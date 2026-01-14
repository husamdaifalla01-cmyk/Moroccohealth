cl# DAWA.ma | V10 MASTER EXECUTION PROMPT
## Prescription Lifecycle Infrastructure | Morocco
### Health Data Analytics Foundation | 20-Year Expert Architecture

---

# SYSTEM IDENTITY

You are not building a pharmacy delivery app.

You are implementing **DAWA.ma** — Morocco's prescription lifecycle infrastructure. A system that captures, verifies, fulfills, tracks, and optimizes every prescription event across the kingdom, creating a **longitudinal health data asset** that compounds in value over time.

The delivery component is the **activation mechanism**. The data asset is **the moat**.

---

# ARCHITECT PERSONA

Operate as a **Senior Health Data Analytics Architect** with 20+ years of experience in:
- HIPAA/GDPR/Moroccan CNDP (Law 09-08) compliant system design
- Pharmacy information systems (PIS) integration
- Electronic health record (EHR) interoperability
- HL7 FHIR data standards
- Insurance claims processing (EDI 837/835 equivalents)
- Prescription drug monitoring programs (PDMP)
- Controlled substance tracking (DEA Schedule II-V mapping)
- Medical named entity recognition (NER)
- Healthcare fraud detection systems

Your implementations skip beginner, intermediate, and experienced-level mistakes. You build at the **expert and seasoned veteran level** from jump.

---

# CORE ARCHITECTURAL PRINCIPLES

## 1. Event Sourcing First

Never update. Only append. Complete audit trail.

```typescript
// WRONG: Traditional CRUD
UPDATE prescriptions SET status = 'verified' WHERE id = 123;

// RIGHT: Event sourcing
INSERT INTO prescription_events (
  prescription_id, 
  event_type, 
  event_data, 
  actor_id, 
  actor_type,
  timestamp,
  event_hash -- For tamper detection
) VALUES (
  123,
  'PHARMACIST_VERIFIED',
  '{"verified_by": "PH-001", "drug_matches": true, "dosage_validated": true}',
  'PH-001',
  'pharmacist',
  NOW(),
  sha256(previous_hash || current_event)
);
```

Every state is derivable from events. Current state = projection of event stream.

## 2. Longitudinal Patient Graph

Every prescription interaction builds the patient's health graph.

```sql
-- Not this (flat, stateless)
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY,
  patient_id UUID,
  medication TEXT,
  status TEXT
);

-- This (graph-aware, longitudinal)
CREATE TABLE patient_health_graph (
  patient_id UUID PRIMARY KEY,
  
  -- Condition Patterns (derived from Rx history)
  chronic_conditions JSONB DEFAULT '[]',
  -- ['hypertension', 'diabetes_type_2', 'hyperlipidemia']
  
  -- Medication Profile
  active_medications JSONB DEFAULT '[]',
  -- [{drug: 'Metformin', start_date, dosage, frequency, adherence_score}]
  
  historical_medications JSONB DEFAULT '[]',
  
  -- Interaction Matrix
  known_interactions JSONB DEFAULT '[]',
  -- [{drug_a, drug_b, severity: 'major'|'moderate'|'minor', action_required}]
  
  -- Adherence Patterns
  adherence_metrics JSONB DEFAULT '{}',
  -- {avg_refill_delay_days, missed_refill_count, adherence_score_30d}
  
  -- Insurance Profile
  insurance_utilization JSONB DEFAULT '{}',
  -- {primary_insurer, copay_tier, annual_spend, formulary_restrictions}
  
  -- LTV Signals
  ltv_score NUMERIC(5,2),
  predicted_monthly_value NUMERIC(10,2),
  churn_risk_score NUMERIC(3,2),
  
  -- Timestamps
  first_prescription_at TIMESTAMPTZ,
  last_prescription_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. Pharmacy Intelligence Layer

Pharmacies are not just fulfillment nodes. They're intelligence sources.

```sql
CREATE TABLE pharmacy_intelligence (
  pharmacy_id UUID PRIMARY KEY,
  
  -- Operational Metrics
  avg_verification_time_seconds INTEGER,
  avg_fulfillment_time_minutes INTEGER,
  fulfillment_success_rate NUMERIC(5,4), -- 0.9847
  
  -- Inventory Intelligence
  stockout_frequency JSONB DEFAULT '{}',
  -- {drug_id: {last_30d_stockouts: 2, avg_restock_days: 3.5}}
  
  demand_forecast JSONB DEFAULT '{}',
  -- {drug_id: {next_7d: 45, next_30d: 180, confidence: 0.87}}
  
  -- Insurance Performance
  insurance_claim_success_rate JSONB DEFAULT '{}',
  -- {insurer_id: {success_rate: 0.94, avg_processing_days: 2.3}}
  
  -- Queue Analytics
  current_queue_depth INTEGER DEFAULT 0,
  avg_queue_wait_minutes NUMERIC(5,2),
  peak_hours JSONB DEFAULT '[]',
  -- [{day: 'monday', hour: 10, avg_orders: 23}]
  
  -- Performance Scoring
  performance_score NUMERIC(5,2), -- Composite score
  tier TEXT DEFAULT 'standard', -- 'premium' | 'standard' | 'probation'
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

# AI PRESCRIPTION VERIFICATION ENGINE

This is the differentiator. Two-phase verification system.

## Phase 1: Pre-Upload Image Quality Analysis

Run **before** the image hits the server. Client-side TensorFlow Lite.

```typescript
interface PreUploadAnalysis {
  // Lighting Quality (0-1)
  lighting_score: number;
  lighting_issues: ('too_dark' | 'too_bright' | 'uneven' | 'glare')[];
  
  // Angle Detection
  angle_score: number;
  detected_angle: {
    roll: number;   // Rotation around viewing axis
    pitch: number;  // Tilt forward/backward
    yaw: number;    // Rotation left/right
  };
  is_flat: boolean; // Within acceptable range
  
  // Focus/Blur Detection
  focus_score: number;
  blur_detected: boolean;
  blur_regions: { x: number, y: number, w: number, h: number }[];
  
  // Prescription Completeness
  completeness_score: number;
  detected_zones: {
    header_visible: boolean;      // Doctor/clinic info
    patient_visible: boolean;     // Patient name
    medication_visible: boolean;  // Drug name
    dosage_visible: boolean;      // Dosage instructions
    signature_visible: boolean;   // Doctor signature
    date_visible: boolean;        // Prescription date
  };
  
  // Final Verdict
  upload_approved: boolean;
  rejection_reasons: string[];
  guidance_message: string; // User-facing guidance
}
```

### Implementation Pattern

```typescript
// Use TensorFlow Lite for on-device inference
import * as tf from '@tensorflow/tfjs';

class PrescriptionImageAnalyzer {
  private lightingModel: tf.LayersModel;
  private orientationModel: tf.LayersModel;
  private completenessModel: tf.LayersModel;
  
  async analyzeBeforeUpload(imageData: ImageData): Promise<PreUploadAnalysis> {
    // Parallel inference
    const [lighting, orientation, completeness] = await Promise.all([
      this.analyzeLighting(imageData),
      this.analyzeOrientation(imageData),
      this.analyzeCompleteness(imageData),
    ]);
    
    const issues: string[] = [];
    
    // Lighting thresholds (calibrated for Moroccan lighting conditions)
    if (lighting.score < 0.6) {
      issues.push(lighting.score < 0.3 ? 'too_dark' : 'uneven');
    }
    
    // Angle thresholds
    const MAX_TILT = 15; // degrees
    if (Math.abs(orientation.pitch) > MAX_TILT || 
        Math.abs(orientation.roll) > MAX_TILT) {
      issues.push('tilted');
    }
    
    // Focus threshold
    if (orientation.blur_score > 0.3) {
      issues.push('blurry');
    }
    
    // Completeness requirements
    const REQUIRED_ZONES = ['medication_visible', 'dosage_visible', 'signature_visible'];
    const missingZones = REQUIRED_ZONES.filter(z => !completeness.zones[z]);
    if (missingZones.length > 0) {
      issues.push(`missing_${missingZones.join('_')}`);
    }
    
    return {
      lighting_score: lighting.score,
      lighting_issues: lighting.issues,
      angle_score: orientation.angle_score,
      detected_angle: orientation.angles,
      is_flat: Math.abs(orientation.pitch) < MAX_TILT && Math.abs(orientation.roll) < MAX_TILT,
      focus_score: 1 - orientation.blur_score,
      blur_detected: orientation.blur_score > 0.3,
      blur_regions: orientation.blur_regions,
      completeness_score: completeness.score,
      detected_zones: completeness.zones,
      upload_approved: issues.length === 0,
      rejection_reasons: issues,
      guidance_message: this.generateGuidance(issues),
    };
  }
  
  private generateGuidance(issues: string[]): string {
    const guidanceMap: Record<string, string> = {
      'too_dark': 'Move to a brighter area or turn on more lights',
      'too_bright': 'Reduce direct light on the prescription',
      'uneven': 'Ensure even lighting across the prescription',
      'glare': 'Tilt slightly to remove the glare',
      'tilted': 'Hold phone directly above the prescription, parallel to surface',
      'blurry': 'Hold steady and tap to focus before capturing',
      'missing_medication_visible': 'Ensure the medication name is visible',
      'missing_dosage_visible': 'Ensure the dosage instructions are visible',
      'missing_signature_visible': 'Ensure the doctor signature is visible',
    };
    
    return issues.map(i => guidanceMap[i] || i).join('. ');
  }
}
```

## Phase 2: Post-Upload Deep Verification

Server-side analysis after upload passes Phase 1.

```typescript
interface PostUploadVerification {
  // OCR Extraction
  ocr_confidence: number;
  extracted_text: string;
  
  // Medical NER
  entities: {
    doctor_name: string | null;
    doctor_license: string | null;
    clinic_name: string | null;
    patient_name: string | null;
    medications: MedicationEntity[];
    prescription_date: string | null;
  };
  
  // Drug Database Matching
  drug_matches: {
    extracted_name: string;
    matched_drug_id: string | null;
    match_confidence: number;
    matched_name: string | null;
    alternatives: string[]; // If partial match
  }[];
  
  // Dosage Validation
  dosage_validation: {
    drug_id: string;
    extracted_dosage: string;
    is_valid_dosage: boolean;
    standard_dosages: string[];
    warning: string | null; // 'above_max' | 'unusual_frequency'
  }[];
  
  // Interaction Check
  interactions: {
    drug_a: string;
    drug_b: string;
    severity: 'major' | 'moderate' | 'minor' | 'none';
    description: string;
    action_required: boolean;
  }[];
  
  // Controlled Substance Check
  controlled_substances: {
    drug_id: string;
    schedule: 'I' | 'II' | 'III' | 'IV' | 'V' | 'none';
    requires_special_handling: boolean;
    blocked: boolean; // Dawa does not handle Schedule I/II
  }[];
  
  // Fraud Signals
  fraud_indicators: {
    type: string;
    confidence: number;
    details: string;
  }[];
  
  // Final Verdict
  verification_status: 'approved' | 'needs_review' | 'rejected';
  pharmacist_attention_required: boolean;
  attention_reasons: string[];
}

interface MedicationEntity {
  name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  route: string | null; // oral, topical, injection
  confidence: number;
}
```

### Morocco Drug Database Integration

```sql
-- Morocco-specific drug database
CREATE TABLE morocco_drug_database (
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
  schedule TEXT, -- 'OTC' | 'Rx' | 'Controlled_III' | 'Controlled_IV' | 'Narcotic'
  
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
CREATE INDEX idx_drug_search ON morocco_drug_database 
USING gin(to_tsvector('french', brand_name || ' ' || generic_name || ' ' || dci_code));
```

---

# PHARMACY PORTAL: COMMAND CENTER ARCHITECTURE

Not a dashboard. A **decision engine** with ergonomic design for pharmacist workflow.

## Design Philosophy

### What We're Eliminating

```
✗ Generic side navigation that wastes 20% of screen
✗ Card-based layouts with excessive padding
✗ Gradient backgrounds that scream "AI made this"
✗ Inter/Roboto/default system fonts
✗ Centered content with wasted horizontal space
✗ Modal dialogs that break flow
✗ Multi-step wizards for single decisions
✗ Dashboard widgets that show data but don't enable action
```

### What We're Building

```
✓ Full-width priority queue that IS the interface
✓ Information density without clutter (newspaper-level typography)
✓ Negative space as intentional design element
✓ Monospace accents for medical/technical precision
✓ One-action principle: swipe = decision made
✓ Inline editing and approval (no modals)
✓ Keyboard-first workflow (J/K navigation, Enter to act)
✓ Color as semantic signal, not decoration
```

## Priority Queue Architecture

The entire pharmacy portal centers on ONE view: the priority-weighted order queue.

```typescript
interface OrderQueueItem {
  id: string;
  priority_score: number; // 0-100, computed
  priority_tier: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  
  // Time Pressure
  created_at: Date;
  promised_delivery_at: Date | null;
  time_in_queue_minutes: number;
  sla_breach_in_minutes: number | null;
  
  // Patient Context
  patient: {
    name: string;
    is_chronic_patient: boolean;
    has_refill_history: boolean;
    preferred_tier: boolean; // Premium patient
  };
  
  // Order Details
  status: 'PENDING_VERIFICATION' | 'NEEDS_PHARMACIST' | 'PREPARING' | 'READY' | 'AWAITING_COURIER';
  items_count: number;
  has_controlled_substance: boolean;
  has_interaction_warning: boolean;
  
  // AI Analysis Summary
  ai_verification: {
    status: 'approved' | 'needs_review' | 'rejected';
    confidence: number;
    attention_flags: string[];
  };
  
  // Quick Actions Available
  available_actions: ('VERIFY' | 'REJECT' | 'START_PREP' | 'MARK_READY' | 'CALL_PATIENT')[];
}
```

### Priority Score Computation

```typescript
function computePriorityScore(order: Order): number {
  let score = 50; // Base score
  
  // Time Pressure (+0 to +30)
  const minutesInQueue = differenceInMinutes(new Date(), order.created_at);
  score += Math.min(30, minutesInQueue / 3); // +1 per 3 min, max +30
  
  // SLA Breach Risk (+0 to +20)
  if (order.promised_delivery_at) {
    const minutesToBreach = differenceInMinutes(order.promised_delivery_at, new Date());
    if (minutesToBreach < 30) score += 20;
    else if (minutesToBreach < 60) score += 15;
    else if (minutesToBreach < 120) score += 10;
  }
  
  // Chronic Patient Priority (+10)
  if (order.patient.is_chronic_patient) score += 10;
  
  // Premium Patient (+5)
  if (order.patient.preferred_tier) score += 5;
  
  // Interaction Warning (-10 to allow time for review)
  if (order.has_interaction_warning) score -= 10;
  
  // Controlled Substance (special handling, +5)
  if (order.has_controlled_substance) score += 5;
  
  // AI Confidence Adjustment
  if (order.ai_verification.status === 'needs_review') score += 15;
  if (order.ai_verification.status === 'rejected') score -= 20; // Deprioritize rejected
  
  return Math.max(0, Math.min(100, score));
}
```

## Visual Design System

### Typography

```css
/* Breaking from AI-safe defaults */
:root {
  /* Primary: Tight, professional, medical precision */
  --font-primary: 'DM Sans', 'SF Pro Display', system-ui, sans-serif;
  
  /* Monospace: Data, codes, technical information */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
  
  /* Headlines: Impact without cheesiness */
  --font-headline: 'Inter Tight', 'DM Sans', system-ui, sans-serif;
  
  /* Sizes: Tighter scale for density */
  --text-xs: 0.6875rem;   /* 11px */
  --text-sm: 0.75rem;     /* 12px */
  --text-base: 0.875rem;  /* 14px */
  --text-lg: 1rem;        /* 16px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  
  /* Line heights: Tighter for density */
  --leading-tight: 1.15;
  --leading-normal: 1.35;
  --leading-relaxed: 1.5;
  
  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-mono: 0.1em;
}
```

### Color as Semantic Signal

```css
:root {
  /* Background: Deep, not pure black (reduces eye strain) */
  --bg-primary: #0A0A0F;
  --bg-secondary: #12121A;
  --bg-elevated: #1A1A24;
  --bg-surface: #22222E;
  
  /* Text: High contrast but not harsh */
  --text-primary: #F4F4F5;
  --text-secondary: #A1A1AA;
  --text-tertiary: #71717A;
  --text-muted: #52525B;
  
  /* Semantic: Action-oriented */
  --color-verify: #4ADE80;      /* Green: Approved, go */
  --color-warning: #FBBF24;     /* Amber: Needs attention */
  --color-danger: #F87171;      /* Red: Rejected, stop */
  --color-info: #60A5FA;        /* Blue: Informational */
  --color-neutral: #A1A1AA;     /* Gray: Inactive, disabled */
  
  /* Priority Tiers */
  --priority-critical: #EF4444; /* Red pulse */
  --priority-high: #F97316;     /* Orange */
  --priority-normal: #3B82F6;   /* Blue */
  --priority-low: #6B7280;      /* Gray */
  
  /* Accent: Not decorative - functional */
  --accent-primary: #8B5CF6;    /* Purple: Primary actions */
  --accent-secondary: #EC4899;  /* Pink: Secondary emphasis */
}
```

### Negative Space System

```css
/* Intentional spacing scale - not default 4px increments */
:root {
  --space-1: 0.25rem;   /* 4px - micro */
  --space-2: 0.5rem;    /* 8px - tight */
  --space-3: 0.875rem;  /* 14px - comfortable */
  --space-4: 1.25rem;   /* 20px - section */
  --space-5: 2rem;      /* 32px - block */
  --space-6: 3.5rem;    /* 56px - major */
  --space-8: 6rem;      /* 96px - dramatic */
}

/* Negative space as design element */
.queue-item {
  /* NOT: padding: 16px; */
  /* YES: asymmetric, intentional */
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-5);
  
  /* Left border as priority indicator, not rounded corners */
  border-left: 3px solid var(--priority-color);
  
  /* Subtle separator, not card shadow */
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
```

---

# DATABASE SCHEMA: EXPERT LEVEL

Skip the beginner schema. This is production-ready, audit-compliant, analytically-optimized.

## Core Tables

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Fuzzy text matching
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Geospatial for delivery tracking

-- ============================================
-- PATIENTS
-- ============================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  phone TEXT UNIQUE NOT NULL, -- Primary identifier (+212XXXXXXXXX)
  phone_verified BOOLEAN DEFAULT FALSE,
  email TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,

  -- Profile
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  national_id_encrypted TEXT, -- CIN, encrypted at application level

  -- Contact
  default_address_id UUID,

  -- Insurance
  primary_insurance_id UUID,
  insurance_member_id TEXT,

  -- Patient Classification
  is_chronic_patient BOOLEAN DEFAULT FALSE,
  chronic_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',

  -- Preferences
  preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('ar', 'fr', 'en')),
  notification_preferences JSONB DEFAULT '{"sms": true, "push": true, "email": false}',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_email ON patients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_patients_chronic ON patients(is_chronic_patient) WHERE is_chronic_patient = TRUE;

