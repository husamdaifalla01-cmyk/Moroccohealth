'use client';

// ==============================================
// DAWA.ma Patient App - Supabase Context
// Provides Supabase client and auth state
// ==============================================

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from './client';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';

interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  is_chronic_patient: boolean;
  preferred_language: 'fr' | 'ar' | 'en';
  default_address_id?: string;
}

interface SupabaseContextType {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  patient: PatientProfile | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<PatientProfile | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchPatientProfile(session.user.id);
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
        await fetchPatientProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setPatient(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchPatientProfile = async (userId: string) => {
    try {
      // Use type assertion as patients table columns may differ from generated types
      const { data: patientData, error } = await (supabase as unknown as SupabaseClient)
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching patient profile:', error);
      } else if (patientData) {
        const data = patientData as Record<string, unknown>;
        setPatient({
          id: data['id'] as string,
          first_name: data['first_name'] as string,
          last_name: data['last_name'] as string,
          phone: data['phone'] as string,
          email: (data['email'] as string) || undefined,
          date_of_birth: (data['date_of_birth'] as string) || undefined,
          is_chronic_patient: (data['is_chronic_patient'] as boolean) || false,
          preferred_language: ((data['preferred_language'] as string) || 'fr') as 'fr' | 'ar' | 'en',
          default_address_id: (data['default_address_id'] as string) || undefined,
        });
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
        patient,
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

  const signInWithPhone = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { data, error };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    isLoading,
    signInWithPhone,
    verifyOtp,
    signOut,
  };
}

// Helper hook for patient context
export function usePatient() {
  const { supabase, patient, isLoading } = useSupabase();

  return {
    supabase,
    patient,
    isLoading,
    isAuthenticated: !!patient,
    fullName: patient ? `${patient.first_name} ${patient.last_name}` : '',
  };
}
