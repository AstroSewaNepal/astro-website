'use client';

import CalculatorReportResult from '@/components/pages/calculators/shared/calculator-report-result';
import type { CalculatorFormValues } from '@/lib/calculators/calculator-form-types';
import { getDashaMeta } from '@/lib/calculators/dasha-metadata';

export type DashaCalculatorResult = CalculatorFormValues & {
  source?: string;
  birthUtc?: string;
  nakshatra?: { name: string; lord: string };
  currentMahadasha?: { lord: string; start: string; end: string };
  currentAntardasha?: { lord: string; start: string; end: string };
  mahadashas?: Array<{ lord: string; start: string; end: string; years: number }>;
  /** Legacy VedAstro payload */
  dashaPayload?: unknown;
};

const STORAGE_KEY = 'dashaCalculatorResult';

function formatPeriodDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function DashaCalculatorResultSection() {
  return (
    <CalculatorReportResult<DashaCalculatorResult>
      storageKey={STORAGE_KEY}
      calculatorPath="/calculators/dasha-calculator"
      pageTitle="Dasha Calculator"
      pageSubtitle="Your Vimshottari mahadasha and antardasha from birth, computed on the server without slow external dasha APIs."
      emptyTitle="Dasha Result"
      reportSuffix="Dasha Report"
      getReportDisplay={data => {
        const lord = data.currentMahadasha?.lord ?? '—';
        return {
          title: `Current Mahadasha: ${lord}`,
          subtitle: data.currentAntardasha
            ? `Antardasha: ${data.currentAntardasha.lord}`
            : undefined,
          description: data.nakshatra?.name
            ? `Birth nakshatra ${data.nakshatra.name} (${data.nakshatra.lord}). Timelines use Lahiri ayanamsa and standard 120-year Vimshottari proportions.`
            : 'Vimshottari dasha timeline from your birth chart.',
          image: getDashaMeta(1)?.image,
          imageAlt: 'Dasha calculator',
        };
      }}
      extraPersonalRows={data => {
        const rows: Array<{ label: string; value: string }> = [];

        if (data.nakshatra?.name) {
          rows.push({
            label: 'Birth nakshatra',
            value: `${data.nakshatra.name} (${data.nakshatra.lord})`,
          });
        }

        if (data.currentMahadasha) {
          rows.push({
            label: 'Mahadasha period',
            value: `${formatPeriodDate(data.currentMahadasha.start)} → ${formatPeriodDate(data.currentMahadasha.end)}`,
          });
        }

        if (data.currentAntardasha) {
          rows.push({
            label: 'Antardasha period',
            value: `${formatPeriodDate(data.currentAntardasha.start)} → ${formatPeriodDate(data.currentAntardasha.end)}`,
          });
        }

        const upcoming = data.mahadashas?.slice(0, 4) ?? [];
        if (upcoming.length > 0) {
          rows.push({
            label: 'Upcoming mahadashas',
            value: upcoming
              .map(m => `${m.lord} (${formatPeriodDate(m.start)} – ${formatPeriodDate(m.end)})`)
              .join('; '),
          });
        }

        if (rows.length === 0 && data.dashaPayload) {
          rows.push({
            label: 'Dasha data (legacy)',
            value: `${JSON.stringify(data.dashaPayload).slice(0, 200)}…`,
          });
        }

        return rows;
      }}
    />
  );
}
