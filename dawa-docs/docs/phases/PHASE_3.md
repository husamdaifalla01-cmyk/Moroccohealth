# PHASE 3: B2B Marketplace (Months 10-12)

> **Objective**: Distributor Network
> **Key Deliverables**: B2B Ordering, Credit Management, Enterprise Invoicing

## Prerequisites

✅ Phase 2 completed and validated
✅ Claims processing working
✅ 50+ pharmacies active
✅ 500+ orders completed

## Overview

Phase 3 completes the supply chain by connecting pharmacies to distributors (Soremap, COFIPHARMA, PHI, etc.). This creates the B2B marketplace revenue stream and deepens pharmacy lock-in.

## Morocco Distributor Landscape

| Distributor | Coverage | Specialty | Market Share |
|-------------|----------|-----------|--------------|
| Soremap | National | Full range | ~30% |
| COFIPHARMA | National | Generics focus | ~20% |
| PHI | National | Full range | ~20% |
| Cooper | Regional | European imports | ~10% |
| Dislog | Regional | OTC/Parapharmacy | ~10% |
| Others | Varies | Niche | ~10% |

## Data Models

### distributors
```sql
CREATE TABLE distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  code VARCHAR(20) UNIQUE NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_verified BOOLEAN DEFAULT false,
  ice VARCHAR(20), -- Morocco tax ID
  if_number VARCHAR(20), -- Fiscal ID
  
  -- Contact
  address_line1 VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  phone VARCHAR(15),
  email VARCHAR(255),
  
  -- Operations
  coverage_regions TEXT[], -- regions served
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  free_delivery_threshold DECIMAL(10, 2),
  standard_delivery_days INTEGER DEFAULT 1,
  
  -- Financials
  default_payment_terms INTEGER DEFAULT 30, -- net days
  early_payment_discount DECIMAL(5, 2),
  early_payment_days INTEGER,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### distributor_catalog
```sql
CREATE TABLE distributor_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID REFERENCES distributors(id) NOT NULL,
  drug_id UUID REFERENCES drugs(id) NOT NULL,
  sku VARCHAR(50),
  unit_price DECIMAL(10, 2) NOT NULL, -- price to pharmacy
  min_quantity INTEGER DEFAULT 1,
  quantity_increment INTEGER DEFAULT 1,
  available_quantity INTEGER,
  last_available_check TIMESTAMPTZ,
  promotion_price DECIMAL(10, 2),
  promotion_start DATE,
  promotion_end DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(distributor_id, drug_id)
);

-- Index for catalog search
CREATE INDEX idx_distributor_catalog_drug ON distributor_catalog(drug_id, is_active);
CREATE INDEX idx_distributor_catalog_dist ON distributor_catalog(distributor_id, is_active);
```

### b2b_orders
```sql
CREATE TABLE b2b_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(30) UNIQUE NOT NULL,
  pharmacy_id UUID REFERENCES pharmacies(id) NOT NULL,
  distributor_id UUID REFERENCES distributors(id) NOT NULL,
  
  -- Status
  status VARCHAR(30) DEFAULT 'draft',
  -- draft, pending, confirmed, processing, shipped, delivered, cancelled
  
  -- Amounts
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tva_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,
  
  -- Payment
  payment_terms INTEGER, -- net days
  payment_due_date DATE,
  payment_status VARCHAR(20) DEFAULT 'pending',
  -- pending, partial, paid, overdue
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  credit_used DECIMAL(12, 2) DEFAULT 0,
  
  -- Delivery
  delivery_address JSONB,
  estimated_delivery DATE,
  actual_delivery TIMESTAMPTZ,
  delivery_notes TEXT,
  
  -- Audit
  ordered_by UUID REFERENCES users(id),
  confirmed_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### b2b_order_items
