# DAWA.ma V100 - Claude Code Development Kit

> **Morocco's Healthcare Financial Rails**
> 
> Complete technical development plan for building DAWA end-to-end using Claude Code in Cursor IDE.

## Quick Start

```bash
# 1. Clone this repo
git clone https://github.com/flownexis3/dawa-morocco.git
cd dawa-morocco

# 2. Start Phase 0
cat docs/phases/PHASE_0.md
cat prompts/phase-0/P0.1-project-init.md

# 3. Follow the prompt in Cursor
# Paste P0.1 prompt into Claude Code
# Validate before proceeding to P0.2
```

## Why This Structure?

Building DAWA is a **24-month, 18-microservice, 12-portal** project. If you give the AI one massive document:

❌ Token overflow (50,000+ tokens)
❌ AI skips steps in long context
❌ No verification checkpoints
❌ Mistakes compound silently

This documentation architecture solves those problems:

✅ **Modular files** - Each file fits context window
✅ **Checkpoint gates** - Validate before proceeding
✅ **Prompt batches** - Pre-tested instruction sequences
✅ **Cursor rules** - AI behavior constraints

## Repository Structure

```
dawa-morocco/
├── .cursor/
│   └── rules/
│       └── DAWA_RULES.md          # AI behavior constraints
│
├── docs/
│   ├── DAWA_MASTER.md             # Always-loaded context (~2K tokens)
│   ├── BUILD_ORDER.md             # Sequential build steps with gates
│   ├── DAWA_V100_FULL.md          # Complete original specification
│   │
│   ├── phases/                    # Phase-specific specs (~3K tokens each)
│   │   ├── PHASE_0.md             # Foundation (Months 1-3)
│   │   ├── PHASE_1.md             # Pharmacy MVP (Months 4-6)
│   │   ├── PHASE_2.md             # Claims Gateway (Months 7-9)
│   │   └── PHASE_3.md             # B2B Marketplace (Months 10-12)
│   │
│   ├── services/                  # Microservice specs (~1.5K tokens each)
│   │   ├── prescription.md
│   │   ├── pharmacy.md
│   │   ├── inventory.md
│   │   ├── order.md
│   │   ├── delivery.md
│   │   ├── payment.md
│   │   ├── claims.md
│   │   ├── credit.md
│   │   └── ... (18 total)
│   │
│   ├── portals/                   # Portal specs (~2K tokens each)
│   │   ├── patient-app.md
│   │   ├── pharmacy-portal.md
│   │   ├── driver-app.md
│   │   ├── distributor-portal.md
│   │   └── ... (12 total)
│   │
│   └── compliance/                # Regulatory specs
│       ├── CNDP.md                # Data privacy
│       ├── PHARMACY_LAW.md        # Loi 17-04
│       └── FINANCIAL.md           # TVA, DGI
│
└── prompts/                       # Step-by-step prompts
    ├── phase-0/                   # 8 prompts
    │   ├── P0.1-project-init.md
    │   ├── P0.2-supabase-setup.md
    │   ├── P0.3-database-schema.md
    │   ├── P0.4-auth-system.md
    │   ├── P0.5-drug-database.md
    │   ├── P0.6-patient-registration.md
    │   ├── P0.7-patient-rx-upload.md
    │   └── P0.8-admin-dashboard.md
    │
    ├── phase-1/                   # 12 prompts
    ├── phase-2/                   # 10 prompts
    └── phase-3/                   # 8 prompts
```

## How to Use

### Step 1: Load Context

Always start by loading the master reference:

```
Read docs/DAWA_MASTER.md and understand the project context.
```

### Step 2: Load Current Phase

Load the phase you're working on:

```
Read docs/phases/PHASE_0.md for complete Phase 0 specification.
```

### Step 3: Execute Prompt

Follow the prompt exactly:

```
Execute prompts/phase-0/P0.1-project-init.md
```

### Step 4: Validate

Complete ALL validation items before proceeding:

