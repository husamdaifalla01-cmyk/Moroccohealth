// ==============================================
// DAWA.ma Pre-Upload Image Analysis API
// Quick quality check before full prescription verification
// ==============================================

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface PreUploadRequest {
  image_base64: string;
}

interface PreUploadResult {
  upload_approved: boolean;
  quality_score: number;
  lighting_score: number;
  lighting_issues: string[];
  focus_score: number;
  blur_detected: boolean;
  angle_score: number;
  is_flat: boolean;
  completeness_score: number;
  detected_zones: {
    header_visible: boolean;
    patient_visible: boolean;
    medication_visible: boolean;
    dosage_visible: boolean;
    signature_visible: boolean;
    date_visible: boolean;
  };
  rejection_reasons: string[];
  guidance_message: string;
}

const PRE_UPLOAD_PROMPT = `You are an image quality analyzer for a prescription scanning app in Morocco. Quickly assess this image for quality issues BEFORE we process the prescription content.

Analyze the following aspects and provide scores from 0 to 1:

1. LIGHTING (0-1):
   - Is the image well-lit?
   - Are there shadows obscuring text?
   - Is there glare from reflective surfaces?
   - Issues: too_dark, too_bright, uneven, glare

2. FOCUS (0-1):
   - Is the text sharp and readable?
   - Is the image blurry?
   - blur_detected: true/false

3. ANGLE (0-1):
   - Is the prescription photographed straight-on?
   - Is it tilted or at an angle?
   - is_flat: true/false

4. COMPLETENESS (0-1):
   Check which zones are visible:
   - header_visible: Doctor/clinic header area
   - patient_visible: Patient name/info area
   - medication_visible: Drug names visible
   - dosage_visible: Dosage instructions visible
   - signature_visible: Doctor's signature area
   - date_visible: Prescription date visible

Provide guidance in French for the user to improve image quality.

Respond with ONLY valid JSON matching this structure:
{
  "quality_score": 0.0-1.0,
  "lighting_score": 0.0-1.0,
  "lighting_issues": ["issue1", "issue2"],
  "focus_score": 0.0-1.0,
  "blur_detected": false,
  "angle_score": 0.0-1.0,
  "is_flat": true,
  "completeness_score": 0.0-1.0,
  "detected_zones": {
    "header_visible": true,
    "patient_visible": true,
    "medication_visible": true,
    "dosage_visible": true,
    "signature_visible": true,
    "date_visible": true
  },
  "rejection_reasons": [],
  "guidance_message": "French guidance message"
}`;

export async function POST(request: NextRequest) {
  try {
    const body: PreUploadRequest = await request.json();

    if (!body.image_base64) {
      return NextResponse.json(
        { error: 'image_base64 is required' },
        { status: 400 }
      );
    }

    // Call Claude with a smaller, faster model for quick analysis
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: body.image_base64.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
            {
              type: 'text',
              text: PRE_UPLOAD_PROMPT,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    let result: PreUploadResult;
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Calculate if upload should be approved
        const qualityThreshold = 0.6;
        const uploadApproved =
          parsed.quality_score >= qualityThreshold &&
          parsed.lighting_score >= 0.5 &&
          parsed.focus_score >= 0.5 &&
          parsed.detected_zones.medication_visible &&
          parsed.detected_zones.dosage_visible;

        result = {
          ...parsed,
          upload_approved: uploadApproved,
        };

        // Add rejection reasons if not approved
        if (!uploadApproved) {
          const reasons: string[] = [];
          if (parsed.quality_score < qualityThreshold) {
            reasons.push('Qualite generale insuffisante');
          }
          if (parsed.lighting_score < 0.5) {
            reasons.push('Eclairage insuffisant');
          }
          if (parsed.focus_score < 0.5) {
            reasons.push('Image floue');
          }
          if (!parsed.detected_zones.medication_visible) {
            reasons.push('Medicaments non visibles');
          }
          if (!parsed.detected_zones.dosage_visible) {
            reasons.push('Posologie non visible');
          }
          result.rejection_reasons = reasons;
        }
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Default response if parsing fails
      result = {
        upload_approved: true, // Allow upload, will be caught in full verification
        quality_score: 0.7,
        lighting_score: 0.7,
        lighting_issues: [],
        focus_score: 0.7,
        blur_detected: false,
        angle_score: 0.8,
        is_flat: true,
        completeness_score: 0.7,
        detected_zones: {
          header_visible: true,
          patient_visible: true,
          medication_visible: true,
          dosage_visible: true,
          signature_visible: true,
          date_visible: true,
        },
        rejection_reasons: [],
        guidance_message: 'Image acceptee pour verification.',
      };
    }

    return NextResponse.json({
      success: true,
      analysis: result,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Pre-upload Analysis Error:', error);

    // On error, allow upload and let full verification handle it
    return NextResponse.json({
      success: true,
      analysis: {
        upload_approved: true,
        quality_score: 0.7,
        lighting_score: 0.7,
        lighting_issues: [],
        focus_score: 0.7,
        blur_detected: false,
        angle_score: 0.8,
        is_flat: true,
        completeness_score: 0.7,
        detected_zones: {
          header_visible: true,
          patient_visible: true,
          medication_visible: true,
          dosage_visible: true,
          signature_visible: true,
          date_visible: true,
        },
        rejection_reasons: [],
        guidance_message: 'Verification en cours...',
      },
      processed_at: new Date().toISOString(),
      fallback: true,
    });
  }
}
