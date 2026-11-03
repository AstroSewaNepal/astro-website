import { AccountArea, accountAreaMetadata } from '@/components/account/account-area';

export const metadata = accountAreaMetadata;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AccountArea kind="client">{children}</AccountArea>;
}
