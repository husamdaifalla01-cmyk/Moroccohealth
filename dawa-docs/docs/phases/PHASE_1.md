# PHASE 1: Pharmacy MVP (Months 4-6)

> **Objective**: First Pharmacy Partners
> **Key Deliverables**: Pharmacy Portal, Rx Verification, Delivery System

## Prerequisites

✅ Phase 0 completed and validated
✅ 10,000+ drugs in database
✅ Patient app registration working
✅ Prescription upload working

## Overview

Phase 1 transforms DAWA from patient-only to a two-sided marketplace with pharmacies. This phase focuses on Casablanca pilot with 20 pharmacies.

## Pharmacy Portal Architecture

### Desktop-First Design
- Minimum viewport: 1280px
- Sidebar navigation
- Real-time updates via Supabase Realtime
- Keyboard shortcuts for power users

### Core Modules

#### 1. Rx Verification Queue
```typescript
interface RxQueueItem {
  id: string;
  prescription: Prescription;
  patient: PatientSummary;
  drugs: ExtractedDrug[];
  aiVerification: {
    confidence: number;
    warnings: Warning[];
    interactions: DrugInteraction[];
    dosageFlags: DosageFlag[];
  };
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  assignedTo?: string;
  createdAt: Date;
  slaDeadline: Date; // 15 min from creation
}

// Actions
type RxAction = 
  | { type: 'APPROVE'; notes?: string }
  | { type: 'REJECT'; reason: string }
  | { type: 'REQUEST_CLARIFICATION'; message: string }
  | { type: 'MODIFY_DRUGS'; drugs: Drug[] }
  | { type: 'ESCALATE'; to: 'supervisor' | 'compliance' };
```

#### 2. AI Verification Engine (Claude)
```typescript
// System prompt for Rx verification
const RX_VERIFICATION_PROMPT = `
You are a pharmaceutical verification assistant for Morocco.
Analyze this prescription and identify:
1. All medications mentioned
2. Dosage information
3. Duration of treatment
4. Any red flags (interactions, allergies, dosage concerns)

Patient allergies: {{allergies}}
Current medications: {{currentMeds}}

Return structured JSON with:
- drugs: array of identified medications
- confidence: 0-100 score
- warnings: any safety concerns
- interactions: drug-drug interactions
- recommendations: suggestions for pharmacist
`;
```

#### 3. Inventory Management
```typescript
interface InventoryItem {
  id: string;
  drugId: string;
  drug: Drug;
  pharmacyId: string;
  batchNumber: string;
  lotNumber: string;
  expiryDate: Date;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  costPrice: number;
  sellingPrice: number;
  reorderPoint: number;
  location: string; // shelf location
  coldChain: boolean;
  lastCountedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Alerts
interface InventoryAlert {
  type: 'LOW_STOCK' | 'EXPIRING' | 'EXPIRED' | 'RECALL' | 'TEMP_DEVIATION';
  severity: 'low' | 'medium' | 'high' | 'critical';
  item: InventoryItem;
  message: string;
  actionRequired: string;
}
```

## Order State Machine

```typescript
enum OrderStatus {
  CREATED = 'created',
  RX_PENDING = 'rx_pending',
  RX_VERIFIED = 'rx_verified',
  RX_REJECTED = 'rx_rejected',
  INSURANCE_CHECK = 'insurance_check',
  COVERAGE_CONFIRMED = 'coverage_confirmed',
  COVERAGE_DENIED = 'coverage_denied',
  PAYMENT_PENDING = 'payment_pending',
  PAID = 'paid',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  READY_FOR_DISPATCH = 'ready_for_dispatch',
  DRIVER_ASSIGNED = 'driver_assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  DELIVERY_FAILED = 'delivery_failed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Valid transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.RX_PENDING, OrderStatus.CANCELLED],
  [OrderStatus.RX_PENDING]: [OrderStatus.RX_VERIFIED, OrderStatus.RX_REJECTED],
  [OrderStatus.RX_VERIFIED]: [OrderStatus.INSURANCE_CHECK, OrderStatus.PAYMENT_PENDING],
  // ... complete mapping
};

// State transition with validation
async function transitionOrder(
  orderId: string, 
  newStatus: OrderStatus,
  actor: User,
  notes?: string
): Promise<Order> {
  const order = await getOrder(orderId);
  
  if (!VALID_TRANSITIONS[order.status].includes(newStatus)) {
    throw new InvalidTransitionError(order.status, newStatus);
  }
  
  // Record in status_history
  const history = [...order.status_history, {
    from: order.status,
    to: newStatus,
    at: new Date().toISOString(),
    by: actor.id,
    notes,
  }];
  
  return updateOrder(orderId, { status: newStatus, status_history: history });
}
```

