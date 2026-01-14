# Prescription Service Specification

> **Domain**: Rx Lifecycle Management
> **Service ID**: prescription-service
> **Phase**: Introduced in Phase 0, expanded in Phase 1

## Overview

The Prescription Service handles the complete lifecycle of prescriptions from upload to verification to fulfillment.

## Responsibilities

1. Prescription upload and storage
2. AI-powered OCR extraction
3. Drug identification and normalization
4. Pharmacist verification workflow
5. Validity tracking and expiry
6. Refill and renewal management
7. Controlled substance special handling

## API Endpoints

### Upload Prescription

```typescript
POST /api/prescriptions/upload

// Request (multipart/form-data)
{
  image: File,              // Prescription image
  patientId: string,        // Optional if authenticated
}

// Response
{
  id: string,
  status: 'processing',
  imageUrl: string,
  extractedDrugs: [],       // Empty initially, populated by AI
  confidence: null,
}
```

### Get Prescription

```typescript
GET /api/prescriptions/:id

// Response
{
  id: string,
  patientId: string,
  prescriberName: string,
  prescriberLicense: string,
  prescriptionDate: string,
  expiryDate: string,
  imageUrl: string,
  extractedDrugs: ExtractedDrug[],
  verificationStatus: 'pending' | 'verified' | 'rejected',
  verifiedBy: string | null,
  verifiedAt: string | null,
  isRenewable: boolean,
  renewalCount: number,
  maxRenewals: number,
  isControlled: boolean,
}
```

### Verify Prescription (Pharmacist)

```typescript
POST /api/prescriptions/:id/verify

// Request
{
  action: 'approve' | 'reject' | 'request_clarification',
  drugs: Drug[],            // Confirmed/modified drug list
  notes: string,
  rejectionReason?: string,
}

// Response
{
  id: string,
  verificationStatus: 'verified' | 'rejected',
  verifiedBy: string,
  verifiedAt: string,
}
```

## AI Extraction Pipeline

### Claude Integration

```typescript
const PRESCRIPTION_EXTRACTION_PROMPT = `
You are analyzing a Moroccan prescription image.

Extract the following information:
1. Prescriber name and license number (if visible)
2. Patient name (if visible)
3. Prescription date
4. All medications with:
   - Drug name (commercial or DCI)
   - Dosage (e.g., 500mg)
   - Quantity
   - Instructions (e.g., 1 tablet 3x daily)
   - Duration (e.g., 7 days)

Return JSON format:
{
  "prescriberName": string | null,
  "prescriberLicense": string | null,
  "patientName": string | null,
  "prescriptionDate": string | null,
  "drugs": [
    {
      "name": string,
      "dosage": string | null,
      "quantity": number | null,
      "instructions": string | null,
      "duration": string | null
    }
  ],
  "confidence": number,  // 0-100
  "warnings": string[]   // Any concerns
}

Handle handwritten prescriptions in French or Arabic.
Note any illegible sections.
`;
```

### Drug Normalization

```typescript
interface DrugNormalization {
  // Input: Extracted drug name (possibly misspelled)
  inputName: string;
  
  // Output: Matched drug from database
  matchedDrug: Drug | null;
  confidence: number;
  alternatives: Drug[];  // Generics, similar drugs
}

async function normalizeDrug(name: string): Promise<DrugNormalization> {
  // 1. Exact match
  const exact = await findDrugByName(name);
  if (exact) return { matchedDrug: exact, confidence: 100, alternatives: [] };
  
  // 2. Fuzzy match (Meilisearch)
  const fuzzy = await searchDrugs(name, { limit: 5 });
  if (fuzzy.length > 0 && fuzzy[0].score > 0.8) {
    return {
      matchedDrug: fuzzy[0],
      confidence: fuzzy[0].score * 100,
      alternatives: fuzzy.slice(1),
    };
  }
  
  // 3. DCI match
  const dci = await findDrugByDCI(name);
  if (dci) {
    return {
      matchedDrug: dci,
      confidence: 85,
      alternatives: await findGenericAlternatives(dci.id),
    };
  }
  
  // 4. No match - requires manual entry
  return { matchedDrug: null, confidence: 0, alternatives: [] };
}
```

## Drug Interaction Checking

```typescript
interface InteractionCheck {
  drugs: string[];  // Drug IDs
  patientAllergies: string[];
  currentMedications: string[];
}

interface InteractionResult {
  hasInteractions: boolean;
  interactions: Interaction[];
  allergyWarnings: AllergyWarning[];
  dosageWarnings: DosageWarning[];
}

interface Interaction {
  drug1: Drug;
  drug2: Drug;
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
}
```

