'use client';

import DoshaRemediesSection from '@/components/pages/free-kundali/dosha-remedies-section';
import {
  DOSHA_DISPLAY_ORDER,
  type AllDoshaResult,
  type DoshaStrength,
} from '@/lib/vedastro/dosha-types';

function doshaStrengthClass(strength: DoshaStrength): string {
  if (strength === 'Strong') return 'text-[#7F1808]';
  if (strength === 'Mild') return 'text-[#a16207]';
  return 'text-[#2d6a4f]';
}

type PersonDoshaResultsProps = {
  roleLabel: string;
  personName: string;
  doshas: AllDoshaResult | undefined;
};

/** 7-dosha engine table + remedies (same as free kundali dosha tab). */
export default function PersonDoshaResults({
  roleLabel,
  personName,
  doshas,
}: PersonDoshaResultsProps) {
  return (
    <section className="space-y-6">
      <h3 className="font-sahitya text-primary text-[28px] leading-[38px] font-bold">
        {roleLabel}: {personName}
      </h3>
      {!doshas && (
        <p className="font-mukta text-base text-[#4a4a4a]">
          Dosha data is missing for this person. Please go back and generate the match again.
        </p>
      )}
      {doshas && (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#e5d9bc] bg-[#fffdf6] shadow-sm [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e5d9bc]">
                  {['Dosha', 'Present', 'Strength', 'Details'].map((header, hi) => (
                    <th
                      key={`dosha-header-${roleLabel}-${header}`}
                      scope="col"
                      className={`border-b border-r border-[#f0e6d0] bg-[#fff9ed] px-4 py-3 font-mukta text-sm font-semibold text-[#5c4033] last:border-r-0 ${
                        hi === 0 ? 'min-w-[10rem]' : ''
                      } ${hi === 3 ? 'min-w-[16rem]' : ''}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DOSHA_DISPLAY_ORDER.map(({ key, label }, rowIdx) => {
                  const entry = doshas[key];
                  return (
                    <tr key={`dosha-row-${roleLabel}-${key}`}>
                      <td
                        className={`border-b border-r border-[#f0e6d0] px-4 py-3 font-sahitya text-base font-bold text-primary ${
                          rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                        }`}
                      >
                        {label}
                      </td>
                      <td
                        className={`border-b border-r border-[#f0e6d0] px-4 py-3 font-mukta text-base text-[#2d2d2d] ${
                          rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                        }`}
                      >
                        {entry.present ? 'Yes' : 'No'}
                      </td>
                      <td
                        className={`border-b border-r border-[#f0e6d0] px-4 py-3 font-mukta text-base font-medium ${doshaStrengthClass(entry.strength)} ${
                          rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                        }`}
                      >
                        {entry.strength}
                      </td>
                      <td
                        className={`border-b border-[#f0e6d0] px-4 py-3 font-mukta text-base leading-relaxed text-[#4a4a4a] ${
                          rowIdx % 2 === 0 ? 'bg-[#fffdf6]' : 'bg-[#fffaf2]'
                        }`}
                      >
                        {entry.reasons.length > 0 ? (
                          <ul className="list-disc space-y-1 pl-4">
                            {entry.reasons.map(reason => (
                              <li key={`${roleLabel}-${key}-${reason}`}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="italic text-[#666]">
                            No specific conditions triggered for this dosha.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DoshaRemediesSection doshas={doshas} />
        </>
      )}
    </section>
  );
}
