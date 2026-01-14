**DAWA.ma**

V100 MASTER SPECIFICATION

*Morocco\'s Healthcare Financial Rails*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Complete Platform Architecture

Investor \| Regulator \| Partnership Ready

**CONFIDENTIAL**

January 2026 \| Version 100.0

Table of Contents

1\. Executive Summary

1.1 The Opportunity

Morocco stands at the inflection point of healthcare digitization. With
37 million citizens, 11,000+ pharmacies, universal health coverage
expansion (AMO généralisation), and zero dominant digital
infrastructure, DAWA.ma represents the opportunity to become the
foundational transaction layer connecting all healthcare stakeholders.

1.2 The Reframe

**DAWA is not a pharmacy delivery app.**

DAWA is Morocco\'s healthcare financial rails. Every prescription is a
transaction on the rails. When you control the transaction layer that
connects patients, pharmacies, distributors, insurers, employers, and
government---you don\'t compete with apps. You ARE the infrastructure
they all route through.

1.3 Market Size

  ---------------------- ---------------------- -------------------------
  **Metric**             **Value**              **Source**

  Population             37 million             HCP 2024

  Pharmacies             11,000+                Ordre des Pharmaciens

  Drug Distributors      50+                    Ministry of Health

  Pharmaceutical Market  \$2.2B annually        AMIP 2024

  Insurance Coverage     11M+ AMO beneficiaries CNSS/CNOPS

  Digital Penetration    78% smartphone, 65%    ANRT 2024
                         internet               

  Healthcare Spend       8.2% CAGR              WHO/HCP
  Growth                                        
  ---------------------- ---------------------- -------------------------

1.4 Competitive Landscape

  --------------- -------------------------- -----------------------------
  **Player**      **What They Do**           **Gap DAWA Fills**

  DabaDoc         Doctor booking +           No pharmacy/delivery/Rx
                  teleconsultation           fulfillment

  Glovo           Parapharmacy (OTC) only    Explicitly avoids
                                             prescription Rx

  Sobrus          Pharmacy management SaaS   B2B only, no patient-facing
                                             app

  Blink Pharma    B2B pharmacy marketplace   Pharmacist-to-pharmacist only

  DAWA.ma         End-to-end healthcare      FULL STACK: Rx → Delivery →
                  rails                      Insurance → B2B
  --------------- -------------------------- -----------------------------

1.5 Product Suite Overview

  ------------------ ------------------ ------------------ --------------
  **Product**        **Target           **Revenue Model**  **TAM**
                     Stakeholder**                         

  DAWA for Patients  37M citizens       Delivery fees +    \$180M
                                        Premium            
                                        subscriptions      

  DAWA for           11,000+ pharmacies SaaS + 5%          \$65M
  Pharmacies                            transaction fee    

  DAWA Claims        Insurers ↔         0.5-1% claims      \$22M
  Gateway            Pharmacies         processing         

  DAWA for           50+ wholesalers    1.5% B2B           \$33M
  Distributors                          marketplace fee    

  DAWA for Business  Employers          Per-employee       \$28M
                                        subscription       

  DAWA Data          Pharma companies   Annual data        \$15M
  Intelligence                          contracts          
  ------------------ ------------------ ------------------ --------------

1.6 Network Effect Flywheel

More Pharmacies → More Patients → More Data → Better Intelligence → More
Insurers → More Employers → \[LOOPS BACK\]

This creates a winner-take-most market structure. First mover with B2B
lock-in wins Morocco permanently. The infrastructure moat compounds with
every transaction.

2\. Technical Architecture

2.1 Infrastructure Layer (Layer 0)

The foundation of DAWA is built on modern, scalable, and compliant
infrastructure designed for healthcare-grade reliability and Moroccan
data sovereignty requirements.

  --------------- ------------------ --------------------- ----------------
  **Component**   **Technology**     **Purpose**           **Compliance**

  Primary         PostgreSQL +       Transactional data,   CNDP compliant
  Database        Supabase           Row Level Security    

  Analytics       TimescaleDB /      Time-series health    Anonymized data
  Engine          ClickHouse         metrics, real-time    
                                     dashboards            

  Cache + Queue   Redis + BullMQ     Session management,   Encrypted at
                                     rate limiting,        rest
                                     background jobs       

  Document Store  S3 + Supabase      Prescriptions,        7-year retention
                  Storage            invoices, audit logs  

  Search Engine   Meilisearch /      Drug database,        Fuzzy Arabic
                  Typesense          patient lookup,       support
                                     pharmacies            

  Event Bus       Kafka / NATS       Event sourcing,       Audit trail
                                     cross-service         
                                     synchronization       

  AI/ML Engine    Claude API +       Rx verification,      On-premise
                  Custom ML          fraud detection,      option
                                     forecasting           

  Identity        Supabase Auth      OAuth, SAML, MFA,     CNRST compatible
  Provider                           National ID           
                                     integration           

  Observability   Prometheus +       Logs, metrics,        SIEM integration
                  Grafana            traces, alerting      

  Disaster        Multi-region (EU + RPO: 1hr, RTO: 4hr,   Geo-redundant
  Recovery        Morocco)           99.9% SLA             
  --------------- ------------------ --------------------- ----------------

2.2 Microservices Architecture (Layer 1)

DAWA operates on 18 purpose-built microservices, each with bounded
contexts, independent deployment, and clear domain responsibilities.

2.2.1 Core Transaction Services

  ---------------------- ------------------ ---------------------------------
  **Service**            **Domain**         **Key Functions**

  prescription-service   Rx Lifecycle       Verification, refills, renewals,
                                            transfers, drug interaction
                                            checks

  pharmacy-service       Pharmacy           Licenses, hours, staff,
                         Management         inspection compliance tracking

  inventory-service      Stock Management   Batch/lot tracking, expiry,
                                            recalls, cold chain monitoring

  order-service          Order              State machine workflows, split
                         Orchestration      orders, urgent flags

  delivery-service       Logistics          Driver assignment, route
                                            optimization, temperature logging

  payment-service        Payment Processing CMI, Payzone, COD, escrow,
                                            refunds, disputes
  ---------------------- ------------------ ---------------------------------

