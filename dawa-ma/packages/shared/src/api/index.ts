// ==============================================
// DAWA.ma API Client
// Typed Supabase operations for all entities
// ==============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Result, UUID } from '../types';
import { success, failure, ErrorCodes } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any>;

// ==============================================
// Prescriptions API
// ==============================================

export interface CreatePrescriptionInput {
  patientId: UUID;
  imageUrl: string;
  imageHash: string;
  uploadType: 'camera' | 'gallery' | 'document';
  doctorName?: string;
  doctorLicenseNumber?: string;
  clinicHospital?: string;
  prescriptionDate?: string;
}

export interface PrescriptionFilters {
  patientId?: UUID;
  pharmacyId?: UUID;
  status?: string;
  limit?: number;
  offset?: number;
}

export const prescriptionsApi = {
  create: async (
    client: AnySupabaseClient,
    input: CreatePrescriptionInput
  ): Promise<Result<{ id: UUID }>> => {
    const { data, error } = await client
      .from('prescriptions')
      .insert({
        patient_id: input.patientId,
        image_url: input.imageUrl,
        image_hash: input.imageHash,
        upload_type: input.uploadType,
        doctor_name: input.doctorName,
        doctor_license_number: input.doctorLicenseNumber,
        clinic_hospital: input.clinicHospital,
        prescription_date: input.prescriptionDate,
        verification_status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ id: data.id });
  },

  getById: async (
    client: AnySupabaseClient,
    id: UUID
  ) => {
    const { data, error } = await client
      .from('prescriptions')
      .select('*, patient:patients(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Prescription not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  list: async (
    client: AnySupabaseClient,
    filters: PrescriptionFilters = {}
  ) => {
    let query = client
      .from('prescriptions')
      .select('*, patient:patients(id, first_name, last_name, phone)', { count: 'exact' });

    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters.status) {
      query = query.eq('verification_status', filters.status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(
        filters.offset || 0,
        (filters.offset || 0) + (filters.limit || 20) - 1
      );

    const { data, error, count } = await query;

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ data, total: count || 0 });
  },

  updateStatus: async (
    client: AnySupabaseClient,
    id: UUID,
    status: string,
    pharmacistId?: UUID,
    notes?: string
  ) => {
    const updateData: Record<string, unknown> = {
      verification_status: status,
      updated_at: new Date().toISOString(),
    };

    if (pharmacistId) {
      updateData['verified_by_pharmacist_id'] = pharmacistId;
      updateData['verified_at'] = new Date().toISOString();
    }

    if (notes) {
      updateData['verification_notes'] = notes;
    }

    const { error } = await client
      .from('prescriptions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },
};

// ==============================================
// Orders API
// ==============================================

export interface CreateOrderInput {
  patientId: UUID;
  prescriptionId?: UUID;
  orderType: 'prescription' | 'otc' | 'mixed';
  deliveryAddressId: UUID;
  pharmacyId?: UUID;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'wallet';
  patientNotes?: string;
  discountCode?: string;
}

export interface OrderFilters {
  patientId?: UUID;
  pharmacyId?: UUID;
  courierId?: UUID;
  status?: string | string[];
  limit?: number;
  offset?: number;
}

export const ordersApi = {
  create: async (
    client: AnySupabaseClient,
    input: CreateOrderInput
  ): Promise<Result<{ id: UUID; orderNumber: string }>> => {
    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await client
      .from('orders')
      .insert({
        order_number: orderNumber,
        patient_id: input.patientId,
        prescription_id: input.prescriptionId,
        order_type: input.orderType,
        delivery_address_id: input.deliveryAddressId,
        pharmacy_id: input.pharmacyId,
        is_scheduled: input.isScheduled || false,
        scheduled_date: input.scheduledDate,
        scheduled_time_slot: input.scheduledTimeSlot,
        payment_method: input.paymentMethod,
        patient_notes: input.patientNotes,
        discount_code: input.discountCode,
        status: 'pending',
        payment_status: 'pending',
      })
      .select('id, order_number')
      .single();

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ id: data.id, orderNumber: data.order_number });
  },

  getById: async (
    client: AnySupabaseClient,
    id: UUID
  ) => {
    const { data, error } = await client
      .from('orders')
      .select(`
        *,
        patient:patients(*),
        pharmacy:pharmacies(*),
        courier:couriers(*),
        prescription:prescriptions(*),
        items:order_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Order not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  list: async (
    client: AnySupabaseClient,
    filters: OrderFilters = {}
  ) => {
    let query = client
      .from('orders')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone),
        pharmacy:pharmacies(id, name),
        courier:couriers(id, first_name, last_name)
      `, { count: 'exact' });

    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters.pharmacyId) {
      query = query.eq('pharmacy_id', filters.pharmacyId);
    }

    if (filters.courierId) {
      query = query.eq('courier_id', filters.courierId);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    query = query
      .order('created_at', { ascending: false })
      .range(
        filters.offset || 0,
        (filters.offset || 0) + (filters.limit || 20) - 1
      );

    const { data, error, count } = await query;

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ data, total: count || 0 });
  },

  updateStatus: async (
    client: AnySupabaseClient,
    id: UUID,
    status: string,
    updates?: Record<string, unknown>
  ) => {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
      ...updates,
    };

    // Set timestamp fields based on status
    const statusTimestamps: Record<string, string> = {
      pharmacy_assigned: 'pharmacy_accepted_at',
      pharmacist_review: 'pharmacist_reviewed_at',
      preparing: 'preparation_started_at',
      ready_for_pickup: 'ready_for_pickup_at',
      courier_assigned: 'courier_assigned_at',
      picked_up: 'picked_up_at',
      delivered: 'delivered_at',
    };

    if (statusTimestamps[status]) {
      updateData[statusTimestamps[status]] = new Date().toISOString();
    }

    const { error } = await client
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },

  addItem: async (
    client: AnySupabaseClient,
    orderId: UUID,
    item: {
      productName: string;
      productNameArabic?: string;
      medicationId?: UUID;
      quantity: number;
      unitPrice: number;
      fromPrescription?: boolean;
    }
  ) => {
    const { data, error } = await client
      .from('order_items')
      .insert({
        order_id: orderId,
        medication_id: item.medicationId,
        product_name: item.productName,
        product_name_arabic: item.productNameArabic,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
        from_prescription: item.fromPrescription || false,
      })
      .select('id')
      .single();

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ id: data.id });
  },
};

