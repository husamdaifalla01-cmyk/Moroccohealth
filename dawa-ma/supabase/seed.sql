-- =====================================================
-- DAWA.ma Development Seed Data
-- For local development and testing only
-- =====================================================

-- Note: In production, PII would be encrypted. This seed uses plain values for development.

-- =====================================================
-- INSURANCE PROVIDERS
-- =====================================================

INSERT INTO insurance_providers (id, name, name_arabic, type, coverage_percentage, status) VALUES
('11111111-1111-1111-1111-111111111111', 'CNOPS', 'الصندوق الوطني لمنظمات الاحتياط الاجتماعي', 'amo', 80.00, 'active'),
('22222222-2222-2222-2222-222222222222', 'CNSS', 'الصندوق الوطني للضمان الاجتماعي', 'amo', 70.00, 'active'),
('33333333-3333-3333-3333-333333333333', 'RAMED', 'نظام المساعدة الطبية', 'ramed', 100.00, 'active'),
('44444444-4444-4444-4444-444444444444', 'Saham Assurance', 'سهام للتأمين', 'private', 80.00, 'active'),
('55555555-5555-5555-5555-555555555555', 'Wafa Assurance', 'وفا للتأمين', 'private', 75.00, 'active');

-- =====================================================
-- SAMPLE MEDICATIONS (Common in Morocco)
-- =====================================================

INSERT INTO medications (id, national_code, brand_name, brand_name_arabic, generic_name, form, strength, manufacturer, prescription_required, is_controlled_substance, reference_price, status, search_keywords) VALUES
-- Pain Relief / OTC
('med00001-0001-0001-0001-000000000001', 'MAR001', 'Doliprane', 'دوليبران', 'Paracetamol', 'tablet', '500mg', 'Sanofi', FALSE, FALSE, 15.00, 'active', ARRAY['paracetamol', 'douleur', 'fievre', 'pain', 'fever']),
('med00001-0001-0001-0001-000000000002', 'MAR002', 'Doliprane', 'دوليبران', 'Paracetamol', 'tablet', '1000mg', 'Sanofi', FALSE, FALSE, 25.00, 'active', ARRAY['paracetamol', 'douleur', 'fievre', 'pain', 'fever']),
('med00001-0001-0001-0001-000000000003', 'MAR003', 'Efferalgan', 'إيفيرالجان', 'Paracetamol', 'tablet', '500mg', 'UPSA', FALSE, FALSE, 18.00, 'active', ARRAY['paracetamol', 'effervescent', 'douleur']),
('med00001-0001-0001-0001-000000000004', 'MAR004', 'Advil', 'أدفيل', 'Ibuprofen', 'tablet', '400mg', 'Pfizer', FALSE, FALSE, 35.00, 'active', ARRAY['ibuprofen', 'anti-inflammatoire', 'douleur']),

-- Antibiotics (Prescription Required)
('med00002-0002-0002-0002-000000000001', 'MAR010', 'Augmentin', 'أوجمنتين', 'Amoxicillin/Clavulanic acid', 'tablet', '1g', 'GSK', TRUE, FALSE, 85.00, 'active', ARRAY['antibiotique', 'amoxicilline', 'infection']),
('med00002-0002-0002-0002-000000000002', 'MAR011', 'Clamoxyl', 'كلاموكسيل', 'Amoxicillin', 'capsule', '500mg', 'GSK', TRUE, FALSE, 45.00, 'active', ARRAY['antibiotique', 'amoxicilline', 'infection']),
('med00002-0002-0002-0002-000000000003', 'MAR012', 'Zithromax', 'زيثروماكس', 'Azithromycin', 'tablet', '500mg', 'Pfizer', TRUE, FALSE, 120.00, 'active', ARRAY['antibiotique', 'azithromycine', 'infection']),

-- Chronic Care - Diabetes
('med00003-0003-0003-0003-000000000001', 'MAR020', 'Glucophage', 'جلوكوفاج', 'Metformin', 'tablet', '500mg', 'Merck', TRUE, FALSE, 25.00, 'active', ARRAY['diabete', 'metformine', 'glycemie']),
('med00003-0003-0003-0003-000000000002', 'MAR021', 'Glucophage', 'جلوكوفاج', 'Metformin', 'tablet', '850mg', 'Merck', TRUE, FALSE, 35.00, 'active', ARRAY['diabete', 'metformine', 'glycemie']),
('med00003-0003-0003-0003-000000000003', 'MAR022', 'Diamicron', 'دياميكرون', 'Gliclazide', 'tablet', '30mg', 'Servier', TRUE, FALSE, 55.00, 'active', ARRAY['diabete', 'gliclazide', 'glycemie']),

