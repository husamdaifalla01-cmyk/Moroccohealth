// ==============================================
// DAWA.ma Constants
// Morocco-specific configuration values
// ==============================================

// Currency
export const CURRENCY = 'MAD';
export const CURRENCY_SYMBOL = 'DH';

// Default commission rate (5%)
export const DEFAULT_COMMISSION_RATE = 0.05;

// Delivery fees (in MAD)
export const DELIVERY_FEES = {
  BASE_FEE: 15,
  PER_KM_FEE: 3,
  MIN_FEE: 15,
  MAX_FEE: 50,
  EXPRESS_MULTIPLIER: 1.5,
  NIGHT_MULTIPLIER: 1.3,
} as const;

// Service fees
export const SERVICE_FEES = {
  PLATFORM_FEE_PERCENTAGE: 0.02, // 2% platform fee
  MIN_PLATFORM_FEE: 2, // Minimum 2 MAD
  MAX_PLATFORM_FEE: 20, // Maximum 20 MAD
} as const;

// Order limits
export const ORDER_LIMITS = {
  MIN_ORDER_AMOUNT: 20, // 20 MAD minimum
  MAX_ORDER_AMOUNT: 10000, // 10,000 MAD maximum
  MAX_ITEMS_PER_ORDER: 50,
} as const;

// Time slots for scheduled delivery
export const TIME_SLOTS = [
  { id: '09:00-12:00', label: '09:00 - 12:00', labelAr: '09:00 - 12:00' },
  { id: '12:00-15:00', label: '12:00 - 15:00', labelAr: '12:00 - 15:00' },
  { id: '15:00-18:00', label: '15:00 - 18:00', labelAr: '15:00 - 18:00' },
  { id: '18:00-21:00', label: '18:00 - 21:00', labelAr: '18:00 - 21:00' },
] as const;

// Languages
export const LANGUAGES = {
  FR: 'fr',
  AR: 'ar',
  BER: 'ber',
} as const;

export const LANGUAGE_NAMES = {
  fr: 'Français',
  ar: 'العربية',
  ber: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
} as const;

export const DEFAULT_LANGUAGE = 'fr';

// Morocco regions
export const MOROCCO_REGIONS = [
  'Tanger-Tétouan-Al Hoceïma',
  'Oriental',
  'Fès-Meknès',
  'Rabat-Salé-Kénitra',
  'Béni Mellal-Khénifra',
  'Casablanca-Settat',
  'Marrakech-Safi',
  'Drâa-Tafilalet',
  'Souss-Massa',
  'Guelmim-Oued Noun',
  'Laâyoune-Sakia El Hamra',
  'Dakhla-Oued Ed-Dahab',
] as const;

// Major cities
export const MAJOR_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
] as const;

// Phone number validation (Morocco)
export const MOROCCO_PHONE_REGEX = /^(?:\+212|0)([5-7])\d{8}$/;
export const MOROCCO_PHONE_PREFIX = '+212';

// National ID (CIN) validation
export const MOROCCO_CIN_REGEX = /^[A-Z]{1,2}\d{5,6}$/;

// Pharmacy license validation
export const PHARMACY_LICENSE_REGEX = /^PPB\d{6}$/;

// Pharmacist license validation
export const PHARMACIST_LICENSE_REGEX = /^PH\d{6}$/;

// CONTROLLED SUBSTANCES - HARD BLOCK
// These substances are NEVER allowed on the platform per Law 17-04
export const CONTROLLED_SUBSTANCES = {
  // Narcotics (Schedule I)
  NARCOTICS: [
    'morphine',
    'codeine',
    'fentanyl',
    'tramadol',
    'oxycodone',
    'hydrocodone',
    'methadone',
    'pethidine',
    'buprenorphine',
  ],
  // Psychotropics (Schedule II-IV)
  PSYCHOTROPICS: [
    'diazepam',
    'alprazolam',
    'lorazepam',
    'clonazepam',
    'bromazepam',
    'zolpidem',
    'zopiclone',
    'phenobarbital',
    'methylphenidate',
    'amphetamine',
  ],
  // Other controlled
  OTHER: [
    'ketamine',
    'pregabalin',
    'gabapentin',
  ],
} as const;

// All controlled substances flat list for quick lookup
export const ALL_CONTROLLED_SUBSTANCES = [
  ...CONTROLLED_SUBSTANCES.NARCOTICS,
  ...CONTROLLED_SUBSTANCES.PSYCHOTROPICS,
  ...CONTROLLED_SUBSTANCES.OTHER,
] as const;

// OTC categories that don't require prescription
export const OTC_CATEGORIES = [
  'pain_relief',
  'cold_flu',
  'allergies',
  'digestive',
  'vitamins',
  'first_aid',
  'skincare',
  'oral_care',
  'eye_care',
] as const;

