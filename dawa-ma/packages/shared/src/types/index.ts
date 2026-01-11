// ==============================================
// DAWA.ma Core Type Definitions
// Based on FHIR resource naming conventions
// ==============================================

// Base types
export type UUID = string;
export type ISO8601DateTime = string;
export type ISO8601Date = string;

// Enums
export type Language = 'fr' | 'ar' | 'ber';

export type PatientStatus = 'active' | 'suspended' | 'deleted';

export type PharmacyStatus = 'pending' | 'active' | 'suspended' | 'closed';

export type CourierStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export type CourierEmploymentType = 'employee' | 'contractor';

export type VehicleType = 'motorcycle' | 'car' | 'bicycle';

export type PrescriptionVerificationStatus =
  | 'pending'
  | 'pharmacist_review'
  | 'verified'
  | 'rejected'
  | 'flagged';

export type OrderType = 'prescription' | 'otc' | 'mixed';

export type OrderStatus =
  | 'pending'
  | 'pharmacy_search'
  | 'pharmacy_assigned'
  | 'pharmacist_review'
  | 'preparing'
  | 'ready_for_pickup'
  | 'courier_assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'failed';

export type PaymentMethod = 'cash' | 'card' | 'insurance' | 'wallet';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export type DeliveryVerificationType = 'signature' | 'otp' | 'photo';

export type TimeSlot = '09:00-12:00' | '12:00-15:00' | '15:00-18:00' | '18:00-21:00';

export type InsuranceType = 'private' | 'amo' | 'ramed' | 'mutuelle';

export type InsuranceClaimStatus =
  | 'pending'
  | 'submitted'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'paid';

export type ChatSessionType = 'order_support' | 'medication_question' | 'general';

export type ChatSessionStatus = 'active' | 'resolved' | 'escalated';

export type MessageType = 'text' | 'image' | 'file' | 'system';

export type SenderType = 'patient' | 'pharmacist' | 'system';

export type UserType = 'patient' | 'pharmacist' | 'courier' | 'admin' | 'system';

export type DataRequestType = 'access' | 'correction' | 'deletion' | 'portability';

export type ConsentType = 'data_processing' | 'marketing' | 'insurance_sharing';

// Notification preferences
export interface NotificationPreferences {
  sms: boolean;
  push: boolean;
  email: boolean;
}

// Operating hours structure
export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface OperatingHours {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
}

// Geographic point
export interface GeoPoint {
  lat: number;
  lng: number;
}