// ==============================================
// Pharmacies API
// ==============================================

export interface PharmacyFilters {
  city?: string;
  region?: string;
  is24Hour?: boolean;
  isPharmacieDeGarde?: boolean;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface NearbyPharmacyFilters {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
}

export const pharmaciesApi = {
  getById: async (
    client: AnySupabaseClient,
    id: UUID
  ) => {
    const { data, error } = await client
      .from('pharmacies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Pharmacy not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  list: async (
    client: AnySupabaseClient,
    filters: PharmacyFilters = {}
  ) => {
    let query = client
      .from('pharmacies')
      .select('*', { count: 'exact' });

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.region) {
      query = query.eq('region', filters.region);
    }

    if (filters.is24Hour !== undefined) {
      query = query.eq('is_24_hour', filters.is24Hour);
    }

    if (filters.isPharmacieDeGarde !== undefined) {
      query = query.eq('is_pharmacie_de_garde', filters.isPharmacieDeGarde);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query
      .order('rating_average', { ascending: false })
      .range(
        filters.offset || 0,
        (filters.offset || 0) + (filters.limit || 20) - 1
      );

    const { data, error, count } = await query;

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ data, total: count || 0 });
  },

  findNearby: async (
    client: AnySupabaseClient,
    filters: NearbyPharmacyFilters
  ) => {
    // Use PostGIS function for geospatial query
    const { data, error } = await client.rpc('find_nearby_pharmacies', {
      lat: filters.lat,
      lng: filters.lng,
      radius_km: filters.radiusKm || 5,
      max_results: filters.limit || 20,
    });

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  updateSettings: async (
    client: AnySupabaseClient,
    id: UUID,
    settings: Record<string, unknown>
  ) => {
    const { error } = await client
      .from('pharmacies')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },
};

// ==============================================
// Pharmacy Staff API
// ==============================================

export const pharmacyStaffApi = {
  getByUserId: async (
    client: AnySupabaseClient,
    userId: UUID
  ) => {
    const { data, error } = await client
      .from('pharmacy_staff')
      .select('*, pharmacy:pharmacies(*)')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Staff member not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  listByPharmacy: async (
    client: AnySupabaseClient,
    pharmacyId: UUID
  ) => {
    const { data, error } = await client
      .from('pharmacy_staff')
      .select('*')
      .eq('pharmacy_id', pharmacyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },
};

// ==============================================
// Patients API
// ==============================================

export const patientsApi = {
  getById: async (
    client: AnySupabaseClient,
    id: UUID
  ) => {
    const { data, error } = await client
      .from('patients')
      .select('*, addresses:patient_addresses(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Patient not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  getByPhone: async (
    client: AnySupabaseClient,
    phone: string
  ) => {
    const { data, error } = await client
      .from('patients')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Patient not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  updateProfile: async (
    client: AnySupabaseClient,
    id: UUID,
    updates: Record<string, unknown>
  ) => {
    const { error } = await client
      .from('patients')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },
};

// ==============================================
// Patient Addresses API
// ==============================================

export const addressesApi = {
  listByPatient: async (
    client: AnySupabaseClient,
    patientId: UUID
  ) => {
    const { data, error } = await client
      .from('patient_addresses')
      .select('*')
      .eq('patient_id', patientId)
      .order('is_default', { ascending: false });

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  create: async (
    client: AnySupabaseClient,
    patientId: UUID,
    address: {
      label?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      region: string;
      postalCode?: string;
      lat?: number;
      lng?: number;
      deliveryInstructions?: string;
      isDefault?: boolean;
    }
  ) => {
    // If this is the default address, unset other defaults
    if (address.isDefault) {
      await client
        .from('patient_addresses')
        .update({ is_default: false })
        .eq('patient_id', patientId);
    }

    const { data, error } = await client
      .from('patient_addresses')
      .insert({
        patient_id: patientId,
        label: address.label,
        address_line_1: address.addressLine1,
        address_line_2: address.addressLine2,
        city: address.city,
        region: address.region,
        postal_code: address.postalCode,
        location: address.lat && address.lng
          ? `POINT(${address.lng} ${address.lat})`
          : null,
        delivery_instructions: address.deliveryInstructions,
        is_default: address.isDefault || false,
      })
      .select('id')
      .single();

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ id: data.id });
  },

  delete: async (
    client: AnySupabaseClient,
    id: UUID,
    patientId: UUID
  ) => {
    const { error } = await client
      .from('patient_addresses')
      .delete()
      .eq('id', id)
      .eq('patient_id', patientId);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ deleted: true });
  },
};

// ==============================================
// Couriers API
// ==============================================

export interface CourierFilters {
  status?: string;
  isOnline?: boolean;
  vehicleType?: string;
  limit?: number;
  offset?: number;
}

export const couriersApi = {
  getById: async (
    client: AnySupabaseClient,
    id: UUID
  ) => {
    const { data, error } = await client
      .from('couriers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Courier not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  getByUserId: async (
    client: AnySupabaseClient,
    userId: UUID
  ) => {
    const { data, error } = await client
      .from('couriers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Courier not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  list: async (
    client: AnySupabaseClient,
    filters: CourierFilters = {}
  ) => {
    let query = client
      .from('couriers')
      .select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.isOnline !== undefined) {
      query = query.eq('is_online', filters.isOnline);
    }

    if (filters.vehicleType) {
      query = query.eq('vehicle_type', filters.vehicleType);
    }

    query = query
      .order('rating_average', { ascending: false })
      .range(
        filters.offset || 0,
        (filters.offset || 0) + (filters.limit || 20) - 1
      );

    const { data, error, count } = await query;

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ data, total: count || 0 });
  },

  updateLocation: async (
    client: AnySupabaseClient,
    id: UUID,
    lat: number,
    lng: number
  ) => {
    const { error } = await client
      .from('couriers')
      .update({
        current_location: `POINT(${lng} ${lat})`,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },

  setOnlineStatus: async (
    client: AnySupabaseClient,
    id: UUID,
    isOnline: boolean
  ) => {
    const { error } = await client
      .from('couriers')
      .update({
        is_online: isOnline,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },

  findNearby: async (
    client: AnySupabaseClient,
    lat: number,
    lng: number,
    radiusKm: number = 5
  ) => {
    const { data, error } = await client.rpc('find_available_couriers', {
      lat,
      lng,
      radius_km: radiusKm,
    });

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },
};

// ==============================================
// Medications API
// ==============================================

export interface MedicationSearchParams {
  query: string;
  prescriptionRequired?: boolean;
  limit?: number;
}

export const medicationsApi = {
  search: async (
    client: AnySupabaseClient,
    params: MedicationSearchParams
  ) => {
    let query = client
      .from('morocco_drug_database')
      .select('*')
      .or(`brand_name.ilike.%${params.query}%,generic_name.ilike.%${params.query}%,dci_code.ilike.%${params.query}%`)
      .eq('is_active', true);

    if (params.prescriptionRequired !== undefined) {
      query = query.eq('prescription_required', params.prescriptionRequired);
    }

    query = query.limit(params.limit || 20);

    const { data, error } = await query;

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  getById: async (
    client: AnySupabaseClient,
    id: UUID
  ) => {
    const { data, error } = await client
      .from('morocco_drug_database')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Medication not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  checkInteractions: async (
    client: AnySupabaseClient,
    drugIds: UUID[]
  ) => {
    const { data, error } = await client.rpc('check_drug_interactions', {
      drug_ids: drugIds,
    });

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },
};

// ==============================================
// Pharmacy Inventory API
// ==============================================

export const inventoryApi = {
  listByPharmacy: async (
    client: AnySupabaseClient,
    pharmacyId: UUID,
    options?: { lowStockOnly?: boolean; limit?: number }
  ) => {
    let query = client
      .from('pharmacy_inventory')
      .select('*, medication:morocco_drug_database(*)')
      .eq('pharmacy_id', pharmacyId);

    if (options?.lowStockOnly) {
      query = query.lte('quantity_available', 10);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  updateStock: async (
    client: AnySupabaseClient,
    pharmacyId: UUID,
    medicationId: UUID,
    quantity: number
  ) => {
    const { error } = await client
      .from('pharmacy_inventory')
      .update({
        quantity_available: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('pharmacy_id', pharmacyId)
      .eq('medication_id', medicationId);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },

  checkAvailability: async (
    client: AnySupabaseClient,
    pharmacyId: UUID,
    medicationIds: UUID[]
  ) => {
    const { data, error } = await client
      .from('pharmacy_inventory')
      .select('medication_id, quantity_available, is_available')
      .eq('pharmacy_id', pharmacyId)
      .in('medication_id', medicationIds);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },
};

// ==============================================
// Payments API
// ==============================================

export const paymentsApi = {
  create: async (
    client: AnySupabaseClient,
    payment: {
      orderId: UUID;
      amount: number;
      method: 'card' | 'cod' | 'mobile_money';
      providerReference?: string;
    }
  ) => {
    const { data, error } = await client
      .from('payments')
      .insert({
        order_id: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        provider_reference: payment.providerReference,
        status: payment.method === 'cod' ? 'pending' : 'processing',
      })
      .select('id')
      .single();

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ id: data.id });
  },

  updateStatus: async (
    client: AnySupabaseClient,
    id: UUID,
    status: string,
    providerResponse?: Record<string, unknown>
  ) => {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData['paid_at'] = new Date().toISOString();
    }

    if (providerResponse) {
      updateData['provider_response'] = providerResponse;
    }

    const { error } = await client
      .from('payments')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },
};

// ==============================================
// Notifications API
// ==============================================

export const notificationsApi = {
  create: async (
    client: AnySupabaseClient,
    notification: {
      userId: UUID;
      userType: 'patient' | 'pharmacist' | 'courier';
      type: string;
      templateId: string;
      channel: 'push' | 'sms' | 'email' | 'whatsapp';
      data?: Record<string, unknown>;
    }
  ) => {
    const { data, error } = await client
      .from('notifications')
      .insert({
        user_id: notification.userId,
        user_type: notification.userType,
        notification_type: notification.type,
        template_id: notification.templateId,
        channel: notification.channel,
        data: notification.data,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ id: data.id });
  },

  markAsRead: async (
    client: AnySupabaseClient,
    id: UUID
  ) => {
    const { error } = await client
      .from('notifications')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },

  listByUser: async (
    client: AnySupabaseClient,
    userId: UUID,
    options?: { unreadOnly?: boolean; limit?: number }
  ) => {
    let query = client
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (options?.unreadOnly) {
      query = query.is('read_at', null);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(options?.limit || 50);

    const { data, error } = await query;

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },
};

// ==============================================
// Prescription Events API (Event Sourcing)
// ==============================================

export const prescriptionEventsApi = {
  append: async (
    client: AnySupabaseClient,
    event: {
      prescriptionId: UUID;
      eventType: string;
      eventData: Record<string, unknown>;
      actorId: UUID;
      actorType: 'patient' | 'pharmacist' | 'courier' | 'system' | 'admin';
    }
  ) => {
    const { data, error } = await client
      .from('prescription_events')
      .insert({
        prescription_id: event.prescriptionId,
        event_type: event.eventType,
        event_data: event.eventData,
        actor_id: event.actorId,
        actor_type: event.actorType,
      })
      .select('id')
      .single();

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ id: data.id });
  },

  listByPrescription: async (
    client: AnySupabaseClient,
    prescriptionId: UUID
  ) => {
    const { data, error } = await client
      .from('prescription_events')
      .select('*')
      .eq('prescription_id', prescriptionId)
      .order('created_at', { ascending: true });

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },

  getCurrentState: async (
    client: AnySupabaseClient,
    prescriptionId: UUID
  ) => {
    const { data, error } = await client
      .from('prescription_states')
      .select('*')
      .eq('prescription_id', prescriptionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, 'Prescription state not found');
      }
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success(data);
  },
};

// ==============================================
// Insurance Claims API
// ==============================================

export const insuranceClaimsApi = {
  create: async (
    client: AnySupabaseClient,
    claim: {
      orderId: UUID;
      patientId: UUID;
      insuranceProviderId: UUID;
      totalAmount: number;
    }
  ) => {
    const { data, error } = await client
      .from('insurance_claims')
      .insert({
        order_id: claim.orderId,
        patient_id: claim.patientId,
        insurance_provider_id: claim.insuranceProviderId,
        total_amount: claim.totalAmount,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ id: data.id });
  },

  updateStatus: async (
    client: AnySupabaseClient,
    id: UUID,
    status: string,
    updates?: {
      coveredAmount?: number;
      copayAmount?: number;
      rejectionReason?: string;
    }
  ) => {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved' || status === 'partially_approved') {
      updateData['processed_at'] = new Date().toISOString();
      if (updates?.coveredAmount) updateData['covered_amount'] = updates.coveredAmount;
      if (updates?.copayAmount) updateData['copay_amount'] = updates.copayAmount;
    }

    if (status === 'rejected' && updates?.rejectionReason) {
      updateData['rejection_reason'] = updates.rejectionReason;
      updateData['processed_at'] = new Date().toISOString();
    }

    const { error } = await client
      .from('insurance_claims')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return failure(ErrorCodes.DB_ERROR, error.message);
    }

    return success({ updated: true });
  },
};
