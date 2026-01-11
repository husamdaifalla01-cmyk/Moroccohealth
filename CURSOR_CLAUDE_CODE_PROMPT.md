# 🚀 DAWA.ma — Claude Code Execution Prompt
## Copy this entire prompt into Claude Code (Cursor IDE)

---

```
You are building DAWA.ma, Morocco's first integrated pharmacy delivery platform. This is a production healthcare application requiring CNDP (Moroccan data privacy law) compliance and pharmaceutical regulation adherence.

## STEP 0: READ THE BUSINESS LOGIC DOCUMENT

Before writing ANY code, read and fully internalize this document:
@morocco-pharma-delivery-business-logic.md

This document contains:
- Complete Supabase database schema (copy exactly)
- API endpoint specifications
- Legal compliance requirements (CNDP, pharmaceutical law, labor code)
- Competitor analysis (Chefaa, Yodawy, Mydawa, Okadoc, Cura, Uber Health)
- Three-app architecture (Patient, Pharmacy, Courier)
- 12-step order workflow

DO NOT proceed until you confirm you've read the document.

---

## PROJECT STRUCTURE

Create this monorepo structure:

```
dawa-ma/
├── apps/
│   ├── patient/                 # Expo (React Native) - iOS/Android
│   ├── pharmacy/                # Next.js 14 - Web Dashboard
│   ├── courier/                 # Expo (React Native) - iOS/Android
│   └── admin/                   # Next.js 14 - Internal Admin
├── packages/
│   ├── shared/                  # Shared types, utils, constants
│   ├── ui/                      # Shared UI components
│   └── supabase/                # Supabase client + types
├── supabase/
│   ├── migrations/              # SQL migrations
│   ├── functions/               # Edge Functions (Deno)
│   └── seed.sql                 # Development seed data
├── turbo.json
├── package.json
└── .env.example
```

---

## TECH STACK (USE EXACTLY THESE)

### Mobile (Patient + Courier Apps)
- Expo SDK 51+ with Expo Router v3
- NativeWind v4 (Tailwind for RN)
- Zustand for state
- TanStack Query v5 for server state
- React Hook Form + Zod
- Expo Camera, Location, Notifications

### Web (Pharmacy + Admin)
- Next.js 14 App Router
- shadcn/ui components
- Tailwind CSS
- Zustand + TanStack Query
- React Hook Form + Zod
- Recharts for analytics

### Backend
- Supabase (PostgreSQL 15 + Auth + Storage + Realtime + Edge Functions)
- PostGIS for geolocation
- pgcrypto for PII encryption

### External Services
- Google Maps Platform (geocoding, routing)
- Twilio (SMS OTP)
- CMI Morocco (payments)
- Firebase Cloud Messaging (push)

---

## CODING STANDARDS (ENFORCE STRICTLY)

### TypeScript
- strict: true, no `any` types ever
- All external data validated with Zod
- Generate types from Supabase: `npx supabase gen types typescript`

### Naming
- Files: kebab-case (user-profile.tsx)
- Components: PascalCase (UserProfile)
- Hooks: camelCase with use- prefix (useAuth)
- DB tables: snake_case (order_items)
- API routes: kebab-case (/api/orders/:id/accept)

### Security (NON-NEGOTIABLE)
- All PII encrypted with pgcrypto before storage
- Row Level Security (RLS) on ALL tables
- Audit logging for sensitive data access
- Consent collection before data processing
- Never log tokens, passwords, or PII

---

## BUILD SEQUENCE (FOLLOW THIS ORDER)

### PHASE 1: Foundation
1. Initialize Turborepo monorepo
2. Create Supabase project and link
3. Deploy database schema from business logic doc (copy the SQL exactly)
4. Generate TypeScript types from schema
5. Setup shared packages (types, utils, supabase client)
6. Implement phone OTP authentication (Supabase Auth + Twilio)

CHECKPOINT: User can send OTP, verify, and receive JWT

### PHASE 2: Patient App Core
1. Onboarding flow (phone → OTP → profile → address → permissions)
2. Home screen (location, nearby pharmacies, quick actions)
3. Prescription upload (camera capture, gallery, crop, submit)
4. Medication search with pharmacy availability
5. Order creation wizard (cart → pharmacy → address → schedule → payment → confirm)
6. Real-time order tracking with live courier location
7. Profile management with addresses and insurance
8. French/Arabic language support (i18n)

CHECKPOINT: Patient can upload prescription, create order, track delivery

### PHASE 3: Pharmacy Portal
1. Authentication (email/password for pharmacies)
2. Dashboard with real-time metrics and order feed
3. Order management (Kanban: New → Reviewing → Preparing → Ready)
4. Prescription verification interface (image viewer, approve/reject)
5. Inventory management (add, update stock, low alerts)
6. Patient chat support
7. Financial reports and payout tracking
8. Settings (hours, delivery radius, staff accounts)

CHECKPOINT: Pharmacy can receive orders, verify prescriptions, manage fulfillment

### PHASE 4: Courier App
1. Onboarding (phone → profile → documents → training → bank)
2. Admin verification queue (courier approved before activation)
3. Online/offline toggle with location tracking
4. Available orders map with accept/decline
5. Active delivery flow:
   - Navigate to pharmacy
   - Confirm pickup (with photo)
   - Navigate to patient
   - Confirm delivery (OTP + photo proof)
6. Earnings dashboard and withdrawal
7. Training module completion tracking

CHECKPOINT: Courier can go online, accept orders, complete deliveries

### PHASE 5: Integration
1. CMI payment gateway (card payments + 3D Secure)
2. Push notifications (FCM for all status changes)
3. Chat system (patient ↔ pharmacist via Supabase Realtime)
4. Chronic care program (condition → medications → auto-refill schedule)
5. Medication reminders (push notifications at scheduled times)

CHECKPOINT: Payments work, notifications sent, chat functional

### PHASE 6: Admin Dashboard
1. User management (patients, pharmacies, couriers)
2. Verification queues (pharmacy licenses, courier documents)
3. Order monitoring with intervention capabilities
4. Analytics dashboard (orders, revenue, geography)
5. CNDP compliance tools (audit logs, data requests, consent management)
6. System configuration (fees, commissions, service areas)

CHECKPOINT: Admins can manage entire platform

### PHASE 7: Production Readiness
1. Unit tests (Vitest) - 80%+ coverage on critical paths
2. E2E tests (Playwright for web, Maestro for mobile)
3. Security audit (RLS verification, input validation, rate limiting)
4. Performance optimization (queries, bundle size, caching)
5. Error monitoring (Sentry integration)
6. Documentation (API docs, deployment runbook)

CHECKPOINT: All tests pass, security audit complete

---

## DATABASE SCHEMA

Copy the COMPLETE SQL schema from the business logic document including:
- All 20+ tables (patients, pharmacies, orders, prescriptions, etc.)
- PostGIS extension for geolocation
- pgcrypto extension for encryption
- Row Level Security policies
- Audit logging triggers
- All indexes for performance
- Order number generator function

DO NOT modify the schema structure - it's designed for compliance.

---

## API ENDPOINTS (IMPLEMENT ALL)

### Patient App
POST /auth/phone/send-otp
POST /auth/phone/verify
GET /me
PATCH /me
GET /me/addresses
POST /me/addresses
POST /prescriptions
GET /prescriptions
POST /orders
GET /orders
GET /orders/:id/tracking
POST /orders/:id/cancel
POST /orders/:id/rate
GET /medications/search
GET /pharmacies/nearby
GET /chronic-care
POST /chronic-care
GET /reminders
POST /chat/sessions

### Pharmacy Portal
POST /pharmacy/auth/login
GET /pharmacy/dashboard/stats
GET /pharmacy/orders
POST /pharmacy/orders/:id/accept
POST /pharmacy/orders/:id/reject
POST /pharmacy/orders/:id/preparing
POST /pharmacy/orders/:id/ready
GET /pharmacy/inventory
POST /pharmacy/prescriptions/:id/verify
GET /pharmacy/financials/summary

### Courier App
POST /courier/auth/phone/send-otp
POST /courier/auth/phone/verify
PATCH /courier/status
POST /courier/location
GET /courier/orders/available
POST /courier/orders/:id/accept
POST /courier/orders/:id/picked-up
POST /courier/orders/:id/delivered
GET /courier/earnings

### Admin
GET /admin/patients
GET /admin/pharmacies
GET /admin/couriers
PATCH /admin/pharmacies/:id/status
PATCH /admin/couriers/:id/status
GET /admin/verifications/pending
POST /admin/verifications/:id/approve
GET /admin/audit-logs
GET /admin/reports/orders

---

## COMPLIANCE REQUIREMENTS (CRITICAL)

### CNDP (Law 09-08) - Morocco Data Protection
1. Collect EXPLICIT consent at registration with checkbox
2. Store consent records with timestamp, IP, user agent
3. Encrypt ALL PII: names, addresses, national IDs, prescription images
4. Implement data subject rights: access, correction, deletion, export
5. Audit log ALL access to sensitive data
6. 7-year minimum retention for audit logs
7. Data breach notification workflow

### Pharmaceutical (Law 17-04)
1. Only licensed pharmacies can fulfill orders (verify license on onboarding)
2. Licensed pharmacist MUST verify EVERY prescription before processing
3. BLOCK all controlled substances (narcotics, psychotropics) - hard-coded
4. Track prescription validity and refills remaining

### Labor Code (Law 65-99)
1. Courier employment type tracking (employee vs contractor)
2. CNSS registration for employees
3. Training completion documentation
4. Working hours compliance tracking

---

## REAL-TIME FEATURES (SUPABASE REALTIME)

### Patient App
- Order status changes
- Courier location updates (when in transit)
- Chat messages

### Pharmacy Portal
- New order notifications
- Order cancellations
- Chat messages

### Courier App
- Available orders near location
- Order assignment/cancellation

Implementation pattern:
```typescript
const channel = supabase
  .channel('order-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `id=eq.${orderId}`
  }, (payload) => {
    // Handle update
  })
  .subscribe();
