# DAWA.ma — Morocco Pharmacy Delivery Platform
## Complete Business Logic & Development Specification
### Version 1.0 | Prepared for Claude Code Development

---

# EXECUTIVE VISION

**Mission**: Build Morocco's first integrated pharmacy delivery platform connecting patients, pharmacies, healthcare providers, and medical couriers — creating the missing link in Morocco's healthcare digital transformation.

**Core Insight**: DabaDoc has 12M+ users and 10K doctors but NO pharmacy delivery. Glovo has delivery but NO prescription handling. 11,000+ pharmacies exist but have NO digital coordination. This platform bridges all three.

---

# PART 1: PLATFORM INTELLIGENCE SYNTHESIS

## 1.1 Competitor Business Logic Breakdown

### CHEFAA (Egypt) — B2C Focus
**Core Flow**:
```
Patient → Upload Prescription (photo/scan) → GPS-based Pharmacy Matching → 
Pharmacist Review → Order Acceptance → Delivery Dispatch → Patient Tracking → 
Cash/Online Payment → Delivery Confirmation
```

**Key Features Extracted**:
- Prescription upload via camera scan OR medication search
- GPS-based nearest pharmacy routing with auto-forwarding until acceptance
- 24/7 pharmacist chat support
- Medication reminder system (name, dosage, schedule, duration)
- Subscription model (Chefaa Plus) for discounts + fast delivery
- Sensitive medication flagging (no narcotics/psychotropics)
- 5% commission per transaction starting point

**Business Rules**:
- Pharmacist reviews EVERY prescription order before processing
- Orders auto-forward to next nearest pharmacy if first declines
- 1-2 hour delivery for urgent, 48-hour for scheduled
- Patient identity verification at delivery

---

### YODAWY (Egypt) — B2B2C Insurance Focus
**Core Flow (B2C)**:
```
Patient → Register Insurance Card → Upload Prescription → 
AI-Powered Instant Approval Engine → Best-Match Pharmacy Routing → 
Fulfillment → Delivery via Fleet/3PL
```

**Core Flow (B2B - Insurance/Corporate)**:
```
Insurance Company → API Integration → Real-Time Claims Processing → 
Digital Prescription Gateway → Pharmacy Network Routing → 
Automated Billing → Settlement
```

**Key Features Extracted**:
- Pharmacy Benefit Management (PBM) system for insurers
- E-prescription gateway for doctors (paperless prescribing)
- Chronic care subscription (monthly medication refills)
- Own dispensary + 3,000 pharmacy marketplace hybrid
- Middle-mile fleet (7 vans) + last-mile 3PL partners
- 200,000 prescriptions/month processing capacity
- B2B SaaS model for insurance companies

**Business Rules**:
- Insurance approval happens in real-time via API
- Co-payment calculated automatically
- Claims processing fully digitized
- Chronic patients enrolled in "Care Programme" with auto-refills

---

### MYDAWA (Kenya) — Integrated Health Platform
**Core Flow**:
```
Patient → Online Consultation (optional) → E-Prescription → 
Prescription Upload/Verification → Pharmacy Fulfillment → 
Qualified Pharmaceutical Technologist Delivery → Product Authentication
```

**Key Features Extracted**:
- Bricks-and-Clicks Super Pharmacy model (physical + digital)
- Teleconsultation → Lab Testing → E-Prescription → Delivery chain
- Chronic care programs ("Mzima" Kenya, "Bulunji" Uganda)
- Product authentication via tamper-proof seal with unique code
- 4-hour delivery window (8am-8pm, 365 days)
- Pharmaceutical technologists as delivery personnel (not regular couriers)
- Insurance partnerships (NHIF integration)

**Business Rules**:
- Prescription-only medications clearly marked, require valid prescription
- Delivery by qualified pharmaceutical technologists only
- Security seal authentication prevents counterfeits
- Age verification for restricted products (18+)

---

### OKADOC (UAE/KSA) — Healthcare Ecosystem Platform
**Core Flow**:
```
Patient → Doctor Search/Booking → Appointment (In-person/Video) → 
E-Prescription Generated → Cloud Pharmacy Order → Delivery Coordination
```

**Key Features Extracted**:
- 38 EHR/HIS system integrations (EPIC, Intersystems, Oasis, etc.)
- White-label solution for hospitals/insurers
- "My Documents" feature for prescription/medical record storage
- Cloud Pharmacy facility with prescription upload
- Multilingual (Arabic/English)
- 50-75% reduction in no-shows through integration
- B2B revenue from healthcare providers + B2C patient bookings

**Business Rules**:
- OTP SMS authentication for document access
- Healthcare providers can access/download patient documents
- Prescription verified against uploaded medical records
- Real-time doctor schedule sync with hospital systems

