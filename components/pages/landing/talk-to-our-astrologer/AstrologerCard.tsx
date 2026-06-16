'use client';

import React, { memo, useMemo } from 'react';
import Image from 'next/image';

import { AstrologerImage, VerifiedIcon } from '@/components/images';
import { EducationIcon, GoldMedalIcon, LanguageIcon, SquareIcon } from '@/components/images/icons';
import ChatIcon from '@/components/icons/chat-icon';
import PhoneIcon from '@/components/icons/phone-icon';
import StartIcon from '@/components/icons/start-icon';
import CalendarIcon from '@/components/icons/calendar-icon';

import type { Astrologer, AstrologerCardActions } from './types';
import {
  formatCurrency,
  getAstrologerName,
  getDisplayLanguages,
  getDisplayServices,
  getDisplaySpecializations,
  getExperienceLabel,
  getLowestPackage,
  getProfileImageUrl,
  getRatingStars,
  isAstrologerOnline,
} from './utils';

export type AstrologerCardProps = AstrologerCardActions & {
  astrologer: Astrologer;
  priorityImage?: boolean;
};

const AstrologerCard = memo(function AstrologerCard({
  astrologer,
  onChat,
  onCall,
  onSchedule,
  priorityImage = false,
}: AstrologerCardProps) {
  const profileImage = getProfileImageUrl(astrologer);
  const name = getAstrologerName(astrologer);
  const isOnline = isAstrologerOnline(astrologer);
  const isVerified = Boolean(astrologer.isAstrologerActive);
  const ratingStars = useMemo(
    () => getRatingStars(astrologer.averageRating),
    [astrologer.averageRating],
  );

  const pricing = useMemo(() => {
    const lowestPackage = getLowestPackage(astrologer.packages);
    if (!lowestPackage) {
      return {
        hasPackage: false,
        originalLabel: 'Price unavailable',
        discountedLabel: 'Price unavailable',
        showStrikeThrough: false,
      };
    }

    const originalLabel = formatCurrency(lowestPackage.cost?.currency, lowestPackage.cost?.value);
    const discountedLabel = formatCurrency(
      lowestPackage.discountedPrice?.currency ?? lowestPackage.cost?.currency,
      lowestPackage.discountedPrice?.value,
    );
    const showStrikeThrough = (lowestPackage.discountPercent ?? 0) > 0;

    return {
      hasPackage: true,
      originalLabel,
      discountedLabel,
      showStrikeThrough,
    };
  }, [astrologer.packages]);

  const features = useMemo(
    () => [
      {
        icon: LanguageIcon,
        title: getDisplayLanguages(astrologer.language),
      },
      {
        icon: SquareIcon,
        title: getDisplaySpecializations(astrologer.services),
      },
      {
        icon: EducationIcon,
        title: getExperienceLabel(astrologer.yearsOfExperience),
      },
      {
        icon: GoldMedalIcon,
        title: getDisplayServices(astrologer.services),
      },
    ],
    [astrologer.language, astrologer.services, astrologer.yearsOfExperience],
  );

  const showChat = Boolean(astrologer.chatAvailable);
  const showCall = Boolean(astrologer.callAvailable);
  const showSchedule = Boolean(astrologer.isBookingEnabled);
  const imageSrc = profileImage ?? AstrologerImage;
  const isRemoteProfileImage = Boolean(profileImage?.startsWith('http'));

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-4xl border border-solid border-[#0000007D] shadow-[0_8px_32px_rgba(97,21,8,0.08)]">
      <div className="flex flex-1 flex-col p-6 pt-11 sm:p-7 sm:pt-12">
        <div className="flex flex-col items-center">
          <div className="relative shrink-0">
            <div className="relative h-[132px] w-[132px] overflow-hidden rounded-full ring-2 ring-[#e8dcc8] sm:h-[148px] sm:w-[148px] md:h-[156px] md:w-[156px]">
              <Image
                src={imageSrc}
                alt={name}
                fill
                sizes="(max-width: 640px) 132px, (max-width: 768px) 148px, 156px"
                className="object-cover"
                priority={priorityImage}
                unoptimized={isRemoteProfileImage}
              />
            </div>
            <span
              className={[
                'absolute right-0.5 top-0.5 z-[1] h-3.5 w-3.5 rounded-full border-[3px] border-[#fbf6ee] sm:right-1 sm:top-1 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]',
                isOnline ? 'bg-[#34C759]' : 'bg-[#9CA3AF]',
              ].join(' ')}
              aria-label={isOnline ? 'Online' : 'Offline'}
            />
          </div>

          <div className="mt-4 flex flex-col items-center text-center sm:mt-5">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <h3 className="line-clamp-2 font-mukta text-[19px] font-semibold leading-tight text-[#5a6a8a] sm:text-[22px] md:text-[24px]">
                {name}
              </h3>
              {isVerified ? (
                <Image
                  src={VerifiedIcon}
                  alt="Verified astrologer"
                  className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                  width={20}
                  height={20}
                />
              ) : null}
            </div>

            <div
              className="mt-1.5 flex items-center justify-center gap-0.5 sm:mt-2"
              aria-label={
                ratingStars.hasRating
                  ? `${astrologer.averageRating ?? 0} out of 5 stars`
                  : 'No ratings yet'
              }
            >
              {ratingStars.hasRating ? (
                <>
                  {Array.from({ length: ratingStars.filled }).map((_, index) => (
                    <StartIcon
                      className="h-3.5 w-3.5 text-[#F59236] sm:h-4 sm:w-4"
                      key={`filled-${index}`}
                    />
                  ))}
                  {Array.from({ length: ratingStars.empty }).map((_, index) => (
                    <StartIcon
                      className="h-3.5 w-3.5 text-[#F59236]/25 sm:h-4 sm:w-4"
                      key={`empty-${index}`}
                    />
                  ))}
                </>
              ) : (
                <p className="font-mukta text-[12px] text-[#8a8583] sm:text-sm">No ratings yet</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center sm:mt-5">
            {pricing.hasPackage && pricing.showStrikeThrough ? (
              <span className="font-mukta text-[13px] text-[#8a8583] line-through sm:text-sm md:text-base">
                {pricing.originalLabel}/min
              </span>
            ) : null}
            <span className="font-mukta text-[26px] font-bold leading-none text-primary sm:text-[28px] md:text-[32px]">
              {pricing.hasPackage ? `${pricing.discountedLabel}/min` : pricing.discountedLabel}
            </span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4 sm:gap-3 sm:pt-5">
          {features.map(feature => (
            <div
              className="flex min-h-[56px] items-center gap-1.5 rounded-3xl border border-solid border-[#79787A]/70 bg-white/40 px-2 py-2 sm:min-h-[60px] sm:gap-2 sm:px-2.5 sm:py-2.5 md:px-3"
              key={feature.title}
            >
              <Image
                src={feature.icon}
                alt=""
                className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                width={24}
                height={24}
              />
              <p className="min-w-0 line-clamp-2 font-mukta text-[10px] leading-snug text-[#5b5b5b] sm:text-[11px] md:text-sm">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {(showChat || showCall || showSchedule) && (
        <div className="mt-auto flex shrink-0 items-center justify-between gap-2 bg-primary px-4 py-3.5 sm:gap-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5">
            {showChat ? (
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white shadow-sm transition-opacity hover:opacity-90 sm:h-11 sm:w-11"
                aria-label={`Chat with ${name}`}
                onClick={() => onChat?.(astrologer)}
              >
                <ChatIcon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
              </button>
            ) : null}
            {showCall ? (
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white shadow-sm transition-opacity hover:opacity-90 sm:h-11 sm:w-11"
                aria-label={`Call ${name}`}
                onClick={() => onCall?.(astrologer)}
              >
                <PhoneIcon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
              </button>
            ) : null}
          </div>
          {showSchedule ? (
            <button
              type="button"
              className="flex min-w-0 shrink-0 items-center gap-1 rounded-full border border-[#F8F3DF] px-3 py-2 transition-colors hover:bg-white/10 sm:gap-1.5 sm:px-4 sm:py-2.5 md:px-5 md:py-3"
              aria-label={`Schedule session with ${name}`}
              onClick={() => onSchedule?.(astrologer)}
            >
              <CalendarIcon className="h-5 w-5 shrink-0 text-[#F8F3DF] sm:h-6 sm:w-6" />
              <span className="font-mukta text-sm font-medium text-[#F8F3DF] sm:text-base md:text-lg">
                Schedule
              </span>
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
});

export default AstrologerCard;
