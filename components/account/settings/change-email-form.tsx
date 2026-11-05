'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';

import type { ProfileUpdate } from '@/auth';
import { useBackendClient } from '@/hooks/use-backend-client';
import type { PrivateKind } from '@/lib/account/nav';
import { ME_QUERY_KEY } from '@/lib/account/profile';
import {
  type ChangeEmailForm as EmailForm,
  changeEmailSchema,
  cleanOtp,
  OTP_LENGTH,
  settingsPaths,
} from '@/lib/account/settings';
import { BackendError } from '@/lib/backend/client';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-[52px] w-full rounded-full border border-[#c9837a] bg-transparent px-5 font-mukta text-[17px] text-[#4a1a1a] outline-none focus:border-primary';
const labelClass = 'mb-2 block text-lg font-semibold text-primary';
const primaryButton =
  'flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-primary font-mukta text-lg text-white disabled:opacity-60';

const messageOf = (error: unknown, fallback: string) =>
  error instanceof BackendError && error.status < 500 ? error.message : fallback;

type Step = { name: 'form' } | { name: 'code'; email: string } | { name: 'done'; email: string };

/** Change email (the app's ChangeEmailScreen): new address twice, then the 6-digit code sent to it. */
export function ChangeEmailForm({ kind }: { kind: PrivateKind }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const { update } = useSession();
  const [step, setStep] = useState<Step>({ name: 'form' });
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState<'sending' | 'verifying' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: '', confirmNewEmail: '' },
  });

  const sendCode = async (email: string) => {
    setBusy('sending');
    setNotice(null);
    try {
      await backend.post('/auth/email/change', { newEmail: email, confirmNewEmail: email });
      setStep({ name: 'code', email });
      setOtp('');
      setNotice({ kind: 'success', text: `Verification code sent to ${email}` });
    } catch (error) {
      setNotice({
        kind: 'error',
        text: messageOf(error, 'Could not send verification code. Please try again.'),
      });
    } finally {
      setBusy(null);
    }
  };

  const verify = async (email: string) => {
    if (otp.length !== OTP_LENGTH) {
      setNotice({ kind: 'error', text: 'Please enter the 6-digit code' });
      return;
    }
    setBusy('verifying');
    setNotice(null);
    try {
      await backend.post('/auth/email/verify-change', { otp });
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      // The header menu shows the email from the session: the server re-reads it from the backend.
      await update({ profile: { syncEmail: true } } satisfies ProfileUpdate);
      setStep({ name: 'done', email });
    } catch (error) {
      setNotice({
        kind: 'error',
        text: messageOf(error, 'Invalid or expired code. Please try again.'),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <h1 className="mb-6 text-center text-[28px] font-normal text-primary lg:text-[34px]">
        Change Email
      </h1>

      {step.name === 'form' ? (
        <form
          noValidate
          onSubmit={handleSubmit(form => sendCode(form.newEmail.toLowerCase()))}
          className="flex flex-col gap-5"
        >
          <p className="font-mukta text-[17px] text-[#4a1a1a]">
            Enter a new email address. We&apos;ll send a verification code to confirm it&apos;s
            yours.
          </p>
          {/* The backend finds Google accounts by email (sso.service findOrCreateUser), so the old Gmail would make a
              new, empty account. */}
          <p className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 font-mukta text-[15px] text-amber-900">
            You sign in with Google, so use an email that is a Google account you can sign in with.
            After the change, sign in with that account. Signing in with your old email would create
            a new, empty account.
          </p>
          <div>
            <label htmlFor="new-email" className={labelClass}>
              New Email
            </label>
            <input
              id="new-email"
              type="email"
              autoComplete="email"
              placeholder="Enter new email address"
              className={fieldClass}
              {...register('newEmail')}
            />
            <FieldError text={errors.newEmail?.message} />
          </div>
          <div>
            <label htmlFor="confirm-email" className={labelClass}>
              Confirm New Email
            </label>
            <input
              id="confirm-email"
              type="email"
              autoComplete="email"
              placeholder="Re-enter new email address"
              className={fieldClass}
              {...register('confirmNewEmail')}
            />
            <FieldError text={errors.confirmNewEmail?.message} />
          </div>
          <Notice notice={notice} />
          <button type="submit" disabled={busy !== null} className={primaryButton}>
            {busy === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
            Send Code
          </button>
        </form>
      ) : null}

      {step.name === 'code' ? (
        <form
          noValidate
          onSubmit={e => {
            e.preventDefault();
            void verify(step.email);
          }}
          className="flex flex-col gap-5"
        >
          <p className="font-mukta text-[17px] text-[#4a1a1a]">
            Enter the verification code sent to <strong className="break-all">{step.email}</strong>
          </p>
          <div>
            <label htmlFor="email-code" className={labelClass}>
              Verification Code
            </label>
            <input
              id="email-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={e => {
                setOtp(cleanOtp(e.target.value));
                setNotice(null);
              }}
              className={cn(fieldClass, 'tracking-[0.3em]')}
            />
          </div>
          <Notice notice={notice} />
          <button type="submit" disabled={busy !== null} className={primaryButton}>
            {busy === 'verifying' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
            Verify &amp; Update
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void sendCode(step.email)}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-full border border-primary font-mukta text-lg text-primary disabled:opacity-60"
          >
            {busy === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
            Resend Code
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => {
              setStep({ name: 'form' });
              setNotice(null);
            }}
            className="font-mukta text-[15px] text-primary underline disabled:opacity-50"
          >
            Use a different email
          </button>
        </form>
      ) : null}

      {step.name === 'done' ? (
        <div className="flex flex-col items-center gap-4 text-center" role="status">
          <CheckCircle2 className="h-14 w-14 text-green-700" aria-hidden />
          <p className="font-mukta text-[18px] text-[#4a1a1a]">
            Email updated successfully. Your account email is now{' '}
            <strong className="break-all">{step.email}</strong>.
          </p>
          <Link href={settingsPaths(kind).root} className={cn(primaryButton, 'mt-2')}>
            Back to Settings
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Notice({ notice }: { notice: { kind: 'error' | 'success'; text: string } | null }) {
  if (!notice) return null;
  return (
    <p
      role={notice.kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-2xl border px-5 py-3 text-center font-mukta text-[15px]',
        notice.kind === 'error'
          ? 'border-red-300 bg-red-50 text-red-800'
          : 'border-green-300 bg-green-50 text-green-800',
      )}
    >
      {notice.text}
    </p>
  );
}

function FieldError({ text }: { text?: string }) {
  return text ? <p className="mt-1.5 px-2 font-mukta text-sm text-red-700">{text}</p> : null;
}