---

### CURA (Saudi Arabia) — Telemedicine-First
**Core Flow**:
```
Patient → Instant/Scheduled Consultation (Video/Chat) → 
Diagnosis → E-Prescription (ICD-10 coded) → 
Prescription Dispensable at Any KSA Pharmacy
```

**Key Features Extracted**:
- E-prescription system with Saudi Health Coding (ICD-10)
- Integration with health insurance (Bupa Arabia)
- Wellness programs (depression, weight loss, pregnancy, chronic disease)
- 4,500+ doctors, 200+ specialties
- 350,000+ users, 2.8M consultations via Ministry of Health collaboration
- Home blood sample collection service
- Corporate wellness programs (B2B)

**Business Rules**:
- Doctors licensed by Saudi Health Specializations Authority
- E-prescriptions valid at any pharmacy nationwide
- Insurance-covered vs. out-of-pocket consultation tiers
- 5-minute instant, 15-minute specialized, 45-minute wellness sessions

---

### UBER HEALTH (USA) — Care Coordination Platform
**Core Flow (Prescription Delivery)**:
```
Care Coordinator → Dashboard Login → Patient Selection → 
Pharmacy Pickup Request → ScriptDrop Courier Dispatch → 
Pharmacy Verification → Patient SMS Tracking → 
Delivery (Patient Must Be Home) → Confirmation
```

**Key Features Extracted**:
- HIPAA-compliant dashboard for healthcare organizations
- ScriptDrop partnership for prescription delivery network
- BAA (Business Associate Agreement) with all clients
- Patient doesn't need Uber app (SMS-based tracking)
- Multi-language support (15+ languages)
- Contact database for saved patient preferences
- Flat fee based on delivery distance
- API available for system integration

**Business Rules**:
- Only care coordinators/providers book on patient's behalf
- Patient identity verified at delivery
- No PHI shared with drivers
- Prescription delivery not direct-to-patient requestable (must go through provider)

---

## 1.2 Business Logic Synthesis for Morocco

### What Morocco MUST Have (Non-Negotiables)
1. **Prescription verification by licensed pharmacist** before dispatch
2. **CNDP registration** for personal data processing
3. **French + Arabic** interface (Darija optional for chat)
4. **Cash on Delivery + Card payment** (cash-heavy economy)
5. **Insurance integration** capability (AMO/RAMED ready)
6. **Controlled substance exclusion** (no narcotics/psychotropics)
7. **Pharmacy license verification** (only licensed pharmacies)
8. **Medical courier training** documentation

### What Morocco SHOULD Have (Competitive Advantage)
1. **DabaDoc-style doctor network** integration potential
2. **Chronic care subscription** (diabetes, hypertension prevalent)
3. **Pharmacist chat** 24/7 support
4. **Medication reminders** with refill automation
5. **Multi-pharmacy price comparison** (unique in Morocco)
6. **Night pharmacy ("pharmacie de garde")** integration
7. **Berber/Amazigh** language option for rural areas

---

# PART 2: LEGAL & COMPLIANCE FRAMEWORK (MOROCCO)

## 2.1 Data Protection — Law No. 09-08 (CNDP)

### Requirements
| Requirement | Implementation |
|-------------|----------------|
| **CNDP Registration** | Register ALL data processing activities before launch |
| **Explicit Consent** | Checkbox consent at signup + prescription upload |
| **Data Subject Rights** | In-app access, correction, deletion requests |
| **Sensitive Data Authorization** | Prior CNDP authorization for health data processing |
| **Data Transfer Restrictions** | Morocco-only servers OR CNDP-approved countries (EU adequate) |
| **Data Breach Notification** | Internal process + CNDP notification mechanism |

### Penalty Range
- MAD 10,000 - MAD 600,000 fines
- 3 months - 4 years imprisonment (severe violations)

### Implementation Requirements
```
DATABASE: All PII encrypted at rest (AES-256)
TRANSIT: TLS 1.3 minimum
ACCESS: Role-based access control (RBAC)
AUDIT: Full access logging (7-year retention minimum)
CONSENT: Granular consent management table
DELETION: Hard delete capability with audit trail
```

---

## 2.2 Pharmaceutical Law — Law No. 17-04 (Code of Medicines and Pharmacy)

### Key Requirements
| Rule | Platform Implementation |
|------|------------------------|
| **Pharmacy-Only Dispensing** | Orders fulfilled ONLY by licensed pharmacies |
| **Prescription Verification** | Pharmacist must verify ALL prescription orders |
| **Controlled Substances** | EXCLUDED from platform entirely |
| **Drug Authenticity** | Track & trace integration (future) |
| **Pharmacy License** | Verify PPB license before pharmacy onboarding |
| **Pharmacist Presence** | Orders only processed when pharmacist on duty |

