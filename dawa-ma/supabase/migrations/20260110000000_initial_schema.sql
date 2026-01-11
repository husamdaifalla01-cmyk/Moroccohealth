-- =====================================================
-- DAWA.ma Initial Database Schema
-- Version: 1.0
-- Follows HL7 FHIR resource naming conventions
-- CNDP Compliant - Law 09-08
-- =====================================================

-- EXTENSION REQUIREMENTS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geolocation
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- =====================================================
-- HELPER FUNCTIONS (Create before tables that use them)
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Order number generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'DW-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
        LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSURANCE PROVIDERS (Create first due to FK)
-- =====================================================

CREATE TABLE insurance_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,
    name_arabic VARCHAR(255),
    type VARCHAR(50) NOT NULL,  -- private, amo, ramed, mutuelle

    -- Integration
    api_endpoint VARCHAR(500),
    api_key_encrypted BYTEA,
    integration_type VARCHAR(50),  -- realtime, batch, manual

    -- Coverage
    coverage_percentage DECIMAL(5,2),  -- Default coverage %

    -- Contact
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),

    -- Status
    status VARCHAR(20) DEFAULT 'active',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHARMACISTS (Create before pharmacies)
-- =====================================================

CREATE TABLE pharmacists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Personal
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),

    -- Professional
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_verified BOOLEAN DEFAULT FALSE,
    license_expiry_date DATE,
    specializations JSONB,  -- ["clinical", "oncology", etc.]

    -- Employment (will be updated after pharmacies table exists)
    primary_pharmacy_id UUID,
    is_owner BOOLEAN DEFAULT FALSE,

    -- Availability
    is_available_for_chat BOOLEAN DEFAULT FALSE,
    chat_languages VARCHAR[] DEFAULT ARRAY['fr', 'ar'],

    -- Status
    status VARCHAR(20) DEFAULT 'active',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHARMACIES
-- =====================================================

CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Official Information
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,  -- PPB license
    license_verified BOOLEAN DEFAULT FALSE,
    license_expiry_date DATE,

    -- Owner/Pharmacist
    owner_pharmacist_id UUID REFERENCES pharmacists(id),

    -- Location
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    location GEOGRAPHY(POINT, 4326),  -- PostGIS for geospatial

    -- Contact
    phone_primary VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    email VARCHAR(255),
    whatsapp VARCHAR(20),

    -- Operations
    operating_hours JSONB NOT NULL,  -- {"mon": {"open": "08:00", "close": "20:00"}, ...}
    is_24_hour BOOLEAN DEFAULT FALSE,
    is_pharmacie_de_garde BOOLEAN DEFAULT FALSE,
    garde_schedule JSONB,  -- Night pharmacy rotation schedule

    -- Capabilities
    accepts_prescriptions BOOLEAN DEFAULT TRUE,
    accepts_otc BOOLEAN DEFAULT TRUE,
    accepts_cosmetics BOOLEAN DEFAULT TRUE,
    has_cold_storage BOOLEAN DEFAULT FALSE,
    delivery_radius_km INTEGER DEFAULT 5,
    average_preparation_time_minutes INTEGER DEFAULT 15,

    -- Financial
    commission_rate DECIMAL(5,4) DEFAULT 0.0500,  -- 5% default
    bank_account_encrypted BYTEA,
    tax_id_encrypted BYTEA,

    -- Rating & Trust
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    fulfillment_rate DECIMAL(5,4) DEFAULT 1.0000,

    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, active, suspended, closed
    onboarding_completed_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from pharmacists to pharmacies
ALTER TABLE pharmacists
    ADD CONSTRAINT fk_pharmacists_pharmacy
    FOREIGN KEY (primary_pharmacy_id) REFERENCES pharmacies(id);