```
- [ ] npm run dev works
- [ ] No TypeScript errors
- [ ] No console errors
```

### Step 5: Checkpoint Gate

At the end of each phase, run validation:

```bash
node scripts/validate-phase.js 0
```

Only proceed to next phase when gate passes.

## Prompt Execution Protocol

When working in Cursor with Claude Code:

1. **Open the prompt file** in Cursor
2. **Copy the content** inside the \`\`\` code block
3. **Paste into Claude Code** chat
4. **Watch the execution** - interrupt if going wrong
5. **Validate each item** in the checklist
6. **Commit with message**: `[PHASE-X.Y] Description`

## Context Window Management

| Document Type | Tokens | When to Load |
|---------------|--------|--------------|
| DAWA_MASTER.md | ~2,000 | Always |
| Phase spec | ~3,000 | Current phase only |
| Service spec | ~1,500 | When building that service |
| Portal spec | ~2,000 | When building that portal |
| Prompt | ~500 | Current step only |

**Optimal context**: Master + Phase + 1-2 Services = ~8-10K tokens

## Token Budget Example

Building the Rx Verification Queue (P1.3):

```
DAWA_MASTER.md           2,000 tokens
PHASE_1.md               3,000 tokens
prescription.md          1,500 tokens
P1.3-rx-verification.md    500 tokens
─────────────────────────────────────
Total                    7,000 tokens ✅
```

## Checkpoint Gates

Each phase ends with a checkpoint gate:

| Phase | Gate Criteria |
|-------|---------------|
| 0 | All tables created, auth works, patient app renders |
| 1 | 20 pharmacies, 10 orders e2e, 95% Rx accuracy |
| 2 | CNSS/CNOPS sandbox, <500ms eligibility, 98% claims accuracy |
| 3 | 10 distributors, B2B flow complete, TVA compliant |

**Never proceed past a gate without validation.**

## Recovery Procedures

If something breaks:

1. **Check validation errors** - What failed?
2. **Rollback to last commit** - `git checkout .`
3. **Re-read the prompt** - Did you miss something?
4. **Fix and re-run** - One step at a time
5. **Validate again** - All items must pass

## Extending This System

### Adding a New Service

1. Create `docs/services/new-service.md`
2. Follow the template from `prescription.md`
3. Add reference in `DAWA_MASTER.md`
4. Create prompts in `prompts/phase-X/`

### Adding a New Portal

1. Create `docs/portals/new-portal.md`
2. Define screens, routes, components
3. Add to phase roadmap
4. Create build prompts

## Support

- **FlowNexis3 Team**: Slack #dawa-dev
- **Documentation Issues**: Open GitHub issue
- **Build Failures**: Check troubleshooting in prompt file

---

## Phase Overview

| Phase | Duration | Key Deliverables | Prompts |
|-------|----------|------------------|---------|
| 0 | Months 1-3 | DB, Auth, Patient MVP | 8 |
| 1 | Months 4-6 | Pharmacy Portal, Delivery | 12 |
| 2 | Months 7-9 | CNSS/CNOPS, Claims | 10 |
| 3 | Months 10-12 | B2B, Credit, Invoicing | 8 |
| 4-5 | Months 13-24 | Scale, Ecosystem | TBD |

## Tech Stack Summary

- **Frontend**: Next.js 14, Tailwind, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI**: Claude API (Rx verification, fraud detection)
- **Search**: Meilisearch (Arabic fuzzy search)
- **Queue**: BullMQ + Redis
- **Payments**: CMI, Payzone, COD

## Compliance Summary

- **CNDP (Law 09-08)**: Data privacy, consent, 72hr breach notification
- **Loi 17-04**: Pharmacy law, pharmacist-only dispensing
- **TVA**: 0% Rx, 7% basic, 20% standard
- **GDP**: Cold chain, batch traceability

---

*Built for Claude Code in Cursor IDE*
*FlowNexis3 | DAWA.ma | January 2026*