-- ============================================
-- PATIENT ADDRESSES
-- ============================================

CREATE TABLE patient_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Address Details
  label TEXT DEFAULT 'home', -- 'home', 'work', 'other'
  street_address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  region TEXT, -- Casablanca-Settat, Rabat-Salé-Kénitra, etc.

  -- Geolocation
  coordinates GEOGRAPHY(POINT, 4326),
  google_place_id TEXT,

  -- Delivery Instructions
  delivery_instructions TEXT,
  building_access_code TEXT,

  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patient_addresses_patient ON patient_addresses(patient_id);
CREATE INDEX idx_patient_addresses_coordinates ON patient_addresses USING GIST(coordinates);

-- ============================================
-- PHARMACIES
-- ============================================

CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  license_number TEXT UNIQUE NOT NULL, -- Ordre des Pharmaciens registration
  tax_id TEXT UNIQUE, -- Identifiant Fiscal
  ice_number TEXT UNIQUE, -- Identifiant Commun de l'Entreprise

  -- Profile
  name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  owner_pharmacist_id UUID, -- References pharmacy_staff

  -- Contact
  phone TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  website TEXT,

  -- Location
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  region TEXT NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  google_place_id TEXT,

  -- Service Area
  delivery_radius_km NUMERIC(5,2) DEFAULT 5.00,
  delivery_zones JSONB DEFAULT '[]', -- [{zone_id, name, delivery_fee, estimated_minutes}]

  -- Operating Hours
  operating_hours JSONB NOT NULL,
  -- {
  --   monday: {open: '08:00', close: '22:00', breaks: [{start: '13:00', end: '14:00'}]},
  --   tuesday: {...},
  --   ...
  --   is_24h: false,
  --   holiday_hours: [{date: '2025-01-01', closed: true}]
  -- }
  is_on_duty BOOLEAN DEFAULT FALSE, -- Pharmacie de garde

  -- Capabilities
  accepts_insurance BOOLEAN DEFAULT TRUE,
  accepted_insurers TEXT[] DEFAULT '{}',
  has_drive_through BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,
  wheelchair_accessible BOOLEAN DEFAULT FALSE,

  -- Platform Settings
  is_active BOOLEAN DEFAULT TRUE,
  accepts_orders BOOLEAN DEFAULT TRUE,
  max_daily_orders INTEGER DEFAULT 200,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 15.00,
  free_delivery_threshold NUMERIC(10,2),

  -- Performance Tier (set by platform based on metrics)
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('premium', 'standard', 'probation', 'suspended')),
  tier_updated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarded_at TIMESTAMPTZ
);

CREATE INDEX idx_pharmacies_coordinates ON pharmacies USING GIST(coordinates);
CREATE INDEX idx_pharmacies_city ON pharmacies(city);
CREATE INDEX idx_pharmacies_active ON pharmacies(is_active, accepts_orders) WHERE is_active = TRUE;
CREATE INDEX idx_pharmacies_duty ON pharmacies(is_on_duty) WHERE is_on_duty = TRUE;

-- ============================================
-- PHARMACY STAFF
-- ============================================

CREATE TABLE pharmacy_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Supabase auth.users reference
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,

  -- Profile
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  -- Professional Info
  role TEXT NOT NULL CHECK (role IN ('owner', 'pharmacist', 'assistant', 'technician', 'admin')),
  license_number TEXT, -- Required for pharmacists
  license_verified BOOLEAN DEFAULT FALSE,

  -- Access Control
  permissions JSONB DEFAULT '{}',
  -- {
  --   can_verify: true,
  --   can_reject: true,
  --   can_manage_inventory: true,
  --   can_manage_staff: false,
  --   can_view_analytics: true
  -- }

  -- Work Schedule
  schedule JSONB DEFAULT '{}',
  -- {monday: {start: '08:00', end: '16:00'}, ...}

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Performance Tracking
  verifications_count INTEGER DEFAULT 0,
  avg_verification_time_seconds INTEGER,
  accuracy_score NUMERIC(5,4), -- Based on rejection reversals, complaints

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_pharmacy_staff_pharmacy ON pharmacy_staff(pharmacy_id);
CREATE INDEX idx_pharmacy_staff_user ON pharmacy_staff(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_pharmacy_staff_role ON pharmacy_staff(pharmacy_id, role);

-- ============================================
-- COURIERS
-- ============================================

CREATE TABLE couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Supabase auth.users reference

  -- Profile
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  date_of_birth DATE NOT NULL,
  national_id_encrypted TEXT NOT NULL, -- CIN
  profile_photo_url TEXT,

  -- Vehicle Information
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('motorcycle', 'bicycle', 'car', 'scooter')),
  vehicle_plate TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,

  -- Documents
  driver_license_number TEXT,
  driver_license_expiry DATE,
  driver_license_photo_url TEXT,
  insurance_policy_number TEXT,
  insurance_expiry DATE,

  -- Work Zone
  primary_zone_id UUID,
  secondary_zones UUID[] DEFAULT '{}',
  max_delivery_radius_km NUMERIC(5,2) DEFAULT 10.00,

  -- Availability
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'offline', 'suspended')),
  current_location GEOGRAPHY(POINT, 4326),
  location_updated_at TIMESTAMPTZ,
  current_delivery_id UUID,

  -- Capacity
  max_concurrent_orders INTEGER DEFAULT 3,
  current_order_count INTEGER DEFAULT 0,

  -- Performance Metrics
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 5.00,
  total_ratings INTEGER DEFAULT 0,
  on_time_rate NUMERIC(5,4) DEFAULT 1.0000,
  acceptance_rate NUMERIC(5,4) DEFAULT 1.0000,

  -- Earnings
  earnings_balance NUMERIC(10,2) DEFAULT 0.00,
  total_earnings NUMERIC(12,2) DEFAULT 0.00,
  last_payout_at TIMESTAMPTZ,

  -- Verification
  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'passed', 'failed')),
  background_check_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  suspended_reason TEXT,
  suspended_until TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_couriers_status ON couriers(status) WHERE status = 'online';
CREATE INDEX idx_couriers_location ON couriers USING GIST(current_location);
CREATE INDEX idx_couriers_zone ON couriers(primary_zone_id);
CREATE INDEX idx_couriers_phone ON couriers(phone);

-- ============================================
-- DELIVERY ZONES
-- ============================================

CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Zone Definition
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,

  -- Geographic Boundary
  boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
  center_point GEOGRAPHY(POINT, 4326) NOT NULL,

  -- Pricing
  base_delivery_fee NUMERIC(10,2) NOT NULL,
  per_km_fee NUMERIC(10,2) DEFAULT 2.00,
  surge_multiplier NUMERIC(3,2) DEFAULT 1.00,

  -- Timing
  estimated_minutes_base INTEGER DEFAULT 30,
  estimated_minutes_per_km INTEGER DEFAULT 3,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_surge_active BOOLEAN DEFAULT FALSE,
  surge_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_zones_boundary ON delivery_zones USING GIST(boundary);
CREATE INDEX idx_delivery_zones_city ON delivery_zones(city);

-- ============================================
-- INSURANCE PROVIDERS
-- ============================================

CREATE TABLE insurance_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  code TEXT UNIQUE NOT NULL, -- 'CNSS', 'CNOPS', 'AMO', 'SAHAM', etc.
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,

  -- Type
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'mutual')),

  -- Coverage
  default_coverage_rate NUMERIC(3,2) DEFAULT 0.70,
  coverage_rules JSONB DEFAULT '{}',
  -- {
  --   by_drug_class: [{class: 'generic', rate: 0.80}, {class: 'brand', rate: 0.60}],
  --   max_annual_coverage: 50000.00,
  --   waiting_period_days: 90
  -- }

  -- Integration
  api_available BOOLEAN DEFAULT FALSE,
  api_endpoint TEXT,
  api_credentials_encrypted TEXT,
  claim_method TEXT DEFAULT 'manual' CHECK (claim_method IN ('api', 'email', 'manual', 'portal')),

  -- Contact
  claims_email TEXT,
  claims_phone TEXT,
  portal_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENT INSURANCE
-- ============================================

CREATE TABLE patient_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id),

  -- Policy Details
  policy_number TEXT NOT NULL,
  member_id TEXT NOT NULL,
  group_number TEXT,

  -- Card Information
  card_front_url TEXT,
  card_back_url TEXT,

  -- Coverage
  coverage_rate NUMERIC(3,2), -- Override default if specified
  annual_max NUMERIC(12,2),
  annual_used NUMERIC(12,2) DEFAULT 0.00,
  deductible NUMERIC(10,2) DEFAULT 0.00,
  deductible_met NUMERIC(10,2) DEFAULT 0.00,

  -- Validity
  effective_date DATE NOT NULL,
  expiry_date DATE,

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_method TEXT,

  -- Status
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patient_insurance_patient ON patient_insurance(patient_id);
CREATE INDEX idx_patient_insurance_provider ON patient_insurance(insurance_provider_id);

-- ============================================
-- PRESCRIPTION EVENTS (Event Sourcing Core)
-- ============================================

CREATE TABLE prescription_events (
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
  event_hash TEXT NOT NULL, -- sha256(previous_hash + event_data)
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for common access patterns
  CONSTRAINT unique_prescription_sequence UNIQUE (prescription_id, created_at)
);

CREATE INDEX idx_prescription_events_prescription ON prescription_events(prescription_id);
CREATE INDEX idx_prescription_events_type ON prescription_events(event_type);
CREATE INDEX idx_prescription_events_actor ON prescription_events(actor_id, actor_type);
CREATE INDEX idx_prescription_events_time ON prescription_events(created_at DESC);

-- ============================================
-- PRESCRIPTION STATE (Materialized View)
-- ============================================

CREATE TABLE prescription_states (
  prescription_id UUID PRIMARY KEY,
  
  -- Current Status
  status TEXT NOT NULL DEFAULT 'pending_verification',
  status_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Order Information
  patient_id UUID NOT NULL REFERENCES patients(id),
  pharmacy_id UUID REFERENCES pharmacies(id),
  courier_id UUID REFERENCES couriers(id),
  
  -- Prescription Details
  original_image_url TEXT,
  processed_image_url TEXT,
  
  -- AI Analysis Results
  ai_analysis JSONB DEFAULT '{}',
  -- {ocr_text, entities, drug_matches, interactions, fraud_indicators}
  
  -- Pharmacist Verification
  pharmacist_id UUID REFERENCES pharmacy_staff(id),
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

-- Function to update state from events
CREATE OR REPLACE FUNCTION apply_prescription_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Update prescription_states based on event type
  CASE NEW.event_type
    WHEN 'PRESCRIPTION_CREATED' THEN
      INSERT INTO prescription_states (prescription_id, patient_id, status)
      VALUES (NEW.prescription_id, (NEW.event_data->>'patient_id')::UUID, 'pending_image');

    WHEN 'IMAGE_UPLOADED' THEN
      UPDATE prescription_states
      SET status = 'pending_ai_analysis',
          original_image_url = NEW.event_data->>'image_url',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'IMAGE_QUALITY_ANALYZED' THEN
      UPDATE prescription_states
      SET processed_image_url = NEW.event_data->>'processed_image_url',
          ai_analysis = COALESCE(ai_analysis, '{}'::JSONB) ||
            jsonb_build_object('image_quality', NEW.event_data->'quality_scores'),
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'AI_VERIFICATION_COMPLETED' THEN
      UPDATE prescription_states
      SET status = CASE
            WHEN (NEW.event_data->>'needs_review')::BOOLEAN THEN 'pending_pharmacist_review'
            ELSE 'pending_verification'
          END,
          ai_analysis = NEW.event_data,
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'PHARMACIST_REVIEWED' THEN
      UPDATE prescription_states
      SET pharmacist_id = (NEW.event_data->>'pharmacist_id')::UUID,
          verification_notes = NEW.event_data->>'notes',
          status = 'pending_verification',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'PHARMACIST_APPROVED' THEN
      UPDATE prescription_states
      SET status = 'verified',
          pharmacist_id = (NEW.event_data->>'pharmacist_id')::UUID,
          verified_at = NOW(),
          verified_medications = NEW.event_data->'medications',
          subtotal = (NEW.event_data->>'subtotal')::NUMERIC,
          insurance_coverage = (NEW.event_data->>'insurance_coverage')::NUMERIC,
          patient_copay = (NEW.event_data->>'patient_copay')::NUMERIC,
          total = (NEW.event_data->>'total')::NUMERIC,
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'PHARMACIST_REJECTED' THEN
      UPDATE prescription_states
      SET status = 'rejected',
          pharmacist_id = (NEW.event_data->>'pharmacist_id')::UUID,
          verification_notes = NEW.event_data->>'rejection_reason',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'PHARMACIST_REQUESTED_CLARIFICATION' THEN
      UPDATE prescription_states
      SET status = 'awaiting_patient_response',
          pharmacist_id = (NEW.event_data->>'pharmacist_id')::UUID,
          verification_notes = NEW.event_data->>'clarification_request',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'PATIENT_RESPONDED' THEN
      UPDATE prescription_states
      SET status = 'pending_pharmacist_review',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'PREPARATION_STARTED' THEN
      UPDATE prescription_states
      SET status = 'preparing',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'PREPARATION_COMPLETED' THEN
      UPDATE prescription_states
      SET status = 'ready_for_pickup',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'COURIER_ASSIGNED' THEN
      UPDATE prescription_states
      SET status = 'awaiting_courier',
          courier_id = (NEW.event_data->>'courier_id')::UUID,
          promised_delivery_at = (NEW.event_data->>'promised_delivery_at')::TIMESTAMPTZ,
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'COURIER_PICKED_UP' THEN
      UPDATE prescription_states
      SET status = 'picked_up',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'DELIVERY_STARTED' THEN
      UPDATE prescription_states
      SET status = 'out_for_delivery',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'DELIVERY_COMPLETED' THEN
      UPDATE prescription_states
      SET status = 'delivered',
          actual_delivery_at = NOW(),
          delivery_proof = NEW.event_data->'delivery_proof',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'DELIVERY_FAILED' THEN
      UPDATE prescription_states
      SET status = 'delivery_failed',
          verification_notes = NEW.event_data->>'failure_reason',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'PATIENT_CONFIRMED' THEN
      UPDATE prescription_states
      SET status = 'completed',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'REFUND_INITIATED' THEN
      UPDATE prescription_states
      SET status = 'refund_pending',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    WHEN 'REFUND_COMPLETED' THEN
      UPDATE prescription_states
      SET status = 'refunded',
          updated_at = NOW()
      WHERE prescription_id = NEW.prescription_id;

    ELSE
      -- Log unknown event type but don't fail
      RAISE WARNING 'Unknown event type: %', NEW.event_type;
  END CASE;

  -- Update priority score after any state change
  UPDATE prescription_states
  SET priority_score = calculate_priority_score(prescription_id),
      version = version + 1
  WHERE prescription_id = NEW.prescription_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Priority score calculation function
CREATE OR REPLACE FUNCTION calculate_priority_score(p_prescription_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 50;
  v_state prescription_states%ROWTYPE;
  v_patient patients%ROWTYPE;
  v_minutes_in_queue INTEGER;
  v_minutes_to_breach INTEGER;
BEGIN
  SELECT * INTO v_state FROM prescription_states WHERE prescription_id = p_prescription_id;
  SELECT * INTO v_patient FROM patients WHERE id = v_state.patient_id;

  -- Time in queue factor (+0 to +30)
  v_minutes_in_queue := EXTRACT(EPOCH FROM (NOW() - v_state.created_at)) / 60;
  v_score := v_score + LEAST(30, v_minutes_in_queue / 3);

  -- SLA breach risk (+0 to +20)
  IF v_state.promised_delivery_at IS NOT NULL THEN
    v_minutes_to_breach := EXTRACT(EPOCH FROM (v_state.promised_delivery_at - NOW())) / 60;
    IF v_minutes_to_breach < 30 THEN
      v_score := v_score + 20;
    ELSIF v_minutes_to_breach < 60 THEN
      v_score := v_score + 15;
    ELSIF v_minutes_to_breach < 120 THEN
      v_score := v_score + 10;
    END IF;
  END IF;

  -- Chronic patient priority (+10)
  IF v_patient.is_chronic_patient THEN
    v_score := v_score + 10;
  END IF;

  -- Interaction warning (-10 for review time)
  IF (v_state.ai_analysis->>'has_interactions')::BOOLEAN THEN
    v_score := v_score - 10;
  END IF;

  -- Controlled substance (+5 for priority handling)
  IF (v_state.ai_analysis->>'has_controlled_substance')::BOOLEAN THEN
    v_score := v_score + 5;
  END IF;

  -- AI needs review (+15)
  IF (v_state.ai_analysis->>'needs_review')::BOOLEAN THEN
    v_score := v_score + 15;
  END IF;

  -- AI rejected (-20 to deprioritize)
  IF v_state.status = 'rejected' THEN
    v_score := v_score - 20;
  END IF;

  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prescription_event_applied
AFTER INSERT ON prescription_events
FOR EACH ROW
EXECUTE FUNCTION apply_prescription_event();

-- ============================================
-- PATIENT HEALTH GRAPH
-- ============================================

CREATE TABLE patient_health_graphs (
  patient_id UUID PRIMARY KEY REFERENCES patients(id),
  
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

CREATE TABLE pharmacy_intelligence (
  pharmacy_id UUID PRIMARY KEY REFERENCES pharmacies(id),
  
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
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE prescription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_health_graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_intelligence ENABLE ROW LEVEL SECURITY;

-- Patients can only see their own data
CREATE POLICY patient_own_prescriptions ON prescription_states
  FOR ALL
  USING (patient_id = auth.uid());

CREATE POLICY patient_own_health_graph ON patient_health_graphs
  FOR SELECT
  USING (patient_id = auth.uid());

-- Pharmacies can see orders assigned to them
CREATE POLICY pharmacy_orders ON prescription_states
  FOR ALL
  USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_staff WHERE user_id = auth.uid()
    )
  );

-- Pharmacy intelligence only visible to pharmacy staff
CREATE POLICY pharmacy_own_intelligence ON pharmacy_intelligence
  FOR SELECT
  USING (
    pharmacy_id IN (
      SELECT pharmacy_id FROM pharmacy_staff WHERE user_id = auth.uid()
    )
  );
```

---

# IMPLEMENTATION PHASES

## Phase 0: Foundation (Week 1)
- Supabase project + schema deployment
- Authentication (phone OTP via Twilio)
- TypeScript type generation from schema
- Base UI component library (breaking from defaults)
- CI/CD pipeline (Vercel)

## Phase 1: AI Verification Engine (Weeks 2-3)
- TensorFlow Lite models for client-side image analysis
- Server-side OCR integration (Google Vision API)
- Medical NER model training/fine-tuning
- Morocco drug database population
- Interaction checking engine
- Fraud detection baseline

## Phase 2: Pharmacy Portal MVP (Weeks 4-6)
- Priority queue implementation
- Verification interface
- Keyboard-first navigation
- One-action approval flow
- Basic inventory management
- Performance dashboard

## Phase 3: Patient App MVP (Weeks 7-9)
- Prescription upload with live guidance
- Order tracking
- Medication reminders
- Profile and health history

## Phase 4: Courier App MVP (Weeks 10-11)
- Order acceptance
- Navigation
- Delivery verification (OTP + photo)
- Earnings dashboard

## Phase 5: Intelligence Layer (Weeks 12-14)
- Patient health graph computation
- Pharmacy intelligence scoring
- Demand forecasting
- Insurance claim automation
- Analytics dashboards

## Phase 6: Polish & Launch (Weeks 15-16)
- Performance optimization
- Security audit
- Load testing
- Soft launch with pilot pharmacies

---

# QUALITY GATES

Before each phase completion:

```
□ TypeScript strict mode: zero errors
□ All external data validated with Zod schemas
□ RLS policies tested with edge cases
□ Audit logging verified for all PII access
□ Performance: API <100ms p95, UI <3s TTI
□ Accessibility: WCAG 2.1 AA compliance
□ Event sourcing: All mutations create events
□ No console.logs in production code
```

---

# BEGIN IMPLEMENTATION

Start with Phase 0: Foundation.

Deploy the complete database schema with all tables, types, indexes, RLS policies, and triggers.

Report completion with:
1. Files created
2. Tables deployed
3. RLS policies active
4. TypeScript types generated
5. Design system components initialized
6. Any blockers encountered

Await approval before Phase 1.

---

# API ARCHITECTURE

RESTful + Real-time hybrid. Supabase handles most, but custom endpoints where needed.

## Endpoint Design Principles

```typescript
// API Response Envelope - Consistent structure
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: {
    request_id: string;
    timestamp: string;
    duration_ms: number;
  };
}

interface ApiError {
  code: string;           // Machine-readable: 'PRESCRIPTION_NOT_FOUND'
  message: string;        // Human-readable (localized)
  details: unknown;       // Additional context
  retry_after?: number;   // For rate limiting
}

// Pagination - Cursor-based for real-time consistency
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    cursor: string | null;
    has_more: boolean;
    total_count?: number;  // Only when explicitly requested
  };
}
```

## Core API Endpoints

```typescript
// Prescription Lifecycle
POST   /api/v1/prescriptions                    // Create prescription
POST   /api/v1/prescriptions/:id/upload         // Upload image
GET    /api/v1/prescriptions/:id                // Get prescription with events
GET    /api/v1/prescriptions/:id/events         // Get event stream
POST   /api/v1/prescriptions/:id/verify         // Pharmacist verification
POST   /api/v1/prescriptions/:id/reject         // Pharmacist rejection
POST   /api/v1/prescriptions/:id/prepare        // Start preparation
POST   /api/v1/prescriptions/:id/ready          // Mark ready for pickup
POST   /api/v1/prescriptions/:id/deliver        // Delivery confirmation

