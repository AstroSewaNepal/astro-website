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
  getDisplayExpertise,
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
        title: getDisplayExpertise(astrologer.expertise, astrologer.specialist),
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
    [
      astrologer.language,
      astrologer.expertise,
      astrologer.specialist,
      astrologer.services,
      astrologer.yearsOfExperience,
    ],
  );

  const showChat = Boolean(astrologer.chatAvailable);
  const showCall = Boolean(astrologer.callAvailable);
  const showSchedule = Boolean(astrologer.isBookingEnabled);
  const imageSrc = profileImage ?? AstrologerImage;
  const isRemoteProfileImage = Boolean(profileImage?.startsWith('http'));

  return (
    <article className="talk-to-our-astrologer-card flex h-full flex-col overflow-hidden rounded-[34px] border border-solid border-[#0000007D] shadow-[0_8px_32px_rgba(97,21,8,0.08)] bg-[#fbf6ee]">
      <div className="flex flex-1 flex-col p-3.5 pt-4 pb-1 sm:p-6 sm:pt-10 lg:p-8 lg:pt-14">
        <div className="flex flex-col items-center">
          <div className="relative shrink-0">
            <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full ring-2 ring-[#e8dcc8] sm:h-[130px] sm:w-[130px] lg:h-[160px] lg:w-[160px]">
              <Image
                src={imageSrc}
                alt={name}
                fill
                sizes="(max-width: 640px) 80px, (max-width: 1024px) 130px, 160px"
                className="object-cover"
                priority={priorityImage}
                unoptimized={isRemoteProfileImage}
              />
            </div>
            <span
              className={[
                'absolute right-0.5 top-0.5 z-[1] h-2.5 w-2.5 rounded-full border border-[#fbf6ee] sm:right-1 sm:top-1 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]',
                isOnline ? 'bg-[#34C759]' : 'bg-[#9CA3AF]',
              ].join(' ')}
              aria-label={isOnline ? 'Online' : 'Offline'}
            />
          </div>

          <div className="mt-2 flex flex-col items-center text-center sm:mt-4 lg:mt-6">
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <h3 className="line-clamp-1 font-mukta text-[15px] font-semibold leading-tight text-[#5a6a8a] sm:text-[20px] lg:text-[24px]">
                {name}
              </h3>
              {isVerified ? (
                <Image
                  src={VerifiedIcon}
                  alt="Verified astrologer"
                  className="h-3 w-3 shrink-0 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                  width={20}
                  height={20}
                />
              ) : null}
            </div>

            <div
              className="mt-0.5 flex items-center justify-center gap-0.5 sm:mt-1.5 lg:mt-2"
              aria-label={
                ratingStars.hasRating
                  ? `${astrologer.averageRating ?? 0} out of 5 stars`
                  : '5 out of 5 stars'
              }
            >
              {ratingStars.hasRating ? (
                <>
                  {Array.from({ length: ratingStars.filled }).map((_, index) => (
                    <StartIcon
                      className="h-2.5 w-2.5 text-[#F59236] sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
                      key={`filled-${index}`}
                    />
                  ))}
                  {Array.from({ length: ratingStars.empty }).map((_, index) => (
                    <StartIcon
                      className="h-2.5 w-2.5 text-[#F59236]/25 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
                      key={`empty-${index}`}
                    />
                  ))}
                </>
              ) : (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StartIcon
                      className="h-2.5 w-2.5 text-[#F59236] sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
                      key={`fallback-${index}`}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap items-baseline justify-center gap-x-1 gap-y-0.5 text-center sm:mt-3 lg:mt-5">
            {pricing.hasPackage && pricing.showStrikeThrough ? (
              <span className="font-mukta text-[10px] text-[#8a8583] line-through sm:text-sm lg:text-base">
                {pricing.originalLabel}/min
              </span>
            ) : null}
            <span className="font-mukta text-[16px] font-bold leading-none text-primary sm:text-[24px] lg:text-[32px]">
              {pricing.hasPackage ? `${pricing.discountedLabel}/min` : pricing.discountedLabel}
            </span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-1 pt-2 sm:gap-2.5 sm:pt-4 lg:gap-3 lg:pt-5">
          {features.map((feature, index) => (
            <div
              className="flex min-h-[34px] sm:min-h-[52px] lg:min-h-[60px] items-center gap-1 rounded-[14px] sm:rounded-2xl lg:rounded-3xl border border-solid border-[#79787A]/70 bg-white/40 px-2 py-0.5 sm:gap-1.5 sm:px-2.5 sm:py-2 lg:gap-2 lg:px-3 lg:py-2.5"
              key={`${feature.title || 'feature'}-${index}`}
            >
              <Image
                src={feature.icon}
                alt=""
                className="h-3 w-3 shrink-0 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                width={24}
                height={24}
              />
              <p className="min-w-0 line-clamp-1 sm:line-clamp-2 font-mukta text-[9px] leading-snug text-[#5b5b5b] sm:text-[10px] lg:text-sm">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex shrink-0 items-center justify-between gap-1.5 sm:gap-3 px-3 py-2 sm:px-5 sm:py-4 lg:px-6 lg:py-5 border-t border-dashed border-[#79787A]/30">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-[32px] bg-[#611508] py-2.5 sm:py-3 lg:py-3.5 transition-opacity hover:opacity-90"
          aria-label={`Schedule session with ${name}`}
          onClick={() => onSchedule?.(astrologer)}
        >
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 shrink-0 text-white" />
          <span className="font-mukta text-[11px] sm:text-[14px] lg:text-base font-medium text-white">
            Schedule
          </span>
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-[32px] border border-[#611508] bg-transparent py-2.5 sm:py-3 lg:py-3.5 transition-opacity hover:bg-[#611508]/5"
          aria-label={`Connect with ${name}`}
          onClick={() => (onCall ? onCall(astrologer) : onChat?.(astrologer))}
        >
          <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 shrink-0 text-[#611508]" />
          <span className="font-mukta text-[11px] sm:text-[14px] lg:text-base font-medium text-[#611508]">
            Connect Now
          </span>
        </button>
      </div>
    </article>
  );
});

export default AstrologerCard;
