import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreCustomerDto } from '@/shared/types/api';

interface CustomerAuthState {
  accessToken: string | null;
  customer: StoreCustomerDto | null;
  setAuth: (payload: { accessToken: string; customer: StoreCustomerDto }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      customer: null,

      setAuth: ({ accessToken, customer }) => set({ accessToken, customer }),

      logout: () => set({ accessToken: null, customer: null }),

      isAuthenticated: () => Boolean(get().accessToken),
    }),
    {
      name: 'woontegra-customer-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        customer: state.customer,
      }),
    },
  ),
);