2.2.2 Financial Services

  ------------------- ------------------ ---------------------------------
  **Service**         **Domain**         **Key Functions**

  claims-service      Insurance Claims   CNSS/CNOPS/AMO gateway, real-time
                                         adjudication, denials

  invoicing-service   Enterprise         TVA compliant, DGI e-invoicing,
                      Invoicing          multi-entity, credit notes

  credit-service      Credit Management  Limits, scoring, collections,
                                         payment terms, aging reports
  ------------------- ------------------ ---------------------------------

2.2.3 Healthcare Services

  -------------------------- ------------------------- ---------------------------------
  **Service**                **Domain**                **Key Functions**

  patient-service            Patient Graph             Health profiles, allergies,
                                                       medication adherence tracking

  drug-database-service      Morocco Drug Registry     DCI, pricing, generics, shortage
                                                       monitoring

  controlled-substance-svc   Narcotics/Psychotropics   Special Rx workflow,
                                                       DEA-equivalent audit trail

  pharmacovigilance-svc      Adverse Events            Side effect reporting, CAPM
                                                       integration
  -------------------------- ------------------------- ---------------------------------

2.2.4 Platform Services

  ------------------------- ------------------ ---------------------------------
  **Service**               **Domain**         **Key Functions**

  notification-service      Multi-channel      SMS, push, WhatsApp, refill
                            Comms              reminders, alerts

  fraud-detection-service   Anomaly Detection  Doctor shopping, overprescribing,
                                               claims fraud patterns

  compliance-service        Regulatory         CNDP, DMP, pharmacy law, license
                            Compliance         tracking, audits

  analytics-service         Business           Demand forecasting, real-time
                            Intelligence       dashboards

  integration-service       External           HL7 FHIR, SNOMED, hospital EHR
                            Integrations       sync
  ------------------------- ------------------ ---------------------------------

2.3 Data Architecture

2.3.1 Database Schema Design Principles

-   Event Sourcing: All state changes recorded as immutable events for
    complete audit trail

-   CQRS Pattern: Separate read/write models for performance
    optimization

-   Row Level Security (RLS): PostgreSQL policies enforce data isolation
    at database level

-   Soft Deletes: No physical deletion of healthcare data (7-year
    retention)

-   Temporal Tables: Full history of all record changes with
    valid_from/valid_to timestamps

-   UUID Primary Keys: No sequential IDs to prevent enumeration attacks

-   JSONB for Flexibility: Semi-structured data (addresses, metadata)
    without schema migrations

2.3.2 Core Domain Models

*See Appendix A for complete database schema definitions including all
47 tables, relationships, indexes, and RLS policies.*

3\. Stakeholder Portals

DAWA serves 12 distinct stakeholder groups through purpose-built
interfaces optimized for their specific workflows and regulatory
requirements.

3.1 Pharmacy Command Center

Target: 11,000+ pharmacies \| Platform: Web (Desktop-first)

Core Modules

  ---------------- --------------------- ---------------------------------
  **Module**       **Functions**         **Key Features**

  Rx Verification  AI-assisted           One-action decisions, drug
  Queue            prescription review   interaction alerts, dosage
                                         validation

  Inventory        Real-time stock       Batch/lot tracking, expiry
  Management       tracking              alerts, reorder points, cold
                                         chain

  B2B Ordering     Distributor           Price comparison, credit
                   marketplace           management, delivery scheduling

  Claims           Insurance processing  Real-time eligibility,
  Submission                             auto-adjudication, denial
                                         management

  Staff Management HR and scheduling     Pharmacist credentials, shift
                                         scheduling, performance tracking

  Analytics        Business intelligence Sales trends, inventory turnover,
  Dashboard                              profitability analysis

  Compliance       Regulatory tracking   License renewals, inspection
  Center                                 logs, controlled substance
                                         reports
  ---------------- --------------------- ---------------------------------

3.2 Patient Mobile Application

Target: 37M citizens \| Platform: iOS, Android, PWA

User Journey

-   Prescription Upload: Camera scan with AI extraction or manual entry

-   Pharmacy Selection: Availability search, price comparison, ratings

-   Insurance Verification: Real-time eligibility check, copay
    calculation

-   Order Tracking: Live GPS, temperature monitoring, ETA updates

-   Medication Management: Refill reminders, adherence tracking, drug
    information

-   Health Wallet: Insurance cards, prescription history, spending
    summary

-   Family Accounts: Manage medications for dependents with consent
    controls

3.3 Distributor Portal

Target: 50+ wholesalers \| Platform: Web + API

  ---------------------- ------------------------------------------------
  **Module**             **Functions**

  Catalog Management     Product listings, pricing tiers, promotions,
                         availability

  Order Fulfillment      Incoming orders, picking/packing, dispatch,
                         delivery confirmation

  Fleet Management       Vehicle tracking, route optimization,
                         temperature monitoring

  Credit Management      Pharmacy credit limits, payment tracking,
                         collections

  Demand Intelligence    Aggregated demand forecasting, stockout
                         predictions, territory analysis

  Invoicing              Automated invoice generation, TVA compliance,
                         settlement
  ---------------------- ------------------------------------------------

3.4 Insurer Portal

Target: CNSS, CNOPS, AMO, Private Insurers \| Platform: Web + API

  ---------------------- ------------------------------------------------
  **Module**             **Functions**

  Claims Gateway         Real-time claims submission, auto-adjudication,
                         denial workflows

  Member Eligibility     Real-time eligibility verification, coverage
                         lookup

  Fraud Analytics        Doctor shopping detection, overprescribing
                         patterns, claims anomalies

  Provider Network       Pharmacy credentialing, contract management,
                         performance metrics

  Reporting Dashboard    Claims volume, denial rates, cost analytics,
                         utilization trends

  Prior Authorization    PA workflow management, approval queues,
                         clinical criteria
  ---------------------- ------------------------------------------------

3.5 Additional Portals

  ---------------- ------------------ -----------------------------------
  **Portal**       **Target**         **Key Functions**

  Employer         HR/Benefits teams  Employee enrollment, spend
  Benefits                            analytics, wellness programs

  Driver App       Delivery fleet     Route optimization, ID
                                      verification, temperature logging,
                                      earnings

  Government       Ministry of        License management, controlled
  Portal           Health, Regulators substance reports, public health
                                      analytics

  Hospital Portal  Hospital           EHR integration, discharge Rx
                   pharmacies         routing, inventory sync

  Pharma           Drug companies     Market analytics, recall
  Manufacturer                        management, product launches

  Prescriber       Doctors/Clinics    E-prescribing, patient history,
  Portal                              drug interactions, prior auth

  Care Coordinator Patient advocates  Adherence tracking, intervention
                                      alerts, chronic care management

  DAWA Admin       Platform           Onboarding, support escalations,
                   operations         revenue monitoring, system health
  ---------------- ------------------ -----------------------------------

