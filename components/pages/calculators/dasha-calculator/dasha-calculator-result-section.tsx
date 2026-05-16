'use client';

import CalculatorReportResult from '@/components/pages/calculators/shared/calculator-report-result';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { getDashaMeta } from '@/lib/calculators/dasha-metadata';

export type DashaCalculatorResult = CalculatorFormValues & {
  cycle: number;
};

const STORAGE_KEY = 'dashaCalculatorResult';

export default function DashaCalculatorResultSection() {
  return (
    <CalculatorReportResult<DashaCalculatorResult>
      storageKey={STORAGE_KEY}
      calculatorPath="/calculators/dasha-calculator"
      pageTitle="Dasha Calculator"
      pageSubtitle="Discover your current dasha cycle and gain insight into the timing of life events based on your birth date."
      emptyTitle="Dasha Result"
      reportSuffix="Dasha Report"
      getReportDisplay={data => {
        const meta = getDashaMeta(data.cycle);
        return {
          title: meta?.title ?? `Dasha Cycle ${data.cycle}`,
          subtitle: meta?.subtitle,
          description:
            meta?.description ??
            `Your current major dasha cycle is ${data.cycle}. This period focuses on personal growth and life lessons.`,
          image: meta?.image,
          imageAlt: 'Dasha calculator',
        };
      }}
      extraPersonalRows={data => [{ label: 'Dasha Cycle', value: String(data.cycle) }]}
    />
  );
}
