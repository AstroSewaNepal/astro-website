import type { Metadata } from 'next';

import { PaymentReturn } from '@/components/payments/payment-return';
import { requireClient } from '@/lib/auth/require-client';

export const metadata: Metadata = {
  title: 'Payment',
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Where eSewa and card payments started on the website come back to (backend PaymentReturnService). */
export default async function PaymentReturnPage({ searchParams }: Props) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') params.set(key, value);
  }
  const query = params.toString();
  // Logged out (an expired session): sign in and land back here with the same payment.
  await requireClient(`/payment/return${query ? `?${query}` : ''}`);
  return <PaymentReturn query={query} />;
}
