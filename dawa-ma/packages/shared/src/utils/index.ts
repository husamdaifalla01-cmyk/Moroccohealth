// ==============================================
// DAWA.ma Utility Functions
// ==============================================

import type { GeoPoint, ApiError, Result, OrderStatus } from '../types';
import {
  DELIVERY_FEES,
  SERVICE_FEES,
  ORDER_STATUS_FLOW,
  MOROCCO_PHONE_PREFIX,
  ALL_CONTROLLED_SUBSTANCES,
} from '../constants';

// ==============================================
// Phone Number Utilities
// ==============================================

/**
 * Normalizes a Moroccan phone number to international format (+212XXXXXXXXX)
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with 0, replace with +212
  if (cleaned.startsWith('0')) {
    cleaned = MOROCCO_PHONE_PREFIX + cleaned.slice(1);
  }

  // If doesn't start with +, add +212
  if (!cleaned.startsWith('+')) {
    cleaned = MOROCCO_PHONE_PREFIX + cleaned;
  }

  return cleaned;
};

/**
 * Formats phone number for display (05XX XX XX XX)
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  const local = normalized.replace(MOROCCO_PHONE_PREFIX, '0');
  return local.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
};

// ==============================================
// Geolocation Utilities
// ==============================================

/**
 * Calculates distance between two geographic points using Haversine formula
 * @returns Distance in kilometers
 */
export const calculateDistance = (point1: GeoPoint, point2: GeoPoint): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// ==============================================
// Fee Calculation Utilities
// ==============================================

/**
 * Calculates delivery fee based on distance
 */
export const calculateDeliveryFee = (
  distanceKm: number,
  options?: { isExpress?: boolean; isNight?: boolean }
): number => {
  let fee = DELIVERY_FEES.BASE_FEE + distanceKm * DELIVERY_FEES.PER_KM_FEE;

  if (options?.isExpress) {
    fee *= DELIVERY_FEES.EXPRESS_MULTIPLIER;
  }

  if (options?.isNight) {
    fee *= DELIVERY_FEES.NIGHT_MULTIPLIER;
  }

  // Clamp to min/max
  fee = Math.max(DELIVERY_FEES.MIN_FEE, Math.min(DELIVERY_FEES.MAX_FEE, fee));

  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculates platform service fee
 */
export const calculateServiceFee = (subtotal: number): number => {
  let fee = subtotal * SERVICE_FEES.PLATFORM_FEE_PERCENTAGE;

  // Clamp to min/max
  fee = Math.max(SERVICE_FEES.MIN_PLATFORM_FEE, Math.min(SERVICE_FEES.MAX_PLATFORM_FEE, fee));

  return Math.round(fee * 100) / 100;
};

/**
 * Calculates complete order totals
 */
export const calculateOrderTotals = (
  itemsTotal: number,
  deliveryDistanceKm: number,
  options?: {
    discountAmount?: number;
    insuranceCovered?: number;
    isExpress?: boolean;
    isNight?: boolean;
  }
): {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  insuranceCovered: number;
  total: number;
  patientPays: number;
} => {
  const subtotal = itemsTotal;
  const deliveryFee = calculateDeliveryFee(deliveryDistanceKm, options);
  const serviceFee = calculateServiceFee(subtotal);
  const discount = options?.discountAmount || 0;
  const insuranceCovered = options?.insuranceCovered || 0;

  const total = subtotal + deliveryFee + serviceFee - discount;
  const patientPays = total - insuranceCovered;

  return {
    subtotal,
    deliveryFee,
    serviceFee,
    discount,
    insuranceCovered,
    total: Math.max(0, total),
    patientPays: Math.max(0, patientPays),
  };
};

// ==============================================
// Order Status Utilities
// ==============================================

/**
 * Checks if a status transition is valid
 */
export const isValidStatusTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean => {
  const allowedTransitions = ORDER_STATUS_FLOW[currentStatus] as readonly string[];
  return allowedTransitions?.includes(newStatus) ?? false;
};

/**
 * Gets allowed next statuses for an order
 */
export const getAllowedNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  const transitions = ORDER_STATUS_FLOW[currentStatus] as readonly string[];
  return [...(transitions || [])] as OrderStatus[];
};

/**
 * Checks if order is in a terminal state
 */
export const isTerminalStatus = (status: OrderStatus): boolean => {
  return ['completed', 'cancelled', 'rejected', 'failed'].includes(status);
};

/**
 * Checks if order is active (not terminal)
 */
export const isActiveOrder = (status: OrderStatus): boolean => {
  return !isTerminalStatus(status);
};

// ==============================================
// Medication Safety Utilities
// ==============================================

/**
 * Checks if a medication name contains controlled substances
 * CRITICAL: This is a hard block - these medications cannot be ordered
 */
export const containsControlledSubstance = (medicationName: string): boolean => {
  const normalized = medicationName.toLowerCase().trim();
  return ALL_CONTROLLED_SUBSTANCES.some((substance) =>
    normalized.includes(substance.toLowerCase())
  );
};

