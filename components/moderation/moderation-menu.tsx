'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Ban, EllipsisVertical, Flag } from 'lucide-react';
import clsx from 'clsx';

import { BlockDialog } from '@/components/moderation/block-dialog';
import { ReportDialog } from '@/components/moderation/report-dialog';
import type { ReportTarget } from '@/lib/moderation';

/** Report and block need a login, and nobody reports or blocks themselves (the app hides the menu then). */
export function useCanModerate(targetUserId: string | null | undefined): boolean {
  const { data: session } = useSession();
  const me = session?.user?.id;
  return Boolean(me && targetUserId && me !== targetUserId);
}

/**
 * The app's header ⋮ menu (Report / Block) with its two dialogs: astrologer profile, live stream. Renders nothing for
 * guests and for the person themselves.
 */
export function ModerationMenu({
  report,
  block,
  label = 'More options',
  triggerClassName,
  iconClassName = 'h-5 w-5',
  children,
}: {
  report: { title: string; target: ReportTarget };
  block: { userId: string; name?: string; onBlocked?: () => void };
  label?: string;
  triggerClassName?: string;
  iconClassName?: string;
  /** Custom trigger content (e.g. a round button with a caption); defaults to a ⋮ icon. */
  children?: React.ReactNode;
}) {
  const allowed = useCanModerate(block.userId);
  const [reporting, setReporting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  if (!allowed) return null;

  const item =
    'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-app text-[15px] text-primary outline-none data-[highlighted]:bg-primary/10';
  return (
    <>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger aria-label={label} className={triggerClassName}>
          {children ?? <EllipsisVertical className={iconClassName} aria-hidden />}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-[95] min-w-[150px] rounded-xl border border-[#720A0B]/30 bg-[#FAF6E3] p-1.5 shadow-lg"
          >
            <DropdownMenu.Item onSelect={() => setReporting(true)} className={item}>
              <Flag className="h-4 w-4" aria-hidden />
              Report
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 border-t border-dashed border-[#720A0B]/30" />
            <DropdownMenu.Item
              onSelect={() => setBlocking(true)}
              className={clsx(item, 'text-[#B5655F]')}
            >
              <Ban className="h-4 w-4" aria-hidden />
              Block
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {reporting ? (
        <ReportDialog
          title={report.title}
          target={report.target}
          onClose={() => setReporting(false)}
        />
      ) : null}
      <BlockDialog
        user={{ id: block.userId, name: block.name }}
        open={blocking}
        onOpenChange={setBlocking}
        onBlocked={block.onBlocked}
      />
    </>
  );
}
