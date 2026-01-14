-- ============================================
-- DAWA.ma V10 Consolidated Schema
-- Healthcare-grade prescription delivery platform
-- Morocco CNDP (Law 09-08) Compliant
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PATIENTS
-- ============================================

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  phone TEXT UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  email TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  national_id_encrypted TEXT,

  default_address_id UUID,
  primary_insurance_id UUID,
  insurance_member_id TEXT,

  is_chronic_patient BOOLEAN DEFAULT FALSE,
  chronic_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',

  preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('ar', 'fr', 'en')),
  notification_preferences JSONB DEFAULT '{"sms": true, "push": true, "email": false}',

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);

-- ============================================
-- PATIENT ADDRESSES
-- ============================================

CREATE TABLE IF NOT EXISTS patient_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  label TEXT DEFAULT 'home',
  street_address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  region TEXT,

  coordinates GEOGRAPHY(POINT, 4326),
  google_place_id TEXT,

  delivery_instructions TEXT,
  building_access_code TEXT,

  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_addresses_patient ON patient_addresses(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_addresses_coordinates ON patient_addresses USING GIST(coordinates);

-- ============================================
-- PHARMACIES
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  license_number TEXT UNIQUE NOT NULL,
  tax_id TEXT UNIQUE,
  ice_number TEXT UNIQUE,

  name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  owner_pharmacist_id UUID,

  phone TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  website TEXT,

  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  region TEXT NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  google_place_id TEXT,

  delivery_radius_km NUMERIC(5,2) DEFAULT 5.00,
  delivery_zones JSONB DEFAULT '[]',

  operating_hours JSONB NOT NULL DEFAULT '{}',
  is_on_duty BOOLEAN DEFAULT FALSE,

  accepts_insurance BOOLEAN DEFAULT TRUE,
  accepted_insurers TEXT[] DEFAULT '{}',
  has_drive_through BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,
  wheelchair_accessible BOOLEAN DEFAULT FALSE,

  is_active BOOLEAN DEFAULT TRUE,
  accepts_orders BOOLEAN DEFAULT TRUE,
  max_daily_orders INTEGER DEFAULT 200,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 15.00,
  free_delivery_threshold NUMERIC(10,2),

  tier TEXT DEFAULT 'standard' CHECK (tier IN ('premium', 'standard', 'probation', 'suspended')),
  tier_updated_at TIMESTAMPTZ,

  rating_average NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pharmacies_coordinates ON pharmacies USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_pharmacies_city ON pharmacies(city);
CREATE INDEX IF NOT EXISTS idx_pharmacies_active ON pharmacies(is_active, accepts_orders) WHERE is_active = TRUE;

-- ============================================
-- PHARMACY STAFF
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  role TEXT NOT NULL CHECK (role IN ('owner', 'pharmacist', 'assistant', 'technician', 'admin')),
  license_number TEXT,
  license_verified BOOLEAN DEFAULT FALSE,

  permissions JSONB DEFAULT '{}',
  schedule JSONB DEFAULT '{}',

  is_active BOOLEAN DEFAULT TRUE,

  verifications_count INTEGER DEFAULT 0,
  avg_verification_time_seconds INTEGER,
  accuracy_score NUMERIC(5,4),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_staff_pharmacy ON pharmacy_staff(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_staff_user ON pharmacy_staff(user_id) WHERE user_id IS NOT NULL;

-- ============================================
-- COURIERS
-- ============================================

CREATE TABLE IF NOT EXISTS couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  date_of_birth DATE NOT NULL,
  national_id_encrypted TEXT NOT NULL,
  profile_photo_url TEXT,

  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('motorcycle', 'bicycle', 'car', 'scooter')),
  vehicle_plate TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,

  driver_license_number TEXT,
  driver_license_expiry DATE,
  insurance_policy_number TEXT,
  insurance_expiry DATE,

  primary_zone_id UUID,
  secondary_zones UUID[] DEFAULT '{}',
  max_delivery_radius_km NUMERIC(5,2) DEFAULT 10.00,

  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'offline', 'suspended')),
  current_location GEOGRAPHY(POINT, 4326),
  location_updated_at TIMESTAMPTZ,
  current_delivery_id UUID,

  max_concurrent_orders INTEGER DEFAULT 3,
  current_order_count INTEGER DEFAULT 0,

  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 5.00,
  total_ratings INTEGER DEFAULT 0,
  on_time_rate NUMERIC(5,4) DEFAULT 1.0000,
  acceptance_rate NUMERIC(5,4) DEFAULT 1.0000,

  earnings_balance NUMERIC(10,2) DEFAULT 0.00,
  total_earnings NUMERIC(12,2) DEFAULT 0.00,
  last_payout_at TIMESTAMPTZ,

  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'passed', 'failed')),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT TRUE,
  suspended_reason TEXT,
  suspended_until TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_couriers_status ON couriers(status) WHERE status = 'online';