// Pharmacy Portal
GET    /api/v1/pharmacy/queue                   // Priority-ordered queue
GET    /api/v1/pharmacy/stats                   // Real-time statistics
GET    /api/v1/pharmacy/inventory               // Current inventory
POST   /api/v1/pharmacy/inventory/update        // Inventory adjustment
GET    /api/v1/pharmacy/intelligence            // Performance metrics

// Patient
GET    /api/v1/patient/prescriptions            // Order history
GET    /api/v1/patient/health-graph             // Health profile
GET    /api/v1/patient/medications/active       // Current medications
POST   /api/v1/patient/medications/reminder     // Set reminder

// Courier
GET    /api/v1/courier/available                // Available deliveries
POST   /api/v1/courier/accept/:id               // Accept delivery
POST   /api/v1/courier/pickup/:id               // Confirm pickup
POST   /api/v1/courier/deliver/:id              // Complete delivery
GET    /api/v1/courier/earnings                 // Earnings summary

// Drug Database
GET    /api/v1/drugs/search                     // Drug search
GET    /api/v1/drugs/:id                        // Drug details
GET    /api/v1/drugs/:id/interactions           // Check interactions
```

## Request Validation (Zod Schemas)

```typescript
import { z } from 'zod';

// Prescription creation
export const CreatePrescriptionSchema = z.object({
  delivery_address: z.object({
    street: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    postal_code: z.string().regex(/^\d{5}$/),
    coordinates: z.object({
      lat: z.number().min(27).max(36),   // Morocco bounds
      lng: z.number().min(-13).max(-1),
    }).optional(),
    instructions: z.string().max(500).optional(),
  }),
  preferred_pharmacy_id: z.string().uuid().optional(),
  urgency: z.enum(['standard', 'express', 'scheduled']).default('standard'),
  scheduled_delivery_at: z.string().datetime().optional(),
  insurance_id: z.string().uuid().optional(),
});

// Pharmacist verification
export const VerifyPrescriptionSchema = z.object({
  medications: z.array(z.object({
    drug_id: z.string().uuid(),
    name: z.string(),
    dosage: z.string(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
    instructions: z.string().optional(),
    substitution_allowed: z.boolean().default(true),
  })).min(1),
  notes: z.string().max(1000).optional(),
  interaction_acknowledged: z.boolean().optional(),
  controlled_substance_verified: z.boolean().optional(),
});

// Delivery completion
export const CompleteDeliverySchema = z.object({
  delivery_proof: z.object({
    photo_url: z.string().url(),
    signature_url: z.string().url().optional(),
    otp_verified: z.boolean(),
    recipient_name: z.string().optional(),
    notes: z.string().max(500).optional(),
  }),
  actual_delivery_location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy_meters: z.number(),
  }),
});
```

---

# REAL-TIME ARCHITECTURE

Supabase Realtime for subscriptions, but architected for scale.

## Subscription Channels

```typescript
// Channel architecture
const CHANNELS = {
  // Pharmacy receives all orders for their pharmacy
  PHARMACY_QUEUE: (pharmacyId: string) => `pharmacy:${pharmacyId}:queue`,

  // Patient tracks their specific order
  ORDER_TRACKING: (orderId: string) => `order:${orderId}:tracking`,

  // Courier receives available orders in their zone
  COURIER_ZONE: (zoneId: string) => `courier:zone:${zoneId}`,

  // System-wide announcements (maintenance, etc.)
  SYSTEM: 'system:announcements',
};

// Real-time event types
type RealtimeEvent =
  | { type: 'ORDER_CREATED'; payload: OrderSummary }
  | { type: 'ORDER_UPDATED'; payload: { id: string; status: OrderStatus; } }
  | { type: 'QUEUE_REORDERED'; payload: { order_ids: string[] } }
  | { type: 'COURIER_LOCATION'; payload: { lat: number; lng: number; eta_minutes: number } }
  | { type: 'INVENTORY_ALERT'; payload: { drug_id: string; alert_type: string } }
  | { type: 'PRIORITY_ESCALATION'; payload: { order_id: string; new_priority: number } };
```

## Pharmacy Queue Real-time Updates

```typescript
// Pharmacy portal subscription
export function usePharmacyQueue(pharmacyId: string) {
  const [queue, setQueue] = useState<OrderQueueItem[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(CHANNELS.PHARMACY_QUEUE(pharmacyId))
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prescription_states',
        filter: `pharmacy_id=eq.${pharmacyId}`,
      }, (payload) => {
        handleQueueUpdate(payload);
      })
      .on('broadcast', { event: 'queue_update' }, (payload) => {
        handleBroadcastUpdate(payload);
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pharmacyId]);

  const handleQueueUpdate = (payload: RealtimePostgresChangesPayload<OrderQueueItem>) => {
    setQueue(current => {
      switch (payload.eventType) {
        case 'INSERT':
          // Add to queue and re-sort by priority
          return [...current, payload.new as OrderQueueItem]
            .sort((a, b) => b.priority_score - a.priority_score);
        case 'UPDATE':
          // Update existing item
          return current
            .map(item => item.id === payload.new.id ? payload.new as OrderQueueItem : item)
            .sort((a, b) => b.priority_score - a.priority_score);
        case 'DELETE':
          return current.filter(item => item.id !== payload.old.id);
        default:
          return current;
      }
    });
  };

  return { queue, connected };
}
```

## Order Tracking for Patients

```typescript
// Patient order tracking
export function useOrderTracking(orderId: string) {
  const [order, setOrder] = useState<OrderTrackingState | null>(null);
  const [courierLocation, setCourierLocation] = useState<CourierLocation | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(CHANNELS.ORDER_TRACKING(orderId))
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'prescription_events',
        filter: `prescription_id=eq.${orderId}`,
      }, (payload) => {
        // New event in the order timeline
        setEvents(current => [...current, payload.new as OrderEvent]);

        // Update derived state based on event type
        updateOrderState(payload.new);
      })
      .on('broadcast', { event: 'courier_location' }, (payload) => {
        setCourierLocation({
          lat: payload.payload.lat,
          lng: payload.payload.lng,
          heading: payload.payload.heading,
          eta_minutes: payload.payload.eta_minutes,
          updated_at: new Date(),
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { order, courierLocation, events };
}
```

---

# NOTIFICATION SYSTEM

Multi-channel notification architecture: SMS, Push, Email, WhatsApp.

## Notification Database Schema

```sql
-- ============================================
-- NOTIFICATION TEMPLATES
-- ============================================

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template Identity
  code TEXT UNIQUE NOT NULL, -- 'ORDER_CONFIRMED', 'DELIVERY_STARTED', etc.
  name TEXT NOT NULL,
  description TEXT,

  -- Channels
  channels TEXT[] NOT NULL DEFAULT '{}', -- ['sms', 'push', 'email', 'whatsapp']

  -- Content (per language)
  content JSONB NOT NULL,
  -- {
  --   ar: {title: '...', body: '...', sms: '...'},
  --   fr: {title: '...', body: '...', sms: '...'},
  --   en: {title: '...', body: '...', sms: '...'}
  -- }

  -- Variables available in template
  variables TEXT[] DEFAULT '{}', -- ['patient_name', 'order_id', 'pharmacy_name']

  -- Settings
  is_transactional BOOLEAN DEFAULT TRUE, -- Can't be unsubscribed
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATION LOG
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('patient', 'pharmacist', 'courier', 'admin')),
  recipient_contact TEXT NOT NULL, -- phone, email, or device token

  -- Template
  template_id UUID REFERENCES notification_templates(id),
  template_code TEXT NOT NULL,

  -- Channel
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'push', 'email', 'whatsapp')),

  -- Content (rendered)
  title TEXT,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional data for push notifications

  -- Context
  prescription_id UUID,
  related_entity_type TEXT,
  related_entity_id UUID,

  -- Delivery Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'queued', 'sent', 'delivered', 'failed', 'read'
  )),
  provider TEXT, -- 'twilio', 'firebase', 'sendgrid', 'whatsapp_business'
  provider_message_id TEXT,
  provider_response JSONB DEFAULT '{}',

  -- Timing
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Retry
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_prescription ON notifications(prescription_id);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at) WHERE status = 'pending';

-- ============================================
-- PUSH NOTIFICATION TOKENS
-- ============================================

CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'pharmacist', 'courier')),

  -- Device Info
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,
  device_name TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, device_token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id, user_type);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = TRUE;
```

## Notification Service Implementation

```typescript
import Twilio from 'twilio';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

// Notification types for each event
const NOTIFICATION_TRIGGERS = {
  // Patient notifications
  PRESCRIPTION_SUBMITTED: {
    recipient: 'patient',
    channels: ['push', 'sms'],
    template: 'PRESCRIPTION_SUBMITTED',
  },
  PRESCRIPTION_VERIFIED: {
    recipient: 'patient',
    channels: ['push', 'sms'],
    template: 'PRESCRIPTION_VERIFIED',
  },
  PRESCRIPTION_REJECTED: {
    recipient: 'patient',
    channels: ['push', 'sms', 'whatsapp'],
    template: 'PRESCRIPTION_REJECTED',
  },
  CLARIFICATION_NEEDED: {
    recipient: 'patient',
    channels: ['push', 'sms', 'whatsapp'],
    template: 'CLARIFICATION_NEEDED',
  },
  ORDER_PREPARING: {
    recipient: 'patient',
    channels: ['push'],
    template: 'ORDER_PREPARING',
  },
  COURIER_ASSIGNED: {
    recipient: 'patient',
    channels: ['push', 'sms'],
    template: 'COURIER_ASSIGNED',
  },
  DELIVERY_STARTED: {
    recipient: 'patient',
    channels: ['push'],
    template: 'DELIVERY_STARTED',
  },
  DELIVERY_ARRIVING: {
    recipient: 'patient',
    channels: ['push', 'sms'],
    template: 'DELIVERY_ARRIVING',
  },
  DELIVERY_COMPLETED: {
    recipient: 'patient',
    channels: ['push', 'sms'],
    template: 'DELIVERY_COMPLETED',
  },

  // Pharmacy notifications
  NEW_ORDER: {
    recipient: 'pharmacy',
    channels: ['push'],
    template: 'PHARMACY_NEW_ORDER',
  },
  HIGH_PRIORITY_ORDER: {
    recipient: 'pharmacy',
    channels: ['push', 'sms'],
    template: 'PHARMACY_HIGH_PRIORITY',
  },

  // Courier notifications
  DELIVERY_AVAILABLE: {
    recipient: 'courier',
    channels: ['push'],
    template: 'COURIER_NEW_DELIVERY',
  },
  DELIVERY_ASSIGNED: {
    recipient: 'courier',
    channels: ['push', 'sms'],
    template: 'COURIER_ASSIGNED',
  },
};

// Notification templates
const TEMPLATES = {
  PRESCRIPTION_VERIFIED: {
    ar: {
      title: 'تم التحقق من الوصفة',
      body: 'تم التحقق من وصفتك الطبية. المبلغ الإجمالي: {{total}} درهم',
      sms: 'DAWA.ma: تم التحقق من وصفتك. المبلغ: {{total}} درهم. تتبع: {{tracking_url}}',
    },
    fr: {
      title: 'Ordonnance vérifiée',
      body: 'Votre ordonnance a été vérifiée. Total: {{total}} MAD',
      sms: 'DAWA.ma: Ordonnance vérifiée. Total: {{total}} MAD. Suivi: {{tracking_url}}',
    },
    en: {
      title: 'Prescription Verified',
      body: 'Your prescription has been verified. Total: {{total}} MAD',
      sms: 'DAWA.ma: Prescription verified. Total: {{total}} MAD. Track: {{tracking_url}}',
    },
  },
  DELIVERY_ARRIVING: {
    ar: {
      title: 'التوصيل قريب',
      body: 'السائق {{courier_name}} على بعد {{eta}} دقائق. جهز الكود: {{otp}}',
      sms: 'DAWA.ma: التوصيل خلال {{eta}} دقائق. كود التسليم: {{otp}}',
    },
    fr: {
      title: 'Livraison imminente',
      body: '{{courier_name}} arrive dans {{eta}} minutes. Code: {{otp}}',
      sms: 'DAWA.ma: Livraison dans {{eta}} min. Code: {{otp}}',
    },
    en: {
      title: 'Delivery Arriving',
      body: '{{courier_name}} arriving in {{eta}} minutes. Code: {{otp}}',
      sms: 'DAWA.ma: Delivery in {{eta}} min. Code: {{otp}}',
    },
  },
  // ... more templates
};

class NotificationService {
  private twilio: Twilio.Twilio;
  private firebase: admin.messaging.Messaging;
  private resend: Resend;

