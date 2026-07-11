'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2 } from 'lucide-react';
import { OnboardingStatusDetail } from '@/lib/astrologer-verification-api';
import { useOnboardingStatusDetail } from '@/hooks/use-astrologer-verification';

const STAGE_STATE_STYLES: Record<string, string> = {
  DONE: 'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-yellow-50 text-yellow-700',
  UPCOMING: 'bg-neutral-100 text-neutral-500',
  REJECTED: 'bg-red-50 text-red-700',
  APPROVED: 'bg-green-50 text-green-700',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function currentStage(item: OnboardingStatusDetail): { title: string; state: string } {
  const inProgress = item.status.find(s => s.state === 'IN_PROGRESS');
  if (inProgress) return { title: inProgress.title, state: inProgress.state };
  const last = item.status[item.status.length - 1];
  return last ? { title: last.title, state: last.state } : { title: '—', state: 'UPCOMING' };
}

function ReviewApplicationModal({ astrologerId }: { astrologerId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useOnboardingStatusDetail(open ? astrologerId : null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-7 w-7 items-center justify-center rounded hover:bg-neutral-100"
        aria-label="Review application"
      >
        <Eye size={15} className="text-neutral-500" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto font-mukta">
          <DialogHeader>
            <DialogTitle className="font-mukta text-base">Astrologer Application</DialogTitle>
          </DialogHeader>

          {isLoading || !data ? (
            <p className="py-6 text-center text-sm text-neutral-400">Loading…</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  {data.user?.fullName ?? '—'}
                </p>
                <p className="text-xs text-neutral-400">{data.user?.email ?? '—'}</p>
                {data.user?.phoneNumber && (
                  <p className="text-xs text-neutral-400">{data.user.phoneNumber}</p>
                )}
              </div>

              {data.astrologer && (
                <div className="rounded-lg border border-neutral-100 p-3 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Profile
                  </p>
                  {typeof data.astrologer.yearsOfExperience === 'number' && (
                    <p className="text-xs text-neutral-600">
                      Experience: {data.astrologer.yearsOfExperience} years
                    </p>
                  )}
                  {data.astrologer.specialist && data.astrologer.specialist.length > 0 && (
                    <p className="text-xs text-neutral-600">
                      Specialist: {data.astrologer.specialist.join(', ')}
                    </p>
                  )}
                  {data.astrologer.language && data.astrologer.language.length > 0 && (
                    <p className="text-xs text-neutral-600">
                      Languages: {data.astrologer.language.join(', ')}
                    </p>
                  )}
                  {data.astrologer.bio && (
                    <p className="text-xs text-neutral-600">{data.astrologer.bio}</p>
                  )}
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Onboarding Stages
                </p>
                <ul className="space-y-2">
                  {data.status.map(stage => (
                    <li key={stage.stage} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-neutral-700">{stage.title}</span>
                      <Badge
                        className={`${STAGE_STATE_STYLES[stage.state] ?? ''} font-mukta text-[10px]`}
                      >
                        {stage.state}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>

              {data.decisionHistory && data.decisionHistory.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Decision History
                  </p>
                  <ul className="space-y-2">
                    {data.decisionHistory.map((d, i) => (
                      <li key={i} className="rounded-lg border border-neutral-100 p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`${STAGE_STATE_STYLES[d.decision] ?? ''} font-mukta text-[10px]`}
                          >
                            {d.decision}
                          </Badge>
                          <span className="text-neutral-400">{formatDate(d.decidedAt)}</span>
                        </div>
                        {d.reason && <p className="mt-1 text-neutral-600">Reason: {d.reason}</p>}
                        {d.notes && <p className="mt-1 text-neutral-500">Notes: {d.notes}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function RejectReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) setReason('');
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md font-mukta">
        <DialogHeader>
          <DialogTitle className="font-mukta text-base">Reject Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="font-mukta text-sm text-neutral-700">
            Reason for rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Explain why this application is being rejected"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mukta"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-mukta"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!reason.trim() || isPending}
            onClick={() => onConfirm(reason.trim())}
            className="font-mukta text-white"
            style={{ backgroundColor: '#611508' }}
          >
            {isPending ? 'Rejecting…' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ColumnActions {
  onDecision: (
    astrologerId: string,
    input: { decision: 'APPROVED' | 'REJECTED'; reason?: string },
  ) => void;
  pendingId: string | null;
}

export function createColumns({
  onDecision,
  pendingId,
}: ColumnActions): ColumnDef<OnboardingStatusDetail>[] {
  return [
    {
      id: 'astrologer',
      header: 'Astrologer',
      cell: ({ row }) => (
        <div className="font-mukta">
          <p className="text-sm text-neutral-800">{row.original.user?.fullName ?? '—'}</p>
          <p className="text-xs text-neutral-400">{row.original.user?.email ?? '—'}</p>
        </div>
      ),
    },
    {
      id: 'stage',
      header: 'Current Stage',
      cell: ({ row }) => {
        const stage = currentStage(row.original);
        return (
          <Badge className={`${STAGE_STATE_STYLES[stage.state] ?? ''} font-mukta text-xs`}>
            {stage.title}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'rejectionCount',
      header: 'Rejections',
      cell: ({ row }) => (
        <span className="font-mukta text-sm text-neutral-600">
          {row.original.rejectionCount ?? 0}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted',
      cell: ({ getValue }) => (
        <span className="font-mukta text-sm text-neutral-500">
          {formatDate(getValue<string>())}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const astrologerId = row.original.astrologerId;
        const isPending = pendingId === astrologerId;
        return (
          <RowActions astrologerId={astrologerId} isPending={isPending} onDecision={onDecision} />
        );
      },
    },
  ];
}

function RowActions({
  astrologerId,
  isPending,
  onDecision,
}: {
  astrologerId: string;
  isPending: boolean;
  onDecision: ColumnActions['onDecision'];
}) {
  const [rejectOpen, setRejectOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <ReviewApplicationModal astrologerId={astrologerId} />
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() => onDecision(astrologerId, { decision: 'APPROVED' })}
        className="h-7 font-mukta text-xs text-white"
        style={{ backgroundColor: '#611508' }}
      >
        {isPending ? <Loader2 size={13} className="animate-spin" /> : 'Approve'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => setRejectOpen(true)}
        className="h-7 font-mukta text-xs"
      >
        Reject
      </Button>
      <RejectReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        isPending={isPending}
        onConfirm={reason => {
          onDecision(astrologerId, { decision: 'REJECTED', reason });
          setRejectOpen(false);
        }}
      />
    </div>
  );
}
