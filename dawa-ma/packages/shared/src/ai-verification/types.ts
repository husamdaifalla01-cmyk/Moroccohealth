/**
 * DAWA.ma V10 - AI Prescription Verification Engine Types
 * Morocco's prescription lifecycle infrastructure
 */

// ============================================
// PHASE 1: PRE-UPLOAD IMAGE QUALITY ANALYSIS
// ============================================

export interface PreUploadAnalysis {
  // Lighting Quality (0-1)
  lighting_score: number;
  lighting_issues: LightingIssue[];

  // Angle Detection
  angle_score: number;
  detected_angle: {
    roll: number; // Rotation around viewing axis
    pitch: number; // Tilt forward/backward
    yaw: number; // Rotation left/right
  };
  is_flat: boolean; // Within acceptable range

  // Focus/Blur Detection
  focus_score: number;
  blur_detected: boolean;
  blur_regions: BoundingBox[];

  // Prescription Completeness
  completeness_score: number;
  detected_zones: DetectedZones;

  // Final Verdict
  upload_approved: boolean;
  rejection_reasons: string[];
  guidance_message: string; // User-facing guidance
}

export type LightingIssue = 'too_dark' | 'too_bright' | 'uneven' | 'glare';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DetectedZones {
  header_visible: boolean; // Doctor/clinic info
  patient_visible: boolean; // Patient name
  medication_visible: boolean; // Drug name
  dosage_visible: boolean; // Dosage instructions
  signature_visible: boolean; // Doctor signature
  date_visible: boolean; // Prescription date
}

// ============================================
// PHASE 2: POST-UPLOAD DEEP VERIFICATION
// ============================================

export interface PostUploadVerification {
  // OCR Extraction
  ocr_confidence: number;
  extracted_text: string;

  // Medical NER
  entities: ExtractedEntities;

  // Drug Database Matching
  drug_matches: DrugMatch[];

  // Dosage Validation
  dosage_validation: DosageValidation[];

  // Interaction Check
  interactions: DrugInteraction[];

  // Controlled Substance Check
  controlled_substances: ControlledSubstanceCheck[];

  // Fraud Signals
  fraud_indicators: FraudIndicator[];

  // Final Verdict
  verification_status: VerificationStatus;
  pharmacist_attention_required: boolean;
  attention_reasons: string[];
}

export interface ExtractedEntities {
  doctor_name: string | null;
  doctor_license: string | null; // CNOM number
  clinic_name: string | null;
  patient_name: string | null;
  medications: MedicationEntity[];
  prescription_date: string | null;
}

export interface MedicationEntity {
  name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  route: MedicationRoute | null;
  confidence: number;
}

export type MedicationRoute =
  | 'oral'
  | 'topical'
  | 'injection'
  | 'inhalation'
  | 'sublingual'
  | 'rectal'
  | 'ophthalmic'
  | 'otic'
  | 'nasal';

export interface DrugMatch {
  extracted_name: string;
  matched_drug_id: string | null;
  match_confidence: number;
  matched_name: string | null;
  matched_dci: string | null;
  alternatives: string[]; // If partial match
}

export interface DosageValidation {
  drug_id: string;
  extracted_dosage: string;
  is_valid_dosage: boolean;
  standard_dosages: string[];
  warning: DosageWarning | null;
}

export type DosageWarning =
  | 'above_max'
  | 'below_min'
  | 'unusual_frequency'
  | 'duration_concern'
  | 'age_inappropriate';

export interface DrugInteraction {
  drug_a: string;
  drug_b: string;
  severity: InteractionSeverity;
  description: string;
  action_required: boolean;
  mechanism: string | null;
}

export type InteractionSeverity = 'major' | 'moderate' | 'minor' | 'none';

export interface ControlledSubstanceCheck {
  drug_id: string;
  drug_name: string;
  schedule: DrugSchedule;
  requires_special_handling: boolean;
  blocked: boolean; // DAWA does not handle Schedule I/II
  reason: string | null;
}

export type DrugSchedule = 'I' | 'II' | 'III' | 'IV' | 'V' | 'none';

export interface FraudIndicator {
  type: FraudType;
  confidence: number;
  details: string;
}

export type FraudType =
  | 'doctor_shopping'
  | 'forged_signature'
  | 'altered_prescription'
  | 'invalid_license'
  | 'quantity_anomaly'
  | 'frequency_anomaly'
  | 'duplicate_prescription';

export type VerificationStatus = 'approved' | 'needs_review' | 'rejected';

// ============================================
// ORDER QUEUE ITEM (Priority Queue Architecture)
// ============================================