4\. Regulatory Compliance Framework

DAWA operates within one of the most regulated sectors in Morocco. This
section details the complete compliance framework ensuring legal
operation across all jurisdictions and stakeholder types.

4.1 Data Privacy (CNDP Compliance)

**Morocco Law 09-08 on Personal Data Protection**

  ------------------ ------------------------------ ---------------------
  **Requirement**    **DAWA Implementation**        **Verification**

  CNDP Registration  Full declaration of all data   Registration number
                     processing activities          on file

  Consent Management Explicit opt-in for each data  Consent audit trail
                     category, granular controls    

  Data Minimization  Only collect data necessary    Data mapping
                     for specified purpose          documentation

  Purpose Limitation Clear purpose statement for    Privacy policy v3.0
                     each data type                 

  Right to Access    Patient portal data export in  Automated DSAR
                     24 hours                       workflow

  Right to           Self-service profile updates + Change log audit
  Rectification      support channel                

  Right to Deletion  Soft delete with 30-day        Deletion certificates
                     recovery, then anonymization   

  Data Breach        CNDP notification within 72    Incident response
  Notification       hours                          plan

  Cross-border       Data sovereignty:              DPA agreements
  Transfer           Morocco-first, EU adequacy for 
                     backups                        

  Data Protection    Designated DPO with direct     DPO contact published
  Officer            board reporting                
  ------------------ ------------------------------ ---------------------

4.2 Pharmaceutical Regulations

**Code de la Pharmacie (Loi 17-04) and related decrees**

  ---------------------- ------------------------------------------------
  **Requirement**        **DAWA Implementation**

  Pharmacist-Only        All prescriptions verified by licensed
  Dispensing             pharmacist before dispatch. System blocks
                         non-pharmacist actions on controlled
                         medications.

  License Verification   Real-time validation against Ordre des
                         Pharmaciens registry. Quarterly re-verification.
                         Automatic suspension on license lapse.

  Prescription Validity  System enforces validity periods: standard Rx (3
                         months), renewable Rx (12 months with refills),
                         controlled (immediate use).

  Controlled Substances  Separate workflow: original physical Rx
                         required, patient ID verification, special
                         register, quantity limits, no delivery for
                         Tableau A.

  Cold Chain Compliance  GPS + temperature IoT sensors, threshold alerts,
                         chain-of-custody documentation, deviation
                         incident reports.

  Record Retention       7-year retention for all prescription records,
                         indexed and searchable, tamper-proof audit
                         trail.

  Advertising            No therapeutic claims in consumer marketing,
  Restrictions           educational content only, compliance review for
                         all communications.

  Price Ceiling          System enforces Ministry of Health PPM (Prix
  Compliance             Public Maroc), automatic alerts on price
                         deviations.
  ---------------------- ------------------------------------------------

4.3 Financial Compliance

  ---------------- --------------------- ---------------------------------
  **Regulation**   **Requirement**       **DAWA Implementation**

  TVA Compliance   Correct tax rates     Automated rate application by
                   (0/7/10/14/20%)       product category, DGI e-invoicing
                                         ready

  DGI E-Invoicing  Electronic invoice    Real-time invoice transmission,
                   submission            QR code validation, archive
                                         retention

  AML/KYC (Law     Anti-money laundering Identity verification,
  43-05)           controls              transaction monitoring,
                                         suspicious activity reports

  Bank Al-Maghrib  Payment services      Daily settlement reports, float
                   reporting             management, escrow documentation

  ICE/IF           Tax ID verification   Real-time validation against tax
  Validation                             authority, mandatory for B2B
                                         transactions

  Audit Trail      Financial record      10-year retention, immutable
                   keeping               ledger, third-party audit ready
  ---------------- --------------------- ---------------------------------

4.4 Healthcare Quality Standards

  ------------------- ------------------ ---------------------------------
  **Standard**        **Scope**          **DAWA Implementation**

  GDP (Good           Drug distribution  Temperature monitoring, batch
  Distribution        quality            traceability, deviation
  Practice)                              management, qualified personnel

  Patient Safety      Clinical safety    Drug interaction screening,
                      checks             allergy alerts, contraindication
                                         checks, dosage validation

  Pharmacovigilance   Adverse event      CAPM integration, side effect
                      reporting          tracking, mandatory reporting
                                         workflows

  Recall Management   Product recalls    Batch tracking to patient level,
                                         automated notifications, return
                                         logistics

  Quality Assurance   Process quality    SOPs for all operations, regular
                                         audits, corrective action
                                         tracking
  ------------------- ------------------ ---------------------------------

4.5 Regulatory Monitoring System

DAWA maintains a dedicated Regulatory Intelligence function that
continuously monitors changes in the regulatory landscape and ensures
platform compliance.

-   Daily monitoring of Official Gazette (Bulletin Officiel) for new
    laws and decrees

-   Ministry of Health circular tracking and impact assessment

-   CNDP guidance updates and interpretation notes

-   Insurance authority (ACAPS) directive monitoring

-   International best practice benchmarking (EU, GCC, Africa)

-   Quarterly compliance audits with external legal counsel

-   Annual regulatory risk assessment and mitigation planning

5\. Financial Systems

5.1 Enterprise Invoicing Engine

The invoicing engine handles all financial transactions across the
platform, supporting multiple entity types, tax regimes, and compliance
requirements.

