/**
 * DAWA.ma V10 - Zod Validation Schemas
 * All external data must be validated before processing
 */

import { z } from 'zod';

// ============================================
// PRE-UPLOAD ANALYSIS SCHEMAS
// ============================================

export const LightingIssueSchema = z.enum(['too_dark', 'too_bright', 'uneven', 'glare']);

export const BoundingBoxSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  w: z.number().positive(),
  h: z.number().positive(),
});

export const DetectedZonesSchema = z.object({
  header_visible: z.boolean(),
  patient_visible: z.boolean(),
  medication_visible: z.boolean(),
  dosage_visible: z.boolean(),
  signature_visible: z.boolean(),
  date_visible: z.boolean(),
});

export const DetectedAngleSchema = z.object({
  roll: z.number().min(-180).max(180),
  pitch: z.number().min(-180).max(180),
  yaw: z.number().min(-180).max(180),
});

export const PreUploadAnalysisSchema = z.object({
  lighting_score: z.number().min(0).max(1),
  lighting_issues: z.array(LightingIssueSchema),
  angle_score: z.number().min(0).max(1),
  detected_angle: DetectedAngleSchema,
  is_flat: z.boolean(),
  focus_score: z.number().min(0).max(1),
  blur_detected: z.boolean(),
  blur_regions: z.array(BoundingBoxSchema),
  completeness_score: z.number().min(0).max(1),
  detected_zones: DetectedZonesSchema,
  upload_approved: z.boolean(),
  rejection_reasons: z.array(z.string()),
  guidance_message: z.string(),
});

// ============================================
// POST-UPLOAD VERIFICATION SCHEMAS
// ============================================

export const MedicationRouteSchema = z.enum([
  'oral',
  'topical',
  'injection',
  'inhalation',
  'sublingual',
  'rectal',
  'ophthalmic',
  'otic',
  'nasal',
]);

export const MedicationEntitySchema = z.object({
  name: z.string().min(1),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string().nullable(),
  route: MedicationRouteSchema.nullable(),
  confidence: z.number().min(0).max(1),
});

export const ExtractedEntitiesSchema = z.object({
  doctor_name: z.string().nullable(),
  doctor_license: z.string().nullable(),
  clinic_name: z.string().nullable(),
  patient_name: z.string().nullable(),
  medications: z.array(MedicationEntitySchema),
  prescription_date: z.string().nullable(),
});

export const DrugMatchSchema = z.object({
  extracted_name: z.string(),
  matched_drug_id: z.string().uuid().nullable(),
  match_confidence: z.number().min(0).max(1),
  matched_name: z.string().nullable(),
  matched_dci: z.string().nullable(),
  alternatives: z.array(z.string()),
});

export const DosageWarningSchema = z.enum([
  'above_max',
  'below_min',
  'unusual_frequency',
  'duration_concern',
  'age_inappropriate',
]);

export const DosageValidationSchema = z.object({
  drug_id: z.string().uuid(),
  extracted_dosage: z.string(),
  is_valid_dosage: z.boolean(),
  standard_dosages: z.array(z.string()),
  warning: DosageWarningSchema.nullable(),
});

export const InteractionSeveritySchema = z.enum(['major', 'moderate', 'minor', 'none']);

export const DrugInteractionSchema = z.object({
  drug_a: z.string(),
  drug_b: z.string(),
  severity: InteractionSeveritySchema,
  description: z.string(),
  action_required: z.boolean(),
  mechanism: z.string().nullable(),
});

export const DrugScheduleSchema = z.enum(['I', 'II', 'III', 'IV', 'V', 'none']);

export const ControlledSubstanceCheckSchema = z.object({
  drug_id: z.string().uuid(),
  drug_name: z.string(),
  schedule: DrugScheduleSchema,
  requires_special_handling: z.boolean(),
  blocked: z.boolean(),
  reason: z.string().nullable(),
});

export const FraudTypeSchema = z.enum([
  'doctor_shopping',
  'forged_signature',
  'altered_prescription',
  'invalid_license',
  'quantity_anomaly',
  'frequency_anomaly',
  'duplicate_prescription',
]);

export const FraudIndicatorSchema = z.object({
  type: FraudTypeSchema,
  confidence: z.number().min(0).max(1),
  details: z.string(),
});

export const VerificationStatusSchema = z.enum(['approved', 'needs_review', 'rejected']);

export const PostUploadVerificationSchema = z.object({
  ocr_confidence: z.number().min(0).max(1),
  extracted_text: z.string(),
  entities: ExtractedEntitiesSchema,
  drug_matches: z.array(DrugMatchSchema),
  dosage_validation: z.array(DosageValidationSchema),
  interactions: z.array(DrugInteractionSchema),
  controlled_substances: z.array(ControlledSubstanceCheckSchema),
  fraud_indicators: z.array(FraudIndicatorSchema),
  verification_status: VerificationStatusSchema,
  pharmacist_attention_required: z.boolean(),
  attention_reasons: z.array(z.string()),
});

// ============================================
// ORDER QUEUE SCHEMAS
// ============================================

export const PriorityTierSchema = z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']);

