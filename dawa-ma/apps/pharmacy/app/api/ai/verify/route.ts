// ==============================================
// DAWA.ma AI Prescription Verification API
// Server-side endpoint for prescription analysis
// ==============================================

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface VerificationRequest {
  image_url?: string;
  image_base64?: string;
  prescription_id: string;
  patient_health_context?: {
    known_allergies?: string[];
    current_medications?: string[];
    chronic_conditions?: string[];
    age?: number;
    weight_kg?: number;
  };
}

interface DrugExtraction {
  brand_name: string;
  generic_name?: string;
  dosage: string;
  quantity: number;
  frequency: string;
  duration_days?: number;
  route: string;
  special_instructions?: string;
  confidence: number;
}

interface VerificationResult {
  status: 'approved' | 'needs_review' | 'rejected';
  overall_confidence: number;
  prescription_date: string | null;
  prescription_valid: boolean;
  doctor_info: {
    name: string | null;
    license_number: string | null;
    specialty: string | null;
    clinic_hospital: string | null;
    confidence: number;
  };
  patient_info: {
    name: string | null;
    age: number | null;
    confidence: number;
  };
  extracted_drugs: DrugExtraction[];
  drug_interactions: {
    severity: 'major' | 'moderate' | 'minor' | 'none';
    drugs_involved: string[];
    description: string;
    recommendation: string;
  }[];
  warnings: {
    type: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }[];
  ai_notes: string;
  requires_pharmacist_review: boolean;
  review_reasons: string[];
}

const VERIFICATION_PROMPT = `You are a pharmaceutical AI assistant for DAWA.ma, a medication delivery service in Morocco. Your task is to analyze prescription images and extract relevant information while checking for safety concerns.

CRITICAL REQUIREMENTS:
1. Extract all medication details accurately
2. Identify potential drug interactions
3. Flag any controlled substances (Schedule I-V)
4. Verify prescription date validity (max 30 days in Morocco)
5. Check for unusual dosages or quantities
6. Note any handwriting that's unclear

For each medication extracted, provide:
- Brand name (as written)
- Generic name (DCI in Morocco)
- Dosage and strength
- Quantity
- Frequency (e.g., "3 fois par jour")
- Duration if specified
- Route of administration
- Special instructions

Safety checks to perform:
1. Dosage within normal ranges for Morocco
2. Drug-drug interactions (check against patient's current medications if provided)
3. Contraindications based on patient conditions
4. Controlled substance classification
5. Prescription freshness (date within 30 days)

Response format must be valid JSON matching the VerificationResult schema.

Patient health context (if available):
{{PATIENT_CONTEXT}}

Analyze this prescription image and provide a comprehensive verification report.`;

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();

    if (!body.image_url && !body.image_base64) {
      return NextResponse.json(
        { error: 'Either image_url or image_base64 is required' },
        { status: 400 }
      );
    }

    // Build patient context for the prompt
    let patientContext = 'None provided';
    if (body.patient_health_context) {
      const ctx = body.patient_health_context;
      patientContext = [
        ctx.known_allergies?.length ? `Allergies: ${ctx.known_allergies.join(', ')}` : null,
        ctx.current_medications?.length ? `Current medications: ${ctx.current_medications.join(', ')}` : null,
        ctx.chronic_conditions?.length ? `Chronic conditions: ${ctx.chronic_conditions.join(', ')}` : null,
        ctx.age ? `Age: ${ctx.age} years` : null,
        ctx.weight_kg ? `Weight: ${ctx.weight_kg} kg` : null,
      ].filter(Boolean).join('\n');
    }

    const prompt = VERIFICATION_PROMPT.replace('{{PATIENT_CONTEXT}}', patientContext);

    // Prepare image content - always use base64 for now
    // URL-based images require a different approach in Claude API
    const imageData = body.image_base64?.replace(/^data:image\/\w+;base64,/, '') || '';
    const imageContent = {
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: 'image/jpeg' as const,
        data: imageData,
      },
    };

    // Call Claude API for vision analysis
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            imageContent,
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract the text response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    let verificationResult: VerificationResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verificationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // If parsing fails, create a needs_review result
      verificationResult = {
        status: 'needs_review',
        overall_confidence: 0,
        prescription_date: null,
        prescription_valid: false,
        doctor_info: {
          name: null,
          license_number: null,
          specialty: null,
          clinic_hospital: null,
          confidence: 0,
        },
        patient_info: {
          name: null,
          age: null,
          confidence: 0,
        },
        extracted_drugs: [],
        drug_interactions: [],
        warnings: [
          {
            type: 'parsing_error',
            message: 'AI response could not be parsed. Manual review required.',
            severity: 'high',
          },
        ],
        ai_notes: textContent.text,
        requires_pharmacist_review: true,
        review_reasons: ['AI response parsing failed'],
      };
    }

    // Add controlled substance checks
    const controlledSubstances = [
      'tramadol', 'codeine', 'morphine', 'fentanyl', 'oxycodone',
      'diazepam', 'lorazepam', 'alprazolam', 'clonazepam',
      'methylphenidate', 'amphetamine',
    ];

    for (const drug of verificationResult.extracted_drugs) {
      const drugNameLower = (drug.brand_name + ' ' + (drug.generic_name || '')).toLowerCase();
      if (controlledSubstances.some((cs) => drugNameLower.includes(cs))) {
        verificationResult.warnings.push({
          type: 'controlled_substance',
          message: `${drug.brand_name} is a controlled substance requiring special verification`,
          severity: 'high',
        });
        verificationResult.requires_pharmacist_review = true;
        if (!verificationResult.review_reasons.includes('Controlled substance detected')) {
          verificationResult.review_reasons.push('Controlled substance detected');
        }
      }
    }

    // Check prescription date validity
    if (verificationResult.prescription_date) {
      const prescriptionDate = new Date(verificationResult.prescription_date);
      const daysSincePrescription = Math.floor(
        (Date.now() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSincePrescription > 30) {
        verificationResult.prescription_valid = false;
        verificationResult.warnings.push({
          type: 'expired_prescription',
          message: `Prescription is ${daysSincePrescription} days old. Maximum validity in Morocco is 30 days.`,
          severity: 'high',
        });
        verificationResult.requires_pharmacist_review = true;
        verificationResult.review_reasons.push('Prescription expired');
      }
    }

    // Determine final status based on checks
    if (verificationResult.requires_pharmacist_review) {
      verificationResult.status = 'needs_review';
    } else if (
      verificationResult.overall_confidence >= 0.85 &&
      verificationResult.prescription_valid &&
      verificationResult.drug_interactions.every((i) => i.severity !== 'major')
    ) {
      verificationResult.status = 'approved';
    } else {
      verificationResult.status = 'needs_review';
    }

    return NextResponse.json({
      success: true,
      prescription_id: body.prescription_id,
      verification: verificationResult,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Verification Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