### Regulatory Bodies
- **Directorate of Medicines and Pharmacy (DMP)** — Ministry of Health
- **National Laboratory for Medicines Control (LNCM)** — Quality
- **Pharmacy and Poisons Board equivalent** — Licensing

---

## 2.3 Employment Law — Labor Code (Law No. 65-99)

### Medical Courier Employment Options

**Option A: Direct Employment (CDI/CDD)**
```
Pros: Full control, training standardization, brand loyalty
Cons: Higher cost, CNSS contributions (employer ~20%), severance obligations

Requirements:
- Written employment contract
- CNSS registration (mandatory)
- Minimum wage compliance (SMIG)
- 44-hour work week maximum
- 18 days paid annual leave
- Medical check before employment
```

**Option B: Contractor Network (Recommended for Scale)**
```
Pros: Flexibility, lower fixed costs, rapid scaling
Cons: Less control, must avoid "disguised employment"

Requirements:
- Service agreement with independent couriers
- Couriers maintain own business registration
- No exclusivity clauses (prevents reclassification)
- Per-delivery payment (not hourly)
- Own vehicle/equipment
```

**Option C: Hybrid Model (Recommended)**
```
Core fleet: 10-20 employed couriers for consistency
Peak demand: Contractor network for surge capacity
```

### Medical Courier Training Requirements
```
1. Medication handling basics (temperature, fragility)
2. Patient confidentiality obligations
3. ID verification procedures
4. Delivery chain of custody
5. Emergency contact protocols
6. First aid basics
7. Professional conduct standards
```

---

## 2.4 Telemedicine Law — Law No. 131-13 (2015)

### Integration Opportunity
- Morocco has legalized telemedicine since 2015
- Platform can integrate with licensed telehealth providers
- E-prescriptions from telemedicine consultations valid for delivery

---

# PART 3: DATABASE ARCHITECTURE (SUPABASE)

## 3.1 Core Schema Design