-- =====================================================
-- ADDRESSES (Create before patients)
-- =====================================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID,  -- Will add FK after patients table

    label VARCHAR(50),  -- "Home", "Work", "Parent's House"
    address_line_1_encrypted BYTEA NOT NULL,
    address_line_2_encrypted BYTEA,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    location GEOGRAPHY(POINT, 4326),

    delivery_instructions TEXT,
    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PATIENTS
-- =====================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,  -- Primary identifier in Morocco
    phone_verified BOOLEAN DEFAULT FALSE,
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,

    -- Personal Information (Encrypted for CNDP compliance)
    first_name_encrypted BYTEA NOT NULL,
    last_name_encrypted BYTEA NOT NULL,
    date_of_birth_encrypted BYTEA,
    gender VARCHAR(20),
    national_id_encrypted BYTEA,  -- CIN

    -- Address
    default_address_id UUID REFERENCES addresses(id),

    -- Insurance Information
    insurance_provider_id UUID REFERENCES insurance_providers(id),
    insurance_member_id_encrypted BYTEA,
    ramed_beneficiary BOOLEAN DEFAULT FALSE,

    -- Preferences
    language VARCHAR(10) DEFAULT 'fr',  -- fr, ar, ber
    notification_preferences JSONB DEFAULT '{"sms": true, "push": true, "email": false}',

    -- Consent Management (CNDP Compliance - Law 09-08)
    consent_data_processing BOOLEAN DEFAULT FALSE,
    consent_data_processing_date TIMESTAMPTZ,
    consent_marketing BOOLEAN DEFAULT FALSE,
    consent_marketing_date TIMESTAMPTZ,
    consent_version VARCHAR(20),

    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active, suspended, deleted
    deleted_at TIMESTAMPTZ,  -- Soft delete for legal retention

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from addresses to patients
ALTER TABLE addresses
    ADD CONSTRAINT fk_addresses_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id);

-- =====================================================
-- MEDICAL COURIERS
-- =====================================================

CREATE TABLE couriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Personal (Encrypted for PII)
    first_name_encrypted BYTEA NOT NULL,
    last_name_encrypted BYTEA NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    national_id_encrypted BYTEA NOT NULL,  -- CIN
    date_of_birth DATE NOT NULL,

    -- Photo for verification
    photo_url VARCHAR(500),

    -- Employment Type (Law 65-99 compliance)
    employment_type VARCHAR(20) NOT NULL,  -- employee, contractor
    cnss_number_encrypted BYTEA,  -- For employees only
    contractor_registration_encrypted BYTEA,  -- For contractors

    -- Vehicle
    vehicle_type VARCHAR(50) NOT NULL,  -- motorcycle, car, bicycle
    vehicle_registration_encrypted BYTEA,
    vehicle_insurance_expiry DATE,

    -- Training & Certification
    medical_courier_training_completed BOOLEAN DEFAULT FALSE,
    training_completion_date DATE,
    training_certificate_url VARCHAR(500),
    first_aid_certified BOOLEAN DEFAULT FALSE,

    -- Operations
    service_areas JSONB,  -- Array of city/region codes
    current_location GEOGRAPHY(POINT, 4326),
    location_updated_at TIMESTAMPTZ,
    is_online BOOLEAN DEFAULT FALSE,
    current_order_id UUID,

    -- Performance
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    delivery_count INTEGER DEFAULT 0,
    on_time_rate DECIMAL(5,4) DEFAULT 1.0000,

    -- Financial
    earnings_balance DECIMAL(12,2) DEFAULT 0.00,
    bank_account_encrypted BYTEA,

    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, active, suspended, inactive
    background_check_status VARCHAR(20) DEFAULT 'pending',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRESCRIPTIONS
