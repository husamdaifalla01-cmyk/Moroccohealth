# DAWA.ma V100 - Master Reference

> **Morocco's Healthcare Financial Rails** | Confidential | January 2026

## What is DAWA?

DAWA is NOT a pharmacy delivery app. DAWA is Morocco's healthcare financial rails - the foundational transaction layer connecting all healthcare stakeholders.

## Core Metrics

| Metric | Value |
|--------|-------|
| Target Market | 37M citizens, 11,000+ pharmacies |
| TAM | $343M across all revenue streams |
| Implementation | 5 phases over 24 months |
| Architecture | 18 microservices, 12 portals |

## Product Suite

| Product | Stakeholder | Revenue Model |
|---------|-------------|---------------|
| DAWA for Patients | Citizens | Delivery fees + Premium subscriptions |
| DAWA for Pharmacies | 11,000+ pharmacies | SaaS + 5% transaction fee |
| DAWA Claims Gateway | Insurers ↔ Pharmacies | 0.5-1% claims processing |
| DAWA for Distributors | 50+ wholesalers | 1.5% B2B marketplace fee |
| DAWA for Business | Employers | Per-employee subscription |
| DAWA Data Intelligence | Pharma companies | Annual data contracts |

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Database | PostgreSQL + Supabase | RLS, Transactions |
| Cache | Redis + BullMQ | Sessions, Jobs |
| Storage | S3 + Supabase Storage | Rx, Invoices |
| Search | Meilisearch | Drug DB, Arabic fuzzy |
| Auth | Supabase Auth | OAuth, MFA, National ID |
| AI | Claude API | Rx verification, Fraud |

## Implementation Phases

| Phase | Duration | Objective | Key Deliverables |
|-------|----------|-----------|------------------|
| 0: Foundation | M1-3 | Infrastructure | DB, Auth, Patient App MVP |
| 1: Pharmacy MVP | M4-6 | First Partners | Pharmacy Portal, Rx, Delivery |
| 2: Claims Gateway | M7-9 | Insurance | CNSS/CNOPS APIs, Claims |
| 3: B2B Marketplace | M10-12 | Distributors | B2B Ordering, Credit |
| 4-5: Scale | M13-24 | National | 6,000 pharmacies, Full ecosystem |

## Critical Regulations

| Regulation | Scope | Key Requirement |
|------------|-------|-----------------|
| CNDP (Law 09-08) | Data Privacy | Consent, 72hr breach notification |
| Loi 17-04 | Pharmacy Law | Pharmacist-only dispensing |
| TVA Rates | Tax | 0% Rx, 7% basic, 20% standard |
| GDP | Distribution | Cold chain, batch tracking |

## Document References

| When Building | Load These Docs |
|---------------|-----------------|
| Phase 0 | `phases/PHASE_0.md` + `services/auth.md` + `services/database.md` |
| Phase 1 | `phases/PHASE_1.md` + `services/prescription.md` + `services/pharmacy.md` |
| Phase 2 | `phases/PHASE_2.md` + `services/claims.md` + `compliance/INSURANCE.md` |
| Phase 3 | `phases/PHASE_3.md` + `services/credit.md` + `services/distributor.md` |

## Build Principles

1. **NEVER skip validation checkpoints** - Each phase has gates
2. **Load only relevant specs** - Prevent context overload
3. **Follow prompt batches** - Pre-tested sequences in `/prompts`
4. **Moroccan-first** - Arabic RTL, Darija support, local payment
5. **Compliance by design** - RLS, audit trails, 7-year retention

## Quick Commands

```bash
# Start Phase 0
cat docs/phases/PHASE_0.md
cat prompts/phase-0/P0.1-infrastructure.md

# Validate checkpoint
node scripts/validate-phase.js 0
```

---
*See BUILD_ORDER.md for detailed implementation sequence*
