'use client';

import CalculatorReportResult from '@/components/pages/calculators/shared/calculator-report-result';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import type { MoonPhaseName } from '@/lib/calculators/determine-moon-phase';
import { getMoonPhaseMeta } from '@/lib/calculators/moon-phase-metadata';

export type MoonPhaseCalculatorResult = CalculatorFormValues & {
  phase: MoonPhaseName;
};

const STORAGE_KEY = 'moonPhaseCalculatorResult';

export default function MoonPhaseCalculatorResultSection() {
  return (
    <CalculatorReportResult<MoonPhaseCalculatorResult>
      storageKey={STORAGE_KEY}
      calculatorPath="/calculators/moon-phase-calculator"
      pageTitle="Moon Phase Calculator"
      pageSubtitle="Find the moon phase for your birth date and uncover the lunar energy associated with that day."
      emptyTitle="Moon Phase Result"
      reportSuffix="Moon Phase Report"
      getReportDisplay={data => {
        const meta = getMoonPhaseMeta(data.phase);
        return {
          title: meta?.title ?? data.phase,
          subtitle: meta?.subtitle,
          description:
            meta?.description ??
            `Your selected date falls under the ${data.phase}. This lunar energy can influence emotions, intuition, and timing.`,
          image: meta?.image,
          imageAlt: 'Moon phase',
        };
      }}
      extraPersonalRows={data => [{ label: 'Moon Phase', value: data.phase }]}
    />
  );
}
