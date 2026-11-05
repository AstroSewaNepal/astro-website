'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2, Mail, Plus, Trash2, User } from 'lucide-react';

import type { ProfileUpdate } from '@/auth';
import { useBackendClient } from '@/hooks/use-backend-client';
import {
  currentGender,
  type GenderOption,
  imageProblem,
  MAX_GALLERY_PHOTOS,
  type MeResponse,
  type ProfileForm,
  profileFormData,
  profileSchema,
  splitPhone,
} from '@/lib/account/profile';
import { BackendError } from '@/lib/backend/client';
import { COUNTRIES } from '@/lib/data/countries';
import { cn } from '@/lib/utils';

const ME_KEY = ['users', 'me'] as const;

type NewImage = { id: string; file: File; preview: string };

const fieldClass =
  'h-[52px] w-full rounded-full border border-[#c9837a] bg-transparent px-5 font-mukta text-[17px] text-[#4a1a1a] outline-none focus:border-primary';
const labelClass = 'mb-2 block text-lg font-semibold text-primary';

const message = (error: unknown) =>
  error instanceof BackendError ? error.message : 'Could not update profile. Please try again.';

/** Client Edit profile (Figma Home/Edit-Profile, fields as the app's EditUserProfileScreen). */
export function EditProfileForm() {
  const backend = useBackendClient();
  const me = useQuery({ queryKey: ME_KEY, queryFn: () => backend.get<MeResponse>('/users/me') });
  const genders = useQuery({
    queryKey: ['genders'],
    queryFn: () => backend.get<GenderOption[]>('/genders'),
    staleTime: Infinity,
  });

  if (me.isPending || genders.isPending) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (me.isError) {
    return (
      <div className="py-16 text-center font-mukta text-[17px] text-[#4a1a1a]">
        <p>We could not load your profile.</p>
        <button type="button" onClick={() => me.refetch()} className="mt-3 text-primary underline">
          Try again
        </button>
      </div>
    );
  }
  return <ProfileEditor me={me.data} genders={Array.isArray(genders.data) ? genders.data : []} />;
}