CREATE INDEX IF NOT EXISTS idx_couriers_location ON couriers USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_couriers_phone ON couriers(phone);

-- ============================================
-- DELIVERY ZONES
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,

  boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
  center_point GEOGRAPHY(POINT, 4326) NOT NULL,

  base_delivery_fee NUMERIC(10,2) NOT NULL,
  per_km_fee NUMERIC(10,2) DEFAULT 2.00,
  surge_multiplier NUMERIC(3,2) DEFAULT 1.00,

  estimated_minutes_base INTEGER DEFAULT 30,
  estimated_minutes_per_km INTEGER DEFAULT 3,

  is_active BOOLEAN DEFAULT TRUE,
  is_surge_active BOOLEAN DEFAULT FALSE,
  surge_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_boundary ON delivery_zones USING GIST(boundary);

-- ============================================
-- INSURANCE PROVIDERS
-- ============================================

CREATE TABLE IF NOT EXISTS insurance_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,

  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'mutual')),

  default_coverage_rate NUMERIC(3,2) DEFAULT 0.70,
  coverage_rules JSONB DEFAULT '{}',

  api_available BOOLEAN DEFAULT FALSE,
  api_endpoint TEXT,
  claim_method TEXT DEFAULT 'manual' CHECK (claim_method IN ('api', 'email', 'manual', 'portal')),

  claims_email TEXT,
  claims_phone TEXT,
  portal_url TEXT,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRESCRIPTIONS (Core table for event sourcing)
