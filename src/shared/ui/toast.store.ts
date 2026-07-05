import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  items: ToastItem[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, variant = 'success') => {
    const id = String(++counter);
    set((state) => ({
      items: [...state.items, { id, message, variant }],
    }));
    window.setTimeout(() => {
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    }, 4000);
  },
  dismiss: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));

export function toast(message: string, variant: ToastVariant = 'success') {
  useToastStore.getState().push(message, variant);
}
