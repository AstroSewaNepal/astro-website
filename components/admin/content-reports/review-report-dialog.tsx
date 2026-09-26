'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateContentReportStatus, useUpdateUserSuspension } from '@/hooks/use-content-reports';
import type { ContentReportRow } from '@/lib/content-reports-api';
import { REASON_LABELS, TARGET_LABELS } from './report-labels';

type ReviewReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ContentReportRow;
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 font-mukta text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="col-span-2 break-words text-neutral-800">{value}</span>
    </div>
  );
}

function formatUser(user: ContentReportRow['reporter']) {
  if (!user) return 'Deleted user';
  return [user.fullName, user.email].filter(Boolean).join(' · ');
}

export function ReviewReportDialog({ open, onOpenChange, row }: ReviewReportDialogProps) {
  const [note, setNote] = useState(row.resolutionNote ?? '');
  const mutation = useUpdateContentReportStatus();
  const suspensionMutation = useUpdateUserSuspension();
  const isPending = row.status === 'PENDING';
  const reportedUser = row.reportedUser;
  const isReportedUserSuspended = !!reportedUser?.isSuspended;
  const isAdminTarget = !!reportedUser?.roles?.some(role =>
    ['ADMIN', 'SUPER_ADMIN'].includes(role),
  );
  const pendingAction = mutation.isPending
    ? mutation.variables?.suspendReportedUser
      ? 'SUSPEND'
      : mutation.variables?.status
    : null;
  const isBusy = mutation.isPending || suspensionMutation.isPending;
  const error = mutation.error ?? suspensionMutation.error;

  function handleSubmit(status: 'RESOLVED' | 'DISMISSED', suspendReportedUser = false) {
    mutation.mutate(
      {
        reportId: row._id,
        status,
        resolutionNote: note.trim() || undefined,
        suspendReportedUser: suspendReportedUser || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  function handleLiftSuspension() {
    if (!reportedUser) return;
    suspensionMutation.mutate(
      { userId: reportedUser._id, suspended: false },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) setNote(row.resolutionNote ?? '');
        mutation.reset();
        suspensionMutation.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg font-mukta">
        <DialogHeader>
          <DialogTitle className="font-mukta text-base">
            {TARGET_LABELS[row.targetType]} report
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <DetailRow label="Reason" value={REASON_LABELS[row.reason] ?? row.reason} />
          <DetailRow
            label="Reported user"
            value={`${formatUser(row.reportedUser)}${isReportedUserSuspended ? ' (suspended)' : ''}`}
          />
          <DetailRow label="Reported by" value={formatUser(row.reporter)} />
          <DetailRow label="Submitted" value={new Date(row.createdAt).toLocaleString()} />
          <DetailRow label="Target ID" value={row.targetId} />
          <DetailRow label="Chat ID" value={row.chatId} />
          <DetailRow label="Live room" value={row.roomName} />
          {row.contentSnapshot && (
            <div className="rounded-lg bg-neutral-50 p-3 font-mukta text-sm text-neutral-800">
              <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
                Reported content
              </p>
              <p className="whitespace-pre-wrap break-words">{row.contentSnapshot}</p>
            </div>
          )}
          {row.description && (
            <div className="rounded-lg bg-neutral-50 p-3 font-mukta text-sm text-neutral-800">
              <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
                Reporter&apos;s note
              </p>
              <p className="whitespace-pre-wrap break-words">{row.description}</p>
            </div>
          )}
          {!isPending && (
            <DetailRow
              label="Handled by"
              value={`${formatUser(row.resolvedBy ?? null)}${
                row.resolvedAt ? ` · ${new Date(row.resolvedAt).toLocaleString()}` : ''
              }`}
            />
          )}
          <div className="space-y-2 pt-2">
            <label htmlFor="resolution-note" className="font-mukta text-sm text-neutral-700">
              Action taken / note
            </label>
            <textarea
              id="resolution-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="e.g. Removed the review and suspended the account"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 font-mukta text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          {error && <p className="font-mukta text-sm text-red-600">{error.message}</p>}
        </div>
        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          {isReportedUserSuspended ? (
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={handleLiftSuspension}
              className="font-mukta"
            >
              {suspensionMutation.isPending ? 'Lifting…' : 'Lift suspension'}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isBusy || !reportedUser || isAdminTarget}
              onClick={() => handleSubmit('RESOLVED', true)}
              className="bg-red-700 font-mukta text-white hover:bg-red-800"
            >
              {pendingAction === 'SUSPEND' ? 'Suspending…' : 'Resolve & suspend user'}
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => handleSubmit('DISMISSED')}
              className="font-mukta"
            >
              {pendingAction === 'DISMISSED' ? 'Dismissing…' : 'Dismiss'}
            </Button>
            <Button
              type="button"
              disabled={isBusy}
              onClick={() => handleSubmit('RESOLVED')}
              className="font-mukta text-white"
              style={{ backgroundColor: '#611508' }}
            >
              {pendingAction === 'RESOLVED' ? 'Saving…' : 'Mark as Resolved'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
