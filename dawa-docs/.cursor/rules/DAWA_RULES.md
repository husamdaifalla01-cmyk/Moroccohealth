# DAWA V100 - Cursor AI Rules

> These rules constrain Claude Code behavior for the DAWA build.

## Project Context

You are building DAWA.ma - Morocco's healthcare financial rails. This is a regulated healthcare platform requiring extreme attention to:
- Data privacy (CNDP Law 09-08)
- Pharmaceutical compliance (Loi 17-04)
- Financial accuracy (TVA, DGI invoicing)
- Patient safety (drug interactions, dosage validation)

## Mandatory Behaviors

### 1. Always Reference Specs
Before implementing any feature:
```
1. Check docs/DAWA_MASTER.md for context
2. Load the relevant phase doc from docs/phases/
3. Load relevant service specs from docs/services/
4. Follow the prompt from prompts/phase-X/
```

### 2. Never Skip Validation
After every implementation step:
- [ ] Verify RLS policies are in place
- [ ] Confirm audit logging active
- [ ] Check for console errors
- [ ] Test the happy path

### 3. Database Rules (CRITICAL)
```sql
-- ALWAYS use UUID for primary keys
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- NEVER delete healthcare data
-- Use soft deletes with is_deleted flag

-- ALWAYS add audit columns
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
created_by UUID REFERENCES users(id)
updated_by UUID REFERENCES users(id)

-- ALWAYS enable RLS
ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;

-- ALWAYS add the basic RLS policy
CREATE POLICY "Users can view own data"
ON tablename FOR SELECT
USING (auth.uid() = user_id);
```

### 4. Morocco-Specific Requirements
```typescript
// ALWAYS support Arabic RTL
dir="rtl" // for Arabic content

// ALWAYS use Morocco timezone
const TZ = 'Africa/Casablanca';

// ALWAYS support Darija in notifications
// French as fallback, Arabic formal for official docs

// ALWAYS validate Moroccan phone format
const MA_PHONE = /^(\+212|0)[5-7]\d{8}$/;

// ALWAYS use MAD currency
const CURRENCY = 'MAD';
```

### 5. TVA Compliance
```typescript
// Tax rates for Morocco
const TVA_RATES = {
  PRESCRIPTION: 0.00,      // 0% for Rx drugs
  BASIC_NECESSITY: 0.07,   // 7% baby formula, etc
  HEALTHCARE_SERVICE: 0.10, // 10% services
  STANDARD_GOODS: 0.14,    // 14% cosmetics
  STANDARD: 0.20           // 20% parapharmacy, SaaS
};
```

### 6. Order State Machine
Valid transitions only:
```
CREATED → RX_PENDING
RX_PENDING → RX_VERIFIED | RX_REJECTED
RX_VERIFIED → INSURANCE_CHECK | PAYMENT_PENDING
INSURANCE_CHECK → COVERAGE_CONFIRMED | COVERAGE_DENIED
COVERAGE_CONFIRMED → PAYMENT_PENDING
PAYMENT_PENDING → PAID | CANCELLED
PAID → PREPARING
PREPARING → READY_FOR_DISPATCH
READY_FOR_DISPATCH → DRIVER_ASSIGNED
DRIVER_ASSIGNED → PICKED_UP
PICKED_UP → IN_TRANSIT
IN_TRANSIT → DELIVERED | DELIVERY_FAILED
DELIVERED → COMPLETED
```

### 7. Security Non-Negotiables
```typescript
// NEVER expose internal IDs in URLs
// Use UUIDs or slugs

// NEVER log sensitive data
// No: passwords, prescriptions, health records, payment details

// ALWAYS validate input
import { z } from 'zod';

// ALWAYS sanitize output
// XSS prevention on all user-generated content

// ALWAYS use parameterized queries
// Never string concatenation for SQL
```

### 8. Healthcare Safety Checks
```typescript
// Before dispensing, ALWAYS check:
// 1. Drug-drug interactions
// 2. Drug-allergy interactions  
// 3. Dosage validation against patient age/weight
// 4. Prescription validity (not expired)
// 5. Controlled substance limits

// Log ALL clinical decisions with pharmacist ID
```

### 9. File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (patient)/         # Patient app
│   ├── (pharmacy)/        # Pharmacy portal
│   ├── (admin)/           # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui
│   └── [domain]/          # Domain components
├── lib/
│   ├── supabase/          # Supabase client
│   ├── validation/        # Zod schemas
│   └── utils/             # Utilities
├── services/              # Business logic
└── types/                 # TypeScript types
```

### 10. Prompt Discipline
When following prompts from `/prompts`:
1. Read the ENTIRE prompt first
2. Implement in the exact order specified
3. Complete ALL validation items before moving on
4. Report blockers immediately

## Forbidden Actions

❌ **NEVER** skip RLS policy creation
❌ **NEVER** use sequential/predictable IDs
❌ **NEVER** store passwords in plaintext
❌ **NEVER** log prescription content
❌ **NEVER** allow order state backwards
❌ **NEVER** skip drug interaction checks
❌ **NEVER** hardcode API keys
❌ **NEVER** disable TypeScript strict mode
❌ **NEVER** skip Arabic RTL support
❌ **NEVER** proceed past checkpoint without validation

## Error Handling

```typescript
// Standard error response format
interface DAWAError {
  code: string;           // Machine-readable
  message: string;        // Human-readable (localized)
  details?: object;       // Additional context
  timestamp: string;      // ISO 8601
  requestId: string;      // For tracing
}

// Healthcare-specific errors
const ERROR_CODES = {
  RX_EXPIRED: 'E_RX_001',
  RX_INVALID: 'E_RX_002',
  DRUG_INTERACTION: 'E_RX_003',
  INSURANCE_INELIGIBLE: 'E_INS_001',
  CONTROLLED_LIMIT: 'E_CTRL_001',
};
```

## Testing Requirements

Every feature must have:
1. Unit tests for business logic
2. Integration tests for API routes
3. RLS policy tests
4. Arabic RTL visual tests (for UI)

## Commit Message Format

```
[PHASE-X.Y] Brief description

- What was implemented
- What validations passed
- Any blockers or notes

Refs: prompts/phase-X/P0.Y-name.md
```

---

*These rules are enforced by Cursor. Violations will cause build failures.*
