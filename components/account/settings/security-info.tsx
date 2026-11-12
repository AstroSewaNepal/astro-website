import Link from 'next/link';
import { Ban, Trash2 } from 'lucide-react';

import type { PrivateKind } from '@/lib/account/nav';
import { SECURITY_SECTIONS, settingsPaths } from '@/lib/account/settings';

const buttonClass =
  'flex h-[56px] w-full items-center justify-center gap-3 rounded-full border bg-[#f8f0dc] font-app text-[18px]';

/** Security (Figma Setting/Delete-Account 1138, the app's SecurityScreen): what we do with data, then account actions. */
export function SecurityInfo({ kind }: { kind: PrivateKind }) {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <h1 className="mb-6 text-center text-[28px] font-normal text-primary lg:text-[34px]">
        Security
      </h1>

      <div className="flex flex-col gap-6">
        {SECURITY_SECTIONS.map(section => (
          <section key={section.title}>
            <h2 className="font-app text-[17px] font-medium text-[#720A0B]">{section.title}</h2>
            <p className="mt-2 font-app text-[16px] leading-relaxed text-[#2b2b2b]">
              {section.content}
            </p>
            {section.link ? (
              <Link
                href={section.link.href}
                className="mt-1 inline-block font-app text-[15px] text-primary underline"
              >
                {section.link.label}
              </Link>
            ) : null}
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {kind === 'client' ? (
          <Link
            href={settingsPaths(kind).blockedUsers}
            className={`${buttonClass} border-[#720A0B] text-[#720A0B]`}
          >
            <Ban className="h-5 w-5" aria-hidden />
            Blocked users
          </Link>
        ) : (
          // The astrologer area is built in doc 17.
          <span
            aria-disabled
            className={`${buttonClass} cursor-default border-[#720A0B]/30 text-[#720A0B]/45`}
          >
            <Ban className="h-5 w-5" aria-hidden />
            Blocked users
            <span className="text-xs text-[#8a7a6a]">Soon</span>
          </span>
        )}
        <Link
          href={settingsPaths(kind).deleteAccount}
          className={`${buttonClass} border-[#BE7B71] text-[#BE7B71]`}
        >
          <Trash2 className="h-5 w-5" aria-hidden />
          Delete your Account
        </Link>
      </div>
    </div>
  );
}