-- =====================================================

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,

    -- Prescription Image/Document (Encrypted URL)
    image_url_encrypted BYTEA NOT NULL,
    image_hash VARCHAR(64) NOT NULL,  -- SHA-256 for integrity
    upload_type VARCHAR(20) NOT NULL,  -- camera, gallery, document

    -- Doctor Information (if provided)
    doctor_name VARCHAR(255),
    doctor_license_number VARCHAR(100),
    clinic_hospital VARCHAR(255),
    prescription_date DATE,

    -- Verification (Law 17-04 - Pharmacist MUST verify)
    verification_status VARCHAR(30) DEFAULT 'pending',
    -- pending, pharmacist_review, verified, rejected, flagged
    verified_by_pharmacist_id UUID REFERENCES pharmacists(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    rejection_reason VARCHAR(255),

    -- Flags
    contains_controlled_substance BOOLEAN DEFAULT FALSE,
    requires_special_handling BOOLEAN DEFAULT FALSE,
    is_chronic_refill BOOLEAN DEFAULT FALSE,
    parent_prescription_id UUID REFERENCES prescriptions(id),

    -- Validity
    valid_until DATE,
    refills_remaining INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MEDICATIONS CATALOG
-- =====================================================

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identification
    national_code VARCHAR(50),  -- Morocco national drug code
    barcode VARCHAR(50),

    -- Names
    brand_name VARCHAR(255) NOT NULL,
    brand_name_arabic VARCHAR(255),
    generic_name VARCHAR(255),
    generic_name_arabic VARCHAR(255),

    -- Classification
    atc_code VARCHAR(20),  -- WHO ATC classification
    therapeutic_class VARCHAR(255),

    -- Form & Dosage
    form VARCHAR(100) NOT NULL,
    strength VARCHAR(100),
    unit VARCHAR(50),

    -- Manufacturer
    manufacturer VARCHAR(255),
    country_of_origin VARCHAR(100),

    -- Regulatory (Law 17-04)
    prescription_required BOOLEAN DEFAULT FALSE,
    is_controlled_substance BOOLEAN DEFAULT FALSE,  -- HARD BLOCK on platform
    controlled_substance_schedule VARCHAR(20),
    is_cold_chain BOOLEAN DEFAULT FALSE,
    storage_requirements VARCHAR(255),

    -- Pricing
    reference_price DECIMAL(10,2),  -- Government reference price

    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active, discontinued, recalled

    -- Search
    search_keywords VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,  -- Human-readable: DW-2026-XXXXX

    patient_id UUID REFERENCES patients(id) NOT NULL,
    prescription_id UUID REFERENCES prescriptions(id),  -- NULL for OTC-only
    pharmacy_id UUID REFERENCES pharmacies(id),
    courier_id UUID REFERENCES couriers(id),

    -- Order Type
    order_type VARCHAR(20) NOT NULL,  -- prescription, otc, mixed

    -- Delivery Address
    delivery_address_id UUID REFERENCES addresses(id) NOT NULL,
    delivery_location GEOGRAPHY(POINT, 4326),

    -- Scheduling
    is_scheduled BOOLEAN DEFAULT FALSE,
    scheduled_date DATE,
    scheduled_time_slot VARCHAR(20),

    -- Status Workflow
    status VARCHAR(30) DEFAULT 'pending',
    status_history JSONB DEFAULT '[]',

    -- Pharmacy Processing
    pharmacy_accepted_at TIMESTAMPTZ,
    pharmacist_reviewed_at TIMESTAMPTZ,
    preparation_started_at TIMESTAMPTZ,
    ready_for_pickup_at TIMESTAMPTZ,

    -- Courier Processing
    courier_assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    -- Delivery Verification
    delivery_verification_type VARCHAR(20),  -- signature, otp, photo
    delivery_otp_hash VARCHAR(64),
    delivery_signature_url VARCHAR(500),
    delivery_photo_url VARCHAR(500),
    recipient_name VARCHAR(255),

    -- Financials
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_code VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    -- Insurance
    insurance_claim_id UUID,
    insurance_covered_amount DECIMAL(10,2) DEFAULT 0.00,
    patient_copay_amount DECIMAL(10,2),

    -- Payment
    payment_method VARCHAR(30),  -- cash, card, insurance, wallet
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_transaction_id VARCHAR(100),
    paid_at TIMESTAMPTZ,

    -- Special Instructions
    patient_notes TEXT,
    pharmacy_notes TEXT,
    courier_notes TEXT,

    -- Cancellation
    cancelled_by VARCHAR(20),  -- patient, pharmacy, courier, system
    cancellation_reason VARCHAR(255),
    cancelled_at TIMESTAMPTZ,

    -- Ratings
    patient_rating_pharmacy INTEGER CHECK (patient_rating_pharmacy BETWEEN 1 AND 5),
    patient_rating_courier INTEGER CHECK (patient_rating_courier BETWEEN 1 AND 5),
    patient_rating_comment TEXT,
    rated_at TIMESTAMPTZ,

    -- Timing Metrics
    estimated_preparation_minutes INTEGER,
    actual_preparation_minutes INTEGER,
    estimated_delivery_minutes INTEGER,
    actual_delivery_minutes INTEGER,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from couriers to orders
ALTER TABLE couriers
    ADD CONSTRAINT fk_couriers_current_order
    FOREIGN KEY (current_order_id) REFERENCES orders(id);

-- =====================================================
-- ORDER ITEMS
-- =====================================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) NOT NULL,

    -- Product Reference
    medication_id UUID REFERENCES medications(id),
    product_name VARCHAR(255) NOT NULL,
    product_name_arabic VARCHAR(255),
    dosage VARCHAR(100),
    form VARCHAR(100),
    manufacturer VARCHAR(255),

    -- Quantity
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) DEFAULT 'unit',

    -- Prescription Link
    from_prescription BOOLEAN DEFAULT FALSE,

    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,

    -- Substitution
    is_substitution BOOLEAN DEFAULT FALSE,
    original_product_name VARCHAR(255),
    substitution_reason VARCHAR(255),
    patient_approved_substitution BOOLEAN,

    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    unavailable_reason VARCHAR(255),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHARMACY INVENTORY
