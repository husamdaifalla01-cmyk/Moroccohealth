// ==============================================
// DAWA.ma Zod Validation Schemas
// All external data must be validated
// ==============================================

import { z } from 'zod';
import {
  MOROCCO_PHONE_REGEX,
  MOROCCO_CIN_REGEX,
  PHARMACY_LICENSE_REGEX,
  PHARMACIST_LICENSE_REGEX,
  ALL_CONTROLLED_SUBSTANCES,
  ORDER_LIMITS,
  FILE_LIMITS,
  RATING_SCALE,
} from '../constants';

// ==============================================
// Common Validators
// ==============================================

export const UUIDSchema = z.string().uuid();

export const PhoneSchema = z
  .string()
  .regex(MOROCCO_PHONE_REGEX, 'Invalid Moroccan phone number format');

export const EmailSchema = z.string().email('Invalid email format').optional();

export const CINSchema = z
  .string()
  .regex(MOROCCO_CIN_REGEX, 'Invalid CIN format')
  .optional();

export const LanguageSchema = z.enum(['fr', 'ar', 'ber']);

export const GeoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// ==============================================
// Auth Schemas
// ==============================================

export const SendOTPSchema = z.object({
  phone: PhoneSchema,
  language: LanguageSchema.optional().default('fr'),
});