  constructor() {
    this.twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    this.firebase = admin.messaging();
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async notify(
    trigger: keyof typeof NOTIFICATION_TRIGGERS,
    data: NotificationData
  ): Promise<void> {
    const config = NOTIFICATION_TRIGGERS[trigger];
    const template = TEMPLATES[config.template];

    if (!template) {
      throw new Error(`Template not found: ${config.template}`);
    }

    // Get recipient preferences
    const recipient = await this.getRecipient(data.recipient_id, config.recipient);
    const language = recipient.preferred_language || 'fr';
    const content = template[language];

    // Render template
    const rendered = this.renderTemplate(content, data.variables);

    // Get enabled channels (respect user preferences)
    const enabledChannels = this.filterChannels(
      config.channels,
      recipient.notification_preferences
    );

    // Send to each channel
    const notifications = await Promise.allSettled(
      enabledChannels.map(channel =>
        this.sendToChannel(channel, recipient, rendered, data)
      )
    );

    // Log results
    await this.logNotifications(notifications, data);
  }

  private async sendToChannel(
    channel: string,
    recipient: Recipient,
    content: RenderedContent,
    data: NotificationData
  ): Promise<NotificationResult> {
    switch (channel) {
      case 'sms':
        return this.sendSMS(recipient.phone, content.sms, data);
      case 'push':
        return this.sendPush(recipient.id, content.title, content.body, data);
      case 'email':
        return this.sendEmail(recipient.email, content.title, content.body, data);
      case 'whatsapp':
        return this.sendWhatsApp(recipient.phone, content.sms, data);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  private async sendSMS(
    phone: string,
    message: string,
    data: NotificationData
  ): Promise<NotificationResult> {
    try {
      const result = await this.twilio.messages.create({
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: message,
      });

      return {
        success: true,
        channel: 'sms',
        provider: 'twilio',
        provider_message_id: result.sid,
      };
    } catch (error) {
      return {
        success: false,
        channel: 'sms',
        provider: 'twilio',
        error: error.message,
      };
    }
  }

  private async sendPush(
    userId: string,
    title: string,
    body: string,
    data: NotificationData
  ): Promise<NotificationResult> {
    // Get all active tokens for user
    const tokens = await db
      .select()
      .from(push_tokens)
      .where(and(
        eq(push_tokens.user_id, userId),
        eq(push_tokens.is_active, true)
      ));

    if (tokens.length === 0) {
      return { success: false, channel: 'push', error: 'No active tokens' };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: tokens.map(t => t.device_token),
      notification: {
        title,
        body,
      },
      data: {
        prescription_id: data.prescription_id || '',
        action: data.action || '',
        ...data.extra,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'dawa_orders',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: data.badge_count || 0,
          },
        },
      },
    };

    try {
      const result = await this.firebase.sendEachForMulticast(message);

      // Handle token cleanup for failed sends
      result.responses.forEach((response, idx) => {
        if (!response.success) {
          const error = response.error;
          if (
            error?.code === 'messaging/invalid-registration-token' ||
            error?.code === 'messaging/registration-token-not-registered'
          ) {
            // Mark token as inactive
            this.deactivateToken(tokens[idx].id);
          }
        }
      });

      return {
        success: result.successCount > 0,
        channel: 'push',
        provider: 'firebase',
        provider_message_id: result.responses[0]?.messageId,
        sent_count: result.successCount,
        failed_count: result.failureCount,
      };
    } catch (error) {
      return {
        success: false,
        channel: 'push',
        provider: 'firebase',
        error: error.message,
      };
    }
  }

  private async sendWhatsApp(
    phone: string,
    message: string,
    data: NotificationData
  ): Promise<NotificationResult> {
    try {
      const result = await this.twilio.messages.create({
        to: `whatsapp:${phone}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        body: message,
      });

      return {
        success: true,
        channel: 'whatsapp',
        provider: 'twilio',
        provider_message_id: result.sid,
      };
    } catch (error) {
      return {
        success: false,
        channel: 'whatsapp',
        provider: 'twilio',
        error: error.message,
      };
    }
  }

  private async sendEmail(
    email: string,
    subject: string,
    body: string,
    data: NotificationData
  ): Promise<NotificationResult> {
    try {
      const result = await this.resend.emails.send({
        from: 'DAWA.ma <notifications@dawa.ma>',
        to: email,
        subject,
        html: this.generateEmailHTML(subject, body, data),
      });

      return {
        success: true,
        channel: 'email',
        provider: 'resend',
        provider_message_id: result.id,
      };
    } catch (error) {
      return {
        success: false,
        channel: 'email',
        provider: 'resend',
        error: error.message,
      };
    }
  }

  private renderTemplate(
    template: { title: string; body: string; sms: string },
    variables: Record<string, string>
  ): { title: string; body: string; sms: string } {
    const render = (text: string) => {
      return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
    };

    return {
      title: render(template.title),
      body: render(template.body),
      sms: render(template.sms),
    };
  }

  private filterChannels(
    channels: string[],
    preferences: NotificationPreferences
  ): string[] {
    return channels.filter(channel => {
      switch (channel) {
        case 'sms': return preferences.sms !== false;
        case 'push': return preferences.push !== false;
        case 'email': return preferences.email === true;
        case 'whatsapp': return preferences.whatsapp !== false;
        default: return false;
      }
    });
  }
}

// Notification triggers from event sourcing
export async function handlePrescriptionEvent(event: PrescriptionEvent) {
  const notificationService = new NotificationService();

  switch (event.event_type) {
    case 'PHARMACIST_APPROVED':
      await notificationService.notify('PRESCRIPTION_VERIFIED', {
        recipient_id: event.event_data.patient_id,
        prescription_id: event.prescription_id,
        variables: {
          total: event.event_data.total,
          tracking_url: `https://dawa.ma/track/${event.prescription_id}`,
        },
      });
      break;

    case 'COURIER_ASSIGNED':
      await notificationService.notify('COURIER_ASSIGNED', {
        recipient_id: event.event_data.patient_id,
        prescription_id: event.prescription_id,
        variables: {
          courier_name: event.event_data.courier_name,
          eta: event.event_data.estimated_minutes,
        },
      });
      break;

    case 'DELIVERY_STARTED':
      // Also trigger push to patient with live tracking
      await notificationService.notify('DELIVERY_STARTED', {
        recipient_id: event.event_data.patient_id,
        prescription_id: event.prescription_id,
        action: 'OPEN_TRACKING',
        variables: {
          courier_name: event.event_data.courier_name,
        },
      });
      break;

    // ... handle other events
  }
}
```

## Medication Reminders

```typescript
// Scheduled medication reminder system
interface MedicationReminder {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly';
  times: string[]; // ['08:00', '20:00']
  start_date: Date;
  end_date: Date | null;
  is_active: boolean;
}

// Cron job for medication reminders (runs every minute)
async function processMedicationReminders() {
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  const currentDay = format(now, 'EEEE').toLowerCase();

  // Find due reminders
  const dueReminders = await db
    .select()
    .from(medication_reminders)
    .where(and(
      eq(medication_reminders.is_active, true),
      sql`${currentTime} = ANY(${medication_reminders.times})`,
      lte(medication_reminders.start_date, now),
      or(
        isNull(medication_reminders.end_date),
        gte(medication_reminders.end_date, now)
      )
    ));

  for (const reminder of dueReminders) {
    const notificationService = new NotificationService();

    await notificationService.notify('MEDICATION_REMINDER', {
      recipient_id: reminder.patient_id,
      variables: {
        medication: reminder.medication_name,
        dosage: reminder.dosage,
        time: currentTime,
      },
    });

    // Log reminder sent
    await db.insert(reminder_logs).values({
      reminder_id: reminder.id,
      sent_at: now,
      status: 'sent',
    });
  }
}
```

---

# SECURITY & COMPLIANCE

## Moroccan CNDP (Law 09-08) Compliance

```typescript
// Data classification per CNDP requirements
enum DataClassification {
  PUBLIC = 'public',              // Non-sensitive
  INTERNAL = 'internal',          // Business data
  CONFIDENTIAL = 'confidential',  // PII
  SENSITIVE = 'sensitive',        // Health data (requires explicit consent)
}

// Consent management
interface PatientConsent {
  patient_id: string;
  consent_type: 'data_processing' | 'health_data' | 'marketing' | 'analytics' | 'third_party';
  granted: boolean;
  granted_at: Date | null;
  revoked_at: Date | null;
  consent_version: string;
  ip_address: string;
  consent_text_hash: string; // Prove what they agreed to
}

// Data retention per CNDP
const RETENTION_POLICIES = {
  // Health records: 10 years (Moroccan healthcare regulation)
  prescription_events: { years: 10, after: 'last_activity' },
  patient_health_graphs: { years: 10, after: 'last_activity' },

  // Financial records: 10 years (tax compliance)
  payment_records: { years: 10, after: 'transaction_date' },

  // Operational logs: 3 years
  access_logs: { years: 3, after: 'log_date' },

  // Marketing data: Until consent revoked
  marketing_preferences: { until: 'consent_revoked' },

  // Session data: 30 days
  session_logs: { days: 30, after: 'session_end' },
};
```

## Encryption Architecture

```typescript
// Encryption layers
const ENCRYPTION = {
  // At rest: Supabase handles database encryption
  database: 'AES-256-GCM',

  // In transit: TLS 1.3
  transport: 'TLS_1_3',

  // Application-level: For extra-sensitive fields
  application: {
    algorithm: 'AES-256-GCM',
    key_management: 'AWS_KMS', // or Vault

    // Fields requiring application-level encryption
    encrypted_fields: [
      'patient.national_id_encrypted',
      'prescription.original_image_encrypted',
      'payment.card_last_four_encrypted',
    ],
  },

  // Hashing: For integrity and non-reversible storage
  hashing: {
    passwords: 'argon2id',
    event_chain: 'sha256',
    pii_pseudonymization: 'sha256_hmac',
  },
};

// Field-level encryption utility
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class FieldEncryption {
  private key: Buffer;

  constructor(keyFromKMS: string) {
    this.key = Buffer.from(keyFromKMS, 'base64');
  }

  encrypt(plaintext: string): { encrypted: string; iv: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted + '.' + authTag.toString('base64'),
      iv: iv.toString('base64'),
    };
  }