## Prescription Validity

```typescript
// Morocco prescription validity rules
const VALIDITY_RULES = {
  STANDARD: {
    validDays: 90,          // 3 months
    renewals: 0,
  },
  RENEWABLE: {
    validDays: 365,         // 12 months
    renewals: 11,           // Monthly refills
    renewalIntervalDays: 30,
  },
  CONTROLLED: {
    validDays: 7,           // 7 days max
    renewals: 0,
    requiresOriginal: true,
    requiresPatientId: true,
  },
};

function isValidPrescription(rx: Prescription): boolean {
  const today = new Date();
  const expiry = new Date(rx.expiryDate);
  
  if (today > expiry) return false;
  
  if (rx.isControlled) {
    // Controlled substances require original physical prescription
    return rx.verificationStatus === 'verified';
  }
  
  return true;
}
```

## Controlled Substance Workflow

```typescript
// Special handling for narcotics/psychotropics
interface ControlledSubstanceOrder {
  prescriptionId: string;
  
  // Required verifications
  originalPrescriptionReceived: boolean;
  patientIdVerified: boolean;
  patientIdType: 'CIN' | 'Passport' | 'ResidenceCard';
  patientIdNumber: string;
  patientIdPhotoUrl: string;
  
  // Quantity limits
  quantityPrescribed: number;
  quantityDispensed: number;
  quantityRemaining: number;
  
  // Audit trail
  dispensedBy: string;  // Pharmacist ID
  dispensedAt: Date;
  witnessedBy?: string; // Second pharmacist for some substances
  
  // Regulatory reporting
  reportedToMinistry: boolean;
  reportReference: string;
}
```

## Database Functions

```sql
-- Check prescription validity
CREATE OR REPLACE FUNCTION is_prescription_valid(rx_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  rx prescriptions;
BEGIN
  SELECT * INTO rx FROM prescriptions WHERE id = rx_id;
  
  IF rx IS NULL THEN RETURN FALSE; END IF;
  IF rx.is_deleted THEN RETURN FALSE; END IF;
  IF rx.verification_status != 'verified' THEN RETURN FALSE; END IF;
  IF rx.expiry_date < CURRENT_DATE THEN RETURN FALSE; END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Get prescription with full drug details
CREATE OR REPLACE FUNCTION get_prescription_details(rx_id UUID)
RETURNS TABLE (
  prescription_id UUID,
  patient_name TEXT,
  prescriber_name TEXT,
  drugs JSONB,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    u.first_name || ' ' || u.last_name,
    p.prescriber_name,
    p.ocr_extracted_drugs,
    is_prescription_valid(p.id)
  FROM prescriptions p
  JOIN users u ON p.patient_id = u.id
  WHERE p.id = rx_id;
END;
$$ LANGUAGE plpgsql;
```

## Events Emitted

| Event | Trigger | Payload |
|-------|---------|---------|
| `prescription.uploaded` | New upload | `{ id, patientId }` |
| `prescription.extracted` | AI extraction complete | `{ id, drugs, confidence }` |
| `prescription.verified` | Pharmacist approves | `{ id, pharmacistId }` |
| `prescription.rejected` | Pharmacist rejects | `{ id, reason }` |
| `prescription.expired` | Past expiry date | `{ id }` |

## RLS Policies

```sql
-- Patients see own prescriptions
CREATE POLICY "Patients view own prescriptions"
ON prescriptions FOR SELECT
USING (auth.uid() = patient_id);

-- Pharmacists view assigned prescriptions (via orders)
CREATE POLICY "Pharmacists view assigned prescriptions"
ON prescriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN pharmacy_staff ps ON o.pharmacy_id = ps.pharmacy_id
    WHERE o.prescription_id = prescriptions.id
    AND ps.user_id = auth.uid()
    AND ps.can_verify_rx = true
  )
);

-- Pharmacists update verification
CREATE POLICY "Pharmacists verify prescriptions"
ON prescriptions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN pharmacy_staff ps ON o.pharmacy_id = ps.pharmacy_id
    WHERE o.prescription_id = prescriptions.id
    AND ps.user_id = auth.uid()
    AND ps.can_verify_rx = true
  )
)
WITH CHECK (
  verification_status IN ('verified', 'rejected')
);
```

## Error Codes

| Code | Message | Action |
|------|---------|--------|
| `RX_001` | Prescription expired | Show renewal option |
| `RX_002` | Invalid prescription format | Request re-upload |
| `RX_003` | Drug interaction detected | Show warning, require pharmacist override |
| `RX_004` | Controlled substance limit exceeded | Block, notify compliance |
| `RX_005` | Prescriber license invalid | Block, request alternative |