export const VerifyOTPSchema = z.object({
  phone: PhoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ==============================================
// Patient Schemas
// ==============================================

export const PatientProfileSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  nationalId: CINSchema,
  language: LanguageSchema.optional(),
  notificationPreferences: z
    .object({
      sms: z.boolean(),
      push: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
});

export const UpdatePatientProfileSchema = PatientProfileSchema.partial();

export const ConsentSchema = z.object({
  consentDataProcessing: z.boolean(),
  consentMarketing: z.boolean().optional(),
  consentVersion: z.string(),
});

// ==============================================
// Address Schemas
// ==============================================

export const AddressSchema = z.object({
  label: z.string().max(50).optional(),
  addressLine1: z.string().min(5).max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(2).max(100),
  region: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional(),
  location: GeoPointSchema.optional(),
  deliveryInstructions: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export const UpdateAddressSchema = AddressSchema.partial();

// ==============================================
// Prescription Schemas
// ==============================================

export const PrescriptionUploadSchema = z.object({
  imageBase64: z.string().min(1, 'Image is required'),
  uploadType: z.enum(['camera', 'gallery', 'document']),
  doctorName: z.string().max(255).optional(),
  doctorLicenseNumber: z.string().max(100).optional(),
  clinicHospital: z.string().max(255).optional(),
  prescriptionDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const PrescriptionVerificationSchema = z.object({
  prescriptionId: UUIDSchema,
  status: z.enum(['verified', 'rejected']),
  verificationNotes: z.string().max(1000).optional(),
  rejectionReason: z.string().max(255).optional(),
  containsControlledSubstance: z.boolean().optional(),
  requiresSpecialHandling: z.boolean().optional(),
  validUntil: z.string().optional(),
  refillsRemaining: z.number().int().min(0).max(12).optional(),
});

// ==============================================
// Order Schemas
// ==============================================

export const OrderItemSchema = z.object({
  medicationId: UUIDSchema.optional(),
  productName: z.string().min(1).max(255),
  productNameArabic: z.string().max(255).optional(),
  dosage: z.string().max(100).optional(),
  form: z.string().max(100).optional(),
  manufacturer: z.string().max(255).optional(),
  quantity: z.number().int().min(1).max(100),
  unit: z.string().max(50).optional().default('unit'),
  fromPrescription: z.boolean().optional().default(false),
  unitPrice: z.number().min(0),
});

export const CreateOrderSchema = z
  .object({
    prescriptionId: UUIDSchema.optional(),
    orderType: z.enum(['prescription', 'otc', 'mixed']),
    deliveryAddressId: UUIDSchema,
    pharmacyId: UUIDSchema.optional(), // Optional - auto-assign if not provided
    isScheduled: z.boolean().optional().default(false),
    scheduledDate: z.string().optional(),
    scheduledTimeSlot: z.enum(['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']).optional(),
    items: z.array(OrderItemSchema).min(1).max(ORDER_LIMITS.MAX_ITEMS_PER_ORDER),
    paymentMethod: z.enum(['cash', 'card', 'insurance', 'wallet']),
    patientNotes: z.string().max(1000).optional(),
    discountCode: z.string().max(50).optional(),
    insuranceClaimRequested: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.isScheduled) {
        return data.scheduledDate && data.scheduledTimeSlot;
      }
      return true;
    },
    {
      message: 'Scheduled orders require date and time slot',
      path: ['scheduledDate'],
    }
  )
  .refine(
    (data) => {
      if (data.orderType === 'prescription') {
        return !!data.prescriptionId;
      }
      return true;
    },
    {
      message: 'Prescription orders require a prescription ID',
      path: ['prescriptionId'],
    }
  );

export const OrderSubstitutionSchema = z.object({
  orderId: UUIDSchema,
  itemId: UUIDSchema,
  newProductName: z.string().min(1).max(255),
  newUnitPrice: z.number().min(0),
  substitutionReason: z.string().max(255),
});

export const CancelOrderSchema = z.object({
  orderId: UUIDSchema,
  cancellationReason: z.string().min(5).max(255),
});

export const RateOrderSchema = z.object({
  orderId: UUIDSchema,
  pharmacyRating: z.number().int().min(RATING_SCALE.MIN).max(RATING_SCALE.MAX).optional(),
  courierRating: z.number().int().min(RATING_SCALE.MIN).max(RATING_SCALE.MAX).optional(),
  comment: z.string().max(1000).optional(),
});

// ==============================================
// Pharmacy Schemas
// ==============================================

export const PharmacyLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const PharmacyOnboardingSchema = z.object({
  name: z.string().min(2).max(255),
  licenseNumber: z.string().regex(PHARMACY_LICENSE_REGEX, 'Invalid pharmacy license format'),
  addressLine1: z.string().min(5).max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(2).max(100),
  region: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional(),
  location: GeoPointSchema,
  phonePrimary: PhoneSchema,
  phoneSecondary: PhoneSchema.optional(),
  email: z.string().email(),
  whatsapp: PhoneSchema.optional(),
  operatingHours: z.record(
    z.object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
      closed: z.boolean().optional(),
    })
  ),
  is24Hour: z.boolean().optional().default(false),
  hasColdStorage: z.boolean().optional().default(false),
  deliveryRadiusKm: z.number().int().min(1).max(50).optional().default(5),
});

export const UpdatePharmacySettingsSchema = z.object({
  operatingHours: z.record(z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/),
    close: z.string().regex(/^\d{2}:\d{2}$/),
    closed: z.boolean().optional(),
  })).optional(),
  is24Hour: z.boolean().optional(),
  hasColdStorage: z.boolean().optional(),
  deliveryRadiusKm: z.number().int().min(1).max(50).optional(),
  averagePreparationTimeMinutes: z.number().int().min(5).max(120).optional(),
});

// ==============================================
// Inventory Schemas
// ==============================================

export const InventoryItemSchema = z.object({
  medicationId: UUIDSchema,
  quantityAvailable: z.number().int().min(0),
  price: z.number().min(0),
  reorderLevel: z.number().int().min(0).optional().default(10),
  batchNumber: z.string().max(100).optional(),
  expiryDate: z.string().optional(),
});

export const UpdateInventorySchema = z.object({
  quantityAvailable: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

// ==============================================
// Courier Schemas
// ==============================================

export const CourierOnboardingSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  phone: PhoneSchema,
  email: EmailSchema,
  nationalId: z.string().regex(MOROCCO_CIN_REGEX, 'Invalid CIN format'),
  dateOfBirth: z.string(),
  vehicleType: z.enum(['motorcycle', 'car', 'bicycle']),
  vehicleRegistration: z.string().max(50).optional(),
  serviceAreas: z.array(z.string()).min(1),
});

