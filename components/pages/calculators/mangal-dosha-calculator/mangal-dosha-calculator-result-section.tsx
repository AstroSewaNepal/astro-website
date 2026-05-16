'use client';

import CalculatorReportResult from '@/components/pages/calculators/shared/calculator-report-result';
import type { MangalDoshaLevel } from '@/lib/calculators/determine-mangal-dosha';
import { getMangalDoshaMeta } from '@/lib/calculators/mangal-dosha-metadata';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';

export type MangalDoshaCalculatorResult = CalculatorFormValues & {
  level: MangalDoshaLevel;
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
        return {
          title: meta?.title ?? data.level,
          subtitle: meta?.subtitle,
          description:
            meta?.description ??
            'Your Mangal Dosha result is based on your birth date pattern in Vedic astrology.',
          image: meta?.image,
          imageAlt: 'Mangal Dosha',
        };
      }}
    />
  );
}