## Delivery System

### Fleet Model for Phase 1
- DAWA Fleet: 10 drivers in Casablanca
- 3PL Partner: Stuart/Glovo as backup
- Pharmacy Self-Delivery: Enabled but optional

### Driver Assignment Algorithm
```typescript
interface DriverAssignmentInput {
  order: Order;
  availableDrivers: Driver[];
  pharmacyLocation: LatLng;
  deliveryLocation: LatLng;
}

function assignDriver(input: DriverAssignmentInput): Driver | null {
  const { order, availableDrivers, pharmacyLocation, deliveryLocation } = input;
  
  // Filter eligible drivers
  const eligible = availableDrivers.filter(d => {
    // Must be available
    if (d.status !== 'available') return false;
    
    // Cold chain: driver must have cooler
    if (order.requires_cold_chain && !d.has_cooler) return false;
    
    // Controlled substance: special certification
    if (order.has_controlled && !d.controlled_certified) return false;
    
    return true;
  });
  
  if (eligible.length === 0) return null;
  
  // Score by proximity to pharmacy
  const scored = eligible.map(driver => ({
    driver,
    score: calculateProximityScore(driver.location, pharmacyLocation),
  }));
  
  // Sort and return best match
  return scored.sort((a, b) => b.score - a.score)[0].driver;
}
```

### Driver App Features
- PWA (installable)
- Offline-capable (service worker)
- GPS tracking (background)
- Route optimization (Google Maps)
- Delivery verification:
  - Photo proof
  - Signature capture
  - ID verification (for controlled)
  - OTP confirmation

## Payment Integration

### CMI (Centre Monetique Interbancaire)
```typescript
// CMI Payment Flow
interface CMIPaymentRequest {
  amount: number;
  currency: 'MAD';
  orderId: string;
  customerEmail?: string;
  customerPhone: string;
  returnUrl: string;
  callbackUrl: string;
  language: 'ar' | 'fr';
}

// Response handling
interface CMIPaymentResponse {
  transactionId: string;
  status: 'approved' | 'declined' | 'pending';
  authCode?: string;
  errorCode?: string;
  errorMessage?: string;
}
```

### Cash on Delivery (COD)
```typescript
interface CODOrder {
  orderId: string;
  totalAmount: number;
  collectedAmount?: number;
  change?: number;
  collectedAt?: Date;
  collectedBy?: string; // driver ID
  proofImageUrl?: string;
}

// Driver collects cash, system reconciles
async function recordCODCollection(
  orderId: string,
  amount: number,
  driverId: string
): Promise<void> {
  // Update order
  await updateOrder(orderId, {
    payment_status: 'collected',
    cod_collected_amount: amount,
    cod_collected_at: new Date(),
    cod_collected_by: driverId,
  });
  
  // Add to driver's daily collection
  await addToDriverCollection(driverId, amount);
}
```

## Notification Templates

### SMS Templates (Darija/French)
```javascript
const SMS_TEMPLATES = {
  ORDER_CONFIRMED: {
    ar: 'DAWA: طلبك {orderNumber} تأكد. غادي يوصلك في {eta}.',
    fr: 'DAWA: Votre commande {orderNumber} est confirmée. Livraison estimée: {eta}.',
  },
  DRIVER_ASSIGNED: {
    ar: 'DAWA: {driverName} غادي يجيبلك الطلبية. تقدر تتبعو هنا: {trackingUrl}',
    fr: 'DAWA: {driverName} livrera votre commande. Suivez ici: {trackingUrl}',
  },
  DELIVERED: {
    ar: 'DAWA: طلبيتك وصلات! شكرا على ثقتك. عطينا رأيك: {reviewUrl}',
    fr: 'DAWA: Votre commande a été livrée! Merci. Donnez votre avis: {reviewUrl}',
  },
};
```