-- =====================================================

CREATE TABLE pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) NOT NULL,
    medication_id UUID REFERENCES medications(id) NOT NULL,

    -- Stock
    quantity_available INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,

    -- Pricing
    price DECIMAL(10,2) NOT NULL,

    -- Batch Tracking
    batch_number VARCHAR(100),
    expiry_date DATE,

    -- Status
    is_available BOOLEAN DEFAULT TRUE,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(pharmacy_id, medication_id)
);

-- =====================================================
-- INSURANCE CLAIMS
-- =====================================================

CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    insurance_provider_id UUID REFERENCES insurance_providers(id) NOT NULL,
    patient_id UUID REFERENCES patients(id) NOT NULL,

    -- Claim Details
    claim_number VARCHAR(100),
    claim_type VARCHAR(50),

    -- Amounts
    total_amount DECIMAL(10,2) NOT NULL,
    covered_amount DECIMAL(10,2),
    copay_amount DECIMAL(10,2),

    -- Status
    status VARCHAR(30) DEFAULT 'pending',

    -- Processing
    submitted_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    rejection_reason VARCHAR(255),

    -- Settlement
    settlement_amount DECIMAL(10,2),
    settled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from orders to insurance_claims
ALTER TABLE orders
    ADD CONSTRAINT fk_orders_insurance_claim
    FOREIGN KEY (insurance_claim_id) REFERENCES insurance_claims(id);

-- =====================================================
-- PAYMENT TRANSACTIONS
-- =====================================================

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),

    -- Transaction Details
    transaction_type VARCHAR(30) NOT NULL,  -- charge, refund, payout
    payment_method VARCHAR(30) NOT NULL,  -- cash, card, wallet

    -- Gateway Information
    gateway VARCHAR(50),  -- cmi, stripe, paypal
    gateway_transaction_id VARCHAR(100),
    gateway_response JSONB,

    -- Amounts
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MAD',

    -- Status
    status VARCHAR(20) NOT NULL,  -- pending, completed, failed, refunded

    -- Error Handling
    error_code VARCHAR(50),
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHRONIC CARE PROGRAMS
-- =====================================================

