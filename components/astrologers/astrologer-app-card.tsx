import Link from 'next/link';
import { Award, CalendarDays, GraduationCap, Languages, Phone, Trophy } from 'lucide-react';
import clsx from 'clsx';

import { Stars } from '@/components/astrologers/profile/stars';
import { VerifiedBadge } from '@/components/astrologers/verified-badge';
import type { Astrologer } from '@/components/pages/landing/talk-to-our-astrologer/types';
import {
  formatCurrency,
  getDisplayLanguages,
  getLowestPackage,
} from '@/components/pages/landing/talk-to-our-astrologer/utils';
import { tagNames, tierLabel, tierStyle } from '@/lib/astrologers/profile';

const slideRow =
  'min-w-0 flex-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/**
 * The app's AstrologerNewCard (Astro Connect list on phones): photo + stars on the left; name, languages, skills and
 * expertise (one line each, sliding sideways), experience and the cheapest price on the right; Schedule / Connect Now.
 */
export function AstrologerAppCard({ astrologer, href }: { astrologer: Astrologer; href?: string }) {
  const name = astrologer.user?.fullName?.trim() || 'Astrologer';
  const photo =
    astrologer.user?.profilePicture?.thumbnail?.url || astrologer.user?.profilePicture?.url;
  const tier = tierLabel(astrologer.tier?.name);
  const badge = tierStyle(astrologer.tier?.name);
  const cheapest = getLowestPackage(astrologer.packages);
  const free = cheapest?.discountedPrice?.value === 0;
  const skills = tagNames(astrologer.tags, 'skill');
  const expertise = tagNames(astrologer.tags, 'expertise');
  const years = astrologer.yearsOfExperience;

  return (
    <article className="rounded-[20px] border border-[#e3c9b5] bg-[#fbf6ee] p-3">
      <div className="flex gap-3">
        <MaybeLink href={href} className="flex shrink-0 flex-col items-center gap-3">
          <span className="relative block h-[80px] w-[80px]">
            <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#f1d9d2] font-app text-2xl font-semibold text-primary">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
                <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </span>
            {astrologer.status === 'ONLINE' ? (
              <span
                className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full border-2 border-[#fbf6ee] bg-[#34C759]"
                aria-label="Online"
              />
            ) : null}
            {tier ? (
              <span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-px font-app text-[10px] font-semibold"
                style={{ backgroundColor: badge.bg, color: badge.text }}
              >
                {tier}
              </span>
            ) : null}
          </span>
          <Stars rating={astrologer.averageRating ?? 0} size={12} />
        </MaybeLink>

        <div className="min-w-0 flex-1 space-y-1 font-app text-[14px] font-semibold text-[#2b2b2b]">
          <MaybeLink href={href} className="flex min-w-0 items-center gap-1">
            {astrologer.isAstrologerActive ? <VerifiedBadge size={13} /> : null}
            <span className={`${slideRow} text-[16px] text-[#720A0B]`}>{name}</span>
          </MaybeLink>
          <Row icon={Languages}>
            <span className="min-w-0 flex-1 truncate">
              {getDisplayLanguages(astrologer.tags, astrologer.language)}
            </span>
          </Row>
          <Row icon={Award}>
            <span className={slideRow}>{skills.join(', ') || '-'}</span>
          </Row>
          <Row icon={Trophy}>
            <span className={slideRow}>{expertise.join(', ') || '-'}</span>
          </Row>
          <div className="flex items-center justify-between gap-2">
            <Row icon={GraduationCap}>
              <span className="truncate">{years ? `${years} years` : '-'}</span>
            </Row>
            {cheapest ? (
              <span className="shrink-0 rounded-full bg-[#720A0B] px-2.5 py-0.5 text-[14px] text-[#F8F0DC]">
                {free
                  ? 'Free'
                  : formatCurrency(
                      cheapest.discountedPrice?.currency ?? cheapest.cost?.currency,
                      cheapest.discountedPrice?.value,
                    )}
                {!free && cheapest.consultationMinutes ? (
                  <span className="text-[10px]"> / {cheapest.consultationMinutes}m</span>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Schedule / Connect Now open the profile until booking exists on the web (doc 05). */}
      <div className="mt-2 flex gap-2 border-t border-[#e3c9b5] pt-2">
        <Action href={href} primary label={`Schedule session with ${name}`}>
          <CalendarDays className="h-4 w-4" aria-hidden />
          Schedule
        </Action>
        <Action href={href} label={`Connect with ${name}`}>
          <Phone className="h-4 w-4" aria-hidden />
          Connect Now
        </Action>
      </div>
    </article>
  );
}

function MaybeLink({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) return <div className={className}>{children}</div>;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function Row({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#720A0B]" aria-hidden />
      {children}
    </div>
  );
}

function Action({
  href,
  primary = false,
  label,
  children,
}: {
  href?: string;
  primary?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className = clsx(
    'flex h-[38px] flex-1 items-center justify-center gap-2 rounded-full font-app text-[14px] font-medium',
    primary ? 'bg-[#720A0B] text-[#F8F0DC]' : 'border border-[#720A0B] text-[#720A0B]',
  );
  if (!href) {
    return (
      <span className={className} aria-label={label}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className} aria-label={label}>
      {children}
    </Link>
  );
}