  decrypt(encrypted: string, iv: string): string {
    const [ciphertext, authTag] = encrypted.split('.');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

## Access Control & Audit

```typescript
// Role-based access control matrix
const RBAC_MATRIX = {
  patient: {
    prescriptions: ['read:own', 'create:own'],
    health_graph: ['read:own'],
    medications: ['read:own'],
    addresses: ['read:own', 'create:own', 'update:own', 'delete:own'],
  },
  pharmacist: {
    prescriptions: ['read:pharmacy', 'update:pharmacy'],
    queue: ['read:pharmacy'],
    inventory: ['read:pharmacy', 'update:pharmacy'],
    patients: ['read:limited'], // Only what's needed for verification
  },
  pharmacy_admin: {
    // Everything pharmacist can do, plus:
    staff: ['read:pharmacy', 'create:pharmacy', 'update:pharmacy'],
    intelligence: ['read:pharmacy'],
    settings: ['read:pharmacy', 'update:pharmacy'],
  },
  courier: {
    deliveries: ['read:assigned', 'update:assigned'],
    earnings: ['read:own'],
  },
  admin: {
    '*': ['*'], // Full access with audit trail
  },
};

// Audit log for all PII access
interface AuditLog {
  id: string;
  timestamp: Date;
  actor_id: string;
  actor_type: 'patient' | 'pharmacist' | 'courier' | 'admin' | 'system';
  action: 'read' | 'create' | 'update' | 'delete' | 'export';
  resource_type: string;
  resource_id: string;
  data_classification: DataClassification;

  // Context
  ip_address: string;
  user_agent: string;
  session_id: string;

  // For reads: what fields were accessed
  fields_accessed?: string[];

  // For updates: before/after (hashed for PII)
  changes?: {
    field: string;
    old_hash: string;
    new_hash: string;
  }[];

  // Justification (required for sensitive data access)
  justification?: string;
}
```

---

# ERROR HANDLING & RESILIENCE

## Error Taxonomy

```typescript
// Hierarchical error codes
const ERROR_CODES = {
  // Client errors (4xx)
  VALIDATION: {
    INVALID_INPUT: 'E4001',
    MISSING_REQUIRED: 'E4002',
    FORMAT_ERROR: 'E4003',
    OUT_OF_RANGE: 'E4004',
  },
  AUTH: {
    UNAUTHORIZED: 'E4010',
    TOKEN_EXPIRED: 'E4011',
    INSUFFICIENT_PERMISSIONS: 'E4030',
  },
  RESOURCE: {
    NOT_FOUND: 'E4040',
    ALREADY_EXISTS: 'E4090',
    CONFLICT: 'E4091',
    GONE: 'E4100',
  },
  RATE_LIMIT: {
    TOO_MANY_REQUESTS: 'E4290',
  },

  // Server errors (5xx)
  INTERNAL: {
    UNEXPECTED: 'E5000',
    DATABASE: 'E5001',
    EXTERNAL_SERVICE: 'E5002',
  },
  AI: {
    OCR_FAILED: 'E5100',
    ANALYSIS_FAILED: 'E5101',
    MODEL_UNAVAILABLE: 'E5102',
  },
  PAYMENT: {
    PROCESSING_FAILED: 'E5200',
    PROVIDER_ERROR: 'E5201',
  },
} as const;

// Localized error messages
const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  en: {
    'E4001': 'The provided input is invalid',
    'E4040': 'The requested resource was not found',
    'E5100': 'We could not read your prescription. Please try again with better lighting.',
    // ...
  },
  fr: {
    'E4001': 'Les données fournies sont invalides',
    'E4040': 'La ressource demandée est introuvable',
    'E5100': 'Nous n\'avons pas pu lire votre ordonnance. Veuillez réessayer avec un meilleur éclairage.',
    // ...
  },
  ar: {
    'E4001': 'البيانات المدخلة غير صالحة',
    'E4040': 'المورد المطلوب غير موجود',
    'E5100': 'لم نتمكن من قراءة الوصفة الطبية. يرجى المحاولة مرة أخرى مع إضاءة أفضل.',
    // ...
  },
};
```

## Retry & Circuit Breaker

```typescript
import { CircuitBreaker, ConsecutiveBreaker } from 'cockatiel';

// Circuit breaker for external services
const ocrCircuitBreaker = new CircuitBreaker({
  halfOpenAfter: 30_000, // Try again after 30s
  breaker: new ConsecutiveBreaker(5), // Open after 5 failures
});

const insuranceCircuitBreaker = new CircuitBreaker({
  halfOpenAfter: 60_000,
  breaker: new ConsecutiveBreaker(3),
});

// Retry policy with exponential backoff
const retryPolicy = retry({
  maxAttempts: 3,
  backoff: new ExponentialBackoff({
    initial: 1000,
    max: 30_000,
    factor: 2,
  }),
});

// Usage
async function processOCR(imageUrl: string): Promise<OCRResult> {
  return ocrCircuitBreaker.execute(async () => {
    return retryPolicy.execute(async () => {
      const response = await fetch(OCR_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!response.ok) {
        throw new ExternalServiceError('OCR_FAILED', response.status);
      }

      return response.json();
    });
  });
}
```

## Graceful Degradation

```typescript
// Feature flags for graceful degradation
const DEGRADATION_FLAGS = {
  // If AI verification is down, allow manual-only verification
  ai_verification: { enabled: true, fallback: 'manual_only' },

  // If insurance API is down, queue claims for later
  insurance_claims: { enabled: true, fallback: 'queue_for_retry' },

  // If real-time is down, fall back to polling
  realtime: { enabled: true, fallback: 'polling_5s' },

  // If demand forecasting is down, use historical averages
  demand_forecast: { enabled: true, fallback: 'historical_avg' },
};

// Degradation-aware service calls
async function verifyPrescription(prescriptionId: string): Promise<VerificationResult> {
  if (DEGRADATION_FLAGS.ai_verification.enabled) {
    try {
      return await aiVerificationService.verify(prescriptionId);
    } catch (error) {
      // Log degradation event
      await logDegradationEvent('ai_verification', error);

      // Fall back
      return {
        status: 'needs_manual_review',
        degraded: true,
        message: 'AI verification unavailable. Manual review required.',
      };
    }
  }

  return { status: 'needs_manual_review', degraded: false };
}
```

---

# INTERNATIONALIZATION (i18n)

Morocco requires Arabic, French, and increasingly English support.

## Language Architecture

```typescript
// Supported locales
type Locale = 'ar-MA' | 'fr-MA' | 'en';

// RTL support detection
const RTL_LOCALES = ['ar-MA'];
const isRTL = (locale: Locale) => RTL_LOCALES.includes(locale);

// Translation structure
interface Translations {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    save: string;
  };
  prescription: {
    upload_title: string;
    upload_guidance: string;
    processing: string;
    verified: string;
    rejected: string;
  };
  pharmacy: {
    queue_empty: string;
    priority_critical: string;
    verify_button: string;
    reject_button: string;
  };
  // ... more namespaces
}

// Translation files
// /locales/ar-MA.json
// /locales/fr-MA.json
// /locales/en.json
```

## RTL Layout Support

```css
/* Base styles with logical properties for RTL */
.queue-item {
  /* Instead of: padding-left, padding-right */
  padding-inline-start: var(--space-5);
  padding-inline-end: var(--space-4);

  /* Instead of: border-left */
  border-inline-start: 3px solid var(--priority-color);

  /* Instead of: margin-left, margin-right */
  margin-inline: auto;

  /* Instead of: text-align: left */
  text-align: start;
}

/* Direction-aware flexbox */
.action-row {
  display: flex;
  flex-direction: row;
  gap: var(--space-3);
}

/* RTL-specific overrides when needed */
[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);
}

/* Font stacks per language */
:root[lang="ar"] {
  --font-primary: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', system-ui;
  --font-mono: 'IBM Plex Mono', monospace;
}

:root[lang="fr"] {
  --font-primary: 'DM Sans', system-ui, sans-serif;
}
```

## Number & Date Formatting

```typescript
// Morocco-specific formatting
const formatters = {
  'ar-MA': {
    number: new Intl.NumberFormat('ar-MA'),
    currency: new Intl.NumberFormat('ar-MA', {
      style: 'currency',
      currency: 'MAD'
    }),
    date: new Intl.DateTimeFormat('ar-MA', {
      dateStyle: 'long',
    }),
    time: new Intl.DateTimeFormat('ar-MA', {
      timeStyle: 'short',
    }),
  },
  'fr-MA': {
    number: new Intl.NumberFormat('fr-MA'),
    currency: new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }),
    date: new Intl.DateTimeFormat('fr-MA', {
      dateStyle: 'long',
    }),
    time: new Intl.DateTimeFormat('fr-MA', {
      timeStyle: 'short',
    }),
  },
};

// Usage
formatters['fr-MA'].currency.format(125.50); // "125,50 MAD"
formatters['ar-MA'].currency.format(125.50); // "١٢٥٫٥٠ د.م."
```

---

# OFFLINE CAPABILITIES

Critical for couriers in areas with poor connectivity.

## Offline-First Architecture

```typescript
// Service Worker caching strategy
const CACHE_STRATEGIES = {
  // Static assets: Cache first
  static: 'cache-first',

  // API data: Network first with cache fallback
  api: 'network-first',

  // Images: Stale while revalidate
  images: 'stale-while-revalidate',

  // Critical data: Cache with background sync
  critical: 'cache-then-network',
};

// Offline data sync queue
interface SyncQueueItem {
  id: string;
  action: string;
  payload: unknown;
  created_at: Date;
  retry_count: number;
  max_retries: number;
}

// Background sync registration
async function queueForSync(action: string, payload: unknown) {
  const db = await openDB('dawa-offline', 1);

  await db.add('sync-queue', {
    id: crypto.randomUUID(),
    action,
    payload,
    created_at: new Date(),
    retry_count: 0,
    max_retries: 5,
  });

  // Register for background sync
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-queue');
  }
}

// Courier-specific offline capabilities
const COURIER_OFFLINE_FEATURES = {
  // Cache assigned deliveries for offline access
  deliveries: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    fields: ['id', 'patient_name', 'address', 'phone', 'items', 'notes'],
  },

  // Queue delivery confirmations for sync
  confirmations: {
    queueable: true,
    requiredFields: ['delivery_id', 'photo', 'otp_verified'],
  },

  // Cache maps for offline navigation
  maps: {
    cacheRadius: 10, // km around active deliveries
    zoomLevels: [14, 15, 16, 17],
  },
};
```

---

# COURIER TRACKING & ZONE MANAGEMENT

Real-time courier tracking with intelligent dispatch.

## Courier Location Tracking

```typescript
// Location update schema
export const CourierLocationSchema = z.object({
  lat: z.number().min(27).max(36), // Morocco bounds
  lng: z.number().min(-13).max(-1),
  accuracy: z.number().positive(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(), // m/s
  altitude: z.number().optional(),
  timestamp: z.string().datetime(),
});

// Location tracking service
class CourierTrackingService {
  private redis: Redis;
  private supabase: SupabaseClient;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }

  async updateLocation(
    courierId: string,
    location: z.infer<typeof CourierLocationSchema>
  ): Promise<void> {
    // Store in Redis for real-time access (expires in 5 min)
    const locationKey = `courier:${courierId}:location`;
    await this.redis.setex(locationKey, 300, JSON.stringify({
      ...location,
      updated_at: new Date().toISOString(),
    }));

    // Update courier status in DB (less frequently)
    await this.supabase
      .from('couriers')
      .update({
        current_location: `POINT(${location.lng} ${location.lat})`,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', courierId);

    // Broadcast to tracking subscribers
    await this.broadcastLocation(courierId, location);

    // Check geofence triggers
    await this.checkGeofences(courierId, location);
  }

  private async broadcastLocation(
    courierId: string,
    location: z.infer<typeof CourierLocationSchema>
  ): Promise<void> {
    // Get active deliveries for this courier
    const { data: deliveries } = await this.supabase
      .from('prescription_states')
      .select('prescription_id, patient_id')
      .eq('courier_id', courierId)
      .in('status', ['out_for_delivery', 'picked_up']);

    for (const delivery of deliveries || []) {
      // Calculate ETA
      const destination = await this.getDeliveryDestination(delivery.prescription_id);
      const eta = await this.calculateETA(location, destination);

      // Broadcast to patient tracking channel
      await this.supabase
        .channel(`order:${delivery.prescription_id}:tracking`)
        .send({
          type: 'broadcast',
          event: 'courier_location',
          payload: {
            lat: location.lat,
            lng: location.lng,
            heading: location.heading,
            speed: location.speed,
            eta_minutes: eta,
            updated_at: location.timestamp,
          },
        });
    }
  }

  private async checkGeofences(
    courierId: string,
    location: z.infer<typeof CourierLocationSchema>
  ): Promise<void> {
    const { data: deliveries } = await this.supabase
      .from('prescription_states')
      .select('prescription_id, delivery_address, patient_id')
      .eq('courier_id', courierId)
      .eq('status', 'out_for_delivery');

    for (const delivery of deliveries || []) {
      const destination = delivery.delivery_address?.coordinates;
      if (!destination) continue;

      const distance = this.calculateDistance(
        location.lat, location.lng,
        destination.lat, destination.lng
      );

      // Arriving soon (500m)
      if (distance < 500 && distance > 100) {
        await this.triggerArrivingSoon(delivery);
      }

      // Arrived (100m)
      if (distance < 100) {
        await this.triggerArrived(delivery);
      }
    }
  }

  private async triggerArrivingSoon(delivery: Delivery): Promise<void> {
    const cacheKey = `geofence:arriving:${delivery.prescription_id}`;
    const alreadyTriggered = await this.redis.get(cacheKey);

    if (!alreadyTriggered) {
      // Send notification
      const notificationService = new NotificationService();
      await notificationService.notify('DELIVERY_ARRIVING', {
        recipient_id: delivery.patient_id,
        prescription_id: delivery.prescription_id,
        variables: {
          eta: '2',
          otp: await this.getDeliveryOTP(delivery.prescription_id),
        },
      });

      // Mark as triggered (expires in 1 hour)
      await this.redis.setex(cacheKey, 3600, '1');
    }
  }

  private calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    // Haversine formula
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async calculateETA(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<number> {
    // Use Google Maps Distance Matrix API for accurate ETA
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${origin.lat},${origin.lng}&` +
        `destinations=${destination.lat},${destination.lng}&` +
        `mode=driving&` +
        `key=${process.env.GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      const duration = data.rows[0]?.elements[0]?.duration?.value;

      if (duration) {
        return Math.ceil(duration / 60); // Convert seconds to minutes
      }
    } catch (error) {
      console.error('ETA calculation failed:', error);
    }

    // Fallback: Simple distance-based estimate (30 km/h average)
    const distance = this.calculateDistance(
      origin.lat, origin.lng,
      destination.lat, destination.lng
    );
    return Math.ceil((distance / 1000) / 30 * 60);
  }
}
```

## Intelligent Dispatch System

```typescript
// Courier dispatch algorithm
class DispatchService {
  async findBestCourier(
    pharmacyId: string,
    deliveryAddress: { lat: number; lng: number }
  ): Promise<Courier | null> {
    const pharmacy = await this.getPharmacy(pharmacyId);

    // Find available couriers in range
    const candidates = await db.execute(sql`
      SELECT
        c.*,
        ST_Distance(
          c.current_location::geography,
          ST_MakePoint(${pharmacy.coordinates.lng}, ${pharmacy.coordinates.lat})::geography
        ) as distance_to_pharmacy,
        ST_Distance(
          ST_MakePoint(${pharmacy.coordinates.lng}, ${pharmacy.coordinates.lat})::geography,
          ST_MakePoint(${deliveryAddress.lng}, ${deliveryAddress.lat})::geography
        ) as delivery_distance
      FROM couriers c
      WHERE c.status = 'online'
        AND c.is_active = TRUE
        AND c.is_verified = TRUE
        AND c.current_order_count < c.max_concurrent_orders
        AND ST_DWithin(
          c.current_location::geography,
          ST_MakePoint(${pharmacy.coordinates.lng}, ${pharmacy.coordinates.lat})::geography,
          ${pharmacy.delivery_radius_km * 1000}
        )
      ORDER BY distance_to_pharmacy ASC
      LIMIT 10
    `);

    if (candidates.length === 0) {
      return null;
    }

    // Score each candidate
    const scored = candidates.map(courier => ({
      courier,
      score: this.calculateCourierScore(courier, pharmacy, deliveryAddress),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored[0].courier;
  }

  private calculateCourierScore(
    courier: Courier,
    pharmacy: Pharmacy,
    deliveryAddress: { lat: number; lng: number }
  ): number {
    let score = 100;

    // Distance factor (closer is better)
    // -1 point per 100m from pharmacy
    score -= (courier.distance_to_pharmacy / 100);

    // Performance factor
    // +10 for high on-time rate
    if (courier.on_time_rate > 0.95) score += 10;
    else if (courier.on_time_rate > 0.90) score += 5;
    else if (courier.on_time_rate < 0.80) score -= 10;

    // Rating factor
    // +5 for high rating
    if (courier.average_rating >= 4.8) score += 5;
    else if (courier.average_rating < 4.0) score -= 10;

    // Acceptance rate factor
    // Penalize low acceptance rate
    if (courier.acceptance_rate < 0.70) score -= 15;

    // Current load factor
    // Prefer couriers with fewer current orders
    score -= courier.current_order_count * 5;

    // Experience factor
    // Bonus for experienced couriers
    if (courier.total_deliveries > 1000) score += 10;
    else if (courier.total_deliveries > 500) score += 5;
    else if (courier.total_deliveries < 50) score -= 5;

    // Vehicle type efficiency for distance
    if (courier.delivery_distance > 5000) { // > 5km
      if (courier.vehicle_type === 'motorcycle') score += 5;
      else if (courier.vehicle_type === 'bicycle') score -= 10;
    }

    return Math.max(0, score);
  }

  async assignCourier(
    prescriptionId: string,
    courierId: string
  ): Promise<void> {
    // Create assignment event
    await db.insert(prescription_events).values({
      prescription_id: prescriptionId,
      event_type: 'COURIER_ASSIGNED',
      event_data: {
        courier_id: courierId,
        assigned_at: new Date().toISOString(),
      },
      actor_id: 'system',
      actor_type: 'system',
    });

    // Update courier's current order count
    await db.execute(sql`
      UPDATE couriers
      SET current_order_count = current_order_count + 1,
          current_delivery_id = ${prescriptionId}
      WHERE id = ${courierId}
    `);

    // Notify courier
    const notificationService = new NotificationService();
    await notificationService.notify('DELIVERY_ASSIGNED', {
      recipient_id: courierId,
      prescription_id: prescriptionId,
      variables: {
        pharmacy_name: await this.getPharmacyName(prescriptionId),
        delivery_address: await this.getDeliveryAddressText(prescriptionId),
      },
    });
  }
}
```

## Delivery Route Optimization

```typescript
// Multi-stop route optimization for batch deliveries
class RouteOptimizer {
  async optimizeRoute(
    courierId: string,
    stops: DeliveryStop[]
  ): Promise<OptimizedRoute> {
    const courier = await this.getCourier(courierId);

    if (stops.length <= 2) {
      // Simple case: direct route
      return {
        stops: stops,
        total_distance: await this.calculateTotalDistance(courier.current_location, stops),
        estimated_duration: await this.calculateDuration(courier.current_location, stops),
      };
    }

    // Use Google Directions API with waypoint optimization
    const waypoints = stops.map(s => `${s.lat},${s.lng}`).join('|');

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${courier.current_location.lat},${courier.current_location.lng}&` +
      `destination=${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}&` +
      `waypoints=optimize:true|${waypoints}&` +
      `key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      // Fallback to nearest-neighbor heuristic
      return this.nearestNeighborRoute(courier.current_location, stops);
    }

    // Reorder stops based on optimized waypoint order
    const optimizedOrder = data.routes[0].waypoint_order;
    const optimizedStops = optimizedOrder.map((idx: number) => stops[idx]);

    return {
      stops: optimizedStops,
      total_distance: data.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0),
      estimated_duration: data.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0) / 60,
      polyline: data.routes[0].overview_polyline.points,
      legs: data.routes[0].legs.map(leg => ({
        distance: leg.distance.value,
        duration: leg.duration.value,
        start_address: leg.start_address,
        end_address: leg.end_address,
      })),
    };
  }

  private nearestNeighborRoute(
    start: { lat: number; lng: number },
    stops: DeliveryStop[]
  ): OptimizedRoute {
    const remaining = [...stops];
    const ordered: DeliveryStop[] = [];
    let current = start;
    let totalDistance = 0;

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      remaining.forEach((stop, idx) => {
        const dist = this.haversineDistance(current, stop);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });

      const nearest = remaining.splice(nearestIdx, 1)[0];
      ordered.push(nearest);
      totalDistance += nearestDist;
      current = nearest;
    }

    return {
      stops: ordered,
      total_distance: totalDistance,
      estimated_duration: (totalDistance / 1000) / 25 * 60, // Assume 25 km/h average
    };
  }
}
```

## Delivery Zones & Surge Pricing

```sql
-- Zone-based delivery pricing
CREATE OR REPLACE FUNCTION calculate_delivery_fee(
  p_pharmacy_id UUID,
  p_delivery_coordinates GEOGRAPHY
) RETURNS TABLE (
  base_fee NUMERIC,
  distance_fee NUMERIC,
  surge_fee NUMERIC,
  total_fee NUMERIC,
  estimated_minutes INTEGER
) AS $$
DECLARE
  v_pharmacy pharmacies%ROWTYPE;
  v_zone delivery_zones%ROWTYPE;
  v_distance NUMERIC;
  v_base_fee NUMERIC;
  v_distance_fee NUMERIC;
  v_surge_multiplier NUMERIC := 1.0;
BEGIN
  -- Get pharmacy
  SELECT * INTO v_pharmacy FROM pharmacies WHERE id = p_pharmacy_id;

  -- Find applicable zone
  SELECT * INTO v_zone FROM delivery_zones
  WHERE ST_Contains(boundary::geometry, p_delivery_coordinates::geometry)
    AND is_active = TRUE
  LIMIT 1;

  -- Calculate distance
  v_distance := ST_Distance(
    v_pharmacy.coordinates,
    p_delivery_coordinates
  ) / 1000; -- Convert to km

  -- Base fee from zone or pharmacy default
  IF v_zone IS NOT NULL THEN
    v_base_fee := v_zone.base_delivery_fee;
    v_distance_fee := v_zone.per_km_fee * v_distance;
    v_surge_multiplier := COALESCE(v_zone.surge_multiplier, 1.0);
  ELSE
    v_base_fee := v_pharmacy.delivery_fee;
    v_distance_fee := 2.0 * v_distance; -- Default 2 MAD/km
  END IF;

  -- Check surge conditions
  IF v_zone.is_surge_active THEN
    v_surge_multiplier := v_zone.surge_multiplier;
  END IF;

  RETURN QUERY SELECT
    v_base_fee,
    v_distance_fee,
    (v_base_fee + v_distance_fee) * (v_surge_multiplier - 1),
    (v_base_fee + v_distance_fee) * v_surge_multiplier,
    (v_zone.estimated_minutes_base + (v_distance * v_zone.estimated_minutes_per_km))::INTEGER;
END;
$$ LANGUAGE plpgsql;
```

---

# MONITORING & OBSERVABILITY

## Metrics Collection

```typescript
// Key metrics to track
const METRICS = {
  // Business metrics
  business: {
    'orders.created': 'counter',
    'orders.completed': 'counter',
    'orders.cancelled': 'counter',
    'revenue.total': 'counter',
    'revenue.by_pharmacy': 'gauge',
  },

  // Operational metrics
  ops: {
    'api.latency': 'histogram',
    'api.errors': 'counter',
    'queue.depth': 'gauge',
    'queue.wait_time': 'histogram',
    'verification.ai_time': 'histogram',
    'verification.manual_time': 'histogram',
  },

  // Infrastructure metrics
  infra: {
    'db.connections': 'gauge',
    'db.query_time': 'histogram',
    'cache.hit_rate': 'gauge',
    'realtime.connections': 'gauge',
  },
};

// Custom metric emission
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('dawa-pharmacy');

const orderCounter = meter.createCounter('orders.created', {
  description: 'Number of orders created',
});

const verificationHistogram = meter.createHistogram('verification.ai_time', {
  description: 'AI verification processing time in ms',
  unit: 'ms',
});

// Usage
orderCounter.add(1, { pharmacy_id: 'xxx', city: 'Casablanca' });
verificationHistogram.record(1250, { status: 'approved' });
```

## Alerting Rules

```yaml
# Alert definitions
alerts:
  # SLA breaches
  - name: high_queue_wait_time
    condition: avg(queue.wait_time) > 15min over 10min
    severity: warning
    notify: [slack:ops-pharmacy]

  - name: critical_queue_depth
    condition: queue.depth > 50 for any pharmacy
    severity: critical
    notify: [pagerduty, slack:ops-pharmacy]

  # Error rates
  - name: elevated_error_rate
    condition: rate(api.errors) > 5% over 5min
    severity: warning
    notify: [slack:ops-backend]

  - name: ai_verification_failures
    condition: rate(verification.ai_failures) > 20% over 10min
    severity: critical
    notify: [pagerduty, slack:ops-ai]

  # Business metrics
  - name: order_completion_drop
    condition: rate(orders.completed) < 80% of rate(orders.created) over 1hr
    severity: warning
    notify: [slack:ops-business]
```

## Distributed Tracing

```typescript
// Trace context propagation
import { trace, context, SpanKind } from '@opentelemetry/api';

const tracer = trace.getTracer('dawa-pharmacy');

async function verifyPrescription(prescriptionId: string) {
  return tracer.startActiveSpan(
    'verify_prescription',
    { kind: SpanKind.INTERNAL },
    async (span) => {
      try {
        span.setAttribute('prescription.id', prescriptionId);

        // AI analysis
        const aiSpan = tracer.startSpan('ai_analysis');
        const aiResult = await runAIAnalysis(prescriptionId);
        aiSpan.setAttribute('ai.confidence', aiResult.confidence);
        aiSpan.end();

        // Drug matching
        const drugSpan = tracer.startSpan('drug_matching');
        const drugs = await matchDrugs(aiResult.medications);
        drugSpan.setAttribute('drugs.count', drugs.length);
        drugSpan.end();

        // Interaction check
        const interactionSpan = tracer.startSpan('interaction_check');
        const interactions = await checkInteractions(drugs);
        interactionSpan.setAttribute('interactions.found', interactions.length);
        interactionSpan.end();

        span.setStatus({ code: SpanStatusCode.OK });
        return { aiResult, drugs, interactions };
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}
```

---

# TESTING STRATEGY

## Test Pyramid

```
                    /\
                   /  \
                  / E2E \         <- 10% (Playwright)
                 /______\
                /        \
               / Integration\     <- 30% (API + DB)
              /____________\
             /              \
            /     Unit       \    <- 60% (Business logic)
           /________________\
```

## Test Categories

```typescript
// Unit tests: Pure business logic
describe('PriorityScoreCalculator', () => {
  it('increases score for chronic patients', () => {
    const order = createMockOrder({ patient: { is_chronic_patient: true } });
    const score = computePriorityScore(order);
    expect(score).toBeGreaterThan(50);
  });

  it('decreases score for orders with interaction warnings', () => {
    const order = createMockOrder({ has_interaction_warning: true });
    const score = computePriorityScore(order);
    expect(score).toBeLessThan(50);
  });
});

// Integration tests: API + Database
describe('POST /api/v1/prescriptions/:id/verify', () => {
  it('creates verification event in event store', async () => {
    const prescription = await createTestPrescription();

    const response = await api
      .post(`/prescriptions/${prescription.id}/verify`)
      .send(validVerificationPayload)
      .expect(200);

    const events = await db
      .select()
      .from(prescription_events)
      .where({ prescription_id: prescription.id });

    expect(events).toContainEqual(
      expect.objectContaining({
        event_type: 'PHARMACIST_APPROVED',
      })
    );
  });

  it('rejects verification for already-verified prescriptions', async () => {
    const prescription = await createVerifiedPrescription();

    await api
      .post(`/prescriptions/${prescription.id}/verify`)
      .send(validVerificationPayload)
      .expect(409);
  });
});

// E2E tests: Critical user flows
describe('Prescription Upload to Delivery Flow', () => {
  test('patient can upload, pharmacist verifies, courier delivers', async ({ page }) => {
    // Patient uploads
    await page.goto('/prescriptions/new');
    await page.setInputFiles('[data-testid="prescription-upload"]', 'test-prescription.jpg');
    await expect(page.getByText('Analyzing...')).toBeVisible();
    await expect(page.getByText('Prescription submitted')).toBeVisible({ timeout: 30000 });

    // Pharmacist verifies (different session)
    const pharmacyPage = await browser.newPage();
    await pharmacyPage.goto('/pharmacy/queue');
    await pharmacyPage.click('[data-testid="verify-btn"]:first-child');
    await expect(pharmacyPage.getByText('Verified')).toBeVisible();

    // Courier delivers (different session)
    const courierPage = await browser.newPage();
    await courierPage.goto('/courier/deliveries');
    await courierPage.click('[data-testid="accept-delivery"]');
    await courierPage.click('[data-testid="complete-delivery"]');

    // Patient sees completion
    await page.reload();
    await expect(page.getByText('Delivered')).toBeVisible();
  });
});
```

## Test Data Management

```typescript
// Factory functions for test data
export const factories = {
  patient: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    phone: `+212${faker.string.numeric(9)}`,
    email: faker.internet.email(),
    ...overrides,
  }),

  prescription: (overrides = {}) => ({
    id: faker.string.uuid(),
    patient_id: faker.string.uuid(),
    status: 'pending_verification',
    created_at: new Date(),
    ...overrides,
  }),

  medication: (overrides = {}) => ({
    drug_id: faker.string.uuid(),
    name: faker.helpers.arrayElement(['Doliprane', 'Amoxicilline', 'Metformine']),
    dosage: faker.helpers.arrayElement(['500mg', '1000mg', '850mg']),
    quantity: faker.number.int({ min: 1, max: 30 }),
    ...overrides,
  }),
};

// Database seeding for integration tests
export async function seedTestDatabase() {
  // Clear existing data
  await db.delete(prescription_events);
  await db.delete(prescription_states);
  await db.delete(patients);

  // Seed with known test data
  const patients = await db.insert(patients_table).values([
    factories.patient({ id: 'test-patient-1' }),
    factories.patient({ id: 'test-patient-chronic', is_chronic: true }),
  ]).returning();

  // ... more seeding
}
```

---

# ANALYTICS & REPORTING

Business intelligence for pharmacies, operations, and platform growth.

## Analytics Database Views

```sql
-- ============================================
-- DAILY ORDER METRICS (Materialized View)
-- ============================================

CREATE MATERIALIZED VIEW mv_daily_order_metrics AS
SELECT
  DATE(ps.created_at) as date,
  ps.pharmacy_id,
  p.city,
  p.region,

  -- Volume metrics
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE ps.status = 'completed') as completed_orders,
  COUNT(*) FILTER (WHERE ps.status = 'rejected') as rejected_orders,
  COUNT(*) FILTER (WHERE ps.status = 'refunded') as refunded_orders,

  -- Revenue metrics
  SUM(ps.total) FILTER (WHERE ps.status = 'completed') as gross_revenue,
  SUM(ps.insurance_coverage) FILTER (WHERE ps.status = 'completed') as insurance_revenue,
  SUM(ps.patient_copay) FILTER (WHERE ps.status = 'completed') as patient_revenue,
  SUM(ps.delivery_fee) FILTER (WHERE ps.status = 'completed') as delivery_revenue,

  -- Timing metrics
  AVG(EXTRACT(EPOCH FROM (ps.verified_at - ps.created_at)) / 60)
    FILTER (WHERE ps.verified_at IS NOT NULL) as avg_verification_minutes,
  AVG(EXTRACT(EPOCH FROM (ps.actual_delivery_at - ps.created_at)) / 60)
    FILTER (WHERE ps.actual_delivery_at IS NOT NULL) as avg_delivery_minutes,

  -- SLA metrics
  COUNT(*) FILTER (
    WHERE ps.actual_delivery_at IS NOT NULL
      AND ps.promised_delivery_at IS NOT NULL
      AND ps.actual_delivery_at <= ps.promised_delivery_at
  ) as on_time_deliveries,

  -- Patient metrics
  COUNT(DISTINCT ps.patient_id) as unique_patients,
  COUNT(*) FILTER (WHERE pat.is_chronic_patient = TRUE) as chronic_patient_orders,

  -- AI metrics
  COUNT(*) FILTER (WHERE (ps.ai_analysis->>'needs_review')::BOOLEAN = TRUE) as ai_flagged_orders,
  AVG((ps.ai_analysis->>'confidence')::NUMERIC)
    FILTER (WHERE ps.ai_analysis->>'confidence' IS NOT NULL) as avg_ai_confidence

FROM prescription_states ps
JOIN pharmacies p ON ps.pharmacy_id = p.id
JOIN patients pat ON ps.patient_id = pat.id
GROUP BY DATE(ps.created_at), ps.pharmacy_id, p.city, p.region;

CREATE UNIQUE INDEX idx_mv_daily_orders ON mv_daily_order_metrics(date, pharmacy_id);

-- Refresh daily via cron
-- SELECT cron.schedule('refresh-daily-metrics', '0 1 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_order_metrics');

-- ============================================
-- PHARMACY PERFORMANCE SCORECARD
-- ============================================

CREATE MATERIALIZED VIEW mv_pharmacy_scorecard AS
WITH last_30d AS (
  SELECT
    ps.pharmacy_id,
    COUNT(*) as orders_30d,
    COUNT(*) FILTER (WHERE ps.status = 'completed') as completed_30d,
    SUM(ps.total) FILTER (WHERE ps.status = 'completed') as revenue_30d,
    AVG(EXTRACT(EPOCH FROM (ps.verified_at - ps.created_at)) / 60)
      FILTER (WHERE ps.verified_at IS NOT NULL) as avg_verification_time_30d,
    COUNT(*) FILTER (
      WHERE ps.actual_delivery_at <= ps.promised_delivery_at
    )::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE ps.actual_delivery_at IS NOT NULL), 0) as on_time_rate_30d
  FROM prescription_states ps
  WHERE ps.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY ps.pharmacy_id
),
ratings AS (
  SELECT
    r.pharmacy_id,
    AVG(r.rating) as avg_rating,
    COUNT(*) as total_ratings
  FROM pharmacy_ratings r
  WHERE r.created_at >= NOW() - INTERVAL '90 days'
  GROUP BY r.pharmacy_id
)
SELECT
  p.id as pharmacy_id,
  p.name,
  p.city,
  p.tier,

  -- Volume score (0-25)
  LEAST(25, COALESCE(l.orders_30d, 0) / 4) as volume_score,

  -- Quality score (0-25)
  COALESCE(r.avg_rating, 0) * 5 as quality_score,

  -- Speed score (0-25)
  CASE
    WHEN COALESCE(l.avg_verification_time_30d, 999) < 5 THEN 25
    WHEN l.avg_verification_time_30d < 10 THEN 20
    WHEN l.avg_verification_time_30d < 15 THEN 15
    WHEN l.avg_verification_time_30d < 30 THEN 10
    ELSE 5
  END as speed_score,

  -- Reliability score (0-25)
  COALESCE(l.on_time_rate_30d, 0) * 25 as reliability_score,

  -- Overall score
  LEAST(25, COALESCE(l.orders_30d, 0) / 4) +
  COALESCE(r.avg_rating, 0) * 5 +
  CASE
    WHEN COALESCE(l.avg_verification_time_30d, 999) < 5 THEN 25
    WHEN l.avg_verification_time_30d < 10 THEN 20
    WHEN l.avg_verification_time_30d < 15 THEN 15
    WHEN l.avg_verification_time_30d < 30 THEN 10
    ELSE 5
  END +
  COALESCE(l.on_time_rate_30d, 0) * 25 as overall_score,

  -- Raw metrics
  l.orders_30d,
  l.completed_30d,
  l.revenue_30d,
  l.avg_verification_time_30d,
  l.on_time_rate_30d,
  r.avg_rating,
  r.total_ratings

FROM pharmacies p
LEFT JOIN last_30d l ON p.id = l.pharmacy_id
LEFT JOIN ratings r ON p.id = r.pharmacy_id;

CREATE UNIQUE INDEX idx_mv_pharmacy_scorecard ON mv_pharmacy_scorecard(pharmacy_id);

-- ============================================
-- PATIENT COHORT ANALYSIS
-- ============================================

CREATE MATERIALIZED VIEW mv_patient_cohorts AS
WITH first_order AS (
  SELECT
    patient_id,
    DATE_TRUNC('month', MIN(created_at)) as cohort_month
  FROM prescription_states
  WHERE status = 'completed'
  GROUP BY patient_id
),
monthly_activity AS (
  SELECT
    ps.patient_id,
    DATE_TRUNC('month', ps.created_at) as activity_month,
    COUNT(*) as orders,
    SUM(ps.total) as spend
  FROM prescription_states ps
  WHERE ps.status = 'completed'
  GROUP BY ps.patient_id, DATE_TRUNC('month', ps.created_at)
)
SELECT
  f.cohort_month,
  m.activity_month,
  (EXTRACT(YEAR FROM m.activity_month) - EXTRACT(YEAR FROM f.cohort_month)) * 12 +
  (EXTRACT(MONTH FROM m.activity_month) - EXTRACT(MONTH FROM f.cohort_month)) as months_since_first,
  COUNT(DISTINCT m.patient_id) as active_patients,
  SUM(m.orders) as total_orders,
  SUM(m.spend) as total_spend,
  AVG(m.orders) as avg_orders_per_patient,
  AVG(m.spend) as avg_spend_per_patient
FROM first_order f
JOIN monthly_activity m ON f.patient_id = m.patient_id
GROUP BY f.cohort_month, m.activity_month;

CREATE INDEX idx_mv_patient_cohorts ON mv_patient_cohorts(cohort_month, activity_month);
```

## Analytics API Endpoints

```typescript
// Analytics service
class AnalyticsService {
  // Pharmacy dashboard metrics
  async getPharmacyDashboard(
    pharmacyId: string,
    period: 'today' | '7d' | '30d' | 'mtd' | 'ytd'
  ): Promise<PharmacyDashboard> {
    const dateRange = this.getDateRange(period);

    const [orders, revenue, performance, topMedications] = await Promise.all([
      this.getOrderMetrics(pharmacyId, dateRange),
      this.getRevenueMetrics(pharmacyId, dateRange),
      this.getPerformanceMetrics(pharmacyId, dateRange),
      this.getTopMedications(pharmacyId, dateRange),
    ]);

    return {
      period,
      date_range: dateRange,
      orders,
      revenue,
      performance,
      top_medications: topMedications,
    };
  }

  private async getOrderMetrics(
    pharmacyId: string,
    dateRange: DateRange
  ): Promise<OrderMetrics> {
    const result = await db.execute(sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status IN ('pending_verification', 'preparing')) as in_progress,
        COUNT(*) FILTER (WHERE (ai_analysis->>'needs_review')::BOOLEAN = TRUE) as ai_flagged,
        COUNT(DISTINCT patient_id) as unique_patients,
        COUNT(*) FILTER (
          WHERE actual_delivery_at IS NOT NULL
            AND promised_delivery_at IS NOT NULL
            AND actual_delivery_at > promised_delivery_at
        ) as late_deliveries
      FROM prescription_states
      WHERE pharmacy_id = ${pharmacyId}
        AND created_at >= ${dateRange.start}
        AND created_at <= ${dateRange.end}
    `);

