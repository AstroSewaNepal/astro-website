'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

import { Stars } from '@/components/astrologers/profile/stars';
import {
  averageRating,
  type RatingReview,
  reviewDate,
  topicAverages,
} from '@/lib/astrologers/profile';

const card = 'rounded-[20px] border border-[#e3c9b5] bg-[#fbf6ee] p-5';
const REVIEWS_SHOWN = 3;

/** The app's AstrologerRatingSection: average and one bar per rated topic. */
export function RatingsSummary({ reviews }: { reviews: RatingReview[] }) {
  const average = averageRating(reviews);
  const topics = topicAverages(reviews);
  return (
    <section className={card}>
      <h2 className="font-app text-[20px] font-semibold text-primary">Ratings &amp; Reviews</h2>
      {reviews.length ? (
        <div className="mt-4 flex gap-5">
          <div className="shrink-0 text-center">
            <p className="font-app text-[40px] font-semibold leading-none text-primary">
              {average.toFixed(1)}
            </p>
            <Stars rating={average} size={14} className="mt-2" />
            <p className="mt-1 font-app text-sm text-[#6d6d6d]">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <ul className="min-w-0 flex-1 space-y-2">
            {topics.map(t => (
              <li key={t.topic} className="flex items-center gap-2 font-app text-sm text-[#4a1a1a]">
                <span className="w-[76px] shrink-0 truncate">{t.topic}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#720A0B]/10">
                  <span
                    className="block h-full rounded-full bg-[#720A0B]"
                    style={{ width: `${(t.rating / 5) * 100}%` }}
                  />
                </span>
                <span className="w-7 shrink-0 text-right">{t.rating.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 font-app text-[15px] text-[#6d6d6d]">No ratings available yet.</p>
      )}
    </section>
  );
}

/** The app's UserReviewsSection ("What others are saying"); Report on a review comes with doc 13. */
export function ReviewsList({ reviews }: { reviews: RatingReview[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? reviews : reviews.slice(0, REVIEWS_SHOWN);
  return (
    <section>
      <h2 className="mb-3 font-app text-[18px] font-semibold text-[#4a1a1a]">
        What others are saying
      </h2>
      {reviews.length ? (
        <>
          <ul className="divide-y divide-[#e3c9b5]">
            {shown.map(review => (
              <ReviewItem key={review.reviewId} review={review} />
            ))}
          </ul>
          {reviews.length > REVIEWS_SHOWN ? (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                className="rounded-full bg-primary px-6 py-2 font-app text-[15px] text-white"
              >
                {showAll ? 'Show less' : 'Show more'}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="font-app text-[15px] text-[#6d6d6d]">No reviews yet.</p>
      )}
    </section>
  );
}

function ReviewItem({ review }: { review: RatingReview }) {
  const hidden = Boolean(review.user?.hideProfile);
  const name = review.user?.name?.trim() || 'Anonymous';
  const message = review.ratingMessage?.trim();
  return (
    <li className="flex gap-3 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#efe6da] font-app font-semibold text-primary">
        {hidden ? (
          <Lock className="h-4 w-4" aria-hidden />
        ) : review.user?.profilePicture ? (
          // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
          <img src={review.user.profilePicture} alt="" className="h-full w-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-app text-[16px] font-semibold text-[#4a1a1a]">{name}</span>
          {hidden ? (
            <span className="rounded-full bg-[#720A0B]/10 px-2 py-0.5 font-app text-xs text-primary">
              Private
            </span>
          ) : null}
          <Stars rating={review.overallRating} size={13} />
        </div>
        <p className="font-app text-xs text-[#8a8583]">{reviewDate(review)}</p>
        <p
          className={
            message
              ? 'mt-1.5 whitespace-pre-line break-words font-app text-[15px] text-[#2b2b2b]'
              : 'mt-1.5 font-app text-[15px] italic text-[#8a8583]'
          }
        >
          {message || 'No written review'}
        </p>
      </div>
    </li>
  );
}