// Medication forms
export const MEDICATION_FORMS = [
  { id: 'tablet', label: 'Comprimé', labelAr: 'قرص' },
  { id: 'capsule', label: 'Gélule', labelAr: 'كبسولة' },
  { id: 'syrup', label: 'Sirop', labelAr: 'شراب' },
  { id: 'injection', label: 'Injection', labelAr: 'حقنة' },
  { id: 'cream', label: 'Crème', labelAr: 'كريم' },
  { id: 'ointment', label: 'Pommade', labelAr: 'مرهم' },
  { id: 'gel', label: 'Gel', labelAr: 'جل' },
  { id: 'drops', label: 'Gouttes', labelAr: 'قطرات' },
  { id: 'spray', label: 'Spray', labelAr: 'بخاخ' },
  { id: 'suppository', label: 'Suppositoire', labelAr: 'تحميلة' },
  { id: 'patch', label: 'Patch', labelAr: 'لصقة' },
  { id: 'inhaler', label: 'Inhalateur', labelAr: 'جهاز استنشاق' },
] as const;

// Order status flow
export const ORDER_STATUS_FLOW = {
  pending: ['pharmacy_search', 'cancelled'],
  pharmacy_search: ['pharmacy_assigned', 'cancelled'],
  pharmacy_assigned: ['pharmacist_review', 'rejected'],
  pharmacist_review: ['preparing', 'rejected'],
  preparing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['courier_assigned', 'cancelled'],
  courier_assigned: ['picked_up', 'cancelled'],
  picked_up: ['in_transit'],
  in_transit: ['delivered', 'failed'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
  rejected: [],
  failed: [],
} as const;

// Status labels
export const ORDER_STATUS_LABELS = {
  pending: { fr: 'En attente', ar: 'قيد الانتظار' },
  pharmacy_search: { fr: 'Recherche de pharmacie', ar: 'البحث عن صيدلية' },
  pharmacy_assigned: { fr: 'Pharmacie assignée', ar: 'تم تعيين الصيدلية' },
  pharmacist_review: { fr: 'Vérification en cours', ar: 'جاري التحقق' },
  preparing: { fr: 'En préparation', ar: 'قيد التحضير' },
  ready_for_pickup: { fr: 'Prêt pour le retrait', ar: 'جاهز للاستلام' },
  courier_assigned: { fr: 'Livreur assigné', ar: 'تم تعيين المندوب' },
  picked_up: { fr: 'Récupéré', ar: 'تم الاستلام' },
  in_transit: { fr: 'En cours de livraison', ar: 'قيد التوصيل' },
  delivered: { fr: 'Livré', ar: 'تم التوصيل' },
  completed: { fr: 'Terminé', ar: 'مكتمل' },
  cancelled: { fr: 'Annulé', ar: 'ملغي' },
  rejected: { fr: 'Refusé', ar: 'مرفوض' },
  failed: { fr: 'Échec', ar: 'فشل' },
} as const;

// Prescription validity (days)
export const PRESCRIPTION_VALIDITY_DAYS = 30;

// Chronic care refill frequency options
export const REFILL_FREQUENCIES = [
  { days: 7, label: 'Hebdomadaire', labelAr: 'أسبوعي' },
  { days: 14, label: 'Bi-hebdomadaire', labelAr: 'كل أسبوعين' },
  { days: 30, label: 'Mensuel', labelAr: 'شهري' },
  { days: 60, label: 'Bi-mensuel', labelAr: 'كل شهرين' },
  { days: 90, label: 'Trimestriel', labelAr: 'كل ثلاثة أشهر' },
] as const;

// Delivery radius options (km)
export const DELIVERY_RADIUS_OPTIONS = [3, 5, 7, 10, 15, 20] as const;

// Rating scale
export const RATING_SCALE = {
  MIN: 1,
  MAX: 5,
} as const;

// API pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_PRESCRIPTION_SIZE_MB: 10,
  MAX_DOCUMENT_SIZE_MB: 5,
  MAX_PHOTO_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
} as const;

// Session/token expiry
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN_HOURS: 24,
  REFRESH_TOKEN_DAYS: 30,
  OTP_MINUTES: 5,
} as const;

// Courier earnings
export const COURIER_EARNINGS = {
  BASE_PER_DELIVERY: 15, // 15 MAD base
  PER_KM: 2, // 2 MAD per km
  BONUS_THRESHOLD: 20, // Bonus after 20 deliveries/day
  BONUS_AMOUNT: 50, // 50 MAD bonus
} as const;

// Training modules for couriers
export const COURIER_TRAINING_MODULES = [
  { id: 'medication_handling', label: 'Manipulation des médicaments', required: true },
  { id: 'delivery_protocol', label: 'Protocole de livraison', required: true },
  { id: 'privacy_rules', label: 'Règles de confidentialité', required: true },
  { id: 'emergency_procedures', label: 'Procédures d\'urgence', required: true },
  { id: 'first_aid', label: 'Premiers secours', required: false },
  { id: 'customer_service', label: 'Service client', required: false },
] as const;

// CNDP consent versions
export const CONSENT_VERSIONS = {
  DATA_PROCESSING: '1.0',
  MARKETING: '1.0',
  INSURANCE_SHARING: '1.0',
} as const;

// Audit log retention (7 years per CNDP)
export const AUDIT_LOG_RETENTION_YEARS = 7;