export interface OrderQueueItem {
  id: string;
  priority_score: number; // 0-100, computed
  priority_tier: PriorityTier;

  // Time Pressure
  created_at: Date;
  promised_delivery_at: Date | null;
  time_in_queue_minutes: number;
  sla_breach_in_minutes: number | null;

  // Patient Context
  patient: {
    id: string;
    name: string;
    phone: string;
    is_chronic_patient: boolean;
    has_refill_history: boolean;
    preferred_tier: boolean; // Premium patient
  };

  // Order Details
  status: AIOrderStatus;
  items_count: number;
  has_controlled_substance: boolean;
  has_interaction_warning: boolean;
  total_amount: number;
  delivery_address: DeliveryAddress;

  // AI Analysis Summary
  ai_verification: {
    status: VerificationStatus;
    confidence: number;
    attention_flags: string[];
  };

  // Quick Actions Available
  available_actions: OrderAction[];
}

export type PriorityTier = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type AIOrderStatus =
  | 'PENDING_IMAGE'
  | 'PENDING_AI_ANALYSIS'
  | 'PENDING_VERIFICATION'
  | 'PENDING_PHARMACIST_REVIEW'
  | 'PHARMACIST_APPROVED'
  | 'PHARMACIST_REJECTED'
  | 'PREPARING'
  | 'READY'
  | 'AWAITING_COURIER'
  | 'COURIER_ASSIGNED'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderAction =
  | 'VERIFY'
  | 'REJECT'
  | 'REQUEST_CLARIFICATION'
  | 'START_PREP'
  | 'MARK_READY'
  | 'ASSIGN_COURIER'
  | 'CALL_PATIENT'
  | 'VIEW_PRESCRIPTION'
  | 'CHECK_INTERACTIONS';

export interface DeliveryAddress {
  street: string;
  city: string;
  postal_code: string | null;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  instructions: string | null;
}

// ============================================
// PRESCRIPTION EVENT TYPES (Event Sourcing)
// ============================================

export type PrescriptionEventType =
  | 'PRESCRIPTION_CREATED'
  | 'IMAGE_UPLOADED'
  | 'IMAGE_QUALITY_ANALYZED'
  | 'AI_VERIFICATION_COMPLETED'
  | 'PHARMACIST_REVIEWED'
  | 'PHARMACIST_APPROVED'
  | 'PHARMACIST_REJECTED'
  | 'PHARMACIST_REQUESTED_CLARIFICATION'
  | 'PATIENT_RESPONDED'
  | 'PREPARATION_STARTED'
  | 'PREPARATION_COMPLETED'
  | 'COURIER_ASSIGNED'
  | 'COURIER_PICKED_UP'
  | 'DELIVERY_STARTED'
  | 'DELIVERY_COMPLETED'
  | 'DELIVERY_FAILED'
  | 'PATIENT_CONFIRMED'
  | 'REFUND_INITIATED'
  | 'REFUND_COMPLETED';

export type ActorType = 'patient' | 'pharmacist' | 'courier' | 'system' | 'admin';

export interface PrescriptionEvent {
  id: string;
  prescription_id: string;
  event_type: PrescriptionEventType;
  event_data: Record<string, unknown>;
  actor_id: string;
  actor_type: ActorType;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  previous_event_id: string | null;
  event_hash: string;
  created_at: Date;
}

// ============================================
// PATIENT HEALTH GRAPH
// ============================================

export interface PatientHealthGraph {
  patient_id: string;

  // Chronic Conditions (derived from Rx history)
  chronic_conditions: ChronicCondition[];

  // Active Medications
  active_medications: ActiveMedication[];

  // Historical Medications
  medication_history: MedicationHistory[];

  // Known Interactions
  active_interactions: ActiveInteraction[];

  // Adherence Metrics
  adherence_metrics: AdherenceMetrics;

  // Insurance Utilization
  insurance_utilization: InsuranceUtilization;

  // LTV Metrics
  ltv_metrics: LTVMetrics;

  // Timestamps
  last_prescription_at: Date | null;
  last_graph_update_at: Date;
  graph_version: number;
}

export interface ChronicCondition {
  condition: string;
  confidence: number;
  first_detected: Date;
  medications: string[];
}

export interface ActiveMedication {
  drug_id: string;
  name: string;
  dosage: string;
  frequency: string;
  started_at: Date;
  last_filled_at: Date;
  adherence_score: number;
}

export interface MedicationHistory {
  drug_id: string;
  name: string;
  period: {
    start: Date;
    end: Date;
  };
  reason_stopped: string | null;
}