5.1.1 Invoice Types

  ---------------------- ---------------------- -----------------------------
  **Type**               **Flow**               **Tax Treatment**

  PATIENT_RECEIPT        Pharmacy → Patient     TVA included (0% for Rx, 20%
                                                for parapharmacy)

  INSURANCE_CLAIM        Pharmacy → Insurer     B2B exempt, reimbursement
                                                basis

  INSURANCE_SETTLEMENT   Insurer → Pharmacy     Settlement documentation

  DISTRIBUTOR_ORDER      Pharmacy → Distributor B2B with TVA (varies by
                                                product)

  DISTRIBUTOR_PAYMENT    Pharmacy → Distributor Payment confirmation

  SAAS_SUBSCRIPTION      DAWA → Pharmacy        20% TVA service

  COMMISSION_INVOICE     DAWA → Pharmacy        20% TVA service

  CREDIT_NOTE            Any party              Reversal of original tax
                                                treatment

  DEBIT_NOTE             Any party              Adjustment documentation

  PROFORMA               Pre-transaction        No tax obligation until
                                                converted
  ---------------------- ---------------------- -----------------------------

5.1.2 Morocco TVA Rates

  ----------- ---------------------- ------------------------------------
  **Rate**    **Category**           **Examples**

  0%          Essential medications  Prescription drugs, insulin,
                                     vaccines

  7%          Basic necessities      Baby formula, certain medical
                                     devices

  10%         Services               Certain healthcare services

  14%         Standard goods         Cosmetics, non-essential health
                                     products

  20%         Standard rate          Parapharmacy, SaaS services,
                                     commissions
  ----------- ---------------------- ------------------------------------

5.2 Claims Gateway Architecture

The Claims Gateway connects pharmacies to Morocco\'s insurance
ecosystem, enabling real-time adjudication and settlement.

5.2.1 Insurance Network Coverage

  ---------------- ------------------- ---------------- --------------------
  **Insurer**      **Beneficiaries**   **Integration    **Claim Volume**
                                       Status**         

  CNSS             3.5M private sector API integration  \~2M claims/year

  CNOPS            2.5M public sector  API integration  \~1.5M claims/year

  AMO              11M+ universal      Gateway          \~5M claims/year
                                       partnership      

  RAMED            Low-income          Manual           \~500K claims/year
                   population          processing       

  Private (Saham,  \~2M employees      EDI batch + API  \~1M claims/year
  RMA, etc.)                                            
  ---------------- ------------------- ---------------- --------------------

5.2.2 Claims Processing Flow

-   Step 1: Patient presents insurance card at order creation

-   Step 2: Real-time eligibility verification against insurer database

-   Step 3: Coverage lookup for prescribed medications

-   Step 4: Copay calculation based on coverage percentage

-   Step 5: Patient pays copay, remainder submitted as claim

-   Step 6: Claim auto-adjudicated against coverage rules

-   Step 7: Approved: added to settlement batch \| Denied: denial code
    returned

-   Step 8: Settlement batch processed (daily/weekly depending on
    insurer)

-   Step 9: Pharmacy receives settlement with detailed remittance

-   Step 10: Reconciliation and exception handling

5.3 Credit Management System

  ---------------- -------------------------- ---------------------------
  **Feature**      **Description**            **Risk Controls**

  Credit Scoring   ML-based credit assessment Payment history, volume,
                   for pharmacies             tenure, financial
                                              statements

  Credit Limits    Dynamic limits based on    Auto-adjustment based on
                   risk profile               behavior, manual override

  Payment Terms    Net 30/60/90 based on tier Early payment discounts,
                                              late payment penalties

  Aging Reports    Real-time receivables      Automated reminders at
                   tracking                   30/60/90 days

  Collections      Escalation workflow for    Soft collection → Formal
                   delinquent accounts        demand → Legal action

  Credit Insurance Optional credit insurance  Third-party underwriting
                   for high-risk accounts     integration
  ---------------- -------------------------- ---------------------------

5.4 Payment Processing

  ---------------- ------------------ ------------------ ----------------
  **Method**       **Provider**       **Use Case**       **Fees**

  Credit/Debit     CMI (Centre        Patient payments,  1.8-2.5%
  Cards            Monetique)         B2B cards          

  Mobile Wallets   Payzone, inwi      Patient payments   1.5-2%
                   money, Orange                         
                   Money                                 

  Bank Transfer    CIH, BMCE, AWB     B2B settlements    Fixed fee
                   APIs                                  

  Cash on Delivery DAWA fleet + 3PL   Patient preference 5 MAD handling

  DAWA Credits     Platform credit    Prepaid balance    0%
                   system                                

  Insurance Direct Insurer settlement Third-party payer  N/A
  ---------------- ------------------ ------------------ ----------------

6\. Logistics & Operations

6.1 End-to-End Order Flow

The order lifecycle from prescription submission to delivery completion,
with all state transitions and validation checkpoints.

6.1.1 Order States

  -------------------- ---------------------- --------------------- -----------------
  **State**            **Description**        **Next States**       **SLA**

  CREATED              Order submitted by     RX_PENDING, CANCELLED Immediate
                       patient                                      

  RX_PENDING           Awaiting prescription  RX_VERIFIED,          15 min avg
                       verification           RX_REJECTED           

  RX_VERIFIED          Pharmacist approved    INSURANCE_CHECK,      2 min
                       prescription           PAYMENT_PENDING       

  INSURANCE_CHECK      Verifying insurance    COVERAGE_CONFIRMED,   30 sec
                       eligibility            COVERAGE_DENIED       

  COVERAGE_CONFIRMED   Insurance verified,    PAYMENT_PENDING       Immediate
                       copay calculated                             

  PAYMENT_PENDING      Awaiting patient       PAID, CANCELLED       User-dependent
                       payment                                      

  PAID                 Payment confirmed      PREPARING             Immediate

  PREPARING            Pharmacy preparing     READY_FOR_PICKUP,     30 min target
                       order                  READY_FOR_DISPATCH    

  READY_FOR_DISPATCH   Awaiting driver        DRIVER_ASSIGNED       10 min target
                       assignment                                   

  DRIVER_ASSIGNED      Driver en route to     PICKED_UP             15 min target
                       pharmacy                                     

  PICKED_UP            Driver has order       IN_TRANSIT            Immediate

  IN_TRANSIT           En route to patient    DELIVERED,            Route-dependent
                                              DELIVERY_FAILED       

  DELIVERED            Successfully delivered COMPLETED             Immediate

  COMPLETED            Order finalized        Terminal state        N/A
  -------------------- ---------------------- --------------------- -----------------

6.2 Inventory Management

