'use client';

// ==============================================
// DAWA.ma Courier App - Supabase Context
// Provides Supabase client and courier state
// ==============================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from './client';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';

interface CourierProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  vehicle_type: 'bicycle' | 'motorcycle' | 'car';
  status: 'available' | 'busy' | 'offline' | 'on_break';
  is_online: boolean;
  rating_average: number;
  total_deliveries: number;
  current_zone?: string;
}

interface SupabaseContextType {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  courier: CourierProfile | null;
  isOnline: boolean;
  setOnlineStatus: (online: boolean) => Promise<void>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courier, setCourier] = useState<CourierProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchCourierProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchCourierProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCourier(null);
        setIsOnline(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchCourierProfile = async (userId: string) => {
    try {
      // Use type assertion as couriers table may not be in generated types yet
      const { data: courierData, error } = await (supabase as unknown as SupabaseClient)
        .from('couriers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching courier profile:', error);
      } else if (courierData) {
        const data = courierData as Record<string, unknown>;
        setCourier({
          id: data['id'] as string,
          first_name: data['first_name'] as string,
          last_name: data['last_name'] as string,
          phone: data['phone'] as string,
          vehicle_type: (data['vehicle_type'] as CourierProfile['vehicle_type']) || 'motorcycle',
          status: (data['status'] as CourierProfile['status']) || 'offline',
          is_online: (data['is_online'] as boolean) || false,
          rating_average: (data['rating_average'] as number) || 5.0,
          total_deliveries: (data['total_deliveries'] as number) || 0,
          current_zone: (data['current_zone'] as string) || undefined,
        });
        setIsOnline((data['is_online'] as boolean) || false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setOnlineStatus = useCallback(async (online: boolean) => {
    if (!courier) return;

    const { error } = await (supabase as unknown as SupabaseClient)
      .from('couriers')
      .update({
        is_online: online,
        status: online ? 'available' : 'offline',
        updated_at: new Date().toISOString(),
      })
      .eq('id', courier.id);

    if (!error) {
      setIsOnline(online);
      setCourier((prev) => prev ? { ...prev, is_online: online, status: online ? 'available' : 'offline' } : null);
    }
  }, [courier, supabase]);

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    if (!courier) return;

    await (supabase as unknown as SupabaseClient)
      .from('couriers')
      .update({
        current_location: `POINT(${lng} ${lat})`,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', courier.id);
  }, [courier, supabase]);

  return (
    <SupabaseContext.Provider
      value={{
        supabase: supabase as unknown as SupabaseClient,
        user,
        session,
        isLoading,
        courier,
        isOnline,
        setOnlineStatus,
        updateLocation,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

// Helper hook for courier operations
export function useCourier() {
  const { supabase, courier, isOnline, setOnlineStatus, updateLocation, isLoading } = useSupabase();

  return {
    supabase,
    courier,
    isOnline,
    isLoading,
    isAuthenticated: !!courier,
    fullName: courier ? `${courier.first_name} ${courier.last_name}` : '',
    setOnlineStatus,
    updateLocation,
  };
}