// Patient
export interface Patient {
  id: UUID;
  phone: string;
  phoneVerified: boolean;
  email?: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  nationalId?: string;
  defaultAddressId?: UUID;
  insuranceProviderId?: UUID;
  insuranceMemberId?: string;
  ramedBeneficiary: boolean;
  language: Language;
  notificationPreferences: NotificationPreferences;
  consentDataProcessing: boolean;
  consentDataProcessingDate?: ISO8601DateTime;
  consentMarketing: boolean;
  consentMarketingDate?: ISO8601DateTime;
  consentVersion?: string;
  status: PatientStatus;
  deletedAt?: ISO8601DateTime;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Address
export interface Address {
  id: UUID;
  patientId: UUID;
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  location?: GeoPoint;
  deliveryInstructions?: string;
  isDefault: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Pharmacy
export interface Pharmacy {
  id: UUID;
  name: string;
  licenseNumber: string;
  licenseVerified: boolean;
  licenseExpiryDate?: ISO8601Date;
  ownerPharmacistId?: UUID;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  location?: GeoPoint;
  phonePrimary: string;
  phoneSecondary?: string;
  email?: string;
  whatsapp?: string;
  operatingHours: OperatingHours;
  is24Hour: boolean;
  isPharmacieDeGarde: boolean;
  gardeSchedule?: Record<string, unknown>;
  acceptsPrescriptions: boolean;
  acceptsOtc: boolean;
  acceptsCosmetics: boolean;
  hasColdStorage: boolean;
  deliveryRadiusKm: number;
  averagePreparationTimeMinutes: number;
  commissionRate: number;
  ratingAverage: number;
  ratingCount: number;
  orderCount: number;
  fulfillmentRate: number;
  status: PharmacyStatus;
  onboardingCompletedAt?: ISO8601DateTime;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Pharmacist
export interface Pharmacist {
  id: UUID;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseVerified: boolean;
  licenseExpiryDate?: ISO8601Date;
  specializations?: string[];
  primaryPharmacyId?: UUID;
  isOwner: boolean;
  isAvailableForChat: boolean;
  chatLanguages: Language[];
  status: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Courier
export interface Courier {
  id: UUID;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  nationalId: string;
  dateOfBirth: ISO8601Date;
  photoUrl?: string;
  employmentType: CourierEmploymentType;
  cnssNumber?: string;
  contractorRegistration?: string;
  vehicleType: VehicleType;
  vehicleRegistration?: string;
  vehicleInsuranceExpiry?: ISO8601Date;
  medicalCourierTrainingCompleted: boolean;
  trainingCompletionDate?: ISO8601Date;
  trainingCertificateUrl?: string;
  firstAidCertified: boolean;
  serviceAreas?: string[];
  currentLocation?: GeoPoint;
  locationUpdatedAt?: ISO8601DateTime;
  isOnline: boolean;
  currentOrderId?: UUID;
  ratingAverage: number;
  ratingCount: number;
  deliveryCount: number;
  onTimeRate: number;
  earningsBalance: number;
  status: CourierStatus;
  backgroundCheckStatus: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Prescription
export interface Prescription {
  id: UUID;
  patientId: UUID;
  imageUrl: string;
  imageHash: string;
  uploadType: 'camera' | 'gallery' | 'document';
  doctorName?: string;
  doctorLicenseNumber?: string;
  clinicHospital?: string;
  prescriptionDate?: ISO8601Date;
  verificationStatus: PrescriptionVerificationStatus;
  verifiedByPharmacistId?: UUID;
  verifiedAt?: ISO8601DateTime;
  verificationNotes?: string;
  rejectionReason?: string;
  containsControlledSubstance: boolean;
  requiresSpecialHandling: boolean;
  isChronicRefill: boolean;
  parentPrescriptionId?: UUID;
  validUntil?: ISO8601Date;
  refillsRemaining: number;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Order
export interface Order {
  id: UUID;
  orderNumber: string;
  patientId: UUID;
  prescriptionId?: UUID;
  pharmacyId?: UUID;
  courierId?: UUID;
  orderType: OrderType;
  deliveryAddressId: UUID;
  deliveryLocation?: GeoPoint;
  isScheduled: boolean;
  scheduledDate?: ISO8601Date;
  scheduledTimeSlot?: TimeSlot;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  pharmacyAcceptedAt?: ISO8601DateTime;
  pharmacistReviewedAt?: ISO8601DateTime;
  preparationStartedAt?: ISO8601DateTime;
  readyForPickupAt?: ISO8601DateTime;
  courierAssignedAt?: ISO8601DateTime;
  pickedUpAt?: ISO8601DateTime;
  deliveredAt?: ISO8601DateTime;
  deliveryVerificationType?: DeliveryVerificationType;
  deliveryOtpHash?: string;
  deliverySignatureUrl?: string;
  deliveryPhotoUrl?: string;
  recipientName?: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount: number;
  discountCode?: string;
  totalAmount: number;
  insuranceClaimId?: UUID;
  insuranceCoveredAmount: number;
  patientCopayAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  paidAt?: ISO8601DateTime;
  patientNotes?: string;
  pharmacyNotes?: string;
  courierNotes?: string;
  cancelledBy?: UserType;
  cancellationReason?: string;
  cancelledAt?: ISO8601DateTime;
  patientRatingPharmacy?: number;
  patientRatingCourier?: number;
  patientRatingComment?: string;
  ratedAt?: ISO8601DateTime;
  estimatedPreparationMinutes?: number;
  actualPreparationMinutes?: number;
  estimatedDeliveryMinutes?: number;
  actualDeliveryMinutes?: number;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  timestamp: ISO8601DateTime;
  actor?: UserType;
  actorId?: UUID;
  notes?: string;
}

// Order Item
export interface OrderItem {
  id: UUID;
  orderId: UUID;
  medicationId?: UUID;
  productName: string;
  productNameArabic?: string;
  dosage?: string;
  form?: string;
  manufacturer?: string;
  quantity: number;
  unit: string;
  fromPrescription: boolean;
  unitPrice: number;
  totalPrice: number;
  isSubstitution: boolean;
  originalProductName?: string;
  substitutionReason?: string;
  patientApprovedSubstitution?: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  createdAt: ISO8601DateTime;
}

// Medication
export interface Medication {
  id: UUID;
  nationalCode?: string;
  barcode?: string;
  brandName: string;
  brandNameArabic?: string;
  genericName?: string;
  genericNameArabic?: string;
  atcCode?: string;
  therapeuticClass?: string;
  form: string;
  strength?: string;
  unit?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  prescriptionRequired: boolean;
  isControlledSubstance: boolean;
  controlledSubstanceSchedule?: string;
  isColdChain: boolean;
  storageRequirements?: string;
  referencePrice?: number;
  status: string;
  searchKeywords: string[];
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Pharmacy Inventory
export interface PharmacyInventory {
  id: UUID;
  pharmacyId: UUID;
  medicationId: UUID;
  quantityAvailable: number;
  quantityReserved: number;
  reorderLevel: number;
  price: number;
  batchNumber?: string;
  expiryDate?: ISO8601Date;
  isAvailable: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Insurance Provider
export interface InsuranceProvider {
  id: UUID;
  name: string;
  nameArabic?: string;
  type: InsuranceType;
  apiEndpoint?: string;
  integrationType?: string;
  coveragePercentage?: number;
  contactEmail?: string;
  contactPhone?: string;
  status: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Insurance Claim
export interface InsuranceClaim {
  id: UUID;
  orderId: UUID;
  insuranceProviderId: UUID;
  patientId: UUID;
  claimNumber?: string;
  claimType?: string;
  totalAmount: number;
  coveredAmount?: number;
  copayAmount?: number;
  status: InsuranceClaimStatus;
  submittedAt?: ISO8601DateTime;
  processedAt?: ISO8601DateTime;
  rejectionReason?: string;
  settlementAmount?: number;
  settledAt?: ISO8601DateTime;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Chronic Care Program
export interface ChronicCareProgram {
  id: UUID;
  patientId: UUID;
  conditionName: string;
  icd10Code?: string;
  medications: ChronicCareMedication[];
  refillFrequencyDays: number;
  nextRefillDate?: ISO8601Date;
  autoRefillEnabled: boolean;
  preferredPharmacyId?: UUID;
  prescribingDoctorName?: string;
  prescriptionValidUntil?: ISO8601Date;
  status: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface ChronicCareMedication {
  medicationId: UUID;
  name: string;
  dosage: string;
  frequency: string;
  quantity: number;
}

// Medication Reminder
export interface MedicationReminder {
  id: UUID;
  patientId: UUID;
  chronicCareProgramId?: UUID;
  medicationName: string;
  dosage?: string;
  instructions?: string;
  reminderTimes: string[];
  daysOfWeek: number[];
  startDate: ISO8601Date;
  endDate?: ISO8601Date;
  notificationType: 'push' | 'sms' | 'both';
  snoozeMinutes: number;
  isActive: boolean;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// Chat Session
export interface ChatSession {
  id: UUID;
  patientId: UUID;
  pharmacistId?: UUID;
  orderId?: UUID;
  sessionType: ChatSessionType;
  status: ChatSessionStatus;
  startedAt: ISO8601DateTime;
  lastMessageAt?: ISO8601DateTime;
  resolvedAt?: ISO8601DateTime;
  resolutionNotes?: string;
  patientSatisfaction?: number;
}

// Chat Message
export interface ChatMessage {
  id: UUID;
  sessionId: UUID;
  senderType: SenderType;
  senderId?: UUID;
  messageType: MessageType;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: ISO8601DateTime;
  createdAt: ISO8601DateTime;
}

// Audit Log
export interface AuditLog {
  id: UUID;
  userType: UserType;
  userId?: UUID;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resourceType: string;
  resourceId?: UUID;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  createdAt: ISO8601DateTime;
}

// Consent Record
export interface ConsentRecord {
  id: UUID;
  patientId: UUID;
  consentType: ConsentType;
  consentVersion: string;
  consentText: string;
  granted: boolean;
  grantedAt?: ISO8601DateTime;
  revokedAt?: ISO8601DateTime;
  ipAddress?: string;
  userAgent?: string;
  createdAt: ISO8601DateTime;
}

// Data Access Request (CNDP Compliance)
export interface DataAccessRequest {
  id: UUID;
  patientId: UUID;
  requestType: DataRequestType;
  requestDetails?: string;
  status: string;
  processedBy?: UUID;
  processedAt?: ISO8601DateTime;
  responseDetails?: string;
  dataExportUrl?: string;
  exportExpiresAt?: ISO8601DateTime;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

// Result type for service layer
export type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };
