'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Check, Copy, Ellipsis, Share, SquarePlus, X } from 'lucide-react';

import type { HomeScreenState } from '@/hooks/use-home-screen';
import type { PrivateKind } from '@/lib/account/nav';

type Step = { text: React.ReactNode };

const iconClass = 'inline h-[18px] w-[18px] -translate-y-px text-[#0a64d8]';
const ShareIcon = () => <Share className={iconClass} strokeWidth={2} aria-label="Share" />;
const AddIcon = () => <SquarePlus className={iconClass} strokeWidth={2} aria-hidden />;
const MoreIcon = () => <Ellipsis className={iconClass} strokeWidth={2.5} aria-label="More" />;

function stepsFor(state: HomeScreenState): Step[] {
  const addSteps: Step[] = [
    {
      text: (
        <>
          Scroll down and tap <b>Add to Home Screen</b> <AddIcon />.
        </>
      ),
    },
    {
      text: (
        <>
          Tap <b>Add</b> at the top right.
        </>
      ),
    },
    {
      text: (
        <>
          Open <b>AstroSewa</b> from the new icon on your Home Screen. If it asks, sign in again.
        </>
      ),
    },
  ];
  if (state.browser === 'safari') {
    const where = state.device === 'ipad' ? 'at the top right' : 'at the bottom of Safari';
    return [
      {
        text: (
          <>
            Tap the <b>Share</b> button <ShareIcon /> {where}. Can&apos;t see it? Tap <MoreIcon />{' '}
            first.
          </>
        ),
      },
      ...addSteps,
    ];
  }
  return [
    {
      text: (
        <>
          Tap the <b>Share</b> button <ShareIcon /> next to the address bar (or in the <MoreIcon />{' '}
          menu).
        </>
      ),
    },
    ...addSteps,
  ];
}

function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard
          ?.writeText(window.location.origin)
          .then(() => setCopied(true))
          .catch(() => undefined);
      }}
      className="mx-auto mt-1 flex h-[40px] items-center gap-2 rounded-full border border-[#BE7B71] px-5 font-app text-[15px] text-[#720A0B]"
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <Copy className="h-4 w-4" aria-hidden />
      )}
      {copied ? 'Link copied' : 'Copy link'}
    </button>
  );
}

/**
 * How to add the site to the iPhone/iPad Home Screen, in the app's popup style (LocationAccessPrompt modal): icon,
 * title, why, numbered steps for this browser, one button. Opened by the home banner and the Settings row.
 */
export function HomeScreenGuide({
  state,
  kind,
  open,
  onOpenChange,
  settingsHint = false,
}: {
  state: HomeScreenState;
  kind: PrivateKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opened from the home banner: say the guide stays in Settings, so closing it loses nothing. */
  settingsHint?: boolean;
}) {
  const why =
    kind === 'astrologer'
      ? 'Open AstroSewa like an app, full screen from its own icon. On iPhone, alerts for new bookings and calls only work when you open AstroSewa from the Home Screen.'
      : 'Open AstroSewa like an app, full screen from its own icon. On iPhone, notifications only work when you open AstroSewa from the Home Screen.';

  let title = 'Add AstroSewa to your Home Screen';
  let body: React.ReactNode;
  if (state.standalone) {
    title = "You're all set";
    body = (
      <p className="font-app text-[15px] leading-relaxed text-[#4a1a1a]">
        AstroSewa is on your Home Screen. Keep opening it from there.
      </p>
    );
  } else if (state.browser === 'in-app') {
    body = (
      <>
        <p className="font-app text-[15px] leading-relaxed text-[#4a1a1a]">{why}</p>
        <p className="font-app text-[15px] leading-relaxed text-[#4a1a1a]">
          This app&apos;s browser can&apos;t do it. Tap <MoreIcon /> and choose{' '}
          <b>Open in Safari</b> (or <b>Open in browser</b>), or copy the link and paste it into
          Safari.
        </p>
        <CopyLink />
      </>
    );
  } else {
    body = (
      <>
        <p className="font-app text-[15px] leading-relaxed text-[#4a1a1a]">{why}</p>
        <ol className="flex flex-col gap-3 text-left">
          {stepsFor(state).map((step, i) => (
            <li key={i} className="flex gap-3 font-app text-[15px] leading-snug text-[#4a1a1a]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#720A0B] text-[13px] font-semibold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">{step.text}</span>
            </li>
          ))}
        </ol>
        {state.browser === 'other' ? (
          <p className="font-app text-[13px] leading-relaxed text-[#7a5a4a]">
            No <b>Add to Home Screen</b>? Open astrosewa.com in Safari and try there.
          </p>
        ) : null}
      </>
    );
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/60" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[81] flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-[20px] bg-[#f8f0dc] px-5 pb-5 pt-8 text-center shadow-xl outline-none"
        >
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#720A0B] text-white"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
          <Image
            src="/apple-touch-icon.png"
            alt=""
            width={60}
            height={60}
            className="mx-auto rounded-[14px] shadow-[0_2px_8px_rgba(92,56,23,0.18)]"
          />
          <DialogPrimitive.Title className="font-app text-[21px] font-semibold leading-snug text-[#720A0B]">
            {title}
          </DialogPrimitive.Title>
          {body}
          <DialogPrimitive.Close className="mt-1 h-[44px] w-full rounded-full bg-[#720A0B] font-app text-[17px] text-white">
            {state.standalone ? 'Done' : 'Got it'}
          </DialogPrimitive.Close>
          {settingsHint && !state.standalone ? (
            <p className="-mt-1 font-app text-[13px] leading-relaxed text-[#7a5a4a]">
              No rush: this guide is always in <b>Settings</b>, so it&apos;s fine to close it.
            </p>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
