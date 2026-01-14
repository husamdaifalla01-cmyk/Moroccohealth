// ==============================================
// DAWA.ma React Hooks
// TanStack Query hooks for data fetching
// ==============================================

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UUID } from '../types';
import {
  prescriptionsApi,
  ordersApi,
  pharmaciesApi,
  pharmacyStaffApi,
  patientsApi,
  addressesApi,
  couriersApi,
  medicationsApi,
  inventoryApi,
  notificationsApi,
  prescriptionEventsApi,
} from '../api';
import type {
  CreatePrescriptionInput,
  CreateOrderInput,
  PrescriptionFilters,
  OrderFilters,
  PharmacyFilters,
  NearbyPharmacyFilters,
  CourierFilters,
  MedicationSearchParams,
} from '../api';

// Query key factory for consistent key management
export const queryKeys = {
  // Prescriptions
  prescriptions: {
    all: ['prescriptions'] as const,
    lists: () => [...queryKeys.prescriptions.all, 'list'] as const,
    list: (filters: PrescriptionFilters) => [...queryKeys.prescriptions.lists(), filters] as const,
    details: () => [...queryKeys.prescriptions.all, 'detail'] as const,
    detail: (id: UUID) => [...queryKeys.prescriptions.details(), id] as const,
    events: (id: UUID) => [...queryKeys.prescriptions.all, 'events', id] as const,
    state: (id: UUID) => [...queryKeys.prescriptions.all, 'state', id] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: OrderFilters) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: UUID) => [...queryKeys.orders.details(), id] as const,
  },

  // Pharmacies
  pharmacies: {
    all: ['pharmacies'] as const,
    lists: () => [...queryKeys.pharmacies.all, 'list'] as const,
    list: (filters: PharmacyFilters) => [...queryKeys.pharmacies.lists(), filters] as const,
    details: () => [...queryKeys.pharmacies.all, 'detail'] as const,
    detail: (id: UUID) => [...queryKeys.pharmacies.details(), id] as const,
    nearby: (filters: NearbyPharmacyFilters) => [...queryKeys.pharmacies.all, 'nearby', filters] as const,
    staff: (pharmacyId: UUID) => [...queryKeys.pharmacies.all, 'staff', pharmacyId] as const,
  },

  // Patients
  patients: {
    all: ['patients'] as const,
    details: () => [...queryKeys.patients.all, 'detail'] as const,
    detail: (id: UUID) => [...queryKeys.patients.details(), id] as const,
    addresses: (patientId: UUID) => [...queryKeys.patients.all, 'addresses', patientId] as const,
  },

  // Couriers
  couriers: {
    all: ['couriers'] as const,
    lists: () => [...queryKeys.couriers.all, 'list'] as const,
    list: (filters: CourierFilters) => [...queryKeys.couriers.lists(), filters] as const,
    details: () => [...queryKeys.couriers.all, 'detail'] as const,
    detail: (id: UUID) => [...queryKeys.couriers.details(), id] as const,
    nearby: (lat: number, lng: number) => [...queryKeys.couriers.all, 'nearby', lat, lng] as const,
  },

  // Medications
  medications: {
    all: ['medications'] as const,
    search: (query: string) => [...queryKeys.medications.all, 'search', query] as const,
    detail: (id: UUID) => [...queryKeys.medications.all, 'detail', id] as const,
    interactions: (drugIds: UUID[]) => [...queryKeys.medications.all, 'interactions', drugIds] as const,
  },

  // Inventory
  inventory: {
    all: ['inventory'] as const,
    byPharmacy: (pharmacyId: UUID) => [...queryKeys.inventory.all, 'pharmacy', pharmacyId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    byUser: (userId: UUID) => [...queryKeys.notifications.all, 'user', userId] as const,
  },
};

// ==============================================
// Prescription Hooks
// ==============================================

export function usePrescription(client: SupabaseClient, id: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.prescriptions.detail(id!),
    queryFn: async () => {
      const result = await prescriptionsApi.getById(client, id!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function usePrescriptions(client: SupabaseClient, filters: PrescriptionFilters = {}) {
  return useQuery({
    queryKey: queryKeys.prescriptions.list(filters),
    queryFn: async () => {
      const result = await prescriptionsApi.list(client, filters);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}

export function useCreatePrescription(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePrescriptionInput) => {
      const result = await prescriptionsApi.create(client, input);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.lists() });
    },
  });
}

export function useUpdatePrescriptionStatus(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      pharmacistId,
      notes,
    }: {
      id: UUID;
      status: string;
      pharmacistId?: UUID;
      notes?: string;
    }) => {
      const result = await prescriptionsApi.updateStatus(client, id, status, pharmacistId, notes);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.lists() });
    },
  });
}

export function usePrescriptionEvents(client: SupabaseClient, prescriptionId: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.prescriptions.events(prescriptionId!),
    queryFn: async () => {
      const result = await prescriptionEventsApi.listByPrescription(client, prescriptionId!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prescriptionId,
  });
}