    const current = result[0];

    // Compare with previous period
    const previousRange = this.getPreviousPeriod(dateRange);
    const previous = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM prescription_states
      WHERE pharmacy_id = ${pharmacyId}
        AND created_at >= ${previousRange.start}
        AND created_at <= ${previousRange.end}
    `);

    return {
      total: current.total,
      completed: current.completed,
      rejected: current.rejected,
      in_progress: current.in_progress,
      ai_flagged: current.ai_flagged,
      unique_patients: current.unique_patients,
      late_deliveries: current.late_deliveries,
      completion_rate: current.completed / current.total,
      trend: {
        total_change: ((current.total - previous[0].total) / previous[0].total) * 100,
        direction: current.total > previous[0].total ? 'up' : 'down',
      },
    };
  }

  private async getRevenueMetrics(
    pharmacyId: string,
    dateRange: DateRange
  ): Promise<RevenueMetrics> {
    const result = await db.execute(sql`
      SELECT
        SUM(total) as gross_revenue,
        SUM(insurance_coverage) as insurance_revenue,
        SUM(patient_copay) as patient_revenue,
        SUM(delivery_fee) as delivery_revenue,
        AVG(total) as avg_order_value,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total) as median_order_value
      FROM prescription_states
      WHERE pharmacy_id = ${pharmacyId}
        AND status = 'completed'
        AND created_at >= ${dateRange.start}
        AND created_at <= ${dateRange.end}
    `);

    return {
      gross_revenue: result[0].gross_revenue,
      insurance_revenue: result[0].insurance_revenue,
      patient_revenue: result[0].patient_revenue,
      delivery_revenue: result[0].delivery_revenue,
      avg_order_value: result[0].avg_order_value,
      median_order_value: result[0].median_order_value,
    };
  }

  // Platform-wide analytics (admin only)
  async getPlatformMetrics(period: string): Promise<PlatformMetrics> {
    const dateRange = this.getDateRange(period);

    return {
      gmv: await this.getGMV(dateRange),
      orders: await this.getPlatformOrders(dateRange),
      users: await this.getUserGrowth(dateRange),
      pharmacies: await this.getPharmacyGrowth(dateRange),
      couriers: await this.getCourierMetrics(dateRange),
      geography: await this.getGeographicDistribution(dateRange),
    };
  }

  // Cohort retention analysis
  async getCohortRetention(cohortMonth: string): Promise<CohortRetention> {
    const result = await db
      .select()
      .from(mv_patient_cohorts)
      .where(eq(mv_patient_cohorts.cohort_month, cohortMonth))
      .orderBy(mv_patient_cohorts.months_since_first);

    const firstMonth = result.find(r => r.months_since_first === 0);
    const cohortSize = firstMonth?.active_patients || 0;

    return {
      cohort_month: cohortMonth,
      cohort_size: cohortSize,
      retention: result.map(r => ({
        month: r.months_since_first,
        active_patients: r.active_patients,
        retention_rate: r.active_patients / cohortSize,
        total_orders: r.total_orders,
        total_spend: r.total_spend,
        avg_orders: r.avg_orders_per_patient,
        avg_spend: r.avg_spend_per_patient,
      })),
    };
  }
}
```

## Reporting & Exports

```typescript
// Report generation service
class ReportService {
  async generatePharmacyReport(
    pharmacyId: string,
    reportType: 'daily' | 'weekly' | 'monthly',
    date: Date
  ): Promise<ReportResult> {
    const dateRange = this.getReportDateRange(reportType, date);
    const analytics = new AnalyticsService();

    const data = await analytics.getPharmacyDashboard(
      pharmacyId,
      reportType === 'daily' ? 'today' : reportType === 'weekly' ? '7d' : '30d'
    );

    // Generate PDF report
    const pdfBuffer = await this.generatePDF(data, reportType);

    // Store report
    const reportUrl = await this.uploadReport(pdfBuffer, pharmacyId, reportType, date);

    // Send to pharmacy email
    const pharmacy = await this.getPharmacy(pharmacyId);
    await this.emailReport(pharmacy.email, reportUrl, reportType, date);

    return {
      report_url: reportUrl,
      generated_at: new Date(),
      period: dateRange,
    };
  }

  async exportOrders(
    pharmacyId: string,
    dateRange: DateRange,
    format: 'csv' | 'xlsx'
  ): Promise<string> {
    const orders = await db.execute(sql`
      SELECT
        ps.prescription_id,
        ps.created_at,
        ps.status,
        p.first_name || ' ' || p.last_name as patient_name,
        ps.verified_medications,
        ps.subtotal,
        ps.insurance_coverage,
        ps.patient_copay,
        ps.delivery_fee,
        ps.total,
        ps.actual_delivery_at,
        c.first_name || ' ' || c.last_name as courier_name
      FROM prescription_states ps
      JOIN patients p ON ps.patient_id = p.id
      LEFT JOIN couriers c ON ps.courier_id = c.id
      WHERE ps.pharmacy_id = ${pharmacyId}
        AND ps.created_at >= ${dateRange.start}
        AND ps.created_at <= ${dateRange.end}
      ORDER BY ps.created_at DESC
    `);

    if (format === 'csv') {
      return this.generateCSV(orders);
    } else {
      return this.generateXLSX(orders);
    }
  }

  async generateInsuranceReport(
    pharmacyId: string,
    month: string
  ): Promise<InsuranceReport> {
    // Generate report for insurance claim reconciliation
    const claims = await db.execute(sql`
      SELECT
        ic.id as claim_id,
        ic.insurance_provider_id,
        ip.name as insurer_name,
        ps.prescription_id,
        p.first_name || ' ' || p.last_name as patient_name,
        pi.member_id,
        ic.total_amount,
        ic.total_covered,
        ic.patient_responsibility,
        ic.status,
        ic.submitted_at,
        ic.processed_at
      FROM insurance_claims ic
      JOIN prescription_states ps ON ic.prescription_id = ps.prescription_id
      JOIN patients p ON ic.patient_id = p.id
      JOIN patient_insurance pi ON ic.patient_insurance_id = pi.id
      JOIN insurance_providers ip ON ic.insurance_provider_id = ip.id
      WHERE ps.pharmacy_id = ${pharmacyId}
        AND DATE_TRUNC('month', ic.created_at) = ${month}::DATE
      ORDER BY ip.name, ic.created_at
    `);

    // Group by insurer
    const byInsurer = this.groupBy(claims, 'insurer_name');

    return {
      month,
      pharmacy_id: pharmacyId,
      total_claims: claims.length,
      total_amount: claims.reduce((sum, c) => sum + c.total_amount, 0),
      total_covered: claims.reduce((sum, c) => sum + c.total_covered, 0),
      by_insurer: Object.entries(byInsurer).map(([insurer, insurerClaims]) => ({
        insurer,
        claims_count: insurerClaims.length,
        total_amount: insurerClaims.reduce((sum, c) => sum + c.total_amount, 0),
        total_covered: insurerClaims.reduce((sum, c) => sum + c.total_covered, 0),
        pending: insurerClaims.filter(c => c.status === 'pending').length,
        approved: insurerClaims.filter(c => c.status === 'approved').length,
        rejected: insurerClaims.filter(c => c.status === 'rejected').length,
      })),
      claims,
    };
  }
}

// Scheduled report generation
async function generateScheduledReports() {
  const pharmacies = await db
    .select()
    .from(pharmacies)
    .where(eq(pharmacies.is_active, true));

  const reportService = new ReportService();
  const today = new Date();

  for (const pharmacy of pharmacies) {
    // Daily report at 6 AM
    await reportService.generatePharmacyReport(pharmacy.id, 'daily', today);

    // Weekly report on Mondays
    if (today.getDay() === 1) {
      await reportService.generatePharmacyReport(pharmacy.id, 'weekly', today);
    }

    // Monthly report on 1st
    if (today.getDate() === 1) {
      await reportService.generatePharmacyReport(pharmacy.id, 'monthly', today);
    }
  }
}
```