```sql
CREATE TABLE b2b_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  b2b_order_id UUID REFERENCES b2b_orders(id) NOT NULL,
  catalog_item_id UUID REFERENCES distributor_catalog(id) NOT NULL,
  drug_id UUID REFERENCES drugs(id) NOT NULL,
  
  quantity_ordered INTEGER NOT NULL,
  quantity_confirmed INTEGER,
  quantity_shipped INTEGER,
  quantity_received INTEGER,
  
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  line_total DECIMAL(12, 2) NOT NULL,
  tva_rate DECIMAL(5, 2) NOT NULL,
  tva_amount DECIMAL(10, 2) NOT NULL,
  
  batch_numbers JSONB DEFAULT '[]', -- from distributor
  expiry_dates JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Credit Management System

### pharmacy_credit
```sql
CREATE TABLE pharmacy_credit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) NOT NULL,
  distributor_id UUID REFERENCES distributors(id) NOT NULL,
  
  -- Limits
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  credit_used DECIMAL(12, 2) DEFAULT 0,
  credit_available DECIMAL(12, 2) GENERATED ALWAYS AS (credit_limit - credit_used) STORED,
  
  -- Terms
  payment_terms INTEGER DEFAULT 30,
  
  -- Risk Assessment
  credit_score INTEGER, -- internal scoring
  risk_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  last_assessment_at TIMESTAMPTZ,
  
  -- History
  total_orders DECIMAL(12, 2) DEFAULT 0,
  total_paid DECIMAL(12, 2) DEFAULT 0,
  late_payments INTEGER DEFAULT 0,
  average_days_to_pay DECIMAL(5, 1),
  
  is_frozen BOOLEAN DEFAULT false,
  frozen_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pharmacy_id, distributor_id)
);
```

### Credit Scoring Algorithm
```typescript
interface CreditScoreFactors {
  // Payment history (40%)
  onTimePaymentRate: number;       // 0-100
  averageDaysLate: number;         // if late
  
  // Business metrics (30%)
  monthlyOrderVolume: number;      // MAD
  accountAge: number;              // months
  orderFrequency: number;          // orders/month
  
  // External factors (30%)
  pharmacyRating: number;          // 1-5
  licenseStatus: 'valid' | 'expiring' | 'expired';
  financialStatements: boolean;    // submitted?
}

function calculateCreditScore(factors: CreditScoreFactors): number {
  let score = 0;
  
  // Payment history (40 points max)
  score += factors.onTimePaymentRate * 0.35;
  score += Math.max(0, 5 - factors.averageDaysLate / 10);
  
  // Business metrics (30 points max)
  score += Math.min(10, factors.monthlyOrderVolume / 10000);
  score += Math.min(10, factors.accountAge / 6);
  score += Math.min(10, factors.orderFrequency * 2);
  
  // External factors (30 points max)
  score += factors.pharmacyRating * 4;
  score += factors.licenseStatus === 'valid' ? 10 : 0;
  score += factors.financialStatements ? 5 : 0;
  
  return Math.round(score);
}

function getCreditLimit(score: number, monthlyVolume: number): number {
  // Base limit on score
  const baseMultiplier = score >= 80 ? 2.5 : score >= 60 ? 1.5 : 1.0;
  
  // Limit based on monthly volume
  return Math.round(monthlyVolume * baseMultiplier);
}
```

## Enterprise Invoicing Engine

### invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(30) UNIQUE NOT NULL,
  invoice_type VARCHAR(30) NOT NULL,
  -- PATIENT_RECEIPT, B2B_ORDER, SAAS_SUBSCRIPTION, COMMISSION, etc.
  
  -- Parties
  issuer_id UUID NOT NULL, -- pharmacy, distributor, or DAWA
  issuer_type VARCHAR(20) NOT NULL,
  recipient_id UUID NOT NULL,
  recipient_type VARCHAR(20) NOT NULL,
  
  -- Reference
  order_id UUID, -- linked order if applicable
  b2b_order_id UUID REFERENCES b2b_orders(id),
  
  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  taxable_amount DECIMAL(12, 2) NOT NULL,
  tva_details JSONB NOT NULL, -- breakdown by rate
  total_tva DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  
  -- Payment
  payment_due_date DATE,
  payment_status VARCHAR(20) DEFAULT 'pending',
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  
  -- Morocco Tax Compliance
  ice VARCHAR(20), -- recipient ICE
  if_number VARCHAR(20), -- recipient IF
  dgi_submission_id VARCHAR(50), -- e-invoice reference
  dgi_submitted_at TIMESTAMPTZ,
  dgi_status VARCHAR(20),
  
  -- Document
  pdf_url TEXT,
  qr_code TEXT, -- DGI verification QR
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DGI e-invoicing index
CREATE INDEX idx_invoices_dgi ON invoices(dgi_submission_id) WHERE dgi_submission_id IS NOT NULL;
```

