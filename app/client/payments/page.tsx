import type { Metadata } from 'next';

import { MyPayments } from '@/components/payments/my-payments';
import { TRANSACTION_FILTERS, type TransactionFilter } from '@/lib/payments/transactions';

export const metadata: Metadata = { title: 'My Payments' };

type Props = { searchParams: Promise<{ type?: string | string[] }> };

/** `?type=remedy` opens on one kind (the app's Orders button: My Payments filtered to remedies). */
export default async function ClientPaymentsPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const initialType =
    TRANSACTION_FILTERS.find(f => f.id === type)?.id ?? ('all' as TransactionFilter);
  return <MyPayments key={initialType} initialType={initialType} />;
}
