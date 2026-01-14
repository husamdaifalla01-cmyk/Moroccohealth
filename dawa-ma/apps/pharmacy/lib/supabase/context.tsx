'use client';

// ==============================================
// DAWA.ma Pharmacy Portal - Supabase Context
// Provides Supabase client and auth state to the app
// ==============================================

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from './client';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';

interface SupabaseContextType {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  pharmacyId: string | null;
  staffId: string | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch pharmacy staff info
        fetchStaffInfo(session.user.id);
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
        await fetchStaffInfo(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setPharmacyId(null);
        setStaffId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchStaffInfo = async (userId: string) => {
    try {
      // Use type assertion as pharmacy_staff table may not be in generated types yet
      const { data: staff, error } = await (supabase as unknown as SupabaseClient)
        .from('pharmacy_staff')
        .select('id, pharmacy_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching staff info:', error);
      } else if (staff) {
        const data = staff as Record<string, unknown>;
        setStaffId(data['id'] as string);
        setPharmacyId(data['pharmacy_id'] as string);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SupabaseContext.Provider
      value={{
        supabase: supabase as unknown as SupabaseClient,
        user,
        session,
        isLoading,
        pharmacyId,
        staffId,
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

// Helper hook for auth operations
export function useAuth() {
  const { supabase, user, session, isLoading } = useSupabase();

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  };

  return {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    resetPassword,
  };
}

// Helper hook for pharmacy context
export function usePharmacy() {
  const { supabase, pharmacyId, staffId, isLoading } = useSupabase();

  return {
    supabase,
    pharmacyId,
    staffId,
    isLoading,
    isAuthenticated: !!pharmacyId,
  };
}
