'use client';

import CalculatorReportResult from '@/components/pages/calculators/shared/calculator-report-result';
import type { MangalDoshaLevel } from '@/lib/calculators/determine-mangal-dosha';
import { getMangalDoshaMeta } from '@/lib/calculators/mangal-dosha-metadata';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';

export type MangalDoshaCalculatorResult = CalculatorFormValues & {
  level: MangalDoshaLevel;
  manglik?: {
    present: boolean;
    strength: string;
    reasons: string[];
  };
  source?: string;
};

const STORAGE_KEY = 'mangalDoshaCalculatorResult';

export default function MangalDoshaCalculatorResultSection() {
  return (
    <CalculatorReportResult<MangalDoshaCalculatorResult>
      storageKey={STORAGE_KEY}
      calculatorPath="/calculators/mangal-dosha-calculator"
      pageTitle="Mangal Dosha Calculator"
      pageSubtitle="Check whether Mangal Dosha appears in your birth chart and understand how it may impact marital harmony."
      emptyTitle="Mangal Dosha Result"
      reportSuffix="Mangal Dosha Report"
      getReportDisplay={data => {
        const meta = getMangalDoshaMeta(data.level);
        const reasons = data.manglik?.reasons?.filter(Boolean) ?? [];
        const reasonText = reasons.length > 0 ? ` Chart factors: ${reasons.join('; ')}.` : '';
        return {
          title: meta?.title ?? data.level,
          subtitle: meta?.subtitle,
          description:
            (meta?.description ??
              'Your Mangal Dosha result is calculated from accurate planetary positions and AstroSewa rules.') +
            reasonText,
          image: meta?.image,
          imageAlt: 'Mangal Dosha',
        };
      }}
      extraPersonalRows={data =>
        data.manglik
          ? [
              { label: 'Present', value: data.manglik.present ? 'Yes' : 'No' },
              { label: 'Strength', value: data.manglik.strength },
            ]
          : []
      }
    />
  );
}