export function usePrescriptionState(client: SupabaseClient, prescriptionId: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.prescriptions.state(prescriptionId!),
    queryFn: async () => {
      const result = await prescriptionEventsApi.getCurrentState(client, prescriptionId!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!prescriptionId,
  });
}

// ==============================================
// Order Hooks
// ==============================================

export function useOrder(client: SupabaseClient, id: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id!),
    queryFn: async () => {
      const result = await ordersApi.getById(client, id!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useOrders(client: SupabaseClient, filters: OrderFilters = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: async () => {
      const result = await ordersApi.list(client, filters);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}

interface OrdersPage {
  data: unknown[];
  total: number;
}

export function useInfiniteOrders(client: SupabaseClient, filters: Omit<OrderFilters, 'offset'>) {
  return useInfiniteQuery<OrdersPage, Error, { pages: OrdersPage[] }, readonly ['orders', 'list', OrderFilters], number>({
    queryKey: queryKeys.orders.list(filters),
    queryFn: async ({ pageParam }): Promise<OrdersPage> => {
      const result = await ordersApi.list(client, { ...filters, offset: pageParam });
      if (!result.success) throw new Error(result.error.message);
      return result.data as OrdersPage;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((acc, page) => acc + page.data.length, 0);
      if (loadedCount >= lastPage.total) return undefined;
      return loadedCount;
    },
    initialPageParam: 0,
  });
}

export function useCreateOrder(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const result = await ordersApi.create(client, input);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}

export function useUpdateOrderStatus(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      updates,
    }: {
      id: UUID;
      status: string;
      updates?: Record<string, unknown>;
    }) => {
      const result = await ordersApi.updateStatus(client, id, status, updates);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}

export function useAddOrderItem(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      item,
    }: {
      orderId: UUID;
      item: Parameters<typeof ordersApi.addItem>[2];
    }) => {
      const result = await ordersApi.addItem(client, orderId, item);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
    },
  });
}

// ==============================================
// Pharmacy Hooks
// ==============================================

export function usePharmacy(client: SupabaseClient, id: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.pharmacies.detail(id!),
    queryFn: async () => {
      const result = await pharmaciesApi.getById(client, id!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function usePharmacies(client: SupabaseClient, filters: PharmacyFilters = {}) {
  return useQuery({
    queryKey: queryKeys.pharmacies.list(filters),
    queryFn: async () => {
      const result = await pharmaciesApi.list(client, filters);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}

export function useNearbyPharmacies(client: SupabaseClient, filters: NearbyPharmacyFilters) {
  return useQuery({
    queryKey: queryKeys.pharmacies.nearby(filters),
    queryFn: async () => {
      const result = await pharmaciesApi.findNearby(client, filters);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!filters.lat && !!filters.lng,
  });
}

export function usePharmacyStaff(client: SupabaseClient, userId: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.pharmacies.staff(userId!),
    queryFn: async () => {
      const result = await pharmacyStaffApi.getByUserId(client, userId!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!userId,
  });
}

export function useUpdatePharmacySettings(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, settings }: { id: UUID; settings: Record<string, unknown> }) => {
      const result = await pharmaciesApi.updateSettings(client, id, settings);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pharmacies.detail(variables.id) });
    },
  });
}

// ==============================================
// Patient Hooks
// ==============================================

export function usePatient(client: SupabaseClient, id: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id!),
    queryFn: async () => {
      const result = await patientsApi.getById(client, id!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function usePatientAddresses(client: SupabaseClient, patientId: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.patients.addresses(patientId!),
    queryFn: async () => {
      const result = await addressesApi.listByPatient(client, patientId!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!patientId,
  });
}

export function useUpdatePatientProfile(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: UUID; updates: Record<string, unknown> }) => {
      const result = await patientsApi.updateProfile(client, id, updates);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(variables.id) });
    },
  });
}

export function useCreateAddress(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      address,
    }: {
      patientId: UUID;
      address: Parameters<typeof addressesApi.create>[2];
    }) => {
      const result = await addressesApi.create(client, patientId, address);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.addresses(variables.patientId) });
    },
  });
}

export function useDeleteAddress(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientId }: { id: UUID; patientId: UUID }) => {
      const result = await addressesApi.delete(client, id, patientId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.addresses(variables.patientId) });
    },
  });
}

// ==============================================
// Courier Hooks
// ==============================================

export function useCourier(client: SupabaseClient, id: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.couriers.detail(id!),
    queryFn: async () => {
      const result = await couriersApi.getById(client, id!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCouriers(client: SupabaseClient, filters: CourierFilters = {}) {
  return useQuery({
    queryKey: queryKeys.couriers.list(filters),
    queryFn: async () => {
      const result = await couriersApi.list(client, filters);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}

export function useNearbyCouriers(client: SupabaseClient, lat: number, lng: number, radiusKm?: number) {
  return useQuery({
    queryKey: queryKeys.couriers.nearby(lat, lng),
    queryFn: async () => {
      const result = await couriersApi.findNearby(client, lat, lng, radiusKm);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!lat && !!lng,
  });
}

export function useUpdateCourierLocation(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, lat, lng }: { id: UUID; lat: number; lng: number }) => {
      const result = await couriersApi.updateLocation(client, id, lat, lng);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.couriers.detail(variables.id) });
    },
  });
}

export function useSetCourierOnlineStatus(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isOnline }: { id: UUID; isOnline: boolean }) => {
      const result = await couriersApi.setOnlineStatus(client, id, isOnline);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.couriers.detail(variables.id) });
    },
  });
}

