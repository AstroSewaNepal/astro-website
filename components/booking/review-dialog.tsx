'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Lock, Star, X } from 'lucide-react';
import clsx from 'clsx';

import { useBackendClient } from '@/hooks/use-backend-client';
import {
  REVIEW_MESSAGE_MAX,
  allRated,
  reviewPayload,
  type RatingTopic,
} from '@/lib/booking/review';

/**
 * The app's FeedbackModal (My Consultations, and the chat once a session ends): stars for every rating topic, an
 * optional message and "hide my profile", then POST /ratings. Rendered only while open, so each opening starts empty
 * (the app resets it too).
 */
export function ReviewDialog({
  astrologerId,
  bookingId,
  astrologerName,
  photo,
  onClose,
  onDone,
  note,
  waiting = false,
}: {
  astrologerId: string;
  bookingId: string;
  astrologerName: string;
  photo: string | null;
  onClose: () => void;
  onDone: () => void;
  /** A line under the subtitle (the chat's "Your chat has been ended by …"). */
  note?: string;
  /** Hold Submit: the backend only takes a review once the booking is COMPLETED, and the end call is still out. */
  waiting?: boolean;
}) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const [stars, setStars] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');
  const [hideProfile, setHideProfile] = useState(false);

  const topics = useQuery({
    queryKey: ['ratings', 'topics'],
    queryFn: () => backend.get<RatingTopic[]>('/ratings/topics'),
    staleTime: 60 * 60 * 1000,
  });
  const list = topics.data ?? [];
  const ready = allRated(list, stars);

  const submit = useMutation({
    mutationFn: () =>
      backend.post(
        '/ratings',
        reviewPayload({ astrologerId, bookingId, topics: list, stars, message, hideProfile }),
      ),
    onSuccess: () => {
      // The card turns into View Profile once the list knows about the review.
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      onDone();
    },
    // A card that is stale (already reviewed elsewhere) flips to its real state, like the app.
    onError: () => void queryClient.invalidateQueries({ queryKey: ['consultations'] }),
  });

  const close = () => {
    if (!submit.isPending) onClose();
  };

  return (
    <DialogPrimitive.Root open onOpenChange={next => (next ? undefined : close())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/40 data-[state=open]:animate-[drawer-fade-in_200ms_ease-out] motion-reduce:animate-none" />
        <DialogPrimitive.Content
          aria-describedby="review-subtitle"
          className="fixed left-1/2 top-1/2 z-[71] flex max-h-[90dvh] w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[24px] bg-[#FFFAE6] px-4 pb-6 pt-10 shadow-xl outline-none data-[state=open]:animate-[drawer-fade-in_250ms_ease-out] motion-reduce:animate-none"
        >
          <DialogPrimitive.Close
            aria-label="Close"
            disabled={submit.isPending}
            className="absolute right-3 top-3 text-primary"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto pt-2">
            <div className="flex flex-col items-center gap-1 text-center">
              <DialogPrimitive.Title className="font-raleway text-[20px] font-bold leading-[26px] text-primary">
                {astrologerName || 'Astrologer'}
              </DialogPrimitive.Title>
              <p id="review-subtitle" className="font-app text-[15px] text-primary">
                Please rate your astrology session.
              </p>
              {note ? <p className="font-app text-[13px] text-[#6b6b6b]">{note}</p> : null}
            </div>

            <span className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f1d9d2] font-app text-4xl font-semibold text-primary">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                (astrologerName || 'A').charAt(0).toUpperCase()
              )}
            </span>

            {topics.isPending ? (
              <Loader2 className="my-10 h-8 w-8 animate-spin text-primary" aria-label="Loading" />
            ) : topics.isError ? (
              <p className="py-6 text-center font-app text-[15px] text-[#4a1a1a]">
                We could not load the rating questions.{' '}
                <button
                  type="button"
                  onClick={() => topics.refetch()}
                  className="text-primary underline"
                >
                  Try again
                </button>
              </p>
            ) : (
              <>
                <div className="flex w-full flex-col gap-2">
                  {list.map(t => (
                    <StarRow
                      key={t._id}
                      label={t.name}
                      value={stars[t._id] ?? 0}
                      disabled={submit.isPending}
                      onChange={v => setStars(s => ({ ...s, [t._id]: v }))}
                    />
                  ))}
                </div>
                <label className="w-full">
                  <span className="sr-only">Your review</span>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={REVIEW_MESSAGE_MAX}
                    rows={3}
                    disabled={submit.isPending}
                    placeholder="Share your experience (optional)"
                    className="w-full resize-y rounded-xl border-2 border-[#BE7B71] bg-white px-3 py-2 font-app text-[16px] text-[#1C1C1C] outline-none placeholder:text-[#BE7B71] focus:border-primary"
                  />
                </label>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-[#BE7B71] pt-3">
            {submit.isError ? (
              <p
                role="alert"
                className="rounded-xl bg-[#fdecea] px-3 py-2 font-app text-[14px] text-[#4a1a1a]"
              >
                <b>Submission failed.</b>{' '}
                {submit.error.message || 'Could not submit your rating. Please try again.'}
              </p>
            ) : null}
            <label className="flex cursor-pointer items-center gap-2 font-app text-[16px] font-medium text-primary">
              <input
                type="checkbox"
                checked={hideProfile}
                onChange={e => setHideProfile(e.target.checked)}
                disabled={submit.isPending}
                className="h-5 w-5 accent-[#611508]"
              />
              <Lock className="h-4 w-4" aria-hidden />
              Hide my profile information
            </label>
            <button
              type="button"
              disabled={!ready || submit.isPending || waiting}
              onClick={() => submit.mutate()}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[32px] bg-primary font-app text-[17px] text-white disabled:opacity-60"
            >
              {submit.isPending || (ready && waiting) ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : null}
              {ready ? 'Submit' : 'Rate all fields'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** One topic: five star buttons (a radio group) and the value, like the app's StarRating row. */
function StarRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="font-app text-[16px] font-semibold text-primary">{label}</span>
      <div className="flex items-center gap-2">
        <div role="radiogroup" aria-label={label} className="flex">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              disabled={disabled}
              onClick={() => onChange(n)}
              className="p-1"
            >
              <Star
                className={clsx(
                  'h-[18px] w-[18px]',
                  n <= value ? 'fill-primary text-primary' : 'fill-transparent text-[#BE7B71]',
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>
        <span className="w-7 text-right font-app text-[16px] font-semibold text-primary">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