CREATE TABLE chronic_care_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,

    -- Condition
    condition_name VARCHAR(255) NOT NULL,
    icd10_code VARCHAR(20),

    -- Medications
    medications JSONB NOT NULL,

    -- Refill Schedule
    refill_frequency_days INTEGER DEFAULT 30,
    next_refill_date DATE,
    auto_refill_enabled BOOLEAN DEFAULT FALSE,

    -- Preferred Pharmacy
    preferred_pharmacy_id UUID REFERENCES pharmacies(id),

    -- Prescribing Doctor
    prescribing_doctor_name VARCHAR(255),
    prescription_valid_until DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'active',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MEDICATION REMINDERS
-- =====================================================

CREATE TABLE medication_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    chronic_care_program_id UUID REFERENCES chronic_care_programs(id),

    -- Medication
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    instructions TEXT,

    -- Schedule
    reminder_times TIME[] NOT NULL,
    days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],

    -- Duration
    start_date DATE NOT NULL,
    end_date DATE,

    -- Notification
    notification_type VARCHAR(20) DEFAULT 'push',
    snooze_minutes INTEGER DEFAULT 15,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHAT SESSIONS
-- =====================================================

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Participants
    patient_id UUID REFERENCES patients(id) NOT NULL,
    pharmacist_id UUID REFERENCES pharmacists(id),
    order_id UUID REFERENCES orders(id),

    -- Session Type
    session_type VARCHAR(30) NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'active',

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,

    -- Resolution
    resolution_notes TEXT,
    patient_satisfaction INTEGER CHECK (patient_satisfaction BETWEEN 1 AND 5)
);

-- =====================================================
-- CHAT MESSAGES
-- =====================================================

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) NOT NULL,

    sender_type VARCHAR(20) NOT NULL,
    sender_id UUID,

    message_type VARCHAR(20) DEFAULT 'text',
    content TEXT NOT NULL,
    attachment_url VARCHAR(500),

    -- Read Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOGS (CNDP Compliance - 7 year retention)
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Actor
    user_type VARCHAR(30) NOT NULL,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,

    -- Action
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,

    -- Details
    old_values JSONB,
    new_values JSONB,

    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONSENT RECORDS (CNDP Compliance)
-- =====================================================

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,

    consent_type VARCHAR(50) NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    consent_text TEXT NOT NULL,

    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DATA ACCESS REQUESTS (CNDP Compliance)
-- =====================================================

CREATE TABLE data_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,

    request_type VARCHAR(50) NOT NULL,

    -- Request Details
    request_details TEXT,

    -- Processing
    status VARCHAR(30) DEFAULT 'pending',
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    response_details TEXT,

    -- Delivery
    data_export_url VARCHAR(500),
    export_expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Geospatial Indexes
CREATE INDEX idx_pharmacies_location ON pharmacies USING GIST (location);
CREATE INDEX idx_couriers_location ON couriers USING GIST (current_location);
CREATE INDEX idx_addresses_location ON addresses USING GIST (location);

