# PHASE 0: Foundation (Months 1-3)

> **Objective**: Infrastructure + Core Platform
> **Key Deliverables**: Database, Auth, Patient App MVP, Admin Dashboard

## Overview

Phase 0 establishes the foundational infrastructure for DAWA. Nothing else can be built until this phase is complete and validated.

## Tech Stack Decisions

| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | Next.js 14+ (App Router) | RSC, Server Actions, Morocco SEO |
| Database | PostgreSQL + Supabase | RLS, Real-time, Auth bundle |
| Styling | Tailwind CSS + shadcn/ui | RTL support, rapid UI |
| State | TanStack Query | Server state, caching |
| Forms | React Hook Form + Zod | Type-safe validation |
| Storage | Supabase Storage | Prescription images, invoices |
| Search | Meilisearch | Arabic fuzzy search, instant |
| Queue | BullMQ + Redis | Background jobs |

## Database Schema - Core Tables

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  first_name_ar VARCHAR(100),
  last_name_ar VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(10),
  national_id VARCHAR(20),
  preferred_language VARCHAR(10) DEFAULT 'ar',
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'patient',
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

### pharmacies
```sql
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  license_verified BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES users(id),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(2) DEFAULT 'MA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(15),
  whatsapp VARCHAR(15),
  email VARCHAR(255),
  opening_hours JSONB DEFAULT '{}',
  is_24_hour BOOLEAN DEFAULT false,
  accepts_insurance BOOLEAN DEFAULT true,
  delivery_enabled BOOLEAN DEFAULT true,
  delivery_radius_km DECIMAL(5, 2) DEFAULT 5.0,
  minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2),
  total_reviews INTEGER DEFAULT 0,
  subscription_tier VARCHAR(20) DEFAULT 'basic',
  subscription_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pharmacies_location ON pharmacies USING gist (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_pharmacies_city ON pharmacies(city);
CREATE INDEX idx_pharmacies_active ON pharmacies(is_active) WHERE is_active = true;
```

### drugs
```sql
CREATE TABLE drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_dci VARCHAR(50),
  name_commercial VARCHAR(255) NOT NULL,
  name_dci VARCHAR(255),
  name_ar VARCHAR(255),
  manufacturer VARCHAR(255),
  form VARCHAR(100), -- tablet, capsule, syrup, etc.
  dosage VARCHAR(100),
  unit_count INTEGER,
  ppm_price DECIMAL(10, 2), -- Prix Public Maroc
  is_generic BOOLEAN DEFAULT false,
  is_narcotic BOOLEAN DEFAULT false,
  is_psychotropic BOOLEAN DEFAULT false,
  is_controlled BOOLEAN DEFAULT false,
  requires_rx BOOLEAN DEFAULT true,
  cold_chain_required BOOLEAN DEFAULT false,
  min_temp DECIMAL(4, 1),
  max_temp DECIMAL(4, 1),
  therapeutic_class VARCHAR(100),
  atc_code VARCHAR(10),
  barcode VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index for Arabic
CREATE INDEX idx_drugs_search ON drugs USING gin(
  to_tsvector('arabic', name_ar) ||
  to_tsvector('french', name_commercial) ||
  to_tsvector('english', name_dci)
);
```

### prescriptions
```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) NOT NULL,
  prescriber_name VARCHAR(255),
  prescriber_license VARCHAR(50),
  prescriber_specialty VARCHAR(100),
  prescription_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  image_url TEXT,
  ocr_raw_text TEXT,
  ocr_extracted_drugs JSONB DEFAULT '[]',
  verification_status VARCHAR(20) DEFAULT 'pending',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  is_renewable BOOLEAN DEFAULT false,
  renewal_count INTEGER DEFAULT 0,
  max_renewals INTEGER DEFAULT 0,
  is_controlled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Patients see own, pharmacists see assigned
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients see own prescriptions"
ON prescriptions FOR SELECT
USING (auth.uid() = patient_id);
```

### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  patient_id UUID REFERENCES users(id) NOT NULL,
  pharmacy_id UUID REFERENCES pharmacies(id) NOT NULL,
  prescription_id UUID REFERENCES prescriptions(id),
  status VARCHAR(30) DEFAULT 'created',
  status_history JSONB DEFAULT '[]',
  delivery_type VARCHAR(20) DEFAULT 'delivery', -- delivery, pickup
  delivery_address JSONB,
  delivery_instructions TEXT,
  scheduled_delivery_at TIMESTAMPTZ,
  estimated_delivery_at TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  driver_id UUID REFERENCES users(id),
  subtotal DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  insurance_coverage DECIMAL(10, 2) DEFAULT 0,
  copay_amount DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  tva_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(20),
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_reference VARCHAR(100),
  insurance_claim_id UUID,
  is_urgent BOOLEAN DEFAULT false,
  requires_cold_chain BOOLEAN DEFAULT false,
  temperature_logs JSONB DEFAULT '[]',
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'DW' || TO_CHAR(NOW(), 'YYMMDD') || 
    LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Authentication Flow

### Phone Registration
1. User enters phone number (+212...)
2. Send OTP via SMS (Twilio/MSG91)
3. Verify OTP
4. Create user record
5. Set auth session

### Login
1. Phone + OTP (primary)
2. Email + password (secondary)
3. Social login (Google, Apple)

### MFA
- TOTP for pharmacy staff
- SMS fallback

### Session Management
```typescript
// Supabase handles sessions
// Configure in supabase/config.toml
[auth]
site_url = "https://dawa.ma"
jwt_expiry = 3600
refresh_token_rotation_enabled = true
```

## Patient App MVP Features

### Screens Required

1. **Splash Screen**
   - DAWA logo
   - Language selection (AR/FR)

2. **Onboarding**
   - 3 slides explaining value prop
   - Skip option

3. **Registration**
   - Phone input (Morocco format)
   - OTP verification
   - Basic profile (name, DOB)

4. **Login**
   - Phone + OTP
   - Remember device option

5. **Home**
   - Quick actions (Upload Rx, Find Pharmacy)
   - Recent orders
   - Health tips

6. **Upload Prescription**
   - Camera capture
   - Gallery selection
   - AI extraction preview
   - Manual drug entry

7. **Pharmacy Search**
   - Map view
   - List view
   - Filters (distance, rating, 24h)
   - Availability check

8. **Order Creation**
   - Drug list from Rx
   - Pharmacy selection
   - Delivery/Pickup toggle
   - Address input

9. **Profile**
   - Personal info
   - Addresses
   - Allergies
   - Insurance cards

## Admin Dashboard Features

### Modules

1. **User Management**
   - List all users
   - Filter by role
   - Activate/Deactivate
   - View activity log

2. **Pharmacy Management**
   - Onboarding queue
   - License verification
   - Subscription status

3. **Order Monitoring**
   - Real-time order map
   - Status distribution
   - Exception alerts

4. **System Health**
   - API response times
   - Error rates
   - Queue depths

## Validation Checklist

Before proceeding to Phase 1:

- [ ] Supabase project created and configured
- [ ] All core tables created with RLS
- [ ] Auth flow works (phone + OTP)
- [ ] Patient can register and login
- [ ] Patient can upload prescription image
- [ ] Image stored in Supabase Storage
- [ ] Drug database imported (10,000+ drugs)
- [ ] Drug search works with Arabic
- [ ] Admin can login and view users
- [ ] Arabic RTL renders correctly
- [ ] Mobile responsive works
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] LCP < 2.5s on mobile

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# SMS Provider (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AI (Claude)
ANTHROPIC_API_KEY=

# Search (Meilisearch)
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=

# Redis
REDIS_URL=
```

## Prompt Sequence

Execute these prompts in order:

1. `prompts/phase-0/P0.1-project-init.md`
2. `prompts/phase-0/P0.2-supabase-setup.md`
3. `prompts/phase-0/P0.3-database-schema.md`
4. `prompts/phase-0/P0.4-auth-system.md`
5. `prompts/phase-0/P0.5-drug-database.md`
6. `prompts/phase-0/P0.6-patient-registration.md`
7. `prompts/phase-0/P0.7-patient-rx-upload.md`
8. `prompts/phase-0/P0.8-admin-dashboard.md`

---

*Completion of Phase 0 unlocks Phase 1: Pharmacy MVP*