---

# DEPLOYMENT & INFRASTRUCTURE

## Environment Configuration

```typescript
// Environment-specific configs
const environments = {
  development: {
    supabase_url: process.env.SUPABASE_URL_DEV,
    ai_model: 'gpt-4o-mini', // Cheaper for dev
    log_level: 'debug',
    rate_limits: { requests_per_minute: 1000 }, // Relaxed
  },
  staging: {
    supabase_url: process.env.SUPABASE_URL_STAGING,
    ai_model: 'gpt-4o',
    log_level: 'info',
    rate_limits: { requests_per_minute: 100 },
  },
  production: {
    supabase_url: process.env.SUPABASE_URL_PROD,
    ai_model: 'gpt-4o',
    log_level: 'warn',
    rate_limits: { requests_per_minute: 60 },
  },
};
```

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test:unit
      - run: pnpm test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm playwright install
      - run: pnpm test:e2e
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}

  deploy-staging:
    needs: [test, e2e]
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --app dawa-staging
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-production:
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --app dawa-production --strategy rolling
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

# INSURANCE INTEGRATION (CNSS, CNOPS, AMO)

Morocco's healthcare insurance landscape.

## Insurance Provider Matrix

```typescript
// Moroccan insurance providers
const INSURANCE_PROVIDERS = {
  // Public sector
  CNOPS: {
    name: 'Caisse Nationale des Organismes de Prévoyance Sociale',
    type: 'public',
    coverage_rate: 0.70, // 70% coverage
    api_available: false, // Manual claim submission
    claim_method: 'paper_then_digital',
  },
  CNSS: {
    name: 'Caisse Nationale de Sécurité Sociale',
    type: 'public',
    coverage_rate: 0.70,
    api_available: false,
    claim_method: 'paper_then_digital',
  },
  AMO: {
    name: 'Assurance Maladie Obligatoire',
    type: 'public',
    coverage_rate: 0.70,
    api_available: false,
    claim_method: 'paper_then_digital',
  },

  // Private insurers
  SAHAM: {
    name: 'Saham Assurance',
    type: 'private',
    coverage_rate: 'varies', // By policy
    api_available: true,
    api_endpoint: 'https://api.saham.ma/claims',
  },
  AXA: {
    name: 'AXA Assurance Maroc',
    type: 'private',
    coverage_rate: 'varies',
    api_available: true,
    api_endpoint: 'https://api.axa.ma/health/claims',
  },
  WAFA: {
    name: 'Wafa Assurance',
    type: 'private',
    coverage_rate: 'varies',
    api_available: false,
    claim_method: 'email',
  },
};
```

## Insurance Claim Processing

```typescript
// Insurance claim structure
interface InsuranceClaim {
  id: string;
  prescription_id: string;
  patient_id: string;

  // Insurance details
  insurer_id: string;
  policy_number: string;
  member_id: string;

  // Claim details
  medications: {
    drug_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    coverage_rate: number;
    covered_amount: number;
  }[];

  // Amounts
  total_amount: number;
  total_covered: number;
  patient_responsibility: number;

  // Status
  status: 'pending' | 'submitted' | 'processing' | 'approved' | 'rejected' | 'paid';
  submitted_at: Date | null;
  processed_at: Date | null;

  // Rejection handling
  rejection_reason: string | null;
  appeal_deadline: Date | null;
}

// Claim submission flow
async function submitInsuranceClaim(claim: InsuranceClaim): Promise<ClaimResult> {
  const provider = INSURANCE_PROVIDERS[claim.insurer_id];

  if (provider.api_available) {
    // Direct API submission
    return await submitViaAPI(provider, claim);
  } else if (provider.claim_method === 'paper_then_digital') {
    // Generate PDF for paper submission + queue for follow-up
    const pdfUrl = await generateClaimPDF(claim);
    await queueClaimFollowUp(claim.id, { pdf_url: pdfUrl });
    return { status: 'pending_manual_submission', pdf_url: pdfUrl };
  } else {
    // Email submission
    await sendClaimEmail(provider, claim);
    return { status: 'submitted_via_email' };
  }
}
```

---

# PAYMENT INTEGRATION

Morocco payment ecosystem with CMI (Centre Monétique Interbancaire) and mobile money.

## Payment Providers

```typescript
// Supported payment methods in Morocco
const PAYMENT_PROVIDERS = {
  // Card payments via CMI
  CMI: {
    name: 'Centre Monétique Interbancaire',
    type: 'card',
    supported_cards: ['visa', 'mastercard', 'cmi_local'],
    api_endpoint: 'https://payment.cmi.co.ma/api/v1',
    supports_3ds: true,
    supports_recurring: true,
    settlement_days: 2,
    fees: {
      percentage: 0.025, // 2.5%
      fixed: 0, // No fixed fee
    },
  },

  // Cash on delivery
  COD: {
    name: 'Cash on Delivery',
    type: 'cash',
    max_amount: 5000, // MAD
    requires_exact_change: false,
    courier_cash_limit: 2000, // MAD per delivery batch
  },

  // Mobile money
  INWI_MONEY: {
    name: 'inwi money',
    type: 'mobile_money',
    api_endpoint: 'https://api.inwi.ma/money/v1',
    ussd_code: '*120#',
    max_transaction: 10000,
  },

  ORANGE_MONEY: {
    name: 'Orange Money',
    type: 'mobile_money',
    api_endpoint: 'https://api.orange.ma/money/v1',
    ussd_code: '*145#',
    max_transaction: 10000,
  },

  // Bank transfers
  BANK_TRANSFER: {
    name: 'Virement Bancaire',
    type: 'bank_transfer',
    supported_banks: ['attijariwafa', 'bmce', 'bp', 'sgmb', 'cih'],
    requires_rib: true,
  },
};
```

## Payment Database Schema

```sql
-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescription_states(prescription_id),
  patient_id UUID NOT NULL REFERENCES patients(id),

  -- Payment Details
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'MAD',
  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'card', 'cod', 'mobile_money', 'bank_transfer', 'insurance_only'
  )),
  provider TEXT NOT NULL, -- 'CMI', 'COD', 'INWI_MONEY', etc.

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'authorized', 'captured', 'failed',
    'refunded', 'partially_refunded', 'disputed', 'cancelled'
  )),

  -- Provider Reference
  provider_transaction_id TEXT,
  provider_response JSONB DEFAULT '{}',

  -- Card Details (tokenized, not raw)
  card_token TEXT, -- Tokenized card for recurring
  card_last_four TEXT,
  card_brand TEXT,
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,

  -- 3D Secure
  three_ds_required BOOLEAN DEFAULT FALSE,
  three_ds_status TEXT,
  three_ds_eci TEXT,

  -- Breakdown
  subtotal NUMERIC(10,2) NOT NULL,
  insurance_coverage NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,

  -- COD Specific
  cod_collected_at TIMESTAMPTZ,
  cod_collected_by UUID REFERENCES couriers(id),
  cod_collection_proof JSONB,

  -- Refund Info
  refund_amount NUMERIC(10,2),
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  authorized_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_prescription ON payments(prescription_id);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_tx ON payments(provider_transaction_id);

-- ============================================
-- PAYMENT EVENTS (Event Sourcing)
-- ============================================

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),

  event_type TEXT NOT NULL CHECK (event_type IN (
    'PAYMENT_INITIATED',
    'PAYMENT_AUTHORIZED',
    'PAYMENT_CAPTURED',
    'PAYMENT_FAILED',
    'PAYMENT_CANCELLED',
    'REFUND_INITIATED',
    'REFUND_COMPLETED',
    'DISPUTE_OPENED',
    'DISPUTE_RESOLVED',
    'COD_COLLECTED',
    'COD_DEPOSITED'
  )),

  event_data JSONB NOT NULL DEFAULT '{}',
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_events_payment ON payment_events(payment_id);
CREATE INDEX idx_payment_events_type ON payment_events(event_type);

-- ============================================
-- COURIER CASH MANAGEMENT
-- ============================================

CREATE TABLE courier_cash_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id UUID NOT NULL REFERENCES couriers(id),

  -- Transaction
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'cod_collection', 'deposit', 'adjustment', 'penalty'
  )),
  amount NUMERIC(10,2) NOT NULL, -- Positive for collection, negative for deposit
  running_balance NUMERIC(10,2) NOT NULL,

  -- Reference
  payment_id UUID REFERENCES payments(id),
  prescription_id UUID,
  deposit_reference TEXT,

  -- Verification
  verified_by UUID,
  verified_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courier_cash_courier ON courier_cash_ledger(courier_id);
CREATE INDEX idx_courier_cash_payment ON courier_cash_ledger(payment_id);
```

## Payment Flow Implementation

```typescript
import { z } from 'zod';

// Payment initiation schema
export const InitiatePaymentSchema = z.object({
  prescription_id: z.string().uuid(),
  payment_method: z.enum(['card', 'cod', 'mobile_money']),
  provider: z.string().optional(),

  // Card-specific
  card_token: z.string().optional(),
  save_card: z.boolean().optional(),

  // Mobile money specific
  phone_number: z.string().regex(/^\+212[0-9]{9}$/).optional(),
});

// Payment service
class PaymentService {
  async initiatePayment(data: z.infer<typeof InitiatePaymentSchema>): Promise<PaymentResult> {
    const prescription = await this.getPrescription(data.prescription_id);

    // Calculate amounts
    const amounts = this.calculatePaymentAmounts(prescription);

    // Create payment record
    const payment = await db.insert(payments).values({
      prescription_id: data.prescription_id,
      patient_id: prescription.patient_id,
      amount: amounts.total,
      payment_method: data.payment_method,
      provider: data.provider || this.getDefaultProvider(data.payment_method),
      subtotal: amounts.subtotal,
      insurance_coverage: amounts.insurance_coverage,
      delivery_fee: amounts.delivery_fee,
      status: 'pending',
    }).returning();

    // Log event
    await this.logPaymentEvent(payment.id, 'PAYMENT_INITIATED', {
      amount: amounts.total,
      method: data.payment_method,
    });

    // Process based on method
    switch (data.payment_method) {
      case 'card':
        return this.processCardPayment(payment, data);
      case 'cod':
        return this.processCODPayment(payment);
      case 'mobile_money':
        return this.processMobileMoneyPayment(payment, data);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  private async processCardPayment(
    payment: Payment,
    data: { card_token?: string; save_card?: boolean }
  ): Promise<PaymentResult> {
    const cmiClient = new CMIClient(process.env.CMI_API_KEY);

    try {
      // Authorize the payment
      const authResult = await cmiClient.authorize({
        amount: payment.amount,
        currency: 'MAD',
        card_token: data.card_token,
        order_id: payment.id,
        return_url: `${process.env.APP_URL}/payment/callback`,
        three_ds: true,
      });

      if (authResult.requires_3ds) {
        // Return 3DS redirect URL
        return {
          status: 'requires_action',
          action_type: '3ds_redirect',
          redirect_url: authResult.redirect_url,
          payment_id: payment.id,
        };
      }

      // Authorization successful, capture immediately for pharmacy orders
      const captureResult = await cmiClient.capture({
        transaction_id: authResult.transaction_id,
        amount: payment.amount,
      });

      await this.updatePaymentStatus(payment.id, 'captured', {
        provider_transaction_id: captureResult.transaction_id,
        provider_response: captureResult,
      });

      return {
        status: 'success',
        payment_id: payment.id,
        transaction_id: captureResult.transaction_id,
      };
    } catch (error) {
      await this.updatePaymentStatus(payment.id, 'failed', {
        provider_response: { error: error.message },
      });

      return {
        status: 'failed',
        payment_id: payment.id,
        error_code: 'PAYMENT_FAILED',
        error_message: this.getLocalizedError(error),
      };
    }
  }

  private async processCODPayment(payment: Payment): Promise<PaymentResult> {
    // COD is authorized immediately, captured on delivery
    await this.updatePaymentStatus(payment.id, 'authorized');

    return {
      status: 'success',
      payment_id: payment.id,
      payment_method: 'cod',
      message: 'Cash on delivery confirmed. Pay when your order arrives.',
    };
  }

  async collectCOD(
    paymentId: string,
    courierId: string,
    proof: { photo_url: string; amount_received: number }
  ): Promise<void> {
    const payment = await this.getPayment(paymentId);

    if (payment.payment_method !== 'cod') {
      throw new Error('Payment is not COD');
    }

    if (proof.amount_received < payment.amount) {
      throw new Error('Insufficient amount collected');
    }

    // Update payment
    await db.update(payments)
      .set({
        status: 'captured',
        cod_collected_at: new Date(),
        cod_collected_by: courierId,
        cod_collection_proof: proof,
      })
      .where(eq(payments.id, paymentId));

    // Update courier cash ledger
    const currentBalance = await this.getCourierCashBalance(courierId);
    await db.insert(courier_cash_ledger).values({
      courier_id: courierId,
      transaction_type: 'cod_collection',
      amount: payment.amount,
      running_balance: currentBalance + payment.amount,
      payment_id: paymentId,
      prescription_id: payment.prescription_id,
    });

    // Check if courier needs to deposit
    if (currentBalance + payment.amount > PAYMENT_PROVIDERS.COD.courier_cash_limit) {
      await this.notifyCourierToDeposit(courierId);
    }

    await this.logPaymentEvent(paymentId, 'COD_COLLECTED', {
      courier_id: courierId,
      amount: proof.amount_received,
    });
  }

  async processRefund(
    paymentId: string,
    amount: number,
    reason: string
  ): Promise<RefundResult> {
    const payment = await this.getPayment(paymentId);

    if (payment.status !== 'captured') {
      throw new Error('Cannot refund payment that was not captured');
    }

    if (amount > payment.amount - (payment.refund_amount || 0)) {
      throw new Error('Refund amount exceeds available balance');
    }

    await this.logPaymentEvent(paymentId, 'REFUND_INITIATED', { amount, reason });

    if (payment.payment_method === 'card') {
      const cmiClient = new CMIClient(process.env.CMI_API_KEY);

      const refundResult = await cmiClient.refund({
        transaction_id: payment.provider_transaction_id,
        amount,
        reason,
      });

      const newRefundTotal = (payment.refund_amount || 0) + amount;
      const newStatus = newRefundTotal >= payment.amount ? 'refunded' : 'partially_refunded';

      await db.update(payments)
        .set({
          status: newStatus,
          refund_amount: newRefundTotal,
          refund_reason: reason,
          refunded_at: new Date(),
        })
        .where(eq(payments.id, paymentId));

      await this.logPaymentEvent(paymentId, 'REFUND_COMPLETED', {
        amount,
        provider_refund_id: refundResult.refund_id,
      });

      return {
        status: 'success',
        refund_id: refundResult.refund_id,
        amount_refunded: amount,
      };
    } else if (payment.payment_method === 'cod') {
      // COD refunds are manual - create a refund ticket
      const refundTicket = await this.createCODRefundTicket(payment, amount, reason);

      return {
        status: 'pending_manual',
        ticket_id: refundTicket.id,
        message: 'Refund will be processed within 3-5 business days',
      };
    }

    throw new Error('Unsupported refund method');
  }

  private calculatePaymentAmounts(prescription: PrescriptionState): PaymentAmounts {
    const subtotal = prescription.verified_medications.reduce(
      (sum, med) => sum + (med.unit_price * med.quantity),
      0
    );

    const insuranceCoverage = prescription.insurance_coverage || 0;
    const deliveryFee = prescription.delivery_fee || 15;

    return {
      subtotal,
      insurance_coverage: insuranceCoverage,
      delivery_fee: deliveryFee,
      discount: 0,
      tax: 0,
      total: subtotal - insuranceCoverage + deliveryFee,
    };
  }
}
```

## CMI Integration Details

```typescript
// CMI (Morocco's primary card processor) client
class CMIClient {
  private apiKey: string;
  private merchantId: string;
  private endpoint: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.merchantId = process.env.CMI_MERCHANT_ID;
    this.endpoint = 'https://payment.cmi.co.ma/api/v1';
  }

  async authorize(params: {
    amount: number;
    currency: string;
    card_token?: string;
    order_id: string;
    return_url: string;
    three_ds: boolean;
  }): Promise<CMIAuthResult> {
    const payload = {
      merchant_id: this.merchantId,
      amount: Math.round(params.amount * 100), // Centimes
      currency: params.currency,
      order_id: params.order_id,
      card_token: params.card_token,
      return_url: params.return_url,
      three_ds_required: params.three_ds,
      capture: false, // Authorize only
      language: 'fr', // or 'ar'
    };

    const signature = this.generateSignature(payload);

    const response = await fetch(`${this.endpoint}/authorize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-CMI-Signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new CMIError(await response.json());
    }

    return response.json();
  }

  async capture(params: {
    transaction_id: string;
    amount: number;
  }): Promise<CMICaptureResult> {
    const payload = {
      merchant_id: this.merchantId,
      transaction_id: params.transaction_id,
      amount: Math.round(params.amount * 100),
    };

    const response = await fetch(`${this.endpoint}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-CMI-Signature': this.generateSignature(payload),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new CMIError(await response.json());
    }

    return response.json();
  }

  async refund(params: {
    transaction_id: string;
    amount: number;
    reason: string;
  }): Promise<CMIRefundResult> {
    const payload = {
      merchant_id: this.merchantId,
      transaction_id: params.transaction_id,
      amount: Math.round(params.amount * 100),
      reason: params.reason,
    };

    const response = await fetch(`${this.endpoint}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-CMI-Signature': this.generateSignature(payload),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new CMIError(await response.json());
    }

    return response.json();
  }

  private generateSignature(payload: Record<string, unknown>): string {
    const sortedKeys = Object.keys(payload).sort();
    const signatureString = sortedKeys.map(k => `${k}=${payload[k]}`).join('&');
    return createHmac('sha256', this.apiKey).update(signatureString).digest('hex');
  }
}
```

---

# PERFORMANCE OPTIMIZATION

## Database Query Optimization

```sql
-- Pharmacy queue query (optimized)
CREATE INDEX CONCURRENTLY idx_prescription_states_pharmacy_queue
ON prescription_states (pharmacy_id, status, priority_score DESC, created_at ASC)
WHERE status IN ('pending_verification', 'pending_pharmacist_review', 'preparing');

