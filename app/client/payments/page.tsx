import type { Metadata } from 'next';

import { MyPayments } from '@/components/payments/my-payments';

export const metadata: Metadata = { title: 'My Payments' };

export default function ClientPaymentsPage() {
  return <MyPayments />;
}