function ProfileEditor({ me, genders }: { me: MeResponse; genders: GenderOption[] }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const { update } = useSession();

  const saved = splitPhone(me.user.phoneNumber);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: me.user.fullName ?? '',
      dialCode: saved.dialCode,
      phone: saved.phone,
      gender: currentGender(me, genders),
    },
  });

  const [newPicture, setNewPicture] = useState<NewImage | null>(null);
  const [newPhotos, setNewPhotos] = useState<NewImage[]>([]);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const pictureInput = useRef<HTMLInputElement>(null);
  const photosInput = useRef<HTMLInputElement>(null);

  // Previews are object URLs: free them when they go away.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, []);
  const toNewImage = (file: File): NewImage => {
    const preview = URL.createObjectURL(file);
    previews.current.add(preview);
    return { id: crypto.randomUUID(), file, preview };
  };
  const drop = (image: NewImage | null) => {
    if (!image) return;
    URL.revokeObjectURL(image.preview);
    previews.current.delete(image.preview);
  };

  const savedPhotos = me.userMedia?.media ?? [];
  const pictureUrl = newPicture?.preview ?? me.profilePicture?.url ?? null;
  const slotsLeft = MAX_GALLERY_PHOTOS - savedPhotos.length - newPhotos.length;
  const initial = (me.user.fullName || me.user.email).charAt(0).toUpperCase();

  const pickPicture = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const problem = imageProblem(file);
    if (problem) return setNotice({ kind: 'error', text: problem });
    drop(newPicture);
    setNewPicture(toNewImage(file));
    setNotice(null);
  };

  const pickPhotos = (files: FileList | null) => {
    const picked = Array.from(files ?? []);
    const problem = picked.map(imageProblem).find(Boolean);
    const usable = picked.filter(file => !imageProblem(file)).slice(0, Math.max(slotsLeft, 0));
    setNewPhotos(current => [...current, ...usable.map(toNewImage)]);
    if (problem) setNotice({ kind: 'error', text: problem });
    else if (usable.length < picked.length)
      setNotice({ kind: 'error', text: `You can have up to ${MAX_GALLERY_PHOTOS} photos.` });
    else setNotice(null);
  };

  // Saved images are removed right away, like the app; new ones only leave the form.
  const removeSaved = async (path: string, body?: unknown) => {
    setBusy('deleting');
    setNotice(null);
    try {
      await backend.delete(path, body);
      const fresh = await queryClient.fetchQuery({
        queryKey: ME_KEY,
        queryFn: () => backend.get<MeResponse>('/users/me'),
      });
      await update({
        profile: { image: fresh.profilePicture?.url ?? null },
      } satisfies ProfileUpdate);
    } catch (error) {
      setNotice({ kind: 'error', text: message(error) });
    } finally {
      setBusy(null);
    }
  };

  const removePicture = () => {
    if (newPicture) {
      drop(newPicture);
      setNewPicture(null);
    } else if (me.profilePicture) {
      void removeSaved('/media/profile-picture');
    }
  };

  const save = handleSubmit(async form => {
    setBusy('saving');
    setNotice(null);
    try {
      await backend.put(
        '/users/me',
        profileFormData(
          form,
          newPicture?.file ?? null,
          newPhotos.map(p => p.file),
        ),
      );
      const fresh = await queryClient.fetchQuery({
        queryKey: ME_KEY,
        queryFn: () => backend.get<MeResponse>('/users/me'),
      });
      await update({
        profile: { name: fresh.user.fullName, image: fresh.profilePicture?.url ?? null },
      } satisfies ProfileUpdate);
      drop(newPicture);
      newPhotos.forEach(drop);
      setNewPicture(null);
      setNewPhotos([]);
      setNotice({ kind: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setNotice({ kind: 'error', text: message(error) });
    } finally {
      setBusy(null);
    }
  });

  return (
    <form onSubmit={save} noValidate className="mx-auto w-full max-w-[560px]">
      <h1 className="mb-6 text-center text-[28px] font-normal text-primary lg:text-[34px]">
        Edit Profile
      </h1>

      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => pictureInput.current?.click()}
          className="relative h-[104px] w-[104px] overflow-hidden rounded-full bg-[#f1d9d2] text-primary"
          aria-label="Upload profile picture"
        >
          {pictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- backend URLs and blob previews
            <img src={pictureUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-mukta text-4xl font-semibold">{initial}</span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-black/35 pb-1.5 pt-1 text-xs text-white">
            <Camera className="h-4 w-4" aria-hidden />
            Upload
          </span>
        </button>
        <input
          ref={pictureInput}
          type="file"
          accept="image/*"
          hidden
          onChange={e => {
            pickPicture(e.target.files);
            e.target.value = '';
          }}
        />
        {pictureUrl ? (
          <button
            type="button"
            onClick={removePicture}
            disabled={busy !== null}
            className="mt-2 font-mukta text-[15px] text-primary underline disabled:opacity-50"
          >
            Remove photo
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Name
          </label>
          <div className="relative">
            <input
              id="profile-name"
              autoComplete="name"
              className={cn(fieldClass, 'pr-12')}
              {...register('name')}
            />
            <User
              className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a5a52]"
              aria-hidden
            />
          </div>
          <FieldError text={errors.name?.message} />
        </div>

        <div>
          <label htmlFor="profile-email" className={labelClass}>
            Email
          </label>
          <div className="relative">
            <input
              id="profile-email"
              value={me.user.email}
              readOnly
              className={cn(fieldClass, 'border-[#b9b0a8] pr-12 text-[#8a8580]')}
            />
            <Mail
              className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a8580]"
              aria-hidden
            />
          </div>
          {me.user.isPrivateRelayEmail ? (
            <p className="mt-1.5 font-mukta text-sm text-red-700">
              This is a private Apple relay address. Add a real email so you don&apos;t miss
              important updates.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="profile-gender" className={labelClass}>
            Gender
          </label>
          <select
            id="profile-gender"
            className={cn(fieldClass, 'appearance-none')}
            {...register('gender')}
          >
            <option value="">Select gender</option>
            {genders.map(g => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="profile-phone" className={labelClass}>
            Phone
          </label>
          <div className="flex gap-2">
            <select
              aria-label="Country code"
              className={cn(fieldClass, 'w-[112px] shrink-0 appearance-none px-4')}
              {...register('dialCode')}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.dialCode}>
                  {c.dialCode} {c.name}
                </option>
              ))}
            </select>
            <input
              id="profile-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              className={cn(fieldClass, 'min-w-0 flex-1')}
              {...register('phone')}
            />
          </div>
          <FieldError text={errors.dialCode?.message ?? errors.phone?.message} />
        </div>

        <div>
          <p className={labelClass}>Add photos</p>
          <div className="grid grid-cols-4 gap-2">
            {slotsLeft > 0 ? (
              <button
                type="button"
                onClick={() => photosInput.current?.click()}
                className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[#c9837a] text-[#c9837a]"
                aria-label="Add photos"
              >
                <Plus className="h-6 w-6" />
              </button>
            ) : null}
            {savedPhotos.map(photo => (
              <Photo
                key={photo._id}
                src={photo.url}
                disabled={busy !== null}
                onRemove={() => void removeSaved('/media/user', { mediaId: photo._id })}
              />
            ))}
            {newPhotos.map(photo => (
              <Photo
                key={photo.id}
                src={photo.preview}
                disabled={busy !== null}
                onRemove={() => {
                  drop(photo);
                  setNewPhotos(current => current.filter(p => p.id !== photo.id));
                }}
              />
            ))}
          </div>
          <input
            ref={photosInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={e => {
              pickPhotos(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {notice ? (
        <p
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={cn(
            'mt-6 rounded-2xl border px-5 py-3 text-center font-mukta text-[15px]',
            notice.kind === 'error'
              ? 'border-red-300 bg-red-50 text-red-800'
              : 'border-green-300 bg-green-50 text-green-800',
          )}
        >
          {notice.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy !== null}
        className="mt-6 flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-primary font-mukta text-lg text-white disabled:opacity-60"
      >
        {busy === 'saving' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
        Update Profile
      </button>
    </form>
  );
}

function Photo({
  src,
  disabled,
  onRemove,
}: {
  src: string;
  disabled: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-[#efe6da]">
      {/* eslint-disable-next-line @next/next/no-img-element -- backend URLs and blob previews */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove photo"
        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-primary disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function FieldError({ text }: { text?: string }) {
  return text ? <p className="mt-1.5 px-2 font-mukta text-sm text-red-700">{text}</p> : null;
}
