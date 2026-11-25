'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil } from 'lucide-react';

import KundaliFormSection from '@/components/pages/free-kundali/kundali-form-section';
import KundaliResultSection from '@/components/pages/free-kundali/kundali-result-section';
import KundaliMatchingFormSection from '@/components/pages/kundali-matcing/kundali-matching-form-section';
import KundaliMatchingResultSection from '@/components/pages/kundali-matcing/kundali-matching-result-section';
import { useBackendClient } from '@/hooks/use-backend-client';
import { BackendError } from '@/lib/backend/client';
import {
  kundaliPrefill,
  kundaliToStored,
  matchPrefill,
  matchToStored,
  REPORT_API,
  reportEditPath,
  type ReportTab,
  type SavedKundali,
  type SavedMatch,
} from '@/lib/astro-reports/reports';

/** One saved report (GET bundle/:id, the full result), drawn by the same result page or form as the public tools. */
export function SavedReport({
  tab,
  id,
  mode,
}: {
  tab: ReportTab;
  id: string;
  mode: 'view' | 'edit';
}) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  // After an edit, the report and the list must not show the cached (old) copy.
  const onSaved = () => {
    queryClient.removeQueries({ queryKey: ['astro-report', tab, id] });
    void queryClient.invalidateQueries({ queryKey: ['astro-reports', tab] });
  };
  const report = useQuery({
    queryKey: ['astro-report', tab, id],
    queryFn: () =>
      backend.get<SavedKundali | SavedMatch>(`${REPORT_API[tab]}/${encodeURIComponent(id)}`),
    // A saved match is ~760 KB: don't fetch it again just because the window got focus.
    refetchOnWindowFocus: false,
    retry: (count, error) => !(error instanceof BackendError && error.status === 404) && count < 2,
  });

  const back = tab === 'match' ? '/client/reports?tab=match' : '/client/reports';
  // Built once per fetch: the result pages take it as their data.
  const kundali = useMemo(
    () => (tab === 'kundali' && report.data ? kundaliToStored(report.data as SavedKundali) : null),
    [tab, report.data],
  );
  const match = useMemo(
    () => (tab === 'match' && report.data ? matchToStored(report.data as SavedMatch) : null),
    [tab, report.data],
  );

  if (report.isPending) {
    return (
      <div className="flex justify-center py-24" role="status" aria-label="Loading report">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (report.isError || !report.data || !(kundali ?? match)) {
    const missing = report.error instanceof BackendError && report.error.status === 404;
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center font-app">
        <p className="text-[20px] text-primary">
          {missing ? 'This report was not found.' : 'We could not open this report.'}
        </p>
        {!missing ? (
          <button type="button" onClick={() => report.refetch()} className="text-primary underline">
            Try again
          </button>
        ) : null}
        <Link href={back} className="rounded-full bg-primary px-6 py-2.5 text-[16px] text-white">
          Back to Astro Reports
        </Link>
      </div>
    );
  }

  if (mode === 'edit') {
    return tab === 'kundali' ? (
      <KundaliFormSection
        edit={{ id, prefill: kundaliPrefill(report.data as SavedKundali), onSaved }}
      />
    ) : (
      <KundaliMatchingFormSection
        edit={{ id, prefill: matchPrefill(report.data as SavedMatch), onSaved }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <Link
          href={reportEditPath(tab, id)}
          className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 font-app text-[15px] text-primary hover:bg-primary/5"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Edit
        </Link>
      </div>
      {tab === 'kundali' ? (
        <KundaliResultSection result={kundali} />
      ) : (
        <KundaliMatchingResultSection result={match} />
      )}
    </div>
  );
}
