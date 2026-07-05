import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from '@/shared/api/cart.api';

export const CART_QUERY_KEY = ['public', 'cart'] as const;

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: getCart,
    staleTime: 30_000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

  const addMutation = useMutation({
    mutationFn: addCartItem,
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateCartItem(id, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    itemCount: cartQuery.data?.itemCount ?? 0,
    addMutation,
    updateMutation,
    removeMutation,
    invalidate,
  };
}