/**
 * Filters out controlled substances from a list of medications
 */
export const filterControlledSubstances = <T extends { name: string }>(
  medications: T[]
): { allowed: T[]; blocked: T[] } => {
  const allowed: T[] = [];
  const blocked: T[] = [];

  for (const med of medications) {
    if (containsControlledSubstance(med.name)) {
      blocked.push(med);
    } else {
      allowed.push(med);
    }
  }

  return { allowed, blocked };
};

// ==============================================
// Date/Time Utilities
// ==============================================

/**
 * Checks if current time is within operating hours
 */
export const isWithinOperatingHours = (
  operatingHours: { open: string; close: string; closed?: boolean },
  now: Date = new Date()
): boolean => {
  if (operatingHours.closed) return false;

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openParts = operatingHours.open.split(':').map(Number);
  const closeParts = operatingHours.close.split(':').map(Number);
  const openHour = openParts[0] ?? 0;
  const openMin = openParts[1] ?? 0;
  const closeHour = closeParts[0] ?? 0;
  const closeMin = closeParts[1] ?? 0;

  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  // Handle overnight hours (e.g., 22:00 - 06:00)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime < closeTime;
  }

  return currentTime >= openTime && currentTime < closeTime;
};

/**
 * Formats duration in minutes to human-readable string
 */
export const formatDuration = (
  minutes: number,
  locale: 'fr' | 'ar' = 'fr'
): string => {
  if (minutes < 60) {
    return locale === 'ar' ? `${minutes} دقيقة` : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (locale === 'ar') {
    return remainingMins > 0
      ? `${hours} ساعة و ${remainingMins} دقيقة`
      : `${hours} ساعة`;
  }

  return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
};

/**
 * Calculates estimated delivery time based on preparation and distance
 */
export const calculateEstimatedDeliveryTime = (
  preparationMinutes: number,
  distanceKm: number,
  averageSpeedKmh: number = 25
): number => {
  const travelMinutes = (distanceKm / averageSpeedKmh) * 60;
  return Math.ceil(preparationMinutes + travelMinutes);
};

// ==============================================
// Currency Formatting
// ==============================================

/**
 * Formats amount in MAD
 */
export const formatCurrency = (
  amount: number,
  locale: 'fr' | 'ar' = 'fr'
): string => {
  const formatted = amount.toFixed(2);
  return locale === 'ar' ? `${formatted} درهم` : `${formatted} DH`;
};

// ==============================================
// Result/Error Utilities
// ==============================================

/**
 * Creates a success result
 */
export const success = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

/**
 * Creates an error result
 */
export const failure = <T>(
  code: string,
  message: string,
  details?: Record<string, unknown>
): Result<T, ApiError> => ({
  success: false,
  error: { code, message, details },
});

/**
 * Common error codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DB_ERROR: 'DB_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  CONTROLLED_SUBSTANCE_BLOCKED: 'CONTROLLED_SUBSTANCE_BLOCKED',
  PHARMACY_CLOSED: 'PHARMACY_CLOSED',
  OUT_OF_DELIVERY_RANGE: 'OUT_OF_DELIVERY_RANGE',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PRESCRIPTION_REQUIRED: 'PRESCRIPTION_REQUIRED',
  PRESCRIPTION_EXPIRED: 'PRESCRIPTION_EXPIRED',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

// ==============================================
// String Utilities
// ==============================================

/**
 * Generates a random OTP of specified length
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

/**
 * Generates a delivery verification OTP (4 digits)
 */
export const generateDeliveryOTP = (): string => {
  return generateOTP(4);
};

/**
 * Masks a phone number for display (hiding middle digits)
 */
export const maskPhoneNumber = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length < 10) return phone;
  return normalized.slice(0, 7) + '****' + normalized.slice(-2);
};

/**
 * Masks email for display
 */
export const maskEmail = (email: string): string => {
  const parts = email.split('@');
  const local = parts[0];
  const domain = parts[1];
  if (!local || !domain || local.length < 3) return email;
  return local.slice(0, 2) + '***@' + domain;
};

// ==============================================
// Sorting/Filtering Utilities
// ==============================================

/**
 * Sorts pharmacies by distance from a point
 */
export const sortByDistance = <T extends { location?: GeoPoint }>(
  items: T[],
  fromPoint: GeoPoint
): T[] => {
  return [...items].sort((a, b) => {
    if (!a.location && !b.location) return 0;
    if (!a.location) return 1;
    if (!b.location) return -1;
    return calculateDistance(fromPoint, a.location) - calculateDistance(fromPoint, b.location);
  });
};

/**
 * Filters items within a radius from a point
 */
export const filterByRadius = <T extends { location?: GeoPoint }>(
  items: T[],
  fromPoint: GeoPoint,
  radiusKm: number
): T[] => {
  return items.filter((item) => {
    if (!item.location) return false;
    return calculateDistance(fromPoint, item.location) <= radiusKm;
  });
};