```sql
-- =====================================================
-- DAWA.ma Database Schema for Supabase
-- Follows HL7 FHIR resource naming conventions
-- =====================================================

-- EXTENSION REQUIREMENTS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geolocation
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- =====================================================
-- CORE USER TABLES
-- =====================================================

-- PATIENTS (FHIR: Patient resource)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,  -- Primary identifier in Morocco
    phone_verified BOOLEAN DEFAULT FALSE,
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Personal Information (Encrypted)
    first_name_encrypted BYTEA NOT NULL,
    last_name_encrypted BYTEA NOT NULL,
    date_of_birth_encrypted BYTEA,
    gender VARCHAR(20),
    national_id_encrypted BYTEA,  -- CIN
    
    -- Address (Encrypted)
    default_address_id UUID REFERENCES addresses(id),
    
    -- Insurance Information
    insurance_provider_id UUID REFERENCES insurance_providers(id),
    insurance_member_id_encrypted BYTEA,
    ramed_beneficiary BOOLEAN DEFAULT FALSE,
    
    -- Preferences
    language VARCHAR(10) DEFAULT 'fr',  -- fr, ar, ber
    notification_preferences JSONB DEFAULT '{"sms": true, "push": true, "email": false}',
    
    -- Consent Management (CNDP Compliance)
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

-- PHARMACIES (FHIR: Organization resource)
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

-- PHARMACISTS (FHIR: Practitioner resource)
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
    
    -- Employment
    primary_pharmacy_id UUID REFERENCES pharmacies(id),
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

-- MEDICAL COURIERS (FHIR: Practitioner resource - delivery role)
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
    
    -- Employment Type
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
-- ADDRESS & LOCATION TABLES
-- =====================================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    
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
-- PRESCRIPTION & ORDER TABLES
-- =====================================================

-- PRESCRIPTIONS (FHIR: MedicationRequest resource)
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    
    -- Prescription Image/Document
    image_url_encrypted BYTEA NOT NULL,  -- Encrypted S3 URL
    image_hash VARCHAR(64) NOT NULL,  -- SHA-256 for integrity
    upload_type VARCHAR(20) NOT NULL,  -- camera, gallery, document
    
    -- Doctor Information (if provided)
    doctor_name VARCHAR(255),
    doctor_license_number VARCHAR(100),
    clinic_hospital VARCHAR(255),
    prescription_date DATE,
    
    -- Verification
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
    parent_prescription_id UUID REFERENCES prescriptions(id),  -- For refills
    
    -- Validity
    valid_until DATE,
    refills_remaining INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS (FHIR: ServiceRequest + MedicationDispense combined)
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
    scheduled_time_slot VARCHAR(20),  -- "09:00-12:00", "14:00-17:00", "17:00-20:00"
    
    -- Status Workflow
    status VARCHAR(30) DEFAULT 'pending',
    /*
    WORKFLOW STATES:
    pending → pharmacy_search → pharmacy_assigned → pharmacist_review →
    preparing → ready_for_pickup → courier_assigned → picked_up →
    in_transit → delivered → completed
    
    TERMINAL STATES:
    cancelled, rejected, failed
    */
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
    payment_status VARCHAR(20) DEFAULT 'pending',  -- pending, authorized, captured, failed, refunded
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

-- ORDER ITEMS (FHIR: MedicationDispense line items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    
    -- Product Reference
    medication_id UUID REFERENCES medications(id),  -- If in our catalog
    product_name VARCHAR(255) NOT NULL,
    product_name_arabic VARCHAR(255),
    dosage VARCHAR(100),
    form VARCHAR(100),  -- tablet, syrup, injection, cream, etc.
    manufacturer VARCHAR(255),
    
    -- Quantity
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) DEFAULT 'unit',  -- unit, box, bottle, tube
    
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

-- MEDICATIONS CATALOG (FHIR: Medication resource)
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
    
    -- Regulatory
    prescription_required BOOLEAN DEFAULT FALSE,
    is_controlled_substance BOOLEAN DEFAULT FALSE,
    controlled_substance_schedule VARCHAR(20),  -- If applicable
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

-- PHARMACY INVENTORY
CREATE TABLE pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) NOT NULL,
    medication_id UUID REFERENCES medications(id) NOT NULL,
    
    -- Stock
    quantity_available INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    
    -- Pricing (Pharmacy can set own price within regulated limits)
    price DECIMAL(10,2) NOT NULL,
    
    -- Batch Tracking (For recalls)
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
-- INSURANCE & PAYMENTS
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

CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    insurance_provider_id UUID REFERENCES insurance_providers(id) NOT NULL,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    
    -- Claim Details
    claim_number VARCHAR(100),
    claim_type VARCHAR(50),  -- prescription, consultation
    
    -- Amounts
    total_amount DECIMAL(10,2) NOT NULL,
    covered_amount DECIMAL(10,2),
    copay_amount DECIMAL(10,2),
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending',
    -- pending, submitted, approved, partially_approved, rejected, paid
    
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
-- CHRONIC CARE & SUBSCRIPTIONS
-- =====================================================

CREATE TABLE chronic_care_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    
    -- Condition
    condition_name VARCHAR(255) NOT NULL,  -- Diabetes, Hypertension, etc.
    icd10_code VARCHAR(20),
    
    -- Medications
    medications JSONB NOT NULL,  -- Array of medication + dosage + frequency
    
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
    status VARCHAR(20) DEFAULT 'active',  -- active, paused, completed
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medication_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    chronic_care_program_id UUID REFERENCES chronic_care_programs(id),
    
    -- Medication
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    instructions TEXT,
    
    -- Schedule
    reminder_times TIME[] NOT NULL,  -- ["08:00", "14:00", "20:00"]
    days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],  -- 0=Sun
    
    -- Duration
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- Notification
    notification_type VARCHAR(20) DEFAULT 'push',  -- push, sms, both
    snooze_minutes INTEGER DEFAULT 15,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNICATION & SUPPORT
-- =====================================================

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Participants
    patient_id UUID REFERENCES patients(id) NOT NULL,
    pharmacist_id UUID REFERENCES pharmacists(id),
    order_id UUID REFERENCES orders(id),
    
    -- Session Type
    session_type VARCHAR(30) NOT NULL,  -- order_support, medication_question, general
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active, resolved, escalated
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- Resolution
    resolution_notes TEXT,
    patient_satisfaction INTEGER CHECK (patient_satisfaction BETWEEN 1 AND 5)
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) NOT NULL,
    
    sender_type VARCHAR(20) NOT NULL,  -- patient, pharmacist, system
    sender_id UUID,
    
    message_type VARCHAR(20) DEFAULT 'text',  -- text, image, file, system
    content TEXT NOT NULL,
    attachment_url VARCHAR(500),
    
    -- Read Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT & COMPLIANCE TABLES
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor
    user_type VARCHAR(30) NOT NULL,  -- patient, pharmacist, courier, admin, system
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

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    
    consent_type VARCHAR(50) NOT NULL,  -- data_processing, marketing, insurance_sharing
    consent_version VARCHAR(20) NOT NULL,
    consent_text TEXT NOT NULL,
    
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    
    request_type VARCHAR(50) NOT NULL,  -- access, correction, deletion, portability
    
    -- Request Details
    request_details TEXT,
    
    -- Processing
    status VARCHAR(30) DEFAULT 'pending',  -- pending, processing, completed, rejected
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    response_details TEXT,
    
    -- Delivery (for data exports)
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
CREATE INDEX idx_couriers_location ON couriers USING GIST (location);
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

-- Patient can only see their own data
CREATE POLICY patients_own_data ON patients
    FOR ALL USING (id = auth.uid());

CREATE POLICY prescriptions_own_data ON prescriptions
    FOR ALL USING (patient_id = auth.uid());

CREATE POLICY orders_patient_view ON orders
    FOR SELECT USING (patient_id = auth.uid() OR pharmacy_id IN (
        SELECT pharmacy_id FROM pharmacists WHERE id = auth.uid()
    ) OR courier_id = auth.uid());

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order number generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'DW-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
        LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Audit log function
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_type, user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
        current_setting('app.user_type', true),
        current_setting('app.user_id', true)::UUID,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit to sensitive tables
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE OR DELETE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION log_audit();
```

