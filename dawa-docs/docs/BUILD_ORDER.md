# DAWA V100 - Build Order & Checkpoints

> **Critical**: Follow this sequence exactly. Do NOT proceed past checkpoints without validation.

## Build Philosophy

```
[Read Spec] → [Execute Prompt] → [Validate] → [Checkpoint Gate] → [Next Step]
```

---

## PHASE 0: Foundation (Months 1-3)

### Step 0.1: Project Initialization
**Prompt**: `prompts/phase-0/P0.1-project-init.md`
**Creates**: Next.js 14+ app, Tailwind, shadcn/ui, folder structure
**Validation**: 
- [ ] `npm run dev` works
- [ ] `/` renders placeholder

### Step 0.2: Supabase Setup
**Prompt**: `prompts/phase-0/P0.2-supabase-setup.md`
**Spec**: `services/database.md`
**Creates**: Supabase project, env vars, connection
**Validation**:
- [ ] `supabase status` returns healthy
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`

### Step 0.3: Core Database Schema
**Prompt**: `prompts/phase-0/P0.3-database-schema.md`
**Spec**: `services/database.md`
**Creates**: Users, Pharmacies, Drugs, Orders tables
**Validation**:
- [ ] All tables exist in Supabase
- [ ] RLS policies active on all tables
- [ ] UUID primary keys (no sequential IDs)

### Step 0.4: Authentication System
**Prompt**: `prompts/phase-0/P0.4-auth-system.md`
**Spec**: `services/auth.md`
**Creates**: Login, Register, MFA, Phone verification
**Validation**:
- [ ] User can register with phone
- [ ] User can login
- [ ] MFA flow works
- [ ] Session persists across refresh

### Step 0.5: Drug Database Import
**Prompt**: `prompts/phase-0/P0.5-drug-database.md`
**Spec**: `services/drug-database.md`
**Creates**: Morocco drug registry import, search
**Validation**:
- [ ] 10,000+ drugs in database
- [ ] Search works with Arabic fuzzy
- [ ] PPM (price) data present

### Step 0.6: Patient App - Registration
**Prompt**: `prompts/phase-0/P0.6-patient-registration.md`
**Spec**: `portals/patient-app.md`
**Creates**: Mobile-first registration flow
**Validation**:
- [ ] Phone verification works
- [ ] Profile creation complete
- [ ] Arabic RTL renders correctly

### Step 0.7: Patient App - Rx Upload
**Prompt**: `prompts/phase-0/P0.7-patient-rx-upload.md`
**Spec**: `portals/patient-app.md`
**Creates**: Camera capture, AI extraction, manual entry
**Validation**:
- [ ] Camera opens on mobile
- [ ] Image uploads to storage
- [ ] OCR extracts drug names

### Step 0.8: Admin Dashboard Base
**Prompt**: `prompts/phase-0/P0.8-admin-dashboard.md`
**Spec**: `portals/admin-portal.md`
**Creates**: Admin layout, user management
**Validation**:
- [ ] Super admin can login
- [ ] User list renders
- [ ] Role assignment works

### ⛔ CHECKPOINT GATE 0
**Script**: `node scripts/validate-phase.js 0`
**Criteria**:
- [ ] All 8 steps validated
- [ ] No console errors in production build
- [ ] All RLS policies pass test suite
- [ ] Performance: LCP < 2.5s

---

## PHASE 1: Pharmacy MVP (Months 4-6)

### Step 1.1: Pharmacy Onboarding
**Prompt**: `prompts/phase-1/P1.1-pharmacy-onboarding.md`
**Spec**: `services/pharmacy.md`
**Creates**: License verification, pharmacy profile
**Validation**:
- [ ] License number validates against Ordre
- [ ] Pharmacy profile saves with all fields
- [ ] Owner account linked

### Step 1.2: Pharmacy Portal Shell
**Prompt**: `prompts/phase-1/P1.2-pharmacy-portal.md`
**Spec**: `portals/pharmacy-portal.md`
**Creates**: Dashboard layout, navigation, sidebar
**Validation**:
- [ ] Desktop-first layout renders
- [ ] All menu items navigate
- [ ] Role-based menu visibility

### Step 1.3: Rx Verification Queue
**Prompt**: `prompts/phase-1/P1.3-rx-verification.md`
**Spec**: `services/prescription.md`
**Creates**: Incoming Rx queue, AI verification, pharmacist actions
**Validation**:
- [ ] Orders appear in queue
- [ ] Drug interaction check runs
- [ ] Pharmacist can approve/reject
- [ ] Audit trail logs action

### Step 1.4: Inventory Management
**Prompt**: `prompts/phase-1/P1.4-inventory.md`
**Spec**: `services/inventory.md`
**Creates**: Stock tracking, batch/lot, expiry alerts
**Validation**:
- [ ] Stock levels update on sale
- [ ] Expiry alerts fire at 30 days
- [ ] Batch numbers tracked

### Step 1.5: Order State Machine
**Prompt**: `prompts/phase-1/P1.5-order-states.md`
**Spec**: `services/order.md`
**Creates**: 15 order states, transitions, SLAs
**Validation**:
- [ ] All state transitions work
- [ ] Invalid transitions blocked
- [ ] SLA timers fire

### Step 1.6: Delivery System Base
**Prompt**: `prompts/phase-1/P1.6-delivery-base.md`
**Spec**: `services/delivery.md`
**Creates**: Driver assignment, tracking, proof of delivery
**Validation**:
- [ ] Driver can accept order
- [ ] GPS tracking updates
- [ ] Photo proof captures

### Step 1.7: Driver Mobile App
**Prompt**: `prompts/phase-1/P1.7-driver-app.md`
**Spec**: `portals/driver-app.md`
**Creates**: Driver PWA, route view, delivery actions
**Validation**:
- [ ] PWA installs on mobile
- [ ] Route map renders
- [ ] Delivery completion works

### Step 1.8: Payment Integration
**Prompt**: `prompts/phase-1/P1.8-payment.md`
**Spec**: `services/payment.md`
**Creates**: CMI cards, COD, mobile wallets
**Validation**:
- [ ] Test card payment completes
- [ ] COD order creates
- [ ] Refund flow works

### Step 1.9: Notification System
**Prompt**: `prompts/phase-1/P1.9-notifications.md`
**Spec**: `services/notification.md`
**Creates**: SMS, push, WhatsApp integration
**Validation**:
- [ ] SMS sends on order update
- [ ] Push notifications work
- [ ] WhatsApp messages deliver

### Step 1.10: Patient Order Tracking
**Prompt**: `prompts/phase-1/P1.10-patient-tracking.md`
**Spec**: `portals/patient-app.md`
**Creates**: Live tracking, ETA, order history
**Validation**:
- [ ] Live map updates driver position
- [ ] ETA calculates correctly
- [ ] Order history displays

### Step 1.11: Pharmacy Analytics
**Prompt**: `prompts/phase-1/P1.11-pharmacy-analytics.md`
**Spec**: `portals/pharmacy-portal.md`
**Creates**: Sales dashboard, inventory turnover
**Validation**:
- [ ] Charts render with real data
- [ ] Date range filters work
- [ ] Export to CSV works

### Step 1.12: Pilot Launch Config
**Prompt**: `prompts/phase-1/P1.12-pilot-launch.md`
**Creates**: 20 pharmacy configs, Casablanca geo-fence
**Validation**:
- [ ] All 20 pharmacies onboarded
- [ ] Geo-fence restricts service area
- [ ] Monitoring dashboards live

### ⛔ CHECKPOINT GATE 1
**Script**: `node scripts/validate-phase.js 1`
**Criteria**:
- [ ] All 12 steps validated
- [ ] 10 test orders end-to-end
- [ ] Rx verification accuracy > 95%
- [ ] Order completion rate > 90%
- [ ] NPS survey baseline captured

---

## PHASE 2: Claims Gateway (Months 7-9)

### Step 2.1: Insurance Data Model
**Prompt**: `prompts/phase-2/P2.1-insurance-model.md`
**Spec**: `services/claims.md`

### Step 2.2: CNSS API Integration
**Prompt**: `prompts/phase-2/P2.2-cnss-api.md`
**Spec**: `compliance/INSURANCE.md`

### Step 2.3: CNOPS API Integration
**Prompt**: `prompts/phase-2/P2.3-cnops-api.md`

### Step 2.4: Real-time Eligibility
**Prompt**: `prompts/phase-2/P2.4-eligibility.md`

### Step 2.5: Copay Calculation
**Prompt**: `prompts/phase-2/P2.5-copay.md`

### Step 2.6: Claims Submission
**Prompt**: `prompts/phase-2/P2.6-claims-submit.md`

### Step 2.7: Claims Dashboard
**Prompt**: `prompts/phase-2/P2.7-claims-dashboard.md`

### Step 2.8: Settlement Processing
**Prompt**: `prompts/phase-2/P2.8-settlement.md`

### Step 2.9: Insurance Wallet
**Prompt**: `prompts/phase-2/P2.9-wallet.md`

### Step 2.10: Prior Authorization
**Prompt**: `prompts/phase-2/P2.10-prior-auth.md`

### ⛔ CHECKPOINT GATE 2
**Criteria**:
- [ ] CNSS sandbox claims processing
- [ ] CNOPS sandbox claims processing
- [ ] Eligibility check < 500ms
- [ ] Claims adjudication accuracy > 98%

---

## PHASE 3: B2B Marketplace (Months 10-12)

### Step 3.1: Distributor Data Model
**Prompt**: `prompts/phase-3/P3.1-distributor-model.md`

### Step 3.2: Distributor Portal
**Prompt**: `prompts/phase-3/P3.2-distributor-portal.md`

### Step 3.3: Catalog Management
**Prompt**: `prompts/phase-3/P3.3-catalog.md`

### Step 3.4: B2B Ordering
**Prompt**: `prompts/phase-3/P3.4-b2b-ordering.md`

### Step 3.5: Credit Management
**Prompt**: `prompts/phase-3/P3.5-credit.md`

### Step 3.6: Enterprise Invoicing
**Prompt**: `prompts/phase-3/P3.6-invoicing.md`

### Step 3.7: Fleet Management
**Prompt**: `prompts/phase-3/P3.7-fleet.md`

### Step 3.8: Demand Intelligence
**Prompt**: `prompts/phase-3/P3.8-demand.md`

### ⛔ CHECKPOINT GATE 3
**Criteria**:
- [ ] 10 distributors onboarded
- [ ] B2B order flow complete
- [ ] Credit scoring model live
- [ ] TVA invoicing compliant

---

## Post-Phase 3: Scale (Phases 4-5)

See `phases/PHASE_4_5.md` for:
- National expansion to 6,000 pharmacies
- Hospital integration
- Employer benefits platform
- Data intelligence products
- MENA expansion planning

---

## Validation Scripts

```bash
# Validate specific phase
node scripts/validate-phase.js 0

# Run full test suite
npm run test:e2e

# Check RLS policies
npm run test:rls

# Performance audit
npm run lighthouse
```

---

## Recovery Procedures

If checkpoint fails:
1. Review validation errors
2. Rollback to last passing commit
3. Re-run failed step with fixes
4. Do NOT proceed without passing gate
