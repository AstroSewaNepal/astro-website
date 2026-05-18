'use client';

import { useMemo, useState } from 'react';

import { DOSHA_DISPLAY_ORDER, type AllDoshaResult } from '@/lib/vedastro/dosha-types';
import { getDoshaRemedyGuide } from '@/lib/vedastro/dosha-remedies';

type DoshaRemediesSectionProps = {
  doshas: AllDoshaResult;
};

export default function DoshaRemediesSection({ doshas }: DoshaRemediesSectionProps) {
  const ordered = useMemo(() => {
    const withPresent = DOSHA_DISPLAY_ORDER.filter(({ key }) => doshas[key].present);
    const withoutPresent = DOSHA_DISPLAY_ORDER.filter(({ key }) => !doshas[key].present);
    return [...withPresent, ...withoutPresent];
  }, [doshas]);

  const presentCount = useMemo(
    () => DOSHA_DISPLAY_ORDER.filter(({ key }) => doshas[key].present).length,
    [doshas],
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const { key } of DOSHA_DISPLAY_ORDER) {
      initial[key] = doshas[key].present;
    }
    return initial;
  });

  return (
    <div className="mt-10 rounded-[20px] bg-[#f9f4dd] p-5 md:p-7">
      <h3 className="font-sahitya text-primary text-[26px] leading-tight md:text-[32px] font-bold">
        Remedies &amp; guidance
      </h3>
      <p className="mt-3 font-mukta text-base leading-relaxed text-[#4a4a4a]">
        Traditional remedies and lifestyle suggestions associated with each dosha. These are general
        Vedic practices for reflection — not medical or legal advice. For personalised puja,
        gemstones, or marriage matching, consult a qualified Jyotish acharya.
      </p>

      {presentCount === 0 ? (
        <p className="mt-4 rounded-lg border border-[#e5d9bc] bg-[#fffdf6] px-4 py-3 font-mukta text-base text-[#2d6a4f]">
          No major dosha flags in this automated check. You may still read preventive tips below for
          general wellbeing.
        </p>
      ) : (
        <p className="mt-4 font-mukta text-base text-[#5c4033]">
          <span className="font-semibold">{presentCount}</span> dosha
          {presentCount === 1 ? '' : 's'} indicated in your chart — expand each section for remedies
          and common questions.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {ordered.map(({ key, label }) => {
          const entry = doshas[key];
          const guide = getDoshaRemedyGuide(key);
          if (!guide) return null;

          const strengthLabel = entry.strength === 'None' ? '' : ` · ${entry.strength}`;

          return (
            <details
              key={`remedy-${key}`}
              open={expanded[key]}
              onToggle={e => {
                const isOpen = e.currentTarget.open;
                setExpanded(prev => ({ ...prev, [key]: isOpen }));
              }}
              className="group overflow-hidden rounded-xl border border-[#e5d9bc] bg-[#fffdf6]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-mukta text-base font-semibold text-[#2d2d2d] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-sahitya text-primary">{label}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.present
                        ? 'bg-[#7F1808]/10 text-[#7F1808]'
                        : 'bg-[#2d6a4f]/10 text-[#2d6a4f]'
                    }`}
                  >
                    {entry.present ? `Present${strengthLabel}` : 'Not indicated'}
                  </span>
                </span>
                <span
                  className="shrink-0 text-primary transition-transform group-open:rotate-180"
                  aria-hidden
                >
                  ▼
                </span>
              </summary>

              <div className="border-t border-[#f0e6d0] px-4 py-4">
                <p className="font-mukta text-sm font-medium text-[#5c4033]">May influence</p>
                <p className="mt-1 font-mukta text-base leading-relaxed text-[#4a4a4a]">
                  {guide.affects}
                </p>

                <p className="mt-4 font-mukta text-sm font-medium text-[#5c4033]">
                  Things that may help reduce or balance
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-5 font-mukta text-base leading-relaxed text-[#4a4a4a]">
                  {guide.remedies.map(item => (
                    <li key={`${key}-remedy-${item.slice(0, 40)}`}>{item}</li>
                  ))}
                </ul>

                <p className="mt-5 font-sahitya text-lg font-bold text-primary">Common questions</p>
                <dl className="mt-3 space-y-4">
                  {guide.faq.map(({ question, answer }) => (
                    <div key={`${key}-faq-${question}`}>
                      <dt className="font-mukta text-base font-semibold text-[#2d2d2d]">
                        Q. {question}
                      </dt>
                      <dd className="mt-1 font-mukta text-base leading-relaxed text-[#4a4a4a]">
                        A. {answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