-- Chronic Care - Hypertension
('med00004-0004-0004-0004-000000000001', 'MAR030', 'Amlor', 'أملور', 'Amlodipine', 'capsule', '5mg', 'Pfizer', TRUE, FALSE, 45.00, 'active', ARRAY['hypertension', 'amlodipine', 'tension']),
('med00004-0004-0004-0004-000000000002', 'MAR031', 'Triatec', 'ترياتك', 'Ramipril', 'tablet', '5mg', 'Sanofi', TRUE, FALSE, 65.00, 'active', ARRAY['hypertension', 'ramipril', 'tension']),
('med00004-0004-0004-0004-000000000003', 'MAR032', 'Coversyl', 'كوفرسيل', 'Perindopril', 'tablet', '5mg', 'Servier', TRUE, FALSE, 75.00, 'active', ARRAY['hypertension', 'perindopril', 'tension']),

-- Allergies
('med00005-0005-0005-0005-000000000001', 'MAR040', 'Aerius', 'إيريوس', 'Desloratadine', 'tablet', '5mg', 'MSD', FALSE, FALSE, 65.00, 'active', ARRAY['allergie', 'antihistaminique', 'desloratadine']),
('med00005-0005-0005-0005-000000000002', 'MAR041', 'Zyrtec', 'زيرتك', 'Cetirizine', 'tablet', '10mg', 'UCB', FALSE, FALSE, 55.00, 'active', ARRAY['allergie', 'antihistaminique', 'cetirizine']),

-- Gastrointestinal
('med00006-0006-0006-0006-000000000001', 'MAR050', 'Mopral', 'موبرال', 'Omeprazole', 'capsule', '20mg', 'AstraZeneca', TRUE, FALSE, 75.00, 'active', ARRAY['gastrique', 'omeprazole', 'acidite']),
('med00006-0006-0006-0006-000000000002', 'MAR051', 'Gaviscon', 'جافيسكون', 'Sodium alginate', 'suspension', '250ml', 'Reckitt', FALSE, FALSE, 55.00, 'active', ARRAY['gastrique', 'reflux', 'acidite']),

-- Vitamins (OTC)
('med00007-0007-0007-0007-000000000001', 'MAR060', 'Supradyn', 'سوبرادين', 'Multivitamins', 'tablet', '', 'Bayer', FALSE, FALSE, 95.00, 'active', ARRAY['vitamines', 'multivitamines', 'energie']),
('med00007-0007-0007-0007-000000000002', 'MAR061', 'Berocca', 'بيروكا', 'B Vitamins + Zinc', 'tablet', '', 'Bayer', FALSE, FALSE, 85.00, 'active', ARRAY['vitamines', 'vitamine b', 'energie']),

-- CONTROLLED SUBSTANCES - BLOCKED ON PLATFORM
('med00099-0099-0099-0099-000000000001', 'MAR999', 'Tramadol', 'ترامادول', 'Tramadol', 'capsule', '50mg', 'Various', TRUE, TRUE, 45.00, 'active', ARRAY['tramadol', 'douleur']),
('med00099-0099-0099-0099-000000000002', 'MAR998', 'Valium', 'فاليوم', 'Diazepam', 'tablet', '5mg', 'Roche', TRUE, TRUE, 35.00, 'active', ARRAY['diazepam', 'anxiete']);

-- =====================================================
-- SAMPLE PHARMACIES (Casablanca area)
-- =====================================================

INSERT INTO pharmacies (id, name, license_number, license_verified, address_line_1, city, region, postal_code, location, phone_primary, email, operating_hours, is_24_hour, delivery_radius_km, status) VALUES
(
    'pharm001-0001-0001-0001-000000000001',
    'Pharmacie Al Amal',
    'PPB123456',
    TRUE,
    '123 Boulevard Mohammed V',
    'Casablanca',
    'Casablanca-Settat',
    '20000',
    ST_SetSRID(ST_MakePoint(-7.6114, 33.5883), 4326)::geography,
    '+212522123456',
    'alamal@pharmacy.ma',
    '{"mon": {"open": "08:00", "close": "20:00"}, "tue": {"open": "08:00", "close": "20:00"}, "wed": {"open": "08:00", "close": "20:00"}, "thu": {"open": "08:00", "close": "20:00"}, "fri": {"open": "08:00", "close": "12:30", "close2": "14:30", "close": "20:00"}, "sat": {"open": "08:00", "close": "13:00"}, "sun": {"closed": true}}',
    FALSE,
    5,
    'active'
),
(
    'pharm001-0001-0001-0001-000000000002',
    'Pharmacie de Nuit Maarif',
    'PPB234567',
    TRUE,
    '45 Rue de Paris, Maarif',
    'Casablanca',
    'Casablanca-Settat',
    '20100',
    ST_SetSRID(ST_MakePoint(-7.6369, 33.5731), 4326)::geography,
    '+212522234567',
    'maarif@pharmacy.ma',
    '{"mon": {"open": "00:00", "close": "23:59"}, "tue": {"open": "00:00", "close": "23:59"}, "wed": {"open": "00:00", "close": "23:59"}, "thu": {"open": "00:00", "close": "23:59"}, "fri": {"open": "00:00", "close": "23:59"}, "sat": {"open": "00:00", "close": "23:59"}, "sun": {"open": "00:00", "close": "23:59"}}',
    TRUE,
    7,
    'active'
),
(
    'pharm001-0001-0001-0001-000000000003',
    'Pharmacie Ibn Sina',
    'PPB345678',
    TRUE,
    '78 Avenue Hassan II, Ain Diab',
    'Casablanca',
    'Casablanca-Settat',
    '20150',
    ST_SetSRID(ST_MakePoint(-7.6689, 33.5931), 4326)::geography,
    '+212522345678',
    'ibnsina@pharmacy.ma',
    '{"mon": {"open": "08:30", "close": "21:00"}, "tue": {"open": "08:30", "close": "21:00"}, "wed": {"open": "08:30", "close": "21:00"}, "thu": {"open": "08:30", "close": "21:00"}, "fri": {"open": "08:30", "close": "12:30", "close2": "15:00", "close": "21:00"}, "sat": {"open": "09:00", "close": "14:00"}, "sun": {"closed": true}}',
    FALSE,
    5,
    'active'
);