-- Foreign Key Indexes
CREATE INDEX idx_orders_patient ON orders(patient_id);
CREATE INDEX idx_orders_pharmacy ON orders(pharmacy_id);
CREATE INDEX idx_orders_courier ON orders(courier_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_pharmacy_inventory_pharmacy ON pharmacy_inventory(pharmacy_id);
CREATE INDEX idx_pharmacy_inventory_medication ON pharmacy_inventory(medication_id);

-- Search Indexes
CREATE INDEX idx_medications_search ON medications USING GIN (search_keywords);
CREATE INDEX idx_medications_name ON medications(brand_name);
CREATE INDEX idx_pharmacies_city ON pharmacies(city);

-- Audit Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_type, user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_requests ENABLE ROW LEVEL SECURITY;

-- Patient can only see their own data
CREATE POLICY patients_own_data ON patients
    FOR ALL USING (id = auth.uid());

CREATE POLICY prescriptions_own_data ON prescriptions
    FOR ALL USING (patient_id = auth.uid());

CREATE POLICY addresses_own_data ON addresses
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY addresses_insert ON addresses
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY addresses_update ON addresses
    FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY addresses_delete ON addresses
    FOR DELETE USING (patient_id = auth.uid());

-- Orders: Patient can view their own, pharmacy their assigned, courier their assigned
CREATE POLICY orders_patient_view ON orders
    FOR SELECT USING (
        patient_id = auth.uid()
        OR pharmacy_id IN (
            SELECT pharmacy_id FROM pharmacists WHERE id = auth.uid()
        )
        OR courier_id = auth.uid()
    );

-- Consent records: Only patient can view their own
CREATE POLICY consent_records_own_data ON consent_records
    FOR ALL USING (patient_id = auth.uid());

-- Data access requests: Only patient can view their own
CREATE POLICY data_access_requests_own_data ON data_access_requests
    FOR ALL USING (patient_id = auth.uid());

-- Chat sessions: Participants only
CREATE POLICY chat_sessions_participants ON chat_sessions
    FOR SELECT USING (
        patient_id = auth.uid()
        OR pharmacist_id = auth.uid()
    );

CREATE POLICY chat_messages_participants ON chat_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM chat_sessions
            WHERE patient_id = auth.uid() OR pharmacist_id = auth.uid()
        )
    );

-- Couriers: Only see their own data
CREATE POLICY couriers_own_data ON couriers
    FOR SELECT USING (id = auth.uid());

CREATE POLICY couriers_own_update ON couriers
    FOR UPDATE USING (id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at triggers
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pharmacists_updated_at BEFORE UPDATE ON pharmacists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_couriers_updated_at BEFORE UPDATE ON couriers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pharmacy_inventory_updated_at BEFORE UPDATE ON pharmacy_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_insurance_providers_updated_at BEFORE UPDATE ON insurance_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON insurance_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chronic_care_programs_updated_at BEFORE UPDATE ON chronic_care_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_medication_reminders_updated_at BEFORE UPDATE ON medication_reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_data_access_requests_updated_at BEFORE UPDATE ON data_access_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order number generation
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Audit log function
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_type, user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
        COALESCE(current_setting('app.user_type', true), 'system'),
        NULLIF(current_setting('app.user_id', true), '')::UUID,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit to sensitive tables
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE OR DELETE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION log_audit();

-- =====================================================
-- ENCRYPTION HELPER FUNCTIONS
-- =====================================================

-- Encrypt function for PII
CREATE OR REPLACE FUNCTION encrypt_pii(plaintext TEXT, encryption_key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(plaintext, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt function for PII
CREATE OR REPLACE FUNCTION decrypt_pii(ciphertext BYTEA, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(ciphertext, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE patients IS 'Patient/Customer accounts - PII encrypted per CNDP Law 09-08';
COMMENT ON TABLE pharmacies IS 'Registered pharmacies - License verified per Law 17-04';
COMMENT ON TABLE couriers IS 'Medical courier accounts - Training required per compliance';
COMMENT ON TABLE orders IS '12-step order workflow from creation to completion';
COMMENT ON TABLE prescriptions IS 'Prescription images - Pharmacist verification required';
COMMENT ON TABLE audit_logs IS 'Compliance audit trail - 7 year retention per CNDP';
COMMENT ON TABLE consent_records IS 'CNDP consent tracking with versioning';
COMMENT ON TABLE medications IS 'Medication catalog - is_controlled_substance for hard block';
