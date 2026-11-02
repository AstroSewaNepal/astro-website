import { AccountArea, accountAreaMetadata } from '@/components/account/account-area';

export const metadata = accountAreaMetadata;

export default function AstrologerLayout({ children }: { children: React.ReactNode }) {
  return <AccountArea kind="astrologer">{children}</AccountArea>;
}