export const AIOrderStatusSchema = z.enum([
  'PENDING_IMAGE',
  'PENDING_AI_ANALYSIS',
  'PENDING_VERIFICATION',
  'PENDING_PHARMACIST_REVIEW',
  'PHARMACIST_APPROVED',
  'PHARMACIST_REJECTED',
  'PREPARING',
  'READY',
  'AWAITING_COURIER',
  'COURIER_ASSIGNED',
  'IN_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

export const OrderActionSchema = z.enum([
  'VERIFY',
  'REJECT',
  'REQUEST_CLARIFICATION',
  'START_PREP',
  'MARK_READY',
  'ASSIGN_COURIER',
  'CALL_PATIENT',
  'VIEW_PRESCRIPTION',
  'CHECK_INTERACTIONS',
]);

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const DeliveryAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  postal_code: z.string().nullable(),
  coordinates: CoordinatesSchema.nullable(),
  instructions: z.string().nullable(),
});

export const PatientContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  phone: z.string().regex(/^\+212[0-9]{9}$/, 'Invalid Morocco phone number'),
  is_chronic_patient: z.boolean(),
  has_refill_history: z.boolean(),
  preferred_tier: z.boolean(),
});

export const AIVerificationSummarySchema = z.object({
  status: VerificationStatusSchema,
  confidence: z.number().min(0).max(1),
  attention_flags: z.array(z.string()),
});

export const OrderQueueItemSchema = z.object({
  id: z.string().uuid(),
  priority_score: z.number().min(0).max(100),
  priority_tier: PriorityTierSchema,
  created_at: z.date(),
  promised_delivery_at: z.date().nullable(),
  time_in_queue_minutes: z.number().min(0),
  sla_breach_in_minutes: z.number().nullable(),
  patient: PatientContextSchema,
  status: AIOrderStatusSchema,
  items_count: z.number().int().positive(),
  has_controlled_substance: z.boolean(),
  has_interaction_warning: z.boolean(),
  total_amount: z.number().min(0),
  delivery_address: DeliveryAddressSchema,
  ai_verification: AIVerificationSummarySchema,
  available_actions: z.array(OrderActionSchema),
});

// ============================================
// PRESCRIPTION EVENT SCHEMAS
// ============================================

export const PrescriptionEventTypeSchema = z.enum([
  'PRESCRIPTION_CREATED',
  'IMAGE_UPLOADED',
  'IMAGE_QUALITY_ANALYZED',
  'AI_VERIFICATION_COMPLETED',
  'PHARMACIST_REVIEWED',
  'PHARMACIST_APPROVED',
  'PHARMACIST_REJECTED',
  'PHARMACIST_REQUESTED_CLARIFICATION',
  'PATIENT_RESPONDED',
  'PREPARATION_STARTED',
  'PREPARATION_COMPLETED',
  'COURIER_ASSIGNED',
  'COURIER_PICKED_UP',
  'DELIVERY_STARTED',
  'DELIVERY_COMPLETED',
  'DELIVERY_FAILED',
  'PATIENT_CONFIRMED',
  'REFUND_INITIATED',
  'REFUND_COMPLETED',
]);

export const ActorTypeSchema = z.enum(['patient', 'pharmacist', 'courier', 'system', 'admin']);

export const PrescriptionEventSchema = z.object({
  id: z.string().uuid(),
  prescription_id: z.string().uuid(),
  event_type: PrescriptionEventTypeSchema,
  event_data: z.record(z.unknown()),
  actor_id: z.string(),
  actor_type: ActorTypeSchema,
  ip_address: z.string().ip().nullable(),
  user_agent: z.string().nullable(),
  session_id: z.string().nullable(),
  previous_event_id: z.string().uuid().nullable(),
  event_hash: z.string(),
  created_at: z.date(),
});

// ============================================
// MOROCCO DRUG DATABASE SCHEMAS
// ============================================

export const MoroccoScheduleSchema = z.enum([
  'OTC',
  'Rx',
  'Controlled_III',
  'Controlled_IV',
  'Narcotic',
]);

export const DrugFormSchema = z.object({
  form: z.string(),
  strengths: z.array(z.string()),
});

export const StandardDosageSchema = z.object({
  form: z.string(),
  typical: z.string(),
  max_daily: z.string(),
});

export const DrugInteractionDataSchema = z.object({
  drug_id: z.string().uuid(),
  severity: InteractionSeveritySchema,
  mechanism: z.string(),
});

export const MoroccoDrugSchema = z.object({
  id: z.string().uuid(),
  dci_code: z.string().nullable(),
  morocco_amm_code: z.string().nullable(),
  brand_name: z.string().min(1),
  generic_name: z.string().min(1),
  manufacturer: z.string().nullable(),
  therapeutic_class: z.string().nullable(),
  atc_code: z.string().nullable(),
  schedule: MoroccoScheduleSchema,
  available_forms: z.array(DrugFormSchema),
  standard_dosages: z.array(StandardDosageSchema),
  contraindications: z.array(z.string()),
  drug_interactions: z.array(DrugInteractionDataSchema),
  ppv: z.number().nullable(),
  pfht: z.number().nullable(),
  reimbursement_rate: z.number().min(0).max(1).nullable(),
  last_updated: z.date(),
  is_active: z.boolean(),
});

// ============================================
// TYPE EXPORTS FROM SCHEMAS
// ============================================

export type PreUploadAnalysisInput = z.infer<typeof PreUploadAnalysisSchema>;
export type PostUploadVerificationInput = z.infer<typeof PostUploadVerificationSchema>;
export type OrderQueueItemInput = z.infer<typeof OrderQueueItemSchema>;
export type PrescriptionEventInput = z.infer<typeof PrescriptionEventSchema>;
export type MoroccoDrugInput = z.infer<typeof MoroccoDrugSchema>;