-- ============================================

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  pharmacy_id UUID REFERENCES pharmacies(id),

  -- Reference numbers
  prescription_number TEXT UNIQUE NOT NULL,
  external_reference TEXT,

  -- Image storage
  image_url TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,

  -- Current state (derived from events, cached for performance)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'ai_processing', 'ai_verified', 'needs_pharmacist',
    'pharmacist_verified', 'rejected', 'preparing', 'ready',
    'awaiting_courier', 'delivering', 'delivered', 'cancelled'
  )),

  -- Doctor/Clinic info (extracted)
  doctor_name TEXT,
  doctor_license TEXT,
  clinic_name TEXT,
  clinic_address TEXT,

  -- Prescription details
  prescription_date DATE,
  expiry_date DATE,
  is_chronic BOOLEAN DEFAULT FALSE,
  refill_allowed BOOLEAN DEFAULT FALSE,
  refills_remaining INTEGER DEFAULT 0,

  -- Medications (extracted/verified)
  medications JSONB DEFAULT '[]',

  -- Pricing
  subtotal NUMERIC(10,2),
  insurance_coverage NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2),
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2),

  -- Delivery
  delivery_address_id UUID REFERENCES patient_addresses(id),
  delivery_instructions TEXT,
  requested_delivery_time TIMESTAMPTZ,
  estimated_delivery_time TIMESTAMPTZ,

  -- Assignment
  assigned_pharmacist_id UUID REFERENCES pharmacy_staff(id),
  assigned_courier_id UUID REFERENCES couriers(id),

  -- Verification
  ai_verification_id UUID,
  pharmacist_verified_at TIMESTAMPTZ,
  pharmacist_notes TEXT,

  -- Flags
  has_controlled_substance BOOLEAN DEFAULT FALSE,
  has_interaction_warning BOOLEAN DEFAULT FALSE,
  requires_id_check BOOLEAN DEFAULT FALSE,
  requires_signature BOOLEAN DEFAULT FALSE,

  -- Priority
  priority_score INTEGER DEFAULT 50,
  priority_tier TEXT DEFAULT 'normal' CHECK (priority_tier IN ('critical', 'high', 'normal', 'low')),

  -- Delivery completion
  delivered_at TIMESTAMPTZ,
  delivery_proof JSONB,
  delivery_signature_url TEXT,
  delivery_otp TEXT,
  delivery_otp_verified BOOLEAN DEFAULT FALSE,

  -- Ratings
  patient_rating INTEGER CHECK (patient_rating >= 1 AND patient_rating <= 5),
  patient_feedback TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_pharmacy ON prescriptions(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created ON prescriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_priority ON prescriptions(priority_score DESC) WHERE status IN ('pending', 'ai_verified', 'needs_pharmacist');

-- Generate prescription number
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prescription_number = 'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
    LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_prescription_number
  BEFORE INSERT ON prescriptions
  FOR EACH ROW
  WHEN (NEW.prescription_number IS NULL)
  EXECUTE FUNCTION generate_prescription_number();

-- ============================================
-- PRESCRIPTION EVENTS (Event Sourcing)
-- ============================================

CREATE TABLE IF NOT EXISTS prescription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL CHECK (event_type IN (
    'CREATED', 'IMAGE_UPLOADED', 'AI_PROCESSING_STARTED', 'AI_PROCESSING_COMPLETED',
    'PHARMACIST_ASSIGNED', 'PHARMACIST_VERIFIED', 'PHARMACIST_REJECTED',
    'CLARIFICATION_REQUESTED', 'CLARIFICATION_RECEIVED',
    'PRICE_CALCULATED', 'PAYMENT_INITIATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED',
    'PREPARATION_STARTED', 'PREPARATION_COMPLETED',
    'COURIER_ASSIGNED', 'COURIER_ACCEPTED', 'COURIER_REJECTED',
    'PICKUP_STARTED', 'PICKED_UP', 'DELIVERY_STARTED', 'DELIVERY_ARRIVING',
    'DELIVERED', 'DELIVERY_FAILED', 'RETURNED',
    'CANCELLED', 'REFUNDED',
    'RATING_RECEIVED', 'COMPLAINT_FILED', 'COMPLAINT_RESOLVED'
  )),

  event_data JSONB NOT NULL DEFAULT '{}',

  actor_id UUID,
  actor_type TEXT CHECK (actor_type IN ('patient', 'pharmacist', 'courier', 'system', 'admin')),
  actor_name TEXT,

  previous_event_id UUID REFERENCES prescription_events(id),
  event_hash TEXT,

  ip_address INET,
  user_agent TEXT,
  device_info JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prescription_events_prescription ON prescription_events(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_events_type ON prescription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_prescription_events_actor ON prescription_events(actor_id, actor_type);
CREATE INDEX IF NOT EXISTS idx_prescription_events_time ON prescription_events(created_at DESC);

-- ============================================
-- AI VERIFICATION RESULTS
-- ============================================

CREATE TABLE IF NOT EXISTS ai_verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,

  ocr_confidence NUMERIC(5,4),
  extracted_text TEXT,
  raw_ocr_response JSONB,

  entities JSONB NOT NULL DEFAULT '{}',
  drug_matches JSONB DEFAULT '[]',
  dosage_validation JSONB DEFAULT '[]',
  interactions JSONB DEFAULT '[]',
  controlled_substances JSONB DEFAULT '[]',

  fraud_indicators JSONB DEFAULT '[]',
  fraud_score NUMERIC(5,4) DEFAULT 0,

  verification_status TEXT NOT NULL CHECK (verification_status IN (
    'approved', 'needs_review', 'rejected', 'processing', 'failed'
  )),
  confidence_score NUMERIC(5,4),
  attention_required BOOLEAN DEFAULT FALSE,
  attention_reasons TEXT[] DEFAULT '{}',

  model_version TEXT,
  processing_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_verification_prescription ON ai_verification_results(prescription_id);
CREATE INDEX IF NOT EXISTS idx_ai_verification_status ON ai_verification_results(verification_status);

-- ============================================
-- MOROCCO DRUG DATABASE
-- ============================================

CREATE TABLE IF NOT EXISTS morocco_drug_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  dci_code TEXT UNIQUE,
  morocco_amm_code TEXT UNIQUE,
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  manufacturer TEXT,

  therapeutic_class TEXT,
  atc_code TEXT,
  schedule TEXT CHECK (schedule IN ('OTC', 'Rx', 'Controlled_III', 'Controlled_IV', 'Narcotic')),

  available_forms JSONB DEFAULT '[]',
  standard_dosages JSONB DEFAULT '[]',

  contraindications JSONB DEFAULT '[]',
  drug_interactions JSONB DEFAULT '[]',

  ppv NUMERIC(10,2),
  pfht NUMERIC(10,2),
  reimbursement_rate NUMERIC(3,2),

  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_drug_search ON morocco_drug_database
  USING gin(to_tsvector('french', brand_name || ' ' || generic_name || ' ' || COALESCE(dci_code, '')));

-- ============================================
-- PATIENT HEALTH GRAPHS
-- ============================================

CREATE TABLE IF NOT EXISTS patient_health_graphs (
  patient_id UUID PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,

  chronic_conditions JSONB DEFAULT '[]',
  active_medications JSONB DEFAULT '[]',
  historical_medications JSONB DEFAULT '[]',
  known_interactions JSONB DEFAULT '[]',
  allergies JSONB DEFAULT '[]',

  adherence_metrics JSONB DEFAULT '{}',
  refill_patterns JSONB DEFAULT '{}',

  insurance_utilization JSONB DEFAULT '{}',

  ltv_score NUMERIC(5,2),
  predicted_monthly_value NUMERIC(10,2),
  churn_risk_score NUMERIC(3,2),
  next_likely_refill_date DATE,

  prescription_count INTEGER DEFAULT 0,
  first_prescription_at TIMESTAMPTZ,
  last_prescription_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PHARMACY INTELLIGENCE
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_intelligence (
  pharmacy_id UUID PRIMARY KEY REFERENCES pharmacies(id) ON DELETE CASCADE,

  avg_verification_time_seconds INTEGER,
  avg_fulfillment_time_minutes INTEGER,
  fulfillment_success_rate NUMERIC(5,4),
  rejection_rate NUMERIC(5,4),

  stockout_frequency JSONB DEFAULT '{}',
  demand_forecast JSONB DEFAULT '{}',
  popular_medications JSONB DEFAULT '[]',

  insurance_claim_success_rate JSONB DEFAULT '{}',

  current_queue_depth INTEGER DEFAULT 0,
  avg_queue_wait_minutes NUMERIC(5,2),
  peak_hours JSONB DEFAULT '[]',

  patient_satisfaction_score NUMERIC(3,2),
  pharmacist_accuracy_score NUMERIC(5,4),

  performance_score NUMERIC(5,2),

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id),
  patient_id UUID NOT NULL REFERENCES patients(id),

  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'MAD',
  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'card', 'cod', 'mobile_money', 'bank_transfer', 'insurance_only'
  )),
  provider TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'authorized', 'captured', 'failed',
    'refunded', 'partially_refunded', 'disputed', 'cancelled'
  )),

  provider_transaction_id TEXT,
  provider_response JSONB DEFAULT '{}',

  card_last_four TEXT,
  card_brand TEXT,

  subtotal NUMERIC(10,2) NOT NULL,
  insurance_coverage NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,

  cod_collected_at TIMESTAMPTZ,
  cod_collected_by UUID REFERENCES couriers(id),

  refund_amount NUMERIC(10,2),
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  captured_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_prescription ON payments(prescription_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}',
  content JSONB NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_transactional BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('patient', 'pharmacist', 'courier', 'admin')),
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'push', 'email', 'whatsapp')),
  template_code TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  prescription_id UUID REFERENCES prescriptions(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'queued', 'sent', 'delivered', 'failed', 'read'
  )),
  provider TEXT,
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_prescription ON notifications(prescription_id);

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'pharmacist', 'courier')),
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_token)
);