6.2.1 Stock Tracking Features

  ------------------ ------------------------------ ---------------------
  **Feature**        **Description**                **Compliance
                                                    Requirement**

  Batch/Lot Tracking Every unit tracked by          Recall traceability
                     manufacturer batch number      to patient level

  Expiry Management  FEFO (First Expired First Out) No dispensing of
                     enforcement                    expired medications

  Cold Chain         IoT sensors for                GDP compliance,
  Monitoring         temperature-sensitive products deviation alerts

  Reorder Points     Automatic reorder alerts based Prevent stockouts of
                     on demand forecasting          essential medications

  Cycle Counting     Regular inventory audits with  Financial accuracy,
                     variance reporting             shrinkage detection

  Controlled         Separate tracking for          Ministry of Health
  Substance Ledger   narcotics/psychotropics        reporting
                                                    requirements
  ------------------ ------------------------------ ---------------------

6.3 Delivery Operations

6.3.1 Fleet Model

  ---------------- --------------------- ------------------ ---------------
  **Model**        **Coverage**          **Use Case**       **Economics**

  DAWA Fleet       Major cities          Premium delivery,  Fixed cost +
                   (Casablanca, Rabat,   controlled         per-delivery
                   Marrakech)            substances         

  3PL Partners     Secondary cities,     Standard delivery  Per-delivery
                   overflow                                 fee

  Pharmacy         Rural areas, existing Pharmacy           Reduced
  Self-Delivery    pharmacy fleet        preference         commission
  ---------------- --------------------- ------------------ ---------------

6.3.2 Delivery Requirements

-   ID Verification: Required for controlled substances and high-value
    orders

-   Temperature Monitoring: Continuous logging for cold chain products

-   Photo Proof: Delivery confirmation with timestamp and GPS
    coordinates

-   Signature Capture: Optional digital signature for premium orders

-   Age Verification: Required for certain medications

-   Contactless Delivery: Option for non-sensitive orders

-   Delivery Windows: 2-hour windows with 30-minute notification

6.4 B2B Marketplace Operations

6.4.1 Distributor → Pharmacy Flow

  --------------- -------------------------- -----------------------------
  **Stage**       **Process**                **Automation**

  Catalog Sync    Distributor uploads/syncs  API/SFTP integration,
                  product catalog            real-time pricing

  Order Placement Pharmacy browses,          Smart reordering, bulk import
                  compares, orders           

  Order           Distributor confirms       Automatic confirmation for
  Confirmation    availability               in-stock items

  Fulfillment     Picking, packing, quality  Barcode scanning, batch
                  check                      verification

  Dispatch        Assign to delivery vehicle Route optimization, load
                                             balancing

  Delivery        Transport to pharmacy      GPS tracking, temperature
                                             logging

  Receiving       Pharmacy verifies and      Scan receipt, discrepancy
                  accepts                    reporting

  Invoicing       Automated invoice          TVA calculation, credit
                  generation                 application

  Settlement      Payment processing         Net terms or immediate
                                             payment
  --------------- -------------------------- -----------------------------

7\. Security & Risk Management

7.1 Security Architecture

7.1.1 Defense in Depth

  ---------------- -------------------------- -----------------------------
  **Layer**        **Controls**               **Technologies**

  Network          Firewall, DDoS protection, Cloudflare, AWS Shield
                   WAF                        

  Application      Input validation, OWASP    Custom middleware, security
                   Top 10 mitigation          headers

  Authentication   MFA, session management,   Supabase Auth, SAML
                   OAuth 2.0                  federation

  Authorization    RBAC, RLS, attribute-based PostgreSQL policies, custom
                   access                     middleware

  Data             Encryption at rest and in  AES-256, TLS 1.3, pgcrypto
                   transit                    

  Infrastructure   Container isolation,       Docker, Kubernetes, Vault
                   secrets management         

  Monitoring       SIEM, anomaly detection,   ELK stack, custom alerting
                   audit logging              
  ---------------- -------------------------- -----------------------------

7.1.2 Data Classification

  -------------------- -------------------------- -----------------------------
  **Classification**   **Examples**               **Controls**

  CRITICAL             Prescriptions, health      Encrypted, access logged, DPO
                       records, insurance data    approval required

  CONFIDENTIAL         Personal identifiers,      Encrypted, role-based access
                       addresses, payment details 

  INTERNAL             Business analytics,        Access controlled, audit
                       operational data           trail

  PUBLIC               Drug information, pharmacy No special controls
                       locations                  
  -------------------- -------------------------- -----------------------------

7.2 Fraud Detection System

7.2.1 Fraud Patterns Monitored

  ------------------ -------------------------- -------------------------
  **Pattern**        **Detection Method**       **Response**

  Doctor Shopping    Multiple prescribers for   Alert pharmacist, flag
                     same medication in short   patient profile
                     period                     

  Prescription       AI image analysis,         Block order, notify
  Forgery            prescriber verification    authorities

  Overprescribing    Prescriber volume          Alert compliance team,
                     anomalies, pattern         report to authorities
                     analysis                   

  Insurance Fraud    Claims pattern analysis,   Block claim, notify
                     duplicate submissions      insurer

  Pharmacy Fraud     Dispensing volume          Suspend pharmacy, audit
                     anomalies, fake claims     trail

  Identity Theft     Behavioral biometrics,     Additional verification,
                     device fingerprinting      account lock

  Controlled         Quantity tracking,         DEA-equivalent reporting,
  Substance          geographic patterns        investigation
  Diversion                                     
  ------------------ -------------------------- -------------------------

7.3 Business Continuity

  ---------------------- ------------------ -----------------------------
  **Metric**             **Target**         **Implementation**

  RTO (Recovery Time     4 hours            Hot standby in secondary
  Objective)                                region

  RPO (Recovery Point    1 hour             Continuous database
  Objective)                                replication

  Availability SLA       99.9%              Multi-AZ deployment,
                                            auto-scaling

  Data Durability        99.999999999%      S3 cross-region replication

  Backup Frequency       Continuous + daily Point-in-time recovery
                         snapshots          

  DR Testing             Quarterly          Documented failover
                                            procedures
  ---------------------- ------------------ -----------------------------