```

---

## ERROR HANDLING PATTERN

```typescript
// Service layer
async function createOrder(data: OrderInput): Promise<Result<Order, AppError>> {
  try {
    const validated = OrderSchema.parse(data);
    const { data: order, error } = await supabase
      .from('orders')
      .insert(validated)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: { code: 'DB_ERROR', message: error.message } };
    }
    return { success: true, data: order };
  } catch (e) {
    if (e instanceof ZodError) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: e.message } };
    }
    throw e;
  }
}

// Always use Result type, never throw from service layer
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

---

## ENVIRONMENT VARIABLES

Create .env.example with:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Encryption
ENCRYPTION_KEY=  # 32-byte hex string

# Google Maps
GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# CMI Payment
CMI_MERCHANT_ID=
CMI_API_KEY=
CMI_SECRET_KEY=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=

# Sentry
SENTRY_DSN=

# App URLs
NEXT_PUBLIC_APP_URL=
```

---

## VALIDATION BEFORE EACH COMMIT

Before committing, verify:
1. `pnpm typecheck` passes (no TS errors)
2. `pnpm lint` passes (no ESLint errors)
3. `pnpm test` passes (tests green)
4. No secrets in code
5. No console.logs in production code
6. No disabled RLS policies
7. All new endpoints have Zod validation

---

## WHEN STUCK

1. Re-read the business logic document section for that feature
2. Check competitor implementation notes (Chefaa, Yodawy patterns)
3. For legal/compliance uncertainty, implement the STRICTER interpretation
4. For UX ambiguity, follow Chefaa's mobile app patterns
5. For payment edge cases, default to NOT charging (safe failure)

---

## SUCCESS CRITERIA

The platform works when:
- [ ] Patient orders medication in <5 minutes
- [ ] Pharmacy receives order in <10 seconds
- [ ] Courier accepts in <2 minutes average
- [ ] Delivery completes in <2 hours
- [ ] Zero CNDP violations
- [ ] All PII encrypted at rest
- [ ] Full audit trail for prescription access
- [ ] RLS prevents cross-user data access

---

## START NOW

Begin with Phase 1: Foundation

1. Run: `npx create-turbo@latest dawa-ma`
2. Navigate: `cd dawa-ma`
3. Initialize Supabase: `npx supabase init`
4. Create first migration with the schema from the business logic document
5. Generate types
6. Setup shared packages

Confirm completion of each step before proceeding.

When Phase 1 is complete, report:
- Monorepo structure created ✓
- Supabase schema deployed ✓
- Types generated ✓
- Auth flow working ✓

Then proceed to Phase 2.

BUILD THIS. MAKE A DENT IN MOROCCO. 🇲🇦
```

