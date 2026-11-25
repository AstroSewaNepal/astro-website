'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import { accountKind, signInAgainPath } from '@/lib/auth/account';
import {
  CART_QUERY_KEY,
  DEFAULT_ZONE,
  cartCount,
  cartItems,
  type Cart,
  type CartItem,
  type DeliveryZone,
} from '@/lib/remedies/cart';
import type { Remedy } from '@/lib/remedies/catalogue';

/**
 * The buyer's server-side cart (the app's useCart). Only clients have one: guests are sent to log in when they add
 * something, and astrologers and admins browse without cart controls, as in the app.
 */
export function useRemedyCart() {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const isClient = status === 'authenticated' && accountKind(session?.user?.roles) === 'client';
  const isGuest = status === 'unauthenticated';

  const cart = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => backend.get<Cart>('/cart'),
    enabled: isClient,
    staleTime: 30_000,
  });
  const keep = (next: Cart) => queryClient.setQueryData(CART_QUERY_KEY, next);

  const add = useMutation({
    mutationFn: (body: {
      remedyId: string;
      quantity?: number;
      deliveryZone?: DeliveryZone;
      countryCode?: string;
    }) => backend.post<Cart>('/cart/items', body),
    onSuccess: keep,
  });
  const setQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      backend.patch<Cart>(`/cart/items/${encodeURIComponent(itemId)}`, { quantity }),
    onSuccess: keep,
  });
  const remove = useMutation({
    mutationFn: (itemId: string) =>
      backend.delete<Cart>(`/cart/items/${encodeURIComponent(itemId)}`),
    onSuccess: keep,
  });

  return {
    isClient,
    isGuest,
    cart,
    items: cartItems(cart.data),
    count: cartCount(cart.data),
    add,
    setQuantity,
    remove,
  };
}

/** Add / − qty + for one product (the app's useRemedyCart + RemedyCartControls). */
export function useRemedyCartLine(remedy: Pick<Remedy, 'id' | 'deliveryType'>) {
  const router = useRouter();
  const { countryCode } = useBuyerCountry();
  const { isClient, isGuest, items, add, setQuantity, remove } = useRemedyCart();
  const [error, setError] = useState<string | null>(null);
  const line: CartItem | undefined = items.find(item => item.remedyId === remedy.id);
  const fail = (e: unknown) =>
    setError(
      e instanceof Error && e.message ? e.message : 'Could not update your cart. Please try again.',
    );
  const busy =
    (add.isPending && add.variables?.remedyId === remedy.id) ||
    (!!line && setQuantity.isPending && setQuantity.variables?.itemId === line.id) ||
    (!!line && remove.isPending && remove.variables === line.id);

  const addToCart = () => {
    setError(null);
    if (isGuest) {
      router.push(signInAgainPath(window.location.pathname + window.location.search));
      return;
    }
    if (!isClient) return;
    add.mutate(
      {
        remedyId: remedy.id,
        quantity: 1,
        // The server prices it for this country; physical items need a zone (the cart can change it).
        ...(countryCode ? { countryCode } : {}),
        ...(remedy.deliveryType === 'physical' ? { deliveryZone: DEFAULT_ZONE } : {}),
      },
      { onError: fail },
    );
  };
  const increase = () => {
    if (!line) return;
    setError(null);
    setQuantity.mutate({ itemId: line.id, quantity: line.quantity + 1 }, { onError: fail });
  };
  const decrease = () => {
    if (!line) return;
    setError(null);
    if (line.quantity > 1) {
      setQuantity.mutate({ itemId: line.id, quantity: line.quantity - 1 }, { onError: fail });
    } else {
      remove.mutate(line.id, { onError: fail });
    }
  };

  return {
    /** Show the controls (clients, and guests who are asked to log in). */
    canBuy: isClient || isGuest,
    line,
    busy,
    error,
    addToCart,
    increase,
    decrease,
  };
}