7.4 Risk Register

  --------------- ------------------ ---------------- ------------ -----------------------
  **Risk          **Risk             **Likelihood**   **Impact**   **Mitigation**
  Category**      Description**                                    

  Regulatory      Change in pharmacy Medium           Critical     Legal monitoring,
                  law restricting                                  flexible business model
                  delivery                                         

  Operational     Pharmacy network   Medium           High         Contract incentives,
                  churn                                            switching costs

  Financial       Insurance payment  High             Medium       Working capital
                  delays                                           facility, diverse
                                                                   payers

  Technology      System outage      Low              Critical     Redundancy, incident
                  during peak hours                                response plan

  Reputational    Adverse event      Low              Critical     Quality controls,
                  linked to DAWA                                   insurance, PR plan
                  delivery                                         

  Competitive     Well-funded        Medium           High         Network effects, B2B
                  competitor entry                                 lock-in, execution
                                                                   speed

  Cybersecurity   Data breach        Low              Critical     Security architecture,
                  exposing patient                                 cyber insurance
                  data                                             
  --------------- ------------------ ---------------- ------------ -----------------------

8\. Integration Strategy

8.1 External System Integrations

8.1.1 Government Systems

  ------------------ ------------------- --------------- ---------------- ------------
  **System**         **Owner**           **Integration   **Data           **Status**
                                         Type**          Exchanged**      

  DMP (Dossier       Ministry of Health  HL7 FHIR API    Patient health   Planned
  Medical Partage)                                       records          Phase 3

  CAPM               Pharmacovigilance   Web service     Adverse event    Planned
                     Center                              reports          Phase 2

  DGI E-Invoicing    Tax Authority       REST API        Electronic       Ready Phase
                                                         invoices         1

  Ministry Drug      Ministry of Health  Data sync       Drug database    Active
  Registry                                               updates          

  CNDP Portal        Data Protection     Manual + API    Registration,    Active
                                                         breach           
                                                         notification     
  ------------------ ------------------- --------------- ---------------- ------------

8.1.2 Healthcare Networks

  ---------------------- ------------------ -----------------------------
  **System**             **Integration      **Purpose**
                         Type**             

  DabaDoc                API partnership    Prescription routing from
                                            teleconsultations

  Hospital EHR Systems   HL7 FHIR           Discharge prescription
                                            routing, medication history

  Sobrus (Pharmacy SaaS) API bridge         Inventory sync for existing
                                            Sobrus users

  OPUS (Pharmacy POS)    File integration   Transaction sync for legacy
                                            systems

  Lab Systems            HL7 v2             Lab results affecting
                                            medication decisions
  ---------------------- ------------------ -----------------------------

8.1.3 Insurance Networks

  --------------- ---------------- -------------------------- ---------------
  **Insurer**     **Integration    **Capabilities**           **Volume**
                  Method**                                    

  CNSS            Direct API       Real-time eligibility,     3.5M
                                   claims, settlement         beneficiaries

  CNOPS           Direct API       Real-time eligibility,     2.5M
                                   claims, settlement         beneficiaries

  AMO Gateway     Gateway          Aggregated access to AMO   11M+
                  partnership      network                    beneficiaries

  Private         EDI batch + API  Eligibility, claims, prior \~2M covered
  Insurers                         auth                       lives
  --------------- ---------------- -------------------------- ---------------

8.2 Healthcare Interoperability Standards

  ------------------ --------------- ------------------------------------
  **Standard**       **Version**     **Use Case**

  HL7 FHIR           R4              Patient records, medication
                                     requests, observations

  HL7 v2.x           2.5.1           Legacy hospital system integration

  SNOMED CT          International   Clinical terminology for diagnoses

  ICD-10             WHO 2024        Diagnosis coding for claims

  LOINC              2.76            Lab test identification

  RxNorm             Current         Medication normalization (mapped to
                                     Morocco registry)

  NCPDP SCRIPT       2023            E-prescribing standard (adapted for
                                     Morocco)
  ------------------ --------------- ------------------------------------

8.3 API Strategy

-   Public API: Rate-limited developer access for approved third-party
    integrations

-   Partner API: Enhanced access for strategic partners (insurers,
    hospitals, distributors)

-   Internal API: Service-to-service communication within DAWA
    microservices

-   Webhook System: Real-time event notifications for order status,
    claims, inventory

-   GraphQL Layer: Flexible querying for complex dashboard and reporting
    needs

-   SDK: Official SDKs for JavaScript, Python, and mobile (iOS/Android)

9\. Revenue Model

9.1 Revenue Streams

  --------------- ---------------- ----------------- --------- ----------------
  **Stream**      **Model**        **Pricing**       **TAM**   **Year 3
                                                               Target**

  B2C Delivery    Transaction fee  15-35 MAD per     \$180M    \$8M
                                   delivery                    

  Patient Premium Subscription     49 MAD/month      \$50M     \$2M

  Pharmacy SaaS   Subscription +   500-2000 MAD/mo + \$65M     \$5M
                  transaction      5%                          

  Claims Gateway  Processing fee   0.5-1% of claim   \$22M     \$3M
                                   value                       

  B2B Marketplace Transaction fee  1.5% GMV          \$33M     \$2M

  Employer        Per-employee     20-50             \$28M     \$1.5M
  Benefits                         MAD/employee/mo             

  Data            License          Custom contracts  \$15M     \$1M
  Intelligence                                                 

  Credit          Spread           2-3% on credit    \$10M     \$0.5M
  Facilitation                     extended                    
  --------------- ---------------- ----------------- --------- ----------------

9.2 Unit Economics

9.2.1 Patient Order Economics

  -------------------------- --------------- -----------------------------
  **Metric**                 **Value**       **Notes**

  Average Order Value (AOV)  180 MAD         Excluding insurance portion

  Gross Revenue per Order    25 MAD          Delivery fee average

  COGS per Order             \(15\) MAD      Driver cost + operations

  Gross Margin per Order     10 MAD          40% gross margin

  Customer Acquisition Cost  50 MAD          Blended digital + referral
  (CAC)                                      

  Orders per Customer per    8               Chronic patients: 12+
  Year                                       

  Customer Lifetime Value    320 MAD         4-year retention
  (LTV)                                      

  LTV:CAC Ratio              6.4x            Target: \>3x
  -------------------------- --------------- -----------------------------