---

# PART 4: API ARCHITECTURE

## 4.1 RESTful API Design (Following FHIR Patterns)

### Base URL Structure
```
Production: https://api.dawa.ma/v1
Staging: https://api.staging.dawa.ma/v1
```

### Authentication
```
Header: Authorization: Bearer <JWT_TOKEN>
JWT Contains: { user_id, user_type, permissions, exp }
Token Expiry: 24 hours (access), 30 days (refresh)
```

### Core Endpoints

#### Patient App Endpoints
```
# Auth
POST   /auth/phone/send-otp         # Send OTP to phone
POST   /auth/phone/verify           # Verify OTP, return JWT
POST   /auth/refresh                # Refresh token
DELETE /auth/logout                 # Invalidate tokens

# Profile
GET    /me                          # Get current user profile
PATCH  /me                          # Update profile
GET    /me/addresses                # List saved addresses
POST   /me/addresses                # Add address
PATCH  /me/addresses/:id            # Update address
DELETE /me/addresses/:id            # Delete address
GET    /me/insurance                # Get insurance info
POST   /me/insurance                # Add/update insurance

# Prescriptions
POST   /prescriptions               # Upload new prescription
GET    /prescriptions               # List my prescriptions
GET    /prescriptions/:id           # Get prescription details
GET    /prescriptions/:id/status    # Check verification status

# Orders
POST   /orders                      # Create new order
GET    /orders                      # List my orders
GET    /orders/:id                  # Get order details
GET    /orders/:id/tracking         # Real-time tracking
POST   /orders/:id/cancel           # Cancel order
POST   /orders/:id/rate             # Rate completed order

# Medications Search
GET    /medications/search          # Search medications
GET    /medications/:id             # Get medication details
GET    /medications/:id/availability # Check availability at pharmacies

# Pharmacies
GET    /pharmacies/nearby           # Get pharmacies near location
GET    /pharmacies/:id              # Get pharmacy details
GET    /pharmacies/de-garde         # Get night pharmacies

# Chronic Care
GET    /chronic-care                # Get my programs
POST   /chronic-care                # Create new program
PATCH  /chronic-care/:id            # Update program
GET    /chronic-care/:id/refill     # Trigger refill order

# Reminders
GET    /reminders                   # Get my reminders
POST   /reminders                   # Create reminder
PATCH  /reminders/:id               # Update reminder
DELETE /reminders/:id               # Delete reminder

# Chat
POST   /chat/sessions               # Start chat session
GET    /chat/sessions               # List my sessions
GET    /chat/sessions/:id/messages  # Get messages
POST   /chat/sessions/:id/messages  # Send message
```

#### Pharmacy Portal Endpoints
```
# Auth
POST   /pharmacy/auth/login         # Email/password login
POST   /pharmacy/auth/logout        # Logout

# Dashboard
GET    /pharmacy/dashboard/stats    # Today's stats
GET    /pharmacy/dashboard/orders   # Active orders

# Orders Management
GET    /pharmacy/orders             # List orders (with filters)
GET    /pharmacy/orders/:id         # Get order details
POST   /pharmacy/orders/:id/accept  # Accept order
POST   /pharmacy/orders/:id/reject  # Reject order
POST   /pharmacy/orders/:id/preparing    # Start preparation
POST   /pharmacy/orders/:id/ready        # Mark ready for pickup
POST   /pharmacy/orders/:id/substitute   # Request substitution

# Inventory
GET    /pharmacy/inventory          # Get inventory
POST   /pharmacy/inventory          # Add item
PATCH  /pharmacy/inventory/:id      # Update item/stock
DELETE /pharmacy/inventory/:id      # Remove item

# Prescriptions Review
GET    /pharmacy/prescriptions/pending   # Get pending reviews
POST   /pharmacy/prescriptions/:id/verify   # Verify prescription
POST   /pharmacy/prescriptions/:id/reject   # Reject prescription

# Chat
GET    /pharmacy/chat/sessions      # Active chat sessions
GET    /pharmacy/chat/sessions/:id/messages
POST   /pharmacy/chat/sessions/:id/messages

# Financial
GET    /pharmacy/financials/summary     # Revenue summary
GET    /pharmacy/financials/payouts     # Payout history
GET    /pharmacy/financials/invoices    # Invoices

# Settings
GET    /pharmacy/settings           # Get pharmacy settings
PATCH  /pharmacy/settings           # Update settings
PATCH  /pharmacy/operating-hours    # Update hours
```