## Analytics Dashboard

### Key Metrics for Pharmacy
```typescript
interface PharmacyMetrics {
  // Orders
  totalOrders: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  
  // Revenue
  totalRevenue: number;
  revenueToday: number;
  averageOrderValue: number;
  
  // Performance
  rxVerificationTime: number; // avg minutes
  orderCompletionRate: number;
  customerRating: number;
  
  // Inventory
  lowStockItems: number;
  expiringItems: number;
  inventoryValue: number;
}
```

## Database Additions for Phase 1

### pharmacy_staff
```sql
CREATE TABLE pharmacy_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  role VARCHAR(50) NOT NULL, -- owner, pharmacist, technician, cashier
  license_number VARCHAR(50),
  license_verified BOOLEAN DEFAULT false,
  can_verify_rx BOOLEAN DEFAULT false,
  can_dispense_controlled BOOLEAN DEFAULT false,
  shift_schedule JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pharmacy_id, user_id)
);
```

### order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  drug_id UUID REFERENCES drugs(id) NOT NULL,
  inventory_item_id UUID REFERENCES inventory(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  insurance_covered DECIMAL(10, 2) DEFAULT 0,
  patient_pays DECIMAL(10, 2) NOT NULL,
  substituted_for UUID REFERENCES drugs(id),
  substitution_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### drivers
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  vehicle_type VARCHAR(20), -- motorcycle, car, bicycle
  vehicle_plate VARCHAR(20),
  license_number VARCHAR(50),
  license_verified BOOLEAN DEFAULT false,
  has_cooler BOOLEAN DEFAULT false,
  controlled_certified BOOLEAN DEFAULT false,
  current_location GEOGRAPHY(POINT, 4326),
  status VARCHAR(20) DEFAULT 'offline', -- offline, available, busy, break
  current_order_id UUID REFERENCES orders(id),
  rating DECIMAL(3, 2),
  total_deliveries INTEGER DEFAULT 0,
  earnings_today DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Real-time location updates
CREATE INDEX idx_drivers_location ON drivers USING gist(current_location);
CREATE INDEX idx_drivers_status ON drivers(status) WHERE status = 'available';
```

## Validation Checklist

Before proceeding to Phase 2:

- [ ] 20 pharmacies onboarded in Casablanca
- [ ] Pharmacy portal fully functional
- [ ] Rx verification queue working
- [ ] AI verification integrated (Claude)
- [ ] Drug interaction checking active
- [ ] Inventory management operational
- [ ] Order state machine complete
- [ ] Driver app deployed
- [ ] 10 drivers active
- [ ] Payment integration working (CMI + COD)
- [ ] Notifications sending (SMS + push)
- [ ] Patient tracking working
- [ ] Analytics dashboard live
- [ ] 10 test orders completed end-to-end
- [ ] Order completion rate > 90%
- [ ] Rx verification accuracy > 95%
- [ ] Customer NPS baseline captured

## Prompt Sequence

Execute these prompts in order:

1. `prompts/phase-1/P1.1-pharmacy-onboarding.md`
2. `prompts/phase-1/P1.2-pharmacy-portal.md`
3. `prompts/phase-1/P1.3-rx-verification.md`
4. `prompts/phase-1/P1.4-inventory.md`
5. `prompts/phase-1/P1.5-order-states.md`
6. `prompts/phase-1/P1.6-delivery-base.md`
7. `prompts/phase-1/P1.7-driver-app.md`
8. `prompts/phase-1/P1.8-payment.md`
9. `prompts/phase-1/P1.9-notifications.md`
10. `prompts/phase-1/P1.10-patient-tracking.md`
11. `prompts/phase-1/P1.11-pharmacy-analytics.md`
12. `prompts/phase-1/P1.12-pilot-launch.md`

---

*Completion of Phase 1 unlocks Phase 2: Claims Gateway*