9.2.2 Pharmacy Economics

  -------------------------- --------------- -----------------------------
  **Metric**                 **Value**       **Notes**

  Monthly SaaS Revenue       1,200 MAD       Average tier

  Transaction Revenue (5%)   2,500 MAD       Based on 50K MAD GMV

  Total Monthly Revenue per  3,700 MAD       Growing with volume
  Pharmacy                                   

  Customer Success Cost      \(500\) MAD     Prorated support

  Net Revenue per Pharmacy   3,200 MAD       86% net margin

  Pharmacy CAC               5,000 MAD       Sales + onboarding

  Payback Period             1.6 months      Fast payback enables growth
  -------------------------- --------------- -----------------------------

9.3 Financial Projections

  ------------------ ----------- ----------- ----------- -----------------
  **Metric**         **Year 1**  **Year 2**  **Year 3**  **Year 5**

  Active Pharmacies  200         800         2,500       6,000

  Monthly Active     5,000       50,000      250,000     1,000,000
  Patients                                               

  Total Orders       40,000      400,000     2,000,000   10,000,000

  Gross Revenue      2M MAD      20M MAD     100M MAD    500M MAD

  Claims Processed   10M MAD     100M MAD    500M MAD    2.5B MAD

  B2B GMV            5M MAD      50M MAD     250M MAD    1.25B MAD

  Total Revenue      3M MAD      35M MAD     200M MAD    1B MAD

  Gross Margin       50%         55%         60%         65%

  EBITDA Margin      -80%        -20%        5%          25%
  ------------------ ----------- ----------- ----------- -----------------

10\. Implementation Roadmap

10.1 Phase Overview

  --------------- -------------- ------------------ -------------------------
  **Phase**       **Duration**   **Objective**      **Key Deliverables**

  Phase 0:        Months 1-3     Infrastructure +   Database, Auth, Patient
  Foundation                     Core Platform      App MVP, Admin

  Phase 1:        Months 4-6     First Pharmacy     Pharmacy Portal, Rx
  Pharmacy MVP                   Partners           Verification, Delivery

  Phase 2: Claims Months 7-9     Insurance          CNSS/CNOPS APIs, Claims
  Gateway                        Integration        Processing

  Phase 3: B2B    Months 10-12   Distributor        Distributor Portal, B2B
  Marketplace                    Network            Ordering

  Phase 4: Scale  Months 13-18   National Expansion All Cities, Employer
                                                    Platform, Data Products

  Phase 5:        Months 19-24   Full Platform      Hospital Integration,
  Ecosystem                                         Pharma Data, Regional
  --------------- -------------- ------------------ -------------------------

10.2 Phase 0: Foundation (Months 1-3)

-   Infrastructure: PostgreSQL cluster, Supabase setup, Redis, S3
    storage

-   Authentication: Supabase Auth, MFA, social login, phone verification

-   Core Models: Users, Pharmacies, Medications, Orders, Prescriptions

-   Patient App MVP: Registration, Rx upload, pharmacy search, basic
    ordering

-   Admin Dashboard: User management, pharmacy onboarding, order
    monitoring

-   Drug Database: Import Morocco official drug registry, pricing,
    availability

-   Development Environment: CI/CD pipeline, staging, production
    environments

-   Documentation: API docs, onboarding guides, compliance documentation

10.3 Phase 1: Pharmacy MVP (Months 4-6)

-   Pharmacy Portal: Full command center with Rx queue, inventory,
    analytics

-   AI Verification Engine: Claude-powered prescription analysis and
    validation

-   Inventory Management: Stock tracking, expiry alerts, reorder points

-   Delivery System: Driver app, route optimization, tracking

-   Payment Integration: CMI cards, cash on delivery, basic
    reconciliation

-   Pilot Launch: 20 pharmacies in Casablanca, controlled rollout

-   Success Metrics: Order completion rate, verification accuracy, NPS

10.4 Phase 2: Claims Gateway (Months 7-9)

-   CNSS Integration: API connection, eligibility verification, claims
    submission

-   CNOPS Integration: Similar scope to CNSS

-   Real-time Adjudication: Instant coverage calculation, copay display

-   Claims Dashboard: Submission tracking, denial management, analytics

-   Settlement Processing: Batch settlement, reconciliation, reporting

-   Insurance Card Wallet: Digital insurance cards, family management

-   Prior Authorization: PA workflow for specialty medications

10.5 Phase 3: B2B Marketplace (Months 10-12)

-   Distributor Portal: Catalog management, order fulfillment, fleet
    tracking

-   B2B Ordering: Pharmacy ordering interface, price comparison, credit
    terms

-   Credit Management: Credit scoring, limits, payment tracking,
    collections

-   Demand Intelligence: Aggregated demand forecasting for distributors

-   Enterprise Invoicing: Full TVA compliance, DGI e-invoicing ready

-   Onboard 10 Distributors: Major players (Soremap, COFIPHARMA, PHI)

-   Expand to 500 Pharmacies: Casablanca + Rabat coverage

10.6 Phase 4-5: Scale & Ecosystem

  ------------------ -------------------------- --------------------------
  **Capability**     **Phase 4 (Months 13-18)** **Phase 5 (Months 19-24)**

  Geographic         8 major cities, 2,500      National coverage, 6,000+
                     pharmacies                 pharmacies

  Insurance          All public insurers + 5    Full private insurer
                     private                    network

  B2B                30 distributors, full      Hospital supply chain
                     marketplace                integration

  Employer           Beta with 10 employers     Full employer platform,
                                                100+ clients

  Data Products      Basic market reports       Full data intelligence
                                                suite

  International      Morocco focus              MENA expansion planning
  ------------------ -------------------------- --------------------------

11\. Blindspots Addressed

