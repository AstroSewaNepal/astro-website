'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronRight, FileText, ImagePlus, Loader2, Mail, Phone, X } from 'lucide-react';

import { useBackendClient } from '@/hooks/use-backend-client';
import type { PrivateKind } from '@/lib/account/nav';
import {
  DEFAULT_DIAL_CODE,
  ME_QUERY_KEY,
  splitPhone,
  type MeResponse,
} from '@/lib/account/profile';
import { COUNTRIES } from '@/lib/data/countries';
import { cn } from '@/lib/utils';
import {
  emailUsBody,
  emailUsErrors,
  MAX_SUPPORT_IMAGES,
  POLICY_LINKS,
  SUPPORT_EMAILS,
  SUPPORT_PHONES,
  supportImagesProblem,
  supportPath,
  type EmailUsErrors,
  type EmailUsForm,
} from '@/lib/support/support';

const rowClass =
  'flex w-full items-center gap-4 py-4 font-app text-[19px] text-[#611508] lg:text-[20px]';
const titleClass =
  'mb-4 text-center text-[28px] font-normal text-primary lg:text-left lg:text-[34px]';
const fieldClass =
  'w-full rounded-[26px] border border-[#c9837a] bg-transparent px-5 font-app text-[17px] text-[#4a1a1a] outline-none focus:border-primary';
const labelClass = 'mb-1.5 block font-app text-[16px] font-medium text-primary';