-- =====================================================
-- SAMPLE INVENTORY
-- =====================================================

INSERT INTO pharmacy_inventory (pharmacy_id, medication_id, quantity_available, price, is_available) VALUES
-- Pharmacy Al Amal inventory
('pharm001-0001-0001-0001-000000000001', 'med00001-0001-0001-0001-000000000001', 100, 15.00, TRUE),
('pharm001-0001-0001-0001-000000000001', 'med00001-0001-0001-0001-000000000002', 80, 25.00, TRUE),
('pharm001-0001-0001-0001-000000000001', 'med00001-0001-0001-0001-000000000004', 50, 35.00, TRUE),
('pharm001-0001-0001-0001-000000000001', 'med00002-0002-0002-0002-000000000001', 30, 85.00, TRUE),
('pharm001-0001-0001-0001-000000000001', 'med00003-0003-0003-0003-000000000001', 40, 25.00, TRUE),
('pharm001-0001-0001-0001-000000000001', 'med00004-0004-0004-0004-000000000001', 35, 45.00, TRUE),
('pharm001-0001-0001-0001-000000000001', 'med00005-0005-0005-0005-000000000001', 60, 65.00, TRUE),
('pharm001-0001-0001-0001-000000000001', 'med00007-0007-0007-0007-000000000001', 25, 95.00, TRUE),

-- Pharmacy Maarif inventory
('pharm001-0001-0001-0001-000000000002', 'med00001-0001-0001-0001-000000000001', 150, 15.00, TRUE),
('pharm001-0001-0001-0001-000000000002', 'med00001-0001-0001-0001-000000000002', 120, 25.00, TRUE),
('pharm001-0001-0001-0001-000000000002', 'med00002-0002-0002-0002-000000000001', 45, 85.00, TRUE),
('pharm001-0001-0001-0001-000000000002', 'med00002-0002-0002-0002-000000000002', 40, 45.00, TRUE),
('pharm001-0001-0001-0001-000000000002', 'med00003-0003-0003-0003-000000000001', 60, 25.00, TRUE),
('pharm001-0001-0001-0001-000000000002', 'med00003-0003-0003-0003-000000000002', 50, 35.00, TRUE),
('pharm001-0001-0001-0001-000000000002', 'med00006-0006-0006-0006-000000000001', 30, 75.00, TRUE),

-- Pharmacy Ibn Sina inventory
('pharm001-0001-0001-0001-000000000003', 'med00001-0001-0001-0001-000000000001', 80, 16.00, TRUE),
('pharm001-0001-0001-0001-000000000003', 'med00001-0001-0001-0001-000000000003', 70, 18.00, TRUE),
('pharm001-0001-0001-0001-000000000003', 'med00004-0004-0004-0004-000000000002', 25, 65.00, TRUE),
('pharm001-0001-0001-0001-000000000003', 'med00004-0004-0004-0004-000000000003', 20, 75.00, TRUE),
('pharm001-0001-0001-0001-000000000003', 'med00005-0005-0005-0005-000000000002', 45, 55.00, TRUE),
('pharm001-0001-0001-0001-000000000003', 'med00007-0007-0007-0007-000000000002', 30, 85.00, TRUE);

-- =====================================================
-- NOTE: Test patients, orders, prescriptions should be
-- created through the application to properly handle
-- encryption and authentication.
-- =====================================================
