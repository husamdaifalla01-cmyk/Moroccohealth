// ==============================================
// DAWA.ma Drug Interaction Check API
// Check for drug-drug interactions
// ==============================================

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface DrugInteractionRequest {
  drugs: {
    name: string;
    dosage?: string;
    frequency?: string;
  }[];
  patient_context?: {
    age?: number;
    weight_kg?: number;
    conditions?: string[];
    allergies?: string[];
  };
}

interface Interaction {
  drug_a: string;
  drug_b: string;
  severity: 'major' | 'moderate' | 'minor' | 'none';
  mechanism: string;
  clinical_effects: string;
  recommendation: string;
  evidence_level: 'established' | 'probable' | 'suspected' | 'possible';
}

interface InteractionResult {
  interactions_found: boolean;
  total_interactions: number;
  major_count: number;
  moderate_count: number;
  minor_count: number;
  interactions: Interaction[];
  overall_risk: 'high' | 'moderate' | 'low' | 'none';
  general_recommendations: string[];
  requires_pharmacist_review: boolean;
}

const INTERACTION_PROMPT = `You are a clinical pharmacology expert. Analyze the following list of medications for potential drug-drug interactions.

MEDICATIONS TO CHECK:
{{DRUG_LIST}}

PATIENT CONTEXT:
{{PATIENT_CONTEXT}}

For each pair of drugs that may interact, provide:
1. Severity: major, moderate, minor, or none
2. Mechanism of interaction
3. Clinical effects that may occur
4. Recommendation for the pharmacist/patient
5. Evidence level: established, probable, suspected, or possible

Major interactions are those that:
- Are potentially life-threatening
- Require medical intervention
- May cause permanent harm

Moderate interactions:
- May worsen patient condition
- May require therapy modification

Minor interactions:
- Have limited clinical significance
- Usually don't require intervention

Respond with ONLY valid JSON matching this structure:
{
  "interactions": [
    {
      "drug_a": "Drug Name 1",
      "drug_b": "Drug Name 2",
      "severity": "major|moderate|minor|none",
      "mechanism": "Description of mechanism",
      "clinical_effects": "What may happen",
      "recommendation": "What to do",
      "evidence_level": "established|probable|suspected|possible"
    }
  ],
  "general_recommendations": ["recommendation 1", "recommendation 2"]
}`;

export async function POST(request: NextRequest) {
  try {
    const body: DrugInteractionRequest = await request.json();

    if (!body.drugs || body.drugs.length < 2) {
      return NextResponse.json({
        success: true,
        result: {
          interactions_found: false,
          total_interactions: 0,
          major_count: 0,
          moderate_count: 0,
          minor_count: 0,
          interactions: [],
          overall_risk: 'none',
          general_recommendations: [],
          requires_pharmacist_review: false,
        },
      });
    }

    // Build drug list
    const drugList = body.drugs
      .map((d) => {
        let entry = `- ${d.name}`;
        if (d.dosage) entry += ` (${d.dosage})`;
        if (d.frequency) entry += ` - ${d.frequency}`;
        return entry;
      })
      .join('\n');

    // Build patient context
    let patientContext = 'None provided';
    if (body.patient_context) {
      const ctx = body.patient_context;
      patientContext = [
        ctx.age ? `Age: ${ctx.age} years` : null,
        ctx.weight_kg ? `Weight: ${ctx.weight_kg} kg` : null,
        ctx.conditions?.length ? `Conditions: ${ctx.conditions.join(', ')}` : null,
        ctx.allergies?.length ? `Allergies: ${ctx.allergies.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('\n') || 'None provided';
    }

    const prompt = INTERACTION_PROMPT
      .replace('{{DRUG_LIST}}', drugList)
      .replace('{{PATIENT_CONTEXT}}', patientContext);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    let result: InteractionResult;
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Calculate counts and risk
        const interactions: Interaction[] = parsed.interactions || [];
        const majorCount = interactions.filter((i) => i.severity === 'major').length;
        const moderateCount = interactions.filter((i) => i.severity === 'moderate').length;
        const minorCount = interactions.filter((i) => i.severity === 'minor').length;

        let overallRisk: 'high' | 'moderate' | 'low' | 'none' = 'none';
        if (majorCount > 0) overallRisk = 'high';
        else if (moderateCount > 0) overallRisk = 'moderate';
        else if (minorCount > 0) overallRisk = 'low';

        result = {
          interactions_found: interactions.length > 0,
          total_interactions: interactions.length,
          major_count: majorCount,
          moderate_count: moderateCount,
          minor_count: minorCount,
          interactions,
          overall_risk: overallRisk,
          general_recommendations: parsed.general_recommendations || [],
          requires_pharmacist_review: majorCount > 0 || moderateCount > 1,
        };
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      result = {
        interactions_found: false,
        total_interactions: 0,
        major_count: 0,
        moderate_count: 0,
        minor_count: 0,
        interactions: [],
        overall_risk: 'none',
        general_recommendations: ['Unable to analyze interactions. Manual review recommended.'],
        requires_pharmacist_review: true,
      };
    }

    return NextResponse.json({
      success: true,
      result,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Drug Interaction Check Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