### TVA Calculation
```typescript
const TVA_RATES = {
  RX_DRUGS: 0,        // 0%
  BASIC: 0.07,        // 7%
  SERVICES: 0.10,     // 10%
  STANDARD_GOODS: 0.14, // 14%
  STANDARD: 0.20,     // 20%
};

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
}

function calculateInvoiceTotals(lines: InvoiceLine[]): InvoiceTotals {
  const tvaBreakdown: Record<string, { base: number; tva: number }> = {};
  let subtotal = 0;
  
  for (const line of lines) {
    const lineTotal = line.quantity * line.unitPrice;
    subtotal += lineTotal;
    
    const rateKey = `${line.tvaRate * 100}%`;
    if (!tvaBreakdown[rateKey]) {
      tvaBreakdown[rateKey] = { base: 0, tva: 0 };
    }
    tvaBreakdown[rateKey].base += lineTotal;
    tvaBreakdown[rateKey].tva += lineTotal * line.tvaRate;
  }
  
  const totalTva = Object.values(tvaBreakdown).reduce((sum, v) => sum + v.tva, 0);
  
  return {
    subtotal,
    tvaBreakdown,
    totalTva,
    total: subtotal + totalTva,
  };
}
```

## Distributor Portal

### Modules

1. **Catalog Management**
   - Bulk upload (CSV/API)
   - Price updates
   - Availability sync
   - Promotions

2. **Order Fulfillment**
   - Incoming orders queue
   - Confirmation workflow
   - Picking/packing
   - Dispatch management

3. **Fleet Management**
   - Vehicle tracking
   - Route optimization
   - Delivery scheduling
   - Temperature monitoring

4. **Credit Management**
   - Pharmacy credit limits
   - Aging reports
   - Collection workflow
   - Write-offs

5. **Invoicing**
   - Invoice generation
   - Payment tracking
   - Reconciliation
   - DGI submission

6. **Analytics**
   - Sales by region
   - Top products
   - Pharmacy performance
   - Demand forecasting

## B2B Ordering Flow (Pharmacy)

```typescript
// Pharmacy places B2B order
async function createB2BOrder(
  pharmacyId: string,
  distributorId: string,
  items: OrderItem[]
): Promise<B2BOrder> {
  // 1. Validate items against catalog
  const validatedItems = await validateCatalogItems(distributorId, items);
  
  // 2. Calculate totals with TVA
  const totals = calculateB2BTotals(validatedItems);
  
  // 3. Check credit availability
  const credit = await getPharmacyCredit(pharmacyId, distributorId);
  if (totals.total > credit.creditAvailable) {
    throw new InsufficientCreditError(credit.creditAvailable, totals.total);
  }
  
  // 4. Create order
  const order = await insertB2BOrder({
    pharmacyId,
    distributorId,
    items: validatedItems,
    ...totals,
    paymentTerms: credit.paymentTerms,
  });
  
  // 5. Reserve credit
  await reserveCredit(pharmacyId, distributorId, totals.total);
  
  // 6. Notify distributor
  await notifyDistributor(distributorId, 'NEW_ORDER', order);
  
  return order;
}
```

## Validation Checklist

Before proceeding to Phase 4-5:

- [ ] 10+ distributors onboarded
- [ ] Distributor portal functional
- [ ] Catalog sync working (API/SFTP)
- [ ] B2B ordering flow complete
- [ ] Credit scoring model live
- [ ] Credit limit assignment working
- [ ] Invoice generation working
- [ ] TVA calculation accurate
- [ ] DGI e-invoicing ready
- [ ] Fleet tracking integrated
- [ ] Aging reports functional
- [ ] 50+ B2B orders completed

## Prompt Sequence

Execute these prompts in order:

1. `prompts/phase-3/P3.1-distributor-model.md`
2. `prompts/phase-3/P3.2-distributor-portal.md`
3. `prompts/phase-3/P3.3-catalog.md`
4. `prompts/phase-3/P3.4-b2b-ordering.md`
5. `prompts/phase-3/P3.5-credit.md`
6. `prompts/phase-3/P3.6-invoicing.md`
7. `prompts/phase-3/P3.7-fleet.md`
8. `prompts/phase-3/P3.8-demand.md`

---

*Completion of Phase 3 unlocks Phases 4-5: Scale & Ecosystem*