// ==============================================
// Medication Hooks
// ==============================================

export function useMedicationSearch(
  client: SupabaseClient,
  params: MedicationSearchParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.medications.search(params.query),
    queryFn: async () => {
      const result = await medicationsApi.search(client, params);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: options?.enabled !== false && params.query.length >= 2,
  });
}

export function useMedication(client: SupabaseClient, id: UUID | undefined) {
  return useQuery({
    queryKey: queryKeys.medications.detail(id!),
    queryFn: async () => {
      const result = await medicationsApi.getById(client, id!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useDrugInteractions(client: SupabaseClient, drugIds: UUID[]) {
  return useQuery({
    queryKey: queryKeys.medications.interactions(drugIds),
    queryFn: async () => {
      const result = await medicationsApi.checkInteractions(client, drugIds);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: drugIds.length >= 2,
  });
}

// ==============================================
// Inventory Hooks
// ==============================================

export function usePharmacyInventory(
  client: SupabaseClient,
  pharmacyId: UUID | undefined,
  options?: { lowStockOnly?: boolean; limit?: number }
) {
  return useQuery({
    queryKey: queryKeys.inventory.byPharmacy(pharmacyId!),
    queryFn: async () => {
      const result = await inventoryApi.listByPharmacy(client, pharmacyId!, options);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!pharmacyId,
  });
}

export function useUpdateInventoryStock(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pharmacyId,
      medicationId,
      quantity,
    }: {
      pharmacyId: UUID;
      medicationId: UUID;
      quantity: number;
    }) => {
      const result = await inventoryApi.updateStock(client, pharmacyId, medicationId, quantity);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.byPharmacy(variables.pharmacyId) });
    },
  });
}

// ==============================================
// Notification Hooks
// ==============================================

export function useNotifications(
  client: SupabaseClient,
  userId: UUID | undefined,
  options?: { unreadOnly?: boolean; limit?: number }
) {
  return useQuery({
    queryKey: queryKeys.notifications.byUser(userId!),
    queryFn: async () => {
      const result = await notificationsApi.listByUser(client, userId!, options);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!userId,
  });
}

export function useMarkNotificationRead(client: SupabaseClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: UUID; userId: UUID }) => {
      const result = await notificationsApi.markAsRead(client, id);
      if (!result.success) throw new Error(result.error.message);
      return { ...(result.data as Record<string, unknown>), userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(data.userId) });
    },
  });
}

// ==============================================
// Real-time Subscription Hooks
// ==============================================

export function useOrderUpdates(
  client: SupabaseClient,
  orderId: UUID,
  onUpdate: (payload: unknown) => void
) {
  return useQuery({
    queryKey: ['realtime', 'order', orderId],
    queryFn: async () => {
      const channel = client
        .channel(`order:${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`,
          },
          onUpdate
        )
        .subscribe();

      return { channel };
    },
    staleTime: Infinity,
    gcTime: 0,
  });
}

export function usePrescriptionQueueUpdates(
  client: SupabaseClient,
  pharmacyId: UUID,
  onInsert: (payload: unknown) => void,
  onUpdate: (payload: unknown) => void
) {
  return useQuery({
    queryKey: ['realtime', 'prescriptions', pharmacyId],
    queryFn: async () => {
      const channel = client
        .channel(`prescriptions:${pharmacyId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'prescriptions',
          },
          onInsert
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'prescriptions',
          },
          onUpdate
        )
        .subscribe();

      return { channel };
    },
    staleTime: Infinity,
    gcTime: 0,
  });
}

export function useCourierLocationUpdates(
  client: SupabaseClient,
  courierId: UUID,
  onUpdate: (location: { lat: number; lng: number }) => void
) {
  return useQuery({
    queryKey: ['realtime', 'courier-location', courierId],
    queryFn: async () => {
      const channel = client
        .channel(`courier:${courierId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'couriers',
            filter: `id=eq.${courierId}`,
          },
          (payload) => {
            const location = (payload.new as { current_location?: string }).current_location;
            if (location) {
              // Parse PostGIS POINT format
              const match = location.match(/POINT\(([^ ]+) ([^)]+)\)/);
              if (match && match[1] && match[2]) {
                onUpdate({ lat: parseFloat(match[2]), lng: parseFloat(match[1]) });
              }
            }
          }
        )
        .subscribe();

      return { channel };
    },
    staleTime: Infinity,
    gcTime: 0,
  });
}
