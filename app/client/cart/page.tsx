import type { Metadata } from 'next';

import { RemedyCart } from '@/components/remedies/remedy-cart';

export const metadata: Metadata = { title: 'My Cart' };

export default function ClientCartPage() {
  return <RemedyCart />;
}
