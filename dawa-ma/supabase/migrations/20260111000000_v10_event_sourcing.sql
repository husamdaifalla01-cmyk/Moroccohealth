-- ============================================
-- DAWA.ma V10 Event Sourcing Schema
-- Prescription Lifecycle Infrastructure
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Fuzzy text matching

-- ============================================
-- PRESCRIPTION EVENTS (Event Sourcing Core)
-- ============================================

CREATE TABLE IF NOT EXISTS prescription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL,

  -- Event Type (closed enum for type safety)
  event_type TEXT NOT NULL CHECK (event_type IN (
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
    'REFUND_COMPLETED'
  )),

  -- Event Data (flexible but validated by application)
  event_data JSONB NOT NULL DEFAULT '{}',

  -- Actor Information
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN (
    'patient', 'pharmacist', 'courier', 'system', 'admin'
  )),

  -- Audit Trail
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,

  -- Integrity
  previous_event_id UUID REFERENCES prescription_events(id),
  event_hash TEXT, -- sha256(previous_hash + event_data)

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescription_events_prescription ON prescription_events(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_events_type ON prescription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_prescription_events_actor ON prescription_events(actor_id, actor_type);
CREATE INDEX IF NOT EXISTS idx_prescription_events_time ON prescription_events(created_at DESC);

-- ============================================
-- PRESCRIPTION STATE (Materialized View)
-- ============================================

CREATE TABLE IF NOT EXISTS prescription_states (
  prescription_id UUID PRIMARY KEY,

  -- Current Status
  status TEXT NOT NULL DEFAULT 'pending_verification',
  status_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Order Information
  patient_id UUID NOT NULL,
  pharmacy_id UUID,
  courier_id UUID,

  -- Prescription Details
  original_image_url TEXT,
  processed_image_url TEXT,

  -- AI Analysis Results
  ai_analysis JSONB DEFAULT '{}',
  -- {ocr_text, entities, drug_matches, interactions, fraud_indicators}

  -- Pharmacist Verification
  pharmacist_id UUID,
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,

  -- Medications (after verification)
  verified_medications JSONB DEFAULT '[]',
  -- [{drug_id, name, dosage, quantity, price, insurance_coverage}]

  -- Pricing
  subtotal NUMERIC(10,2),
  insurance_coverage NUMERIC(10,2),
  patient_copay NUMERIC(10,2),
  delivery_fee NUMERIC(10,2),
  total NUMERIC(10,2),

  -- Delivery Information
  delivery_address JSONB,
  promised_delivery_at TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  delivery_proof JSONB, -- {photo_url, signature_url, otp_verified}

  -- Metadata
  priority_score INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Versioning for optimistic concurrency
  version INTEGER NOT NULL DEFAULT 1
);

-- ============================================
-- PATIENT HEALTH GRAPH
-- ============================================

CREATE TABLE IF NOT EXISTS patient_health_graphs (
  patient_id UUID PRIMARY KEY,

  -- Chronic Conditions (derived from prescription patterns)
  chronic_conditions JSONB DEFAULT '[]',
  -- [{condition: 'hypertension', confidence: 0.92, first_detected: '2024-03-15', medications: [...]}]

  -- Active Medications
  active_medications JSONB DEFAULT '[]',
  -- [{drug_id, name, dosage, frequency, started_at, last_filled_at, adherence_score}]

  -- Historical Medications
  medication_history JSONB DEFAULT '[]',
  -- [{drug_id, name, period: {start, end}, reason_stopped}]

  -- Known Interactions
  active_interactions JSONB DEFAULT '[]',
  -- [{drug_a, drug_b, severity, monitoring_required}]

  -- Adherence Metrics
  adherence_metrics JSONB DEFAULT '{}',
  -- {
  --   overall_score: 0.87,
  --   avg_refill_delay_days: 2.3,
  --   missed_refills_30d: 0,
  --   on_time_refills_30d: 3
  -- }

  -- Insurance Utilization
  insurance_utilization JSONB DEFAULT '{}',
  -- {
  --   primary_insurer_id: 'xxx',
  --   annual_spend: 4500.00,
  --   annual_coverage: 3200.00,
  --   formulary_tier: 'preferred'
  -- }

  -- Lifetime Value Scoring
  ltv_metrics JSONB DEFAULT '{}',
  -- {
  --   ltv_score: 850,
  --   predicted_monthly_value: 280.00,
  --   churn_risk: 0.12,
  --   segment: 'high_value_chronic'
  -- }

  -- Graph Update Tracking
  last_prescription_at TIMESTAMPTZ,
  last_graph_update_at TIMESTAMPTZ DEFAULT NOW(),
  graph_version INTEGER DEFAULT 1
);

-- ============================================
-- PHARMACY INTELLIGENCE
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_intelligence (
  pharmacy_id UUID PRIMARY KEY,

  -- Operational Performance
  operational_metrics JSONB DEFAULT '{}',
  -- {
  --   avg_verification_seconds: 127,
  --   avg_fulfillment_minutes: 18,
  --   fulfillment_success_rate: 0.9847,
  --   rejection_rate: 0.023,
  --   daily_order_capacity: 150
  -- }

  -- Queue Analytics
  queue_analytics JSONB DEFAULT '{}',
  -- {
  --   current_depth: 12,
  --   avg_wait_minutes: 8.5,
  --   peak_hours: [{dow: 1, hour: 10, avg_orders: 23}],
  --   predicted_next_hour: 8
  -- }

  -- Inventory Intelligence
  inventory_intelligence JSONB DEFAULT '{}',
  -- {
  --   stockout_risk: [{drug_id, risk_score, predicted_stockout_date}],
  --   reorder_suggestions: [{drug_id, suggested_quantity, urgency}],
  --   slow_movers: [{drug_id, days_since_last_sale, quantity}]
  -- }

  -- Demand Forecasting
  demand_forecast JSONB DEFAULT '{}',
  -- {
  --   next_7d: [{drug_id, predicted_units, confidence}],
  --   next_30d: [{drug_id, predicted_units, confidence}]
  -- }

  -- Insurance Performance
  insurance_performance JSONB DEFAULT '{}',
  -- {
  --   by_insurer: [{insurer_id, claim_success_rate, avg_processing_days, rejection_reasons}]
  -- }

  -- Scoring
  performance_score NUMERIC(5,2) DEFAULT 50.00,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('premium', 'standard', 'probation', 'suspended')),

  -- Update Tracking
  metrics_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MOROCCO DRUG DATABASE
-- ============================================

CREATE TABLE IF NOT EXISTS morocco_drug_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  dci_code TEXT UNIQUE, -- Dénomination Commune Internationale
  morocco_amm_code TEXT UNIQUE, -- Autorisation de Mise sur le Marché
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  manufacturer TEXT,

  -- Classification
  therapeutic_class TEXT,
  atc_code TEXT, -- Anatomical Therapeutic Chemical
  schedule TEXT CHECK (schedule IN ('OTC', 'Rx', 'Controlled_III', 'Controlled_IV', 'Narcotic')),

  -- Dosage Information
  available_forms JSONB DEFAULT '[]',
  -- [{form: 'tablet', strengths: ['500mg', '1000mg']}]

  standard_dosages JSONB DEFAULT '[]',
  -- [{form: 'tablet', typical: '500mg 3x daily', max_daily: '4000mg'}]

  -- Interaction Data
  contraindications JSONB DEFAULT '[]',
  drug_interactions JSONB DEFAULT '[]',
  -- [{drug_id: 'xxx', severity: 'major', mechanism: '...'}]

  -- Pricing (for insurance/copay calculation)
  ppv NUMERIC(10,2), -- Prix Public de Vente
  pfht NUMERIC(10,2), -- Prix Fabricant Hors Taxe
  reimbursement_rate NUMERIC(3,2), -- 0.00 to 1.00

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Full-text search index for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_drug_search ON morocco_drug_database
USING gin(to_tsvector('french', brand_name || ' ' || generic_name || ' ' || COALESCE(dci_code, '')));

-- ============================================
-- AI VERIFICATION RESULTS
-- ============================================

CREATE TABLE IF NOT EXISTS ai_verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL,

  -- Pre-upload Analysis
  pre_upload_analysis JSONB DEFAULT '{}',
  -- {lighting_score, angle_score, focus_score, completeness_score, upload_approved}

  -- OCR Results
  ocr_confidence NUMERIC(3,2),
  extracted_text TEXT,

  -- Medical NER
  entities JSONB DEFAULT '{}',
  -- {doctor_name, doctor_license, clinic_name, patient_name, medications[], prescription_date}

  -- Drug Matching
  drug_matches JSONB DEFAULT '[]',
  -- [{extracted_name, matched_drug_id, match_confidence, alternatives[]}]

  -- Dosage Validation
  dosage_validation JSONB DEFAULT '[]',
  -- [{drug_id, extracted_dosage, is_valid, standard_dosages[], warning}]

  -- Interaction Check
  interactions JSONB DEFAULT '[]',
  -- [{drug_a, drug_b, severity, description, action_required}]

  -- Controlled Substance Check
  controlled_substances JSONB DEFAULT '[]',
  -- [{drug_id, schedule, requires_special_handling, blocked}]

  -- Fraud Signals
  fraud_indicators JSONB DEFAULT '[]',
  -- [{type, confidence, details}]

  -- Final Verdict
  verification_status TEXT CHECK (verification_status IN ('approved', 'needs_review', 'rejected')),
  pharmacist_attention_required BOOLEAN DEFAULT FALSE,
  attention_reasons TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_time_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_ai_verification_prescription ON ai_verification_results(prescription_id);
CREATE INDEX IF NOT EXISTS idx_ai_verification_status ON ai_verification_results(verification_status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE prescription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_health_graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_verification_results ENABLE ROW LEVEL SECURITY;

-- Patients can only see their own prescription events
CREATE POLICY patient_own_prescription_events ON prescription_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prescription_states ps
      WHERE ps.prescription_id = prescription_events.prescription_id
      AND ps.patient_id = auth.uid()
    )
  );