#### Courier App Endpoints
```
# Auth
POST   /courier/auth/phone/send-otp
POST   /courier/auth/phone/verify

# Status
PATCH  /courier/status              # Go online/offline
POST   /courier/location            # Update location (frequent)

# Orders
GET    /courier/orders/available    # Available nearby orders
GET    /courier/orders/active       # My active delivery
POST   /courier/orders/:id/accept   # Accept order
POST   /courier/orders/:id/picked-up    # Confirm pickup
POST   /courier/orders/:id/delivered    # Confirm delivery
POST   /courier/orders/:id/failed       # Report delivery failure

# Earnings
GET    /courier/earnings            # Earnings summary
GET    /courier/earnings/history    # Detailed history
POST   /courier/earnings/withdraw   # Request withdrawal

# Profile
GET    /courier/profile             # Get profile
PATCH  /courier/profile             # Update profile
GET    /courier/documents           # Get document status
POST   /courier/documents           # Upload documents
```

#### Admin Endpoints
```
# Users Management
GET    /admin/patients
GET    /admin/pharmacies
GET    /admin/couriers
PATCH  /admin/pharmacies/:id/status
PATCH  /admin/couriers/:id/status

# Verification
GET    /admin/verifications/pending
POST   /admin/verifications/:id/approve
POST   /admin/verifications/:id/reject

# Reports
GET    /admin/reports/orders
GET    /admin/reports/revenue
GET    /admin/reports/geography

# Compliance
GET    /admin/audit-logs
GET    /admin/data-requests
POST   /admin/data-requests/:id/process
```

---

## 4.2 Real-Time Communication (WebSockets)

### Socket Events

#### Patient App
```javascript
// Connection
socket.connect({ token: JWT_TOKEN })

// Subscribe to order updates
socket.emit('subscribe:order', { orderId })
socket.on('order:status', { orderId, status, timestamp, details })
socket.on('order:courier-location', { orderId, lat, lng, eta })

// Chat
socket.emit('subscribe:chat', { sessionId })
socket.on('chat:message', { sessionId, message })
socket.emit('chat:send', { sessionId, content })
socket.on('chat:typing', { sessionId, isTyping })
```

#### Pharmacy Portal
```javascript
// New order notification
socket.on('order:new', { orderId, orderDetails })
socket.on('order:cancelled', { orderId })

// Chat
socket.on('chat:new-session', { sessionId, patientName })
socket.on('chat:message', { sessionId, message })
```

#### Courier App
```javascript
// Available orders nearby
socket.on('order:available', { orderId, pickupLocation, deliveryLocation, fee })
socket.on('order:unavailable', { orderId })  // When claimed by another

// Active delivery
socket.on('order:cancelled', { orderId, reason })
socket.on('order:updated', { orderId, details })
```

---

# PART 5: APPLICATION STRUCTURE

## 5.1 Customer App (React Native / Expo)

### Screen Flow
```
ONBOARDING
├── Welcome Screen
├── Phone Input
├── OTP Verification
├── Profile Setup (Name, Language)
├── Address Setup (with map)
└── Notification Permissions

HOME
├── Location Header
├── Quick Actions
│   ├── Upload Prescription
│   ├── Search Medications
│   └── Chronic Care Refill
├── Nearby Pharmacies Map
├── Recent Orders
└── Health Tips/Blog

PRESCRIPTION UPLOAD
├── Camera Capture
├── Gallery Upload
├── Preview & Crop
├── Add Notes
└── Submit

ORDER FLOW
├── Cart Review
├── Pharmacy Selection (auto or manual)
├── Delivery Address
├── Schedule (Now/Later)
├── Payment Method
├── Order Confirmation
└── Tracking Screen
    ├── Status Timeline
    ├── Live Map (when courier assigned)
    ├── Courier Info
    └── Chat with Pharmacy

PROFILE
├── Personal Information
├── Addresses
├── Insurance Information
├── Order History
├── Chronic Care Programs
├── Medication Reminders
├── Saved Prescriptions
├── Privacy Settings
├── Language
└── Support
```