---

## 📋 HOW TO USE THIS PROMPT

### Step 1: Setup Your Project Folder
```bash
mkdir dawa-ma-project
cd dawa-ma-project
```

### Step 2: Copy the Business Logic Document
Save `morocco-pharma-delivery-business-logic.md` to your project folder.

### Step 3: Open Cursor IDE
```bash
cursor .
```

### Step 4: Start Claude Code Session
- Open Claude Code panel (Cmd/Ctrl + L)
- Paste the entire prompt above
- Claude will begin building

### Step 5: Monitor Progress
- Claude will create files and folders
- Approve file creations when prompted
- Answer any clarifying questions
- Provide API keys when needed

### Step 6: Checkpoints
After each phase, verify:
- Code compiles without errors
- Features work as expected
- Tests pass
- No security issues flagged

---

## 🔑 PRO TIPS FOR CLAUDE CODE

### Tip 1: Keep Context Fresh
If Claude loses track, remind it:
```
Read @morocco-pharma-delivery-business-logic.md again and continue with [current task]
```

### Tip 2: Be Specific About Files
```
Create the patient app home screen at apps/patient/app/(tabs)/index.tsx
```

### Tip 3: Request Validation
```
Show me the RLS policies you created and explain how they prevent unauthorized access
```

### Tip 4: Batch Related Changes
```
Implement the entire order creation flow (cart, pharmacy selection, address, payment, confirmation) before moving on
```

### Tip 5: Request Tests
```
Write tests for the prescription upload flow including edge cases
```

---

## 🚨 CRITICAL REMINDERS

1. **Database Schema**: Copy EXACTLY from business logic doc - it's compliance-designed
2. **Encryption**: ALL PII must be encrypted - no exceptions
3. **RLS**: Never disable, always test policies
4. **Controlled Substances**: Hard-block in code, not just UI
5. **Audit Logs**: Every sensitive access logged
6. **Consent**: Cannot proceed without explicit consent checkbox

---

## 📁 FILES TO KEEP HANDY

1. `morocco-pharma-delivery-business-logic.md` - Master reference
2. `dawa-ma-system-architecture.svg` - Visual reference
3. This prompt file - For restarting sessions

---

**Ready to build Morocco's healthcare future.** 🏥💊🚀