-- Patients can only see their own prescription states
CREATE POLICY patient_own_prescription_states ON prescription_states
  FOR SELECT
  USING (patient_id = auth.uid());

-- Patients can only see their own health graph
CREATE POLICY patient_own_health_graph ON patient_health_graphs
  FOR SELECT
  USING (patient_id = auth.uid());

-- Pharmacy staff can see orders assigned to their pharmacy
CREATE POLICY pharmacy_prescription_states ON prescription_states
  FOR ALL
  USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_staff WHERE user_id = auth.uid()
    )
  );

-- Pharmacy can see their own intelligence data
CREATE POLICY pharmacy_own_intelligence ON pharmacy_intelligence
  FOR SELECT
  USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_staff WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to compute priority score
CREATE OR REPLACE FUNCTION compute_priority_score(
  p_created_at TIMESTAMPTZ,
  p_promised_delivery_at TIMESTAMPTZ,
  p_is_chronic_patient BOOLEAN,
  p_is_preferred_tier BOOLEAN,
  p_has_interaction_warning BOOLEAN,
  p_ai_status TEXT
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 50;
  minutes_in_queue INTEGER;
  minutes_to_breach INTEGER;
BEGIN
  -- Time in queue (+0 to +30)
  minutes_in_queue := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 60;
  score := score + LEAST(30, minutes_in_queue / 3);

  -- SLA breach risk (+0 to +20)
  IF p_promised_delivery_at IS NOT NULL THEN
    minutes_to_breach := EXTRACT(EPOCH FROM (p_promised_delivery_at - NOW())) / 60;
    IF minutes_to_breach < 30 THEN
      score := score + 20;
    ELSIF minutes_to_breach < 60 THEN
      score := score + 15;
    ELSIF minutes_to_breach < 120 THEN
      score := score + 10;
    END IF;
  END IF;

  -- Chronic patient (+10)
  IF p_is_chronic_patient THEN
    score := score + 10;
  END IF;

  -- Premium patient (+5)
  IF p_is_preferred_tier THEN
    score := score + 5;
  END IF;

  -- Interaction warning (-10)
  IF p_has_interaction_warning THEN
    score := score - 10;
  END IF;

  -- AI status adjustment
  IF p_ai_status = 'needs_review' THEN
    score := score + 15;
  ELSIF p_ai_status = 'rejected' THEN
    score := score - 20;
  END IF;

  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Trigger to update prescription_states from events
CREATE OR REPLACE FUNCTION update_prescription_state_from_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the prescription state based on event type
  UPDATE prescription_states
  SET
    status = CASE NEW.event_type
      WHEN 'PRESCRIPTION_CREATED' THEN 'pending_image'
      WHEN 'IMAGE_UPLOADED' THEN 'pending_ai_analysis'
      WHEN 'AI_VERIFICATION_COMPLETED' THEN
        CASE WHEN (NEW.event_data->>'needs_review')::BOOLEAN THEN 'pending_pharmacist_review' ELSE 'pending_verification' END
      WHEN 'PHARMACIST_APPROVED' THEN 'approved'
      WHEN 'PHARMACIST_REJECTED' THEN 'rejected'
      WHEN 'PREPARATION_STARTED' THEN 'preparing'
      WHEN 'PREPARATION_COMPLETED' THEN 'ready_for_pickup'
      WHEN 'COURIER_ASSIGNED' THEN 'courier_assigned'
      WHEN 'COURIER_PICKED_UP' THEN 'picked_up'
      WHEN 'DELIVERY_STARTED' THEN 'in_transit'
      WHEN 'DELIVERY_COMPLETED' THEN 'delivered'
      WHEN 'DELIVERY_FAILED' THEN 'delivery_failed'
      ELSE status
    END,
    status_updated_at = NOW(),
    updated_at = NOW(),
    version = version + 1
  WHERE prescription_id = NEW.prescription_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prescription_event_state_update
AFTER INSERT ON prescription_events
FOR EACH ROW
EXECUTE FUNCTION update_prescription_state_from_event();

-- ============================================
-- SEED DATA FOR MOROCCO DRUG DATABASE
-- ============================================

INSERT INTO morocco_drug_database (brand_name, generic_name, therapeutic_class, atc_code, schedule, ppv, reimbursement_rate) VALUES
('Doliprane', 'Paracetamol', 'Analgesic', 'N02BE01', 'OTC', 25.00, 0.70),
('Efferalgan', 'Paracetamol', 'Analgesic', 'N02BE01', 'OTC', 32.00, 0.70),
('Aspegic', 'Acetylsalicylic acid', 'Analgesic', 'N02BA01', 'OTC', 28.00, 0.70),
('Amoxil', 'Amoxicillin', 'Antibiotic', 'J01CA04', 'Rx', 45.00, 0.80),
('Augmentin', 'Amoxicillin/Clavulanic acid', 'Antibiotic', 'J01CR02', 'Rx', 85.00, 0.80),
('Clamoxyl', 'Amoxicillin', 'Antibiotic', 'J01CA04', 'Rx', 42.00, 0.80),
('Glucophage', 'Metformin', 'Antidiabetic', 'A10BA02', 'Rx', 35.00, 0.85),
('Diamicron', 'Gliclazide', 'Antidiabetic', 'A10BB09', 'Rx', 65.00, 0.85),
('Amlor', 'Amlodipine', 'Antihypertensive', 'C08CA01', 'Rx', 55.00, 0.80),
('Coversyl', 'Perindopril', 'Antihypertensive', 'C09AA04', 'Rx', 75.00, 0.80),
('Lipitor', 'Atorvastatin', 'Lipid lowering', 'C10AA05', 'Rx', 120.00, 0.75),
('Crestor', 'Rosuvastatin', 'Lipid lowering', 'C10AA07', 'Rx', 145.00, 0.75),
('Inexium', 'Esomeprazole', 'Proton pump inhibitor', 'A02BC05', 'Rx', 95.00, 0.70),
('Mopral', 'Omeprazole', 'Proton pump inhibitor', 'A02BC01', 'Rx', 65.00, 0.70),
('Ventoline', 'Salbutamol', 'Bronchodilator', 'R03AC02', 'Rx', 45.00, 0.80),
('Seretide', 'Fluticasone/Salmeterol', 'Asthma', 'R03AK06', 'Rx', 280.00, 0.80),
('Levothyrox', 'Levothyroxine', 'Thyroid hormone', 'H03AA01', 'Rx', 35.00, 0.85),
('Xanax', 'Alprazolam', 'Anxiolytic', 'N05BA12', 'Controlled_IV', 85.00, 0.60),
('Stilnox', 'Zolpidem', 'Hypnotic', 'N05CF02', 'Controlled_IV', 75.00, 0.60),
('Tramadol', 'Tramadol', 'Opioid analgesic', 'N02AX02', 'Controlled_III', 65.00, 0.50)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE prescription_events IS 'Event sourcing table for prescription lifecycle - immutable append-only';
COMMENT ON TABLE prescription_states IS 'Materialized view of current prescription state derived from events';
COMMENT ON TABLE patient_health_graphs IS 'Longitudinal patient health data for analytics and personalization';
COMMENT ON TABLE pharmacy_intelligence IS 'Pharmacy performance metrics and operational intelligence';
COMMENT ON TABLE morocco_drug_database IS 'Morocco-specific drug reference database with pricing and scheduling';