### Component Architecture
```
src/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigator
│   │   ├── home/
│   │   ├── orders/
│   │   ├── chronic-care/
│   │   └── profile/
│   └── order/[id]/        # Order tracking
├── components/
│   ├── common/            # Buttons, inputs, cards
│   ├── prescription/      # Prescription upload
│   ├── pharmacy/          # Pharmacy cards, map
│   ├── order/             # Order items, tracking
│   └── chat/              # Chat UI
├── hooks/
│   ├── useAuth.ts
│   ├── useLocation.ts
│   ├── useOrders.ts
│   └── useSocket.ts
├── services/
│   ├── api.ts             # API client (Axios/fetch)
│   ├── socket.ts          # WebSocket client
│   └── storage.ts         # AsyncStorage wrapper
├── store/                 # Zustand store
│   ├── authStore.ts
│   ├── orderStore.ts
│   └── locationStore.ts
├── utils/
│   ├── encryption.ts      # Client-side encryption
│   ├── validation.ts
│   └── formatters.ts
├── i18n/                  # Translations
│   ├── fr.json
│   ├── ar.json
│   └── ber.json
└── types/
    └── index.ts           # TypeScript types
```

---

## 5.2 Pharmacy Portal (Next.js Web App)

### Screen Structure
```
DASHBOARD
├── Today's Summary
│   ├── Pending Orders
│   ├── In Preparation
│   ├── Ready for Pickup
│   └── Completed Today
├── Revenue Graph
├── Order Feed (Real-time)
└── Alerts/Notifications

ORDER MANAGEMENT
├── Kanban View
│   ├── New Orders
│   ├── Reviewing
│   ├── Preparing
│   └── Ready
├── List View (Filterable)
├── Order Detail Modal
│   ├── Patient Info
│   ├── Prescription Image
│   ├── Items List
│   ├── Actions (Accept/Reject/Prepare)
│   └── Chat Thread
└── Substitution Workflow

INVENTORY
├── Product Search
├── Stock Levels
├── Low Stock Alerts
├── Add Product
├── Bulk Import
└── Price Management

PRESCRIPTIONS
├── Pending Review Queue
├── Review Interface
│   ├── Prescription Viewer (Zoom)
│   ├── Patient History
│   ├── Drug Interaction Check
│   └── Verify/Reject Actions
└── Verification History

FINANCES
├── Revenue Overview
├── Order-by-Order Breakdown
├── Insurance Claims
├── Payout Schedule
├── Invoices
└── Tax Reports

SETTINGS
├── Pharmacy Profile
├── Operating Hours
├── Delivery Settings
├── Staff Accounts
├── Notification Preferences
└── Integration Keys
```

### Component Architecture
```
pharmacy-portal/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── page.tsx        # Dashboard
│   │   ├── orders/
│   │   ├── inventory/
│   │   ├── prescriptions/
│   │   ├── finances/
│   │   └── settings/
│   └── api/               # API routes (if needed)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/
│   ├── orders/
│   ├── inventory/
│   └── chat/
├── lib/
│   ├── api.ts
│   ├── socket.ts
│   └── utils.ts
├── hooks/
├── store/
└── types/
```

---

## 5.3 Courier App (React Native / Expo)

### Screen Flow
```
ONBOARDING
├── Phone Verification
├── Personal Info
├── Document Upload
│   ├── National ID
│   ├── Vehicle Registration
│   ├── Insurance
│   └── Photo
├── Training Module
│   ├── Medication Handling
│   ├── Delivery Protocol
│   ├── Privacy Rules
│   └── Quiz
└── Bank Account

HOME (Online/Offline Toggle)
├── Online State
│   ├── Available Orders Map
│   ├── Order Cards (swipeable)
│   │   ├── Pickup Location
│   │   ├── Delivery Location
│   │   ├── Items Count
│   │   └── Estimated Fee
│   └── Accept/Skip Actions
└── Offline State
    ├── Today's Stats
    └── Go Online Button

ACTIVE DELIVERY
├── Pickup Phase
│   ├── Navigate to Pharmacy
│   ├── Pharmacy Details
│   ├── Order Items List
│   ├── Call Pharmacy
│   └── Confirm Pickup
├── Delivery Phase
│   ├── Navigate to Patient
│   ├── Patient Contact
│   ├── Delivery Instructions
│   └── Confirm Delivery
│       ├── OTP Verification
│       ├── Photo Proof
│       └── Signature (optional)
└── Issue Reporting

EARNINGS
├── Today's Earnings
├── Weekly Summary
├── Detailed History
├── Withdraw to Bank
└── Tax Documents

PROFILE
├── Personal Info
├── Vehicle Info
├── Documents Status
├── Rating & Reviews
├── Support
└── Training Center
```