export interface ActiveInteraction {
  drug_a: string;
  drug_b: string;
  severity: InteractionSeverity;
  monitoring_required: boolean;
}

export interface AdherenceMetrics {
  overall_score: number;
  avg_refill_delay_days: number;
  missed_refills_30d: number;
  on_time_refills_30d: number;
}

export interface InsuranceUtilization {
  primary_insurer_id: string | null;
  annual_spend: number;
  annual_coverage: number;
  formulary_tier: 'preferred' | 'standard' | 'non_preferred' | null;
}

export interface LTVMetrics {
  ltv_score: number;
  predicted_monthly_value: number;
  churn_risk: number;
  segment:
    | 'high_value_chronic'
    | 'moderate_value_chronic'
    | 'occasional'
    | 'new'
    | 'at_risk';
}

// ============================================
// PHARMACY INTELLIGENCE
// ============================================

export interface PharmacyIntelligence {
  pharmacy_id: string;

  // Operational Metrics
  operational_metrics: OperationalMetrics;

  // Queue Analytics
  queue_analytics: QueueAnalytics;

  // Inventory Intelligence
  inventory_intelligence: InventoryIntelligence;

  // Demand Forecasting
  demand_forecast: DemandForecast;

  // Insurance Performance
  insurance_performance: InsurancePerformance;

  // Scoring
  performance_score: number;
  tier: PharmacyTier;

  // Update Tracking
  metrics_updated_at: Date;
}

export interface OperationalMetrics {
  avg_verification_seconds: number;
  avg_fulfillment_minutes: number;
  fulfillment_success_rate: number;
  rejection_rate: number;
  daily_order_capacity: number;
}

export interface QueueAnalytics {
  current_depth: number;
  avg_wait_minutes: number;
  peak_hours: PeakHour[];
  predicted_next_hour: number;
}

export interface PeakHour {
  dow: number; // 0-6, Sunday = 0
  hour: number; // 0-23
  avg_orders: number;
}

export interface InventoryIntelligence {
  stockout_risk: StockoutRisk[];
  reorder_suggestions: ReorderSuggestion[];
  slow_movers: SlowMover[];
}

export interface StockoutRisk {
  drug_id: string;
  drug_name: string;
  risk_score: number;
  predicted_stockout_date: Date | null;
}

export interface ReorderSuggestion {
  drug_id: string;
  drug_name: string;
  suggested_quantity: number;
  urgency: 'critical' | 'high' | 'normal' | 'low';
}

export interface SlowMover {
  drug_id: string;
  drug_name: string;
  days_since_last_sale: number;
  quantity: number;
}

export interface DemandForecast {
  next_7d: DrugDemand[];
  next_30d: DrugDemand[];
}

export interface DrugDemand {
  drug_id: string;
  drug_name: string;
  predicted_units: number;
  confidence: number;
}

export interface InsurancePerformance {
  by_insurer: InsurerPerformance[];
}

export interface InsurerPerformance {
  insurer_id: string;
  insurer_name: string;
  claim_success_rate: number;
  avg_processing_days: number;
  rejection_reasons: string[];
}

export type PharmacyTier = 'premium' | 'standard' | 'probation' | 'suspended';

// ============================================
// MOROCCO DRUG DATABASE
// ============================================

export interface MoroccoDrug {
  id: string;
  dci_code: string | null; // Dénomination Commune Internationale
  morocco_amm_code: string | null; // Autorisation de Mise sur le Marché
  brand_name: string;
  generic_name: string;
  manufacturer: string | null;

  // Classification
  therapeutic_class: string | null;
  atc_code: string | null; // Anatomical Therapeutic Chemical
  schedule: MoroccoSchedule;

  // Dosage Information
  available_forms: DrugForm[];
  standard_dosages: StandardDosage[];

  // Interaction Data
  contraindications: string[];
  drug_interactions: DrugInteractionData[];

  // Pricing
  ppv: number | null; // Prix Public de Vente
  pfht: number | null; // Prix Fabricant Hors Taxe
  reimbursement_rate: number | null; // 0.00 to 1.00

  // Metadata
  last_updated: Date;
  is_active: boolean;
}

export type MoroccoSchedule =
  | 'OTC'
  | 'Rx'
  | 'Controlled_III'
  | 'Controlled_IV'
  | 'Narcotic';

export interface DrugForm {
  form: string;
  strengths: string[];
}

export interface StandardDosage {
  form: string;
  typical: string;
  max_daily: string;
}

export interface DrugInteractionData {
  drug_id: string;
  severity: InteractionSeverity;
  mechanism: string;
}
