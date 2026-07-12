'use client';

import { CommissionRateCard } from '@/components/admin/commission/commission-rate-card';
import { useAllCommissions } from '@/hooks/use-commission';

export default function CommissionPage() {
  const { data, isPending } = useAllCommissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Commission</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          Set the commission percentage deducted from astrologer earnings for each earning source
        </p>
      </div>

      <div className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <CommissionRateCard
          source="consultation"
          title="Consultation Commission"
          description="Applied to scheduled consultation and live call earnings"
          settings={data?.consultation}
          isLoading={isPending}
        />
        <CommissionRateCard
          source="remedy"
          title="Remedy Commission"
          description="Applied to astrologer remedy order earnings"
          settings={data?.remedy}
          isLoading={isPending}
        />
        <CommissionRateCard
          source="gift"
          title="Gift Commission"
          description="Applied to gifts sent to astrologers"
          settings={data?.gift}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