---

# PART 6: DEVELOPMENT ROADMAP

## Phase 1: Foundation (Weeks 1-4)
```
□ Supabase project setup + schema deployment
□ Authentication system (phone OTP)
□ Patient app MVP
  □ Onboarding flow
  □ Prescription upload
  □ Basic order creation
□ Pharmacy portal MVP
  □ Dashboard
  □ Order management
  □ Prescription verification
□ Admin panel basics
```

## Phase 2: Core Operations (Weeks 5-8)
```
□ Courier app MVP
  □ Onboarding
  □ Order acceptance
  □ Delivery workflow
□ Real-time tracking system
□ Payment integration (CMI Gateway)
□ SMS notifications (Twilio/local)
□ Basic inventory management
```

## Phase 3: Enhancement (Weeks 9-12)
```
□ Chat system (patient-pharmacist)
□ Chronic care module
□ Medication reminders
□ Multi-pharmacy order routing
□ Insurance claim prototype
□ Reporting dashboards
```

## Phase 4: Scale (Weeks 13-16)
```
□ Performance optimization
□ Load testing
□ Security audit
□ CNDP compliance documentation
□ Pharmacy onboarding process
□ Courier training system
□ Analytics implementation
□ Public launch preparation
```

---

# PART 7: CLAUDE CODE DEVELOPMENT PROMPT

## Optimized Prompt for Claude Code Session

```
CONTEXT:
You are building DAWA.ma, Morocco's first integrated pharmacy delivery platform.
Reference architecture document: /path/to/morocco-pharma-delivery-business-logic.md

TECH STACK:
- Frontend: React Native (Expo) for mobile apps, Next.js for pharmacy portal
- Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
- State: Zustand
- UI: NativeWind (mobile), shadcn/ui (web)
- Maps: Google Maps API
- Payments: CMI Morocco gateway
- SMS: Twilio or local provider

CURRENT TASK: [Specify phase/feature]

REQUIREMENTS:
1. Follow the database schema exactly as documented
2. Implement Row Level Security (RLS) for all sensitive tables
3. All PII must be encrypted using pgcrypto
4. French is default language, Arabic as secondary
5. All monetary values in MAD (Moroccan Dirham)
6. Follow FHIR resource naming conventions where applicable
7. Implement comprehensive audit logging
8. Mobile-first design

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation (Zod)
- API response typing
- Unit tests for business logic
- E2E tests for critical flows

COMPLIANCE CHECKPOINTS:
- CNDP consent collection at registration
- Prescription image encryption before storage
- Pharmacist verification workflow before order processing
- Delivery OTP/signature collection
- Audit log for all PHI access

BEGIN IMPLEMENTATION:
[Specific instructions for current feature]
```

---

# APPENDIX A: ENVIRONMENT VARIABLES

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Encryption
ENCRYPTION_KEY=  # 32-byte key for PII encryption

# Maps
GOOGLE_MAPS_API_KEY=

# SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Payments
CMI_MERCHANT_ID=
CMI_API_KEY=
CMI_API_SECRET=

# Storage
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# App
APP_NAME=DAWA.ma
APP_ENV=development
API_URL=https://api.dawa.ma/v1
```

---

# APPENDIX B: THIRD-PARTY INTEGRATIONS

| Service | Purpose | Priority |
|---------|---------|----------|
| Supabase | Backend infrastructure | P0 |
| Google Maps | Geolocation, routing | P0 |
| Twilio/Infobip | SMS OTP, notifications | P0 |
| CMI Morocco | Payment processing | P0 |
| Firebase | Push notifications | P1 |
| Cloudinary/S3 | Image storage | P1 |
| Sentry | Error monitoring | P1 |
| Mixpanel | Analytics | P2 |
| DabaDoc API | Doctor integration (future) | P3 |

---

# APPENDIX C: REGULATORY CHECKLIST

## Pre-Launch Compliance

- [ ] CNDP registration submitted
- [ ] CNDP authorization for health data processing
- [ ] Privacy policy (French + Arabic)
- [ ] Terms of service (French + Arabic)
- [ ] Cookie consent mechanism
- [ ] Data processing agreement with pharmacies
- [ ] Medical courier training program documented
- [ ] Pharmacy license verification process
- [ ] Insurance claim processing agreement (if applicable)
- [ ] Payment processor agreement (PCI compliance)
- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] Data backup and recovery plan
- [ ] Incident response plan
- [ ] GDPR compliance (for EU data transfers)

---

**Document Version**: 1.0
**Last Updated**: January 2026
**Author**: FlowNexis3 Business Intelligence
**For**: Claude Code Development Pipeline