/** The app's CustomerSupportScreen (Figma Home/Customer-Support). Live chat and FAQs stay out, as in the app. */
export function SupportHome({ kind }: { kind: PrivateKind }) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0];
  const items = [
    { label: 'Email Us', href: supportPath(kind, 'email-us'), icon: Mail },
    { label: 'Contact Details', href: supportPath(kind, 'contact'), icon: Phone },
    { label: 'Policies', href: supportPath(kind, 'policies'), icon: FileText },
  ];
  return (
    <div className="mx-auto w-full max-w-[560px] lg:mx-0">
      <h1 className="text-[30px] font-normal leading-tight text-primary lg:text-[36px]">
        Hi, {firstName || 'there'}!
      </h1>
      <p className="mb-5 mt-1 max-w-[340px] font-app text-[20px] leading-snug text-[#B5655F]">
        How would you want to get help from us?
      </p>
      <ul className="divide-y divide-dashed divide-[#611508]/25 border-y border-dashed border-[#611508]/25">
        {items.map(item => (
          <li key={item.href}>
            <Link href={item.href} className={rowClass}>
              <item.icon className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The app's ContactDetailsScreen: tap to call or email. */
export function SupportContact() {
  return (
    <div className="mx-auto w-full max-w-[560px] lg:mx-0">
      <h1 className={titleClass}>Contact Details</h1>
      <p className="mb-2 font-app text-[18px] font-semibold text-primary">Reach us directly</p>
      <ul className="divide-y divide-dashed divide-[#611508]/25 border-y border-dashed border-[#611508]/25">
        {SUPPORT_PHONES.map(phone => (
          <li key={phone}>
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className={rowClass}>
              <Phone className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="flex-1 text-[#2f2f2f]">{phone}</span>
            </a>
          </li>
        ))}
        {SUPPORT_EMAILS.map(email => (
          <li key={email}>
            <a href={`mailto:${email}`} className={rowClass}>
              <Mail className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="flex-1 break-all text-[#2f2f2f]">{email}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The website's legal pages, from one place in the account (the app links the same pages). */
export function SupportPolicies() {
  return (
    <div className="mx-auto w-full max-w-[560px] lg:mx-0">
      <h1 className={titleClass}>Policies</h1>
      <ul className="divide-y divide-dashed divide-[#611508]/25 border-y border-dashed border-[#611508]/25">
        {POLICY_LINKS.map(link => (
          <li key={link.href}>
            <Link href={link.href} className={rowClass}>
              <FileText className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="flex-1">{link.label}</span>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Picked = { id: string; file: File; preview: string };

const EMPTY: EmailUsForm = {
  name: '',
  email: '',
  dialCode: DEFAULT_DIAL_CODE,
  phone: '',
  subject: '',
  description: '',
};

/** The app's EmailUsScreen (Figma Home/Email-us): prefilled from the profile, up to 5 photos. */
export function SupportEmailUs({ kind }: { kind: PrivateKind }) {
  const backend = useBackendClient();
  const router = useRouter();
  const me = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => backend.get<MeResponse>('/users/me'),
  });
  const [form, setForm] = useState<EmailUsForm>(EMPTY);
  const [tried, setTried] = useState(false);
  const [images, setImages] = useState<Picked[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [sentCase, setSentCase] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Prefill once from the profile, as the app does (set while rendering, the first time the profile is there).
  const [filled, setFilled] = useState(false);
  if (!filled && me.data) {
    setFilled(true);
    const { dialCode, phone } = splitPhone(me.data.user.phoneNumber);
    setForm(f => ({
      ...f,
      name: me.data.user.fullName ?? '',
      email: me.data.user.isPrivateRelayEmail ? '' : (me.data.user.email ?? ''),
      dialCode,
      phone,
    }));
  }

  // Free the photo previews when they go away.
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => () => imagesRef.current.forEach(i => URL.revokeObjectURL(i.preview)), []);

  const set = (key: keyof EmailUsForm) => (value: string) => setForm(f => ({ ...f, [key]: value }));
  const errors: EmailUsErrors = tried ? emailUsErrors(form) : {};

  const send = useMutation({
    mutationFn: () =>
      backend.post<{ caseId?: string }>(
        '/customer-support/email-us',
        emailUsBody(
          form,
          images.map(i => i.file),
        ),
      ),
    onSuccess: data => setSentCase(data?.caseId ?? ''),
  });

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    const problem = supportImagesProblem(images.length, files);
    setImageError(problem);
    if (problem) return;
    setImages(list => [
      ...list,
      ...files.map(file => ({
        id: `${file.name}-${file.size}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };
  const removeImage = (id: string) =>
    setImages(list => {
      const gone = list.find(i => i.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return list.filter(i => i.id !== id);
    });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.keys(emailUsErrors(form)).length || send.isPending) return;
    send.mutate();
  };

  if (sentCase !== null) {
    return (
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-3 py-12 text-center">
        <Mail className="h-14 w-14 text-primary" strokeWidth={1.25} aria-hidden />
        <h1 className="text-[26px] font-normal text-primary">Message sent</h1>
        <p className="font-app text-[16px] text-[#4a1a1a]">
          Your message has been submitted successfully. Our team will reply by email.
        </p>
        {sentCase ? (
          <p className="font-app text-[15px] text-[#6d6d6d]">
            Case ID: <span className="font-semibold text-[#4a1a1a]">{sentCase}</span>
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => router.push(supportPath(kind))}
          className="mt-2 rounded-full bg-primary px-8 py-3 font-app text-[17px] text-white"
        >
          Back to Support
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mx-auto flex w-full max-w-[560px] flex-col gap-4 lg:mx-0"
    >
      <h1 className={cn(titleClass, 'mb-0')}>Email Us</h1>
      <p className="font-app text-[19px] font-semibold text-primary">
        Get in Touch with Astro Sewa
      </p>

      <Field label="Name" error={errors.name} htmlFor="support-name">
        <input
          id="support-name"
          value={form.name}
          onChange={e => set('name')(e.target.value)}
          placeholder="Enter your name"
          autoComplete="name"
          maxLength={50}
          className={cn(fieldClass, 'h-[52px]')}
        />
      </Field>
      <Field label="Email" error={errors.email} htmlFor="support-email">
        <input
          id="support-email"
          type="email"
          value={form.email}
          onChange={e => set('email')(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          maxLength={150}
          className={cn(fieldClass, 'h-[52px]')}
        />
      </Field>
      <Field label="Mobile Number" error={errors.dialCode ?? errors.phone} htmlFor="support-phone">
        <div className="flex gap-2">
          <select
            aria-label="Country code"
            value={form.dialCode}
            onChange={e => set('dialCode')(e.target.value)}
            className={cn(fieldClass, 'h-[52px] w-[112px] shrink-0 appearance-none px-4')}
          >
            {COUNTRIES.map(c => (
              <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                {c.dialCode} {c.name}
              </option>
            ))}
          </select>
          <input
            id="support-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={form.phone}
            onChange={e => set('phone')(e.target.value.replace(/\D/g, ''))}
            placeholder="Mobile Number"
            className={cn(fieldClass, 'h-[52px] min-w-0 flex-1')}
          />
        </div>
      </Field>
      <Field label="Subject" error={errors.subject} htmlFor="support-subject">
        <input
          id="support-subject"
          value={form.subject}
          onChange={e => set('subject')(e.target.value)}
          placeholder="Write topic of your issue"
          maxLength={100}
          className={cn(fieldClass, 'h-[52px]')}
        />
      </Field>
      <Field label="Description" error={errors.description} htmlFor="support-description">
        <textarea
          id="support-description"
          value={form.description}
          onChange={e => set('description')(e.target.value)}
          placeholder="Write remarks"
          maxLength={1000}
          rows={6}
          className={cn(fieldClass, 'resize-none py-3')}
        />
      </Field>

      <div>
        <span className={labelClass}>Upload Supporting Images</span>
        <div className="flex flex-wrap gap-3 rounded-[20px] border border-dashed border-[#c9837a] p-4">
          {images.map(img => (
            <div
              key={img.id}
              className="relative h-[72px] w-[72px] overflow-hidden rounded-xl border border-[#e3c9b5]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
              <img src={img.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                aria-label={`Remove ${img.file.name}`}
                className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
          {images.length < MAX_SUPPORT_IMAGES ? (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex min-h-[72px] flex-1 items-center gap-3 text-left font-app text-[14px] text-primary"
            >
              <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full border border-[#c9837a] bg-[#fbf3df]">
                <ImagePlus className="h-6 w-6" aria-hidden />
              </span>
              Please upload the photo or screenshot of related issue.
            </button>
          ) : null}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            onChange={pick}
            className="hidden"
            aria-label="Upload supporting images"
          />
        </div>
        {imageError ? (
          <p role="alert" className="mt-1.5 px-1 font-app text-[14px] text-[#b42318]">
            {imageError}
          </p>
        ) : null}
      </div>

      {send.isError ? (
        <p role="alert" className="font-app text-[15px] text-[#b42318]">
          Could not send your message. {send.error.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={send.isPending}
        className="flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-primary font-app text-[18px] text-white disabled:opacity-60"
      >
        {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
        {send.isPending ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 px-1 font-app text-[14px] text-[#b42318]">{error}</p> : null}
    </div>
  );
}