This section documents the gaps identified in the initial V10
specification and how V100 addresses each one comprehensively.

  ------------------- ----------- ---------------------- -------------------------
  **Gap**             **V10       **V100 Solution**      **Implementation**
                      Status**                           

  Clinical Decision   Missing     Drug interaction       prescription-service with
  Support                         checking, allergy      external drug database
                                  alerts, dosage         
                                  validation             

  Pharmacovigilance   Missing     Adverse event          pharmacovigilance-svc,
                                  reporting, CAPM        mandatory reporting
                                  integration            

  Cold Chain          Partial     IoT temperature        delivery-service + IoT
  Management                      sensors, deviation     integration
                                  alerts, GDP compliance 

  Medication          Missing     Refill reminders,      patient-service +
  Adherence                       adherence tracking,    notification-service
                                  intervention alerts    

  Emergency/Urgent    Missing     Priority queue,        Order priority flags, SLA
  Orders                          expedited              escalation
                                  verification, urgent   
                                  delivery               

  Multi-pharmacy      Missing     Split orders across    order-service split logic
  Splitting                       pharmacies for         
                                  availability           

  Compound            Missing     Compounding pharmacy   pharmacy-service compound
  Medications                     network, special       flag
                                  workflows              

  Government Tenders  Missing     Public procurement     Phase 5 tender management
                                  module for             
                                  hospital/government    

  EHR Integration     Mentioned   HL7 FHIR, SNOMED CT,   integration-service
                                  ICD-10 implementation  standards

  Prescription Expiry Partial     Validity tracking,     prescription-service
                                  renewal reminders,     validation
                                  auto-rejection         

  Generic             Missing     Automatic generic      drug-database-service +
  Substitution                    alternatives,          UI
                                  pharmacist override    

  Price Ceiling       Missing     PPM enforcement, price drug-database-service +
  Compliance                      deviation alerts       compliance

  Drug Shortage       Missing     National shortage      drug-database-service +
  Monitoring                      tracking, alternative  analytics
                                  suggestions            

  Recall Management   Missing     Batch-level recall     inventory-service +
                                  tracking, patient      notification
                                  notification           

  Staff Credential    Partial     License verification,  pharmacy-service +
  Management                      continuing education   compliance
                                  tracking               

  Accessibility       Missing     WCAG 2.1 AA            All portals accessibility
  (WCAG)                          compliance, Arabic RTL audit
                                  support                

  Localization        Missing     Moroccan Arabic        notification-service + AI
  (Darija)                        dialect support for    
                                  chatbot/voice          

  Dispute Resolution  Missing     Customer service       Admin portal + ticketing
                                  workflows, escalation  
                                  paths                  

  Business Continuity Partial     Full DR plan,          Infrastructure layer
                                  multi-region failover  documented

  Environmental       Missing     Packaging waste        Phase 5 sustainability
  Tracking                        reduction,             module
                                  sustainability metrics 
  ------------------- ----------- ---------------------- -------------------------

12\. Appendices

Appendix A: Complete Database Schema

*See separate technical document: DAWA_V100_DATABASE_SCHEMA.sql*

Appendix B: API Documentation

*See separate technical document: DAWA_V100_API_SPEC.yaml (OpenAPI 3.0)*

Appendix C: RBAC Role Matrix

  ------------------- --------------- ---------------------------------------
  **Role**            **Scope**       **Key Permissions**

  SUPER_ADMIN         Platform-wide   Full system access, user management,
                                      configuration

  SUPPORT_AGENT       Platform-wide   Order support, pharmacy support,
                                      limited user access

  PHARMACY_OWNER      Single pharmacy Full pharmacy management, staff,
                                      financials

  PHARMACIST          Single pharmacy Rx verification, dispensing, inventory

  PHARMACY_STAFF      Single pharmacy Order preparation, delivery handoff

  DISTRIBUTOR_ADMIN   Single          Catalog, orders, fleet, financials
                      distributor     

  DISTRIBUTOR_SALES   Single          Order management, customer relations
                      distributor     

  INSURER_ADMIN       Single insurer  Claims, eligibility, analytics,
                                      provider network

  INSURER_ANALYST     Single insurer  Reports, analytics, fraud review

  EMPLOYER_ADMIN      Single employer Benefits admin, employee enrollment,
                                      spend

  EMPLOYER_HR         Single employer Employee management, basic reporting

  PATIENT             Own data        Orders, prescriptions, profile, family

  CAREGIVER           Assigned        Order on behalf, view history (with
                      patients        consent)

  DRIVER              Assigned orders Delivery management, route,
                                      verification

  PRESCRIBER          Own patients    E-prescribing, patient history, drug
                                      info

  REGULATOR           View access     Audit logs, compliance reports,
                                      controlled substance data
  ------------------- --------------- ---------------------------------------

Appendix D: Morocco Regulatory References

  ------------------ ------------------ ---------------------------------
  **Regulation**     **Reference**      **Relevance**

  Code de la         Loi 17-04 (2006)   Pharmacy operations, dispensing
  Pharmacie                             rules

  Data Protection    Loi 09-08 (2009)   Personal data processing

  Insurance          Code des           Insurance claims processing
  Regulation         Assurances         

  Tax Code           Code General des   TVA rates, invoicing requirements
                     Impots             

  E-Commerce         Loi 53-05 (2007)   Electronic transactions

  Health Security    Loi 28-07          Food and drug safety

  Controlled         Dahir 1922 +       Narcotic/psychotropic regulations
  Substances         updates            

  Universal Health   AMO Generalization Insurance expansion requirements
  Coverage           Laws               
  ------------------ ------------------ ---------------------------------

Appendix E: Glossary

  --------------- -------------------------------------------------------
  **Term**        **Definition**

  AMO             Assurance Maladie Obligatoire - Mandatory health
                  insurance

  CAPM            Centre Anti-Poison et de Pharmacovigilance du Maroc

  CNDP            Commission Nationale de Controle de la Protection des
                  Donnees

  CNOPS           Caisse Nationale des Organismes de Prevoyance Sociale

  CNSS            Caisse Nationale de Securite Sociale

  DCI             Denomination Commune Internationale (INN in English)

  DGI             Direction Generale des Impots

  DMP             Dossier Medical Partage - National health record

  GDP             Good Distribution Practice

  ICE             Identifiant Commun de l\'Entreprise

  PPM             Prix Public Maroc - Official drug price

  RAMED           Regime d\'Assistance Medicale - Low-income coverage

  TVA             Taxe sur la Valeur Ajoutee - Value added tax
  --------------- -------------------------------------------------------

Document Control

  ---------------------- ------------------------------------------------
  **Field**              **Value**

  Document Title         DAWA.ma V100 Master Specification

  Version                100.0

  Status                 Draft for Review

  Classification         CONFIDENTIAL

  Author                 FlowNexis3 / DAWA Team

  Created                January 2026

  Last Updated           January 2026

  Next Review            February 2026
  ---------------------- ------------------------------------------------

--- END OF DOCUMENT ---
