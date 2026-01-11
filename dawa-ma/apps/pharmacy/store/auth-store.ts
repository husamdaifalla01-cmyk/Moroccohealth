import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simple types (no external dependencies)
interface Pharmacy {
  id: string;
  name: string;
  city: string;
}

interface Pharmacist {
  id: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  pharmacy: Pharmacy | null;
  pharmacist: Pharmacist | null;
  accessToken: string | null;

  setPharmacy: (pharmacy: Pharmacy | null) => void;
  setPharmacist: (pharmacist: Pharmacist | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: true,
      pharmacy: null,
      pharmacist: null,
      accessToken: null,

      setPharmacy: (pharmacy) =>
        set({
          pharmacy,
          isAuthenticated: !!pharmacy,
        }),

      setPharmacist: (pharmacist) => set({ pharmacist }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          isAuthenticated: false,
          pharmacy: null,
          pharmacist: null,
          accessToken: null,
        }),
    }),
    {
      name: 'pharmacy-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    }
  )
);