export const CourierDocumentsSchema = z.object({
  nationalIdFront: z.string(), // Base64
  nationalIdBack: z.string(), // Base64
  photo: z.string(), // Base64
  vehicleRegistration: z.string().optional(), // Base64
  vehicleInsurance: z.string().optional(), // Base64
});

export const CourierLocationUpdateSchema = z.object({
  location: GeoPointSchema,
});

export const CourierStatusSchema = z.object({
  isOnline: z.boolean(),
});

export const DeliveryConfirmationSchema = z.object({
  orderId: UUIDSchema,
  verificationType: z.enum(['otp', 'photo', 'signature']),
  otp: z.string().length(4).regex(/^\d{4}$/).optional(),
  photoBase64: z.string().optional(),
  signatureBase64: z.string().optional(),
  recipientName: z.string().max(255).optional(),
});

// ==============================================
// Chronic Care Schemas
// ==============================================

export const ChronicCareProgramSchema = z.object({
  conditionName: z.string().min(2).max(255),
  icd10Code: z.string().max(20).optional(),
  medications: z.array(
    z.object({
      medicationId: UUIDSchema,
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1),
  refillFrequencyDays: z.number().int().min(7).max(90),
  autoRefillEnabled: z.boolean().optional().default(false),
  preferredPharmacyId: UUIDSchema.optional(),
  prescribingDoctorName: z.string().max(255).optional(),
  prescriptionValidUntil: z.string().optional(),
});

// ==============================================
// Medication Reminder Schemas
// ==============================================

export const MedicationReminderSchema = z.object({
  chronicCareProgramId: UUIDSchema.optional(),
  medicationName: z.string().min(1).max(255),
  dosage: z.string().max(100).optional(),
  instructions: z.string().max(500).optional(),
  reminderTimes: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1).max(10),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  notificationType: z.enum(['push', 'sms', 'both']).optional().default('push'),
  snoozeMinutes: z.number().int().min(5).max(60).optional().default(15),
});

// ==============================================
// Chat Schemas
// ==============================================

export const StartChatSessionSchema = z.object({
  orderId: UUIDSchema.optional(),
  sessionType: z.enum(['order_support', 'medication_question', 'general']),
});

export const SendMessageSchema = z.object({
  sessionId: UUIDSchema,
  content: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'file']).optional().default('text'),
  attachmentBase64: z.string().optional(),
});

// ==============================================
// Search Schemas
// ==============================================

export const MedicationSearchSchema = z.object({
  query: z.string().min(2).max(100),
  limit: z.number().int().min(1).max(50).optional().default(20),
  prescriptionRequired: z.boolean().optional(),
});

export const PharmacySearchSchema = z.object({
  location: GeoPointSchema,
  radiusKm: z.number().min(1).max(50).optional().default(5),
  is24Hour: z.boolean().optional(),
  isPharmacieDeGarde: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

// ==============================================
// Admin Schemas
// ==============================================

export const AdminVerificationSchema = z.object({
  entityId: UUIDSchema,
  entityType: z.enum(['pharmacy', 'courier']),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const DataAccessRequestSchema = z.object({
  requestType: z.enum(['access', 'correction', 'deletion', 'portability']),
  requestDetails: z.string().max(2000).optional(),
});

// ==============================================
// Utility: Controlled Substance Check
// ==============================================

export const isControlledSubstance = (medicationName: string): boolean => {
  const normalizedName = medicationName.toLowerCase().trim();
  return ALL_CONTROLLED_SUBSTANCES.some(
    (substance) => normalizedName.includes(substance.toLowerCase())
  );
};

// ==============================================
// Export validation error formatter
// ==============================================

export const formatZodErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }
  return errors;
};
