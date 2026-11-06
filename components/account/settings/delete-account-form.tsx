'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import clsx from 'clsx';

import { ConfirmDialog } from '@/components/account/confirm-dialog';
import { useBackendClient } from '@/hooks/use-backend-client';
import type { PrivateKind } from '@/lib/account/nav';
import {
  canConfirmDeletion,
  DELETE_CONFIRM,
  DELETE_REASONS,
  DELETE_WARNING,
  type DeleteReason,
  settingsPaths,
} from '@/lib/account/settings';
import { BackendError } from '@/lib/backend/client';

/** Delete account (Figma Setting/Delete-Account 956, the app's DeleteAccountScreen). */
export function DeleteAccountForm({ kind }: { kind: PrivateKind }) {
  const backend = useBackendClient();
  const [reason, setReason] = useState<DeleteReason | null>(null);
  const [otherText, setOtherText] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = canConfirmDeletion(reason, otherText);

  const deleteAccount = async () => {
    setDeleting(true);
    setError(null);
    try {
      // Deactivates now, deletes after 30 days; the backend ends every session. Logging in again offers to cancel.
      await backend.delete('/users/me');
    } catch (err) {
      setDeleting(false);
      setError(
        err instanceof BackendError
          ? err.message
          : 'Could not delete your account. Please try again.',
      );
      return;
    }
    await signOut({ redirectTo: '/' });
  };

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <h1 className="mb-6 text-center text-[28px] font-normal text-primary lg:text-[34px]">
        Delete Account
      </h1>
      <p className="font-app text-[16px] leading-relaxed text-[#2b2b2b]">{DELETE_WARNING}</p>

      <fieldset className="mt-8">
        <legend className="font-app text-[16px] text-[#720A0B]">
          Please explain why you want to delete your account
        </legend>
        <div className="mt-2 divide-y divide-dotted divide-[#720A0B]/60">
          {DELETE_REASONS.map(item => (
            <div key={item.value} className="py-4">
              <label className="flex cursor-pointer items-center gap-4 font-app text-[17px] text-[#2b2b2b]">
                <input
                  type="radio"
                  name="delete-reason"
                  value={item.value}
                  checked={reason === item.value}
                  onChange={() => setReason(item.value)}
                  className="h-5 w-5 shrink-0 accent-[#720A0B]"
                />
                {item.label}
              </label>
              {item.value === 'other' && reason === 'other' ? (
                <textarea
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  placeholder="Please specify"
                  maxLength={500}
                  autoFocus
                  rows={4}
                  className="mt-3 w-full rounded-2xl border border-[#720A0B] bg-transparent px-4 py-3 font-app text-[16px] text-[#2b2b2b] outline-none focus:border-primary"
                />
              ) : null}
            </div>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex gap-4">
        <Link
          href={settingsPaths(kind).security}
          className="flex h-[56px] flex-1 items-center justify-center rounded-full bg-[#720A0B] font-app text-[18px] text-white"
        >
          Cancel
        </Link>
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className={clsx(
            'h-[56px] flex-[2] rounded-full border bg-[#f8f0dc] font-app text-[18px]',
            ready ? 'border-[#720A0B] text-[#720A0B]' : 'border-[#BE7B71] text-[#BE7B71]',
          )}
        >
          Confirm Deletion
        </button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={DELETE_CONFIRM.title}
        message={DELETE_CONFIRM.message}
        confirmText="Delete"
        cancelText="Cancel"
        busy={deleting}
        error={error}
        onConfirm={() => void deleteAccount()}
      />
    </div>
  );
}