-- ============================================
-- RATINGS
-- ============================================

CREATE TABLE IF NOT EXISTS pharmacy_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  prescription_id UUID REFERENCES prescriptions(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courier_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id UUID NOT NULL REFERENCES couriers(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  prescription_id UUID REFERENCES prescriptions(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Patient policies
CREATE POLICY IF NOT EXISTS patients_own_data ON patients
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS patient_addresses_own ON patient_addresses
  FOR ALL USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS patient_prescriptions ON prescriptions
  FOR ALL USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS patient_prescription_events ON prescription_events
  FOR SELECT USING (
    prescription_id IN (
      SELECT p.id FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      WHERE pt.user_id = auth.uid()
    )
  );

-- Pharmacy policies
CREATE POLICY IF NOT EXISTS pharmacies_public_read ON pharmacies
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY IF NOT EXISTS pharmacy_staff_own ON pharmacy_staff
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS pharmacy_prescriptions ON prescriptions
  FOR ALL USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_staff WHERE user_id = auth.uid()
    )
  );

-- Courier policies
CREATE POLICY IF NOT EXISTS couriers_own_data ON couriers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS courier_prescriptions ON prescriptions
  FOR SELECT USING (assigned_courier_id IN (SELECT id FROM couriers WHERE user_id = auth.uid()));

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO insurance_providers (code, name, name_ar, name_fr, type, default_coverage_rate, claim_method) VALUES
('CNSS', 'Caisse Nationale de Sécurité Sociale', 'الصندوق الوطني للضمان الاجتماعي', 'Caisse Nationale de Sécurité Sociale', 'public', 0.70, 'portal'),
('CNOPS', 'Caisse Nationale des Organismes de Prévoyance Sociale', 'الصندوق الوطني لمنظمات الاحتياط الاجتماعي', 'Caisse Nationale des Organismes de Prévoyance Sociale', 'public', 0.80, 'portal'),
('AMO', 'Assurance Maladie Obligatoire', 'التأمين الإجباري عن المرض', 'Assurance Maladie Obligatoire', 'public', 0.70, 'manual'),
('RAMED', 'Régime d''Assistance Médicale', 'نظام المساعدة الطبية', 'Régime d''Assistance Médicale', 'public', 1.00, 'manual'),
('SAHAM', 'SAHAM Assurance', 'سهام للتأمين', 'SAHAM Assurance', 'private', 0.60, 'email'),
('AXA', 'AXA Assurance Maroc', 'أكسا للتأمين المغرب', 'AXA Assurance Maroc', 'private', 0.60, 'api'),
('WAFA', 'Wafa Assurance', 'وفا للتأمين', 'Wafa Assurance', 'private', 0.60, 'email'),
('ATLANTA', 'Atlanta Assurance', 'أتلانتا للتأمين', 'Atlanta Assurance', 'private', 0.60, 'email')
ON CONFLICT (code) DO NOTHING;

INSERT INTO notification_templates (code, name, channels, content, variables, is_transactional) VALUES
('PRESCRIPTION_SUBMITTED', 'Prescription Submitted', ARRAY['push', 'sms'],
 '{"ar": {"title": "تم استلام الوصفة", "body": "تم استلام وصفتك الطبية وجاري معالجتها", "sms": "DAWA.ma: تم استلام وصفتك. سنقوم بإعلامك عند التحقق منها."}, "fr": {"title": "Ordonnance reçue", "body": "Votre ordonnance a été reçue et est en cours de traitement", "sms": "DAWA.ma: Ordonnance reçue. Nous vous informerons une fois vérifiée."}, "en": {"title": "Prescription Received", "body": "Your prescription has been received and is being processed", "sms": "DAWA.ma: Prescription received. We will notify you once verified."}}',
 ARRAY['patient_name', 'prescription_id'], TRUE),
('PRESCRIPTION_VERIFIED', 'Prescription Verified', ARRAY['push', 'sms'],
 '{"ar": {"title": "تم التحقق من الوصفة", "body": "تم التحقق من وصفتك. المبلغ: {{total}} درهم", "sms": "DAWA.ma: تم التحقق من وصفتك. المبلغ: {{total}} درهم. تتبع: {{tracking_url}}"}, "fr": {"title": "Ordonnance vérifiée", "body": "Votre ordonnance a été vérifiée. Total: {{total}} MAD", "sms": "DAWA.ma: Ordonnance vérifiée. Total: {{total}} MAD. Suivi: {{tracking_url}}"}, "en": {"title": "Prescription Verified", "body": "Your prescription has been verified. Total: {{total}} MAD", "sms": "DAWA.ma: Prescription verified. Total: {{total}} MAD. Track: {{tracking_url}}"}}',
 ARRAY['total', 'tracking_url'], TRUE),
('DELIVERY_STARTED', 'Delivery Started', ARRAY['push', 'sms'],
 '{"ar": {"title": "بدأ التوصيل", "body": "{{courier_name}} في طريقه إليك. الوقت المتوقع: {{eta}} دقيقة", "sms": "DAWA.ma: السائق {{courier_name}} في طريقه. الوقت: {{eta}} دقيقة."}, "fr": {"title": "Livraison en cours", "body": "{{courier_name}} est en route. Temps estimé: {{eta}} min", "sms": "DAWA.ma: {{courier_name}} en route. ETA: {{eta}} min."}, "en": {"title": "Delivery Started", "body": "{{courier_name}} is on the way. ETA: {{eta}} minutes", "sms": "DAWA.ma: {{courier_name}} on the way. ETA: {{eta}} min."}}',
 ARRAY['courier_name', 'eta'], TRUE),
('DELIVERY_COMPLETED', 'Delivery Completed', ARRAY['push', 'sms'],
 '{"ar": {"title": "تم التوصيل", "body": "تم توصيل طلبك بنجاح. شكرا لاستخدام DAWA.ma", "sms": "DAWA.ma: تم توصيل طلبك. شكرا لك!"}, "fr": {"title": "Livraison effectuée", "body": "Votre commande a été livrée. Merci d''utiliser DAWA.ma", "sms": "DAWA.ma: Commande livrée. Merci!"}, "en": {"title": "Delivery Complete", "body": "Your order has been delivered. Thank you for using DAWA.ma", "sms": "DAWA.ma: Order delivered. Thank you!"}}',
 ARRAY['order_id'], TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE patients IS 'Patient/customer accounts - CNDP compliant';
COMMENT ON TABLE prescriptions IS 'Prescription records with event sourcing';
COMMENT ON TABLE prescription_events IS 'Immutable event log for prescription lifecycle';
COMMENT ON TABLE pharmacies IS 'Registered pharmacies with geolocation';
COMMENT ON TABLE couriers IS 'Delivery personnel with real-time tracking';
COMMENT ON TABLE morocco_drug_database IS 'Morocco-specific drug database with AMM codes';
COMMENT ON TABLE ai_verification_results IS 'AI prescription analysis results';
COMMENT ON TABLE patient_health_graphs IS 'Longitudinal patient health data';
COMMENT ON TABLE pharmacy_intelligence IS 'Pharmacy performance analytics';
