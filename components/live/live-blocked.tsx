import Link from 'next/link';
import { Radio } from 'lucide-react';

/** The app's rule: astrologer accounts can't watch live streams (LiveViewerScreen's blocked state). */
export function LiveBlocked() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Radio className="h-14 w-14 text-primary" strokeWidth={1.25} aria-hidden />
      <h1 className="font-app text-[22px] font-semibold text-[#4a1a1a]">
        Live streams aren&apos;t available on astrologer accounts
      </h1>
      <p className="max-w-md font-app text-[16px] text-[#6d6d6d]">
        Log in with a user/client account to watch live streams.
      </p>
      <Link href="/astrologer" className="rounded-full bg-primary px-6 py-2.5 font-app text-[16px] text-white">
        Go Back
      </Link>
    </div>
  );
}