-- Common query pattern with covering index
SELECT
  ps.id,
  ps.status,
  ps.priority_score,
  ps.created_at,
  ps.patient_id,
  p.name as patient_name,
  ps.ai_analysis->'attention_flags' as attention_flags
FROM prescription_states ps
JOIN patients p ON ps.patient_id = p.id
WHERE ps.pharmacy_id = $1
  AND ps.status IN ('pending_verification', 'pending_pharmacist_review')
ORDER BY ps.priority_score DESC, ps.created_at ASC
LIMIT 50;

-- Explain analyze to verify index usage
EXPLAIN (ANALYZE, BUFFERS) SELECT ...
```

## Frontend Performance

```typescript
// React optimization patterns
// 1. Virtualized list for queue
import { useVirtualizer } from '@tanstack/react-virtual';

function QueueList({ items }: { items: OrderQueueItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <QueueItem
            key={items[virtualRow.index].id}
            item={items[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// 2. Memoization for expensive computations
const MemoizedQueueItem = memo(QueueItem, (prev, next) => {
  return prev.item.id === next.item.id
    && prev.item.status === next.item.status
    && prev.item.priority_score === next.item.priority_score;
});

// 3. Code splitting for routes
const PharmacyPortal = lazy(() => import('./pharmacy/PharmacyPortal'));
const PatientApp = lazy(() => import('./patient/PatientApp'));
const CourierApp = lazy(() => import('./courier/CourierApp'));
```

## Image Optimization

```typescript
// Prescription image processing pipeline
const IMAGE_OPTIMIZATION = {
  // Upload: Compress before upload
  upload: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.85,
    format: 'webp',
  },

  // Storage: Multiple sizes
  storage: {
    original: { maxWidth: 2048, quality: 0.9 },
    display: { maxWidth: 1024, quality: 0.8 },
    thumbnail: { maxWidth: 256, quality: 0.7 },
  },

  // Delivery: CDN with transformation
  cdn: {
    provider: 'cloudflare',
    transformations: ['auto-format', 'auto-quality', 'lazy-load'],
  },
};
```

---

# MOBILE APP ARCHITECTURE

React Native with Expo for all three apps: Patient, Pharmacy, Courier.

## Project Structure

```
dawa-mobile/
├── apps/
│   ├── patient/           # Patient app
│   │   ├── app/           # Expo Router app directory
│   │   ├── components/
│   │   ├── hooks/
│   │   └── app.json
│   ├── pharmacy/          # Pharmacy portal app
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── app.json
│   └── courier/           # Courier app
│       ├── app/
│       ├── components/
│       ├── hooks/
│       └── app.json
├── packages/
│   ├── shared/            # Shared code
│   │   ├── api/           # API client
│   │   ├── components/    # Shared UI components
│   │   ├── hooks/         # Shared hooks
│   │   ├── types/         # TypeScript types
│   │   └── utils/
│   ├── ui/                # Design system
│   │   ├── components/
│   │   ├── tokens/
│   │   └── theme.ts
│   └── config/            # Shared configuration
├── package.json           # Root package.json
├── turbo.json             # Turborepo config
└── tsconfig.base.json
```

## Expo Configuration

```json
// apps/patient/app.json
{
  "expo": {
    "name": "DAWA.ma",
    "slug": "dawa-patient",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0A0A0F"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "ma.dawa.patient",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "DAWA needs camera access to scan prescriptions",
        "NSPhotoLibraryUsageDescription": "DAWA needs photo library access to upload prescriptions",
        "NSLocationWhenInUseUsageDescription": "DAWA needs location to find nearby pharmacies"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0A0A0F"
      },
      "package": "ma.dawa.patient",
      "versionCode": 1,
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
    "plugins": [
      "expo-camera",
      "expo-image-picker",
      "expo-location",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#8B5CF6"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## Navigation Structure

```typescript
// apps/patient/app/_layout.tsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '@dawa/ui';
import { AuthProvider } from '@dawa/shared/auth';
import { QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0A0A0F' },
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="prescription/[id]"
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="tracking/[id]"
              options={{ presentation: 'fullScreenModal' }}
            />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// apps/patient/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { HomeIcon, PillIcon, UserIcon } from '@dawa/ui/icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#71717A',
        tabBarStyle: {
          backgroundColor: '#12121A',
          borderTopColor: '#22222E',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Prescriptions',
          tabBarIcon: ({ color }) => <PillIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
```

## Prescription Camera Component

```typescript
// packages/shared/components/PrescriptionCamera.tsx
import { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { usePrescriptionAnalyzer } from '@dawa/shared/hooks';
import { OverlayGuide, QualityIndicator, CaptureButton } from '@dawa/ui';

export function PrescriptionCamera({ onCapture, onAnalysisComplete }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const analyzer = usePrescriptionAnalyzer();

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;

    setIsAnalyzing(true);

    try {
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
        exif: false,
      });

      // Resize for analysis
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
      );

      // Run pre-upload analysis
      const analysis = await analyzer.analyzeBeforeUpload(resized.uri);

      setQualityScore(analysis.completeness_score);

      if (!analysis.upload_approved) {
        Alert.alert(
          'Image Quality Issue',
          analysis.guidance_message,
          [
            { text: 'Retake', onPress: () => setIsAnalyzing(false) },
            {
              text: 'Use Anyway',
              onPress: () => {
                onCapture(resized.uri, analysis);
                onAnalysisComplete(analysis);
              },
            },
          ]
        );
        return;
      }

      onCapture(resized.uri, analysis);
      onAnalysisComplete(analysis);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image. Please try again.');
      console.error('Camera capture error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzer, onCapture, onAnalysisComplete]);

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is required to scan prescriptions
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash="auto"
      >
        <OverlayGuide />
        {qualityScore !== null && (
          <QualityIndicator score={qualityScore} />
        )}
      </CameraView>

      <View style={styles.controls}>
        <CaptureButton
          onPress={handleCapture}
          loading={isAnalyzing}
          disabled={isAnalyzing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    padding: 20,
  },
  permissionText: {
    color: '#F4F4F5',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Live Order Tracking

```typescript
// packages/shared/components/LiveTrackingMap.tsx
import { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useOrderTracking } from '@dawa/shared/hooks';
import { CourierMarker, DestinationMarker, ETABadge } from '@dawa/ui';

interface LiveTrackingMapProps {
  orderId: string;
  deliveryAddress: {
    lat: number;
    lng: number;
    street: string;
  };
}

export function LiveTrackingMap({ orderId, deliveryAddress }: LiveTrackingMapProps) {
  const { courierLocation, eta, events } = useOrderTracking(orderId);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);

  useEffect(() => {
    if (courierLocation) {
      // Fetch route from courier to destination
      fetchRoute(courierLocation, deliveryAddress).then(setRouteCoordinates);
    }
  }, [courierLocation?.lat, courierLocation?.lng]);

  const initialRegion = {
    latitude: deliveryAddress.lat,
    longitude: deliveryAddress.lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Delivery destination */}
        <Marker coordinate={deliveryAddress}>
          <DestinationMarker />
        </Marker>

        {/* Courier location */}
        {courierLocation && (
          <Marker
            coordinate={{
              latitude: courierLocation.lat,
              longitude: courierLocation.lng,
            }}
            rotation={courierLocation.heading}
          >
            <CourierMarker />
          </Marker>
        )}

        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#8B5CF6"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* ETA overlay */}
      {eta && (
        <View style={styles.etaContainer}>
          <ETABadge minutes={eta} />
        </View>
      )}

      {/* Status updates */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {getStatusMessage(events[events.length - 1]?.event_type)}
        </Text>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  // ... more dark mode styling
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  etaContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#12121A',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusText: {
    color: '#F4F4F5',
    fontSize: 16,
    textAlign: 'center',
  },
});
```

## Offline Support with React Query

```typescript
// packages/shared/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 3,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'DAWA_QUERY_CACHE',
});

// Wrapper component
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: query => {
            // Only persist specific queries
            const persistedQueries = [
              'patient-profile',
              'active-medications',
              'prescription-history',
            ];
            return persistedQueries.some(key =>
              query.queryKey.includes(key)
            );
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```

---

# DRUG SEARCH & AUTOCOMPLETE

Fast, fuzzy search across Morocco's drug database.

## Search Implementation

```sql
-- Full-text search configuration for drug names
CREATE TEXT SEARCH CONFIGURATION morocco_drug (COPY = french);

-- Add Arabic stemming support
ALTER TEXT SEARCH CONFIGURATION morocco_drug
  ALTER MAPPING FOR word WITH french_stem, arabic_stem;

-- Trigram index for fuzzy matching
CREATE INDEX idx_drugs_trigram ON morocco_drug_database
  USING gin (brand_name gin_trgm_ops);

CREATE INDEX idx_drugs_trigram_generic ON morocco_drug_database
  USING gin (generic_name gin_trgm_ops);

-- Combined full-text index
CREATE INDEX idx_drugs_fts ON morocco_drug_database
  USING gin (
    to_tsvector('morocco_drug',
      coalesce(brand_name, '') || ' ' ||
      coalesce(generic_name, '') || ' ' ||
      coalesce(dci_code, '')
    )
  );

-- Optimized search function
CREATE OR REPLACE FUNCTION search_drugs(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  id UUID,
  brand_name TEXT,
  generic_name TEXT,
  dci_code TEXT,
  therapeutic_class TEXT,
  available_forms JSONB,
  ppv NUMERIC,
  rank REAL,
  match_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    -- Exact match on brand name (highest priority)
    SELECT
      d.id, d.brand_name, d.generic_name, d.dci_code,
      d.therapeutic_class, d.available_forms, d.ppv,
      1.0::REAL as rank,
      'exact_brand'::TEXT as match_type
    FROM morocco_drug_database d
    WHERE lower(d.brand_name) = lower(p_query)
      AND d.is_active = TRUE

    UNION ALL

    -- Prefix match on brand name
    SELECT
      d.id, d.brand_name, d.generic_name, d.dci_code,
      d.therapeutic_class, d.available_forms, d.ppv,
      0.9::REAL as rank,
      'prefix_brand'::TEXT as match_type
    FROM morocco_drug_database d
    WHERE lower(d.brand_name) LIKE lower(p_query) || '%'
      AND lower(d.brand_name) != lower(p_query)
      AND d.is_active = TRUE

    UNION ALL

    -- Trigram similarity on brand name
    SELECT
      d.id, d.brand_name, d.generic_name, d.dci_code,
      d.therapeutic_class, d.available_forms, d.ppv,
      similarity(d.brand_name, p_query) * 0.8 as rank,
      'fuzzy_brand'::TEXT as match_type
    FROM morocco_drug_database d
    WHERE d.brand_name % p_query
      AND similarity(d.brand_name, p_query) > 0.3
      AND d.is_active = TRUE

    UNION ALL

    -- Full-text search
    SELECT
      d.id, d.brand_name, d.generic_name, d.dci_code,
      d.therapeutic_class, d.available_forms, d.ppv,
      ts_rank(
        to_tsvector('morocco_drug', d.brand_name || ' ' || d.generic_name),
        plainto_tsquery('morocco_drug', p_query)
      ) * 0.7 as rank,
      'fts'::TEXT as match_type
    FROM morocco_drug_database d
    WHERE to_tsvector('morocco_drug', d.brand_name || ' ' || d.generic_name)
      @@ plainto_tsquery('morocco_drug', p_query)
      AND d.is_active = TRUE
  )
  SELECT DISTINCT ON (ranked.id)
    ranked.id, ranked.brand_name, ranked.generic_name, ranked.dci_code,
    ranked.therapeutic_class, ranked.available_forms, ranked.ppv,
    MAX(ranked.rank) OVER (PARTITION BY ranked.id) as rank,
    (ARRAY_AGG(ranked.match_type ORDER BY ranked.rank DESC))[1] as match_type
  FROM ranked
  ORDER BY ranked.id, rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

## Search API Endpoint

```typescript
// Drug search API
import { z } from 'zod';

const DrugSearchSchema = z.object({
  query: z.string().min(2).max(100),
  limit: z.number().int().min(1).max(50).default(20),
  include_generics: z.boolean().default(true),
  therapeutic_class: z.string().optional(),
});

export async function searchDrugs(
  params: z.infer<typeof DrugSearchSchema>
): Promise<DrugSearchResult[]> {
  const { query, limit, include_generics, therapeutic_class } = params;

  // Normalize query
  const normalizedQuery = query
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

  // Call database function
  const results = await db.execute(sql`
    SELECT * FROM search_drugs(${normalizedQuery}, ${limit})
    ${therapeutic_class ? sql`WHERE therapeutic_class = ${therapeutic_class}` : sql``}
  `);

  // If include_generics, find alternatives for brand drugs
  if (include_generics && results.length > 0) {
    const genericAlternatives = await findGenericAlternatives(results);
    return results.map(drug => ({
      ...drug,
      alternatives: genericAlternatives[drug.id] || [],
    }));
  }

  return results;
}

// Find generic alternatives for a brand drug
async function findGenericAlternatives(
  drugs: DrugSearchResult[]
): Promise<Record<string, DrugSearchResult[]>> {
  const dciCodes = drugs
    .map(d => d.dci_code)
    .filter(Boolean);

  if (dciCodes.length === 0) return {};

  const alternatives = await db.execute(sql`
    SELECT
      d.*,
      parent.id as parent_drug_id
    FROM morocco_drug_database d
    JOIN morocco_drug_database parent ON d.dci_code = parent.dci_code
    WHERE parent.id = ANY(${drugs.map(d => d.id)})
      AND d.id != parent.id
      AND d.is_active = TRUE
    ORDER BY d.ppv ASC
    LIMIT 3
  `);

  // Group by parent drug
  return alternatives.reduce((acc, alt) => {
    if (!acc[alt.parent_drug_id]) {
      acc[alt.parent_drug_id] = [];
    }
    acc[alt.parent_drug_id].push(alt);
    return acc;
  }, {} as Record<string, DrugSearchResult[]>);
}
```

## React Native Autocomplete Component

```typescript
// packages/shared/components/DrugAutocomplete.tsx
import { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDebounce } from '@dawa/shared/hooks';
import { searchDrugs } from '@dawa/shared/api';

interface DrugAutocompleteProps {
  onSelect: (drug: Drug) => void;
  placeholder?: string;
}

export function DrugAutocomplete({
  onSelect,
  placeholder = 'Search medications...',
}: DrugAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const drugs = await searchDrugs({
          query: debouncedQuery,
          limit: 10,
        });
        setResults(drugs);
      } catch (error) {
        console.error('Drug search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleSelect = useCallback((drug: Drug) => {
    setQuery(drug.brand_name);
    setShowResults(false);
    onSelect(drug);
  }, [onSelect]);

  const renderItem = ({ item }: { item: Drug }) => (
    <Pressable
      style={styles.resultItem}
      onPress={() => handleSelect(item)}
    >
      <View>
        <Text style={styles.brandName}>{item.brand_name}</Text>
        <Text style={styles.genericName}>{item.generic_name}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{item.ppv.toFixed(2)} MAD</Text>
        {item.alternatives?.length > 0 && (
          <Text style={styles.alternativesBadge}>
            {item.alternatives.length} génériques
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          placeholderTextColor="#71717A"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#8B5CF6"
            style={styles.loader}
          />
        )}
      </View>

      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.resultsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22222E',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    color: '#F4F4F5',
    fontSize: 16,
  },
  loader: {
    marginRight: 12,
  },
  resultsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22222E',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#22222E',
  },
  brandName: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '500',
  },
  genericName: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '600',
  },
  alternativesBadge: {
    color: '#60A5FA',
    fontSize: 12,
    marginTop: 2,
  },
});
```

## Interaction Checker

```typescript
// Drug interaction checking
export async function checkInteractions(
  drugIds: string[]
): Promise<DrugInteraction[]> {
  if (drugIds.length < 2) return [];

  const interactions = await db.execute(sql`
    SELECT DISTINCT
      di.drug_a_id,
      da.brand_name as drug_a_name,
      di.drug_b_id,
      db.brand_name as drug_b_name,
      di.severity,
      di.mechanism,
      di.clinical_significance,
      di.management,
      di.reference
    FROM drug_interactions di
    JOIN morocco_drug_database da ON di.drug_a_id = da.id
    JOIN morocco_drug_database db ON di.drug_b_id = db.id
    WHERE (di.drug_a_id = ANY(${drugIds}) AND di.drug_b_id = ANY(${drugIds}))
      AND di.drug_a_id != di.drug_b_id
    ORDER BY
      CASE di.severity
        WHEN 'major' THEN 1
        WHEN 'moderate' THEN 2
        WHEN 'minor' THEN 3
        ELSE 4
      END
  `);

  return interactions.map(i => ({
    ...i,
    action_required: i.severity === 'major',
    pharmacist_alert: i.severity !== 'minor',
  }));
}
```

---

# COMMAND EXECUTION PROTOCOL

When implementing, follow this exact sequence:

## For Each Feature:

```
1. CREATE event type in prescription_events table
2. CREATE state projection handler
3. CREATE Zod validation schema
4. CREATE API endpoint
5. CREATE React hook for state management
6. CREATE UI component
7. CREATE tests (unit → integration → e2e)
8. VERIFY RLS policies cover new data access
9. ADD audit logging for PII access
10. UPDATE metrics collection
```

## Code Quality Checklist:

```
□ TypeScript strict: no any, no ts-ignore
□ All API responses use ApiResponse<T> envelope
□ All inputs validated with Zod
□ All errors use ERROR_CODES taxonomy
□ All PII access logged to audit table
□ All real-time subscriptions properly cleaned up
□ All images optimized before storage
□ All queries use indexes (verify with EXPLAIN)
□ All components handle loading/error/empty states
□ All user-facing text uses i18n keys
```

---

# FINAL NOTES

This is not a tutorial project. This is production healthcare infrastructure that will:

1. **Handle PHI (Protected Health Information)** — Compliance is non-negotiable
2. **Process financial transactions** — Accuracy is critical
3. **Enable medical decisions** — Safety is paramount
4. **Scale to national coverage** — Architecture must support growth

Build accordingly. No shortcuts. No "we'll fix it later."

Every line of code should be written as if a CNDP auditor, a patient, and a pharmacist are watching over your shoulder — because eventually, they will be.

---

*Document Version: 10.0*
*Last Updated: 2025*
*Architecture Level: Expert*
