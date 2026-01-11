/**
 * DAWA.ma V10 - Prescription Image Analyzer
 * Client-side pre-upload analysis utilities
 */

import type { PreUploadAnalysis, DetectedZones, LightingIssue, BoundingBox } from './types';

/**
 * Thresholds for pre-upload analysis
 * Calibrated for Moroccan lighting conditions
 */
export const ANALYSIS_THRESHOLDS = {
  LIGHTING: {
    MIN_SCORE: 0.6,
    DARK_THRESHOLD: 0.3,
  },
  ANGLE: {
    MAX_TILT_DEGREES: 15,
  },
  FOCUS: {
    BLUR_THRESHOLD: 0.3,
  },
  COMPLETENESS: {
    REQUIRED_ZONES: ['medication_visible', 'dosage_visible', 'signature_visible'] as const,
  },
} as const;

/**
 * Guidance messages in French for user feedback
 */
export const GUIDANCE_MESSAGES: Record<string, string> = {
  too_dark: 'Déplacez-vous vers un endroit plus lumineux ou allumez plus de lumières',
  too_bright: 'Réduisez la lumière directe sur l\'ordonnance',
  uneven: 'Assurez un éclairage uniforme sur l\'ordonnance',
  glare: 'Inclinez légèrement pour enlever le reflet',
  tilted: 'Tenez le téléphone directement au-dessus de l\'ordonnance, parallèle à la surface',
  blurry: 'Tenez fermement et appuyez pour faire la mise au point avant de capturer',
  missing_medication_visible: 'Assurez-vous que le nom du médicament est visible',
  missing_dosage_visible: 'Assurez-vous que les instructions de dosage sont visibles',
  missing_signature_visible: 'Assurez-vous que la signature du médecin est visible',
};

/**
 * Generate user guidance message from issues
 */
export function generateGuidanceMessage(issues: string[]): string {
  if (issues.length === 0) {
    return 'L\'image est prête pour l\'envoi';
  }

  return issues
    .map((issue) => GUIDANCE_MESSAGES[issue] || issue)
    .join('. ') + '.';
}

/**
 * Analyze detected zones and return missing required zones
 */
export function getMissingRequiredZones(zones: DetectedZones): string[] {
  const missing: string[] = [];

  for (const zone of ANALYSIS_THRESHOLDS.COMPLETENESS.REQUIRED_ZONES) {
    if (!zones[zone]) {
      missing.push(zone);
    }
  }

  return missing;
}

/**
 * Calculate overall analysis score from component scores
 */
export function calculateOverallScore(analysis: PreUploadAnalysis): number {
  const weights = {
    lighting: 0.25,
    angle: 0.2,
    focus: 0.25,
    completeness: 0.3,
  };

  return (
    analysis.lighting_score * weights.lighting +
    analysis.angle_score * weights.angle +
    analysis.focus_score * weights.focus +
    analysis.completeness_score * weights.completeness
  );
}

/**
 * Determine if image should be approved for upload
 */
export function shouldApproveUpload(analysis: PreUploadAnalysis): {
  approved: boolean;
  reasons: string[];
} {
  const issues: string[] = [];

  // Check lighting
  if (analysis.lighting_score < ANALYSIS_THRESHOLDS.LIGHTING.MIN_SCORE) {
    if (analysis.lighting_score < ANALYSIS_THRESHOLDS.LIGHTING.DARK_THRESHOLD) {
      issues.push('too_dark');
    } else {
      issues.push('uneven');
    }
  }

  // Check angle
  const maxTilt = ANALYSIS_THRESHOLDS.ANGLE.MAX_TILT_DEGREES;
  if (
    Math.abs(analysis.detected_angle.pitch) > maxTilt ||
    Math.abs(analysis.detected_angle.roll) > maxTilt
  ) {
    issues.push('tilted');
  }

  // Check focus
  if (analysis.blur_detected || analysis.focus_score < (1 - ANALYSIS_THRESHOLDS.FOCUS.BLUR_THRESHOLD)) {
    issues.push('blurry');
  }

  // Check completeness
  const missingZones = getMissingRequiredZones(analysis.detected_zones);
  for (const zone of missingZones) {
    issues.push(`missing_${zone}`);
  }

  return {
    approved: issues.length === 0,
    reasons: issues,
  };
}

/**
 * Create a mock pre-upload analysis for development/testing
 */
export function createMockPreUploadAnalysis(overrides?: Partial<PreUploadAnalysis>): PreUploadAnalysis {
  const defaultAnalysis: PreUploadAnalysis = {
    lighting_score: 0.85,
    lighting_issues: [],
    angle_score: 0.92,
    detected_angle: { roll: 2, pitch: -3, yaw: 1 },
    is_flat: true,
    focus_score: 0.88,
    blur_detected: false,
    blur_regions: [],
    completeness_score: 0.95,
    detected_zones: {
      header_visible: true,
      patient_visible: true,
      medication_visible: true,
      dosage_visible: true,
      signature_visible: true,
      date_visible: true,
    },
    upload_approved: true,
    rejection_reasons: [],
    guidance_message: 'L\'image est prête pour l\'envoi',
  };

  return { ...defaultAnalysis, ...overrides };
}

/**
 * Format confidence as percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get confidence color class based on threshold
 */
export function getConfidenceColorClass(confidence: number): string {
  if (confidence >= 0.9) return 'text-[var(--color-verify)]';
  if (confidence >= 0.7) return 'text-[var(--color-warning)]';
  return 'text-[var(--priority-critical)]';
}

/**
 * Format prescription date for display
 */
export function formatPrescriptionDate(dateString: string | null): string {
  if (!dateString) return '—';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Check if prescription date is within valid period (30 days in Morocco)
 */
export function isPrescriptionDateValid(dateString: string | null, maxDays: number = 30): boolean {
  if (!dateString) return false;

  try {
    const prescriptionDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= maxDays && diffDays >= 0;
  } catch {
    return false;
  }
}

/**
 * Get severity badge class for drug interactions
 */
export function getInteractionSeverityClass(severity: 'major' | 'moderate' | 'minor' | 'none'): string {
  const classes: Record<typeof severity, string> = {
    major: 'badge-critical',
    moderate: 'badge-warning',
    minor: 'badge-pending',
    none: 'badge-verify',
  };
  return classes[severity];
}

/**
 * Get severity label in French
 */
export function getInteractionSeverityLabel(severity: 'major' | 'moderate' | 'minor' | 'none'): string {
  const labels: Record<typeof severity, string> = {
    major: 'Majeure',
    moderate: 'Modérée',
    minor: 'Mineure',
    none: 'Aucune',
  };
  return labels[severity];
}

/**
 * Check if a drug is a controlled substance that DAWA cannot handle
 */
export function isBlockedControlledSubstance(schedule: 'I' | 'II' | 'III' | 'IV' | 'V' | 'none'): boolean {
  // DAWA does not handle Schedule I or II controlled substances
  return schedule === 'I' || schedule === 'II';
}

/**
 * Get controlled substance warning message
 */
export function getControlledSubstanceMessage(schedule: 'I' | 'II' | 'III' | 'IV' | 'V' | 'none'): string | null {
  const messages: Record<typeof schedule, string | null> = {
    I: 'Substance de Tableau I - Non disponible via DAWA.ma',
    II: 'Substance de Tableau II - Non disponible via DAWA.ma',
    III: 'Substance contrôlée (Tableau III) - Vérification requise',
    IV: 'Substance contrôlée (Tableau IV) - Vérification requise',
    V: 'Substance contrôlée (Tableau V)',
    none: null,
  };
  return messages[schedule];
}
