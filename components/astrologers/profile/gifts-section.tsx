'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { GiftImage, GiftSendSheet } from '@/components/astrologers/gift-send-sheet';
import { useBackendClient } from '@/hooks/use-backend-client';
import { availableGifts, type Gift, giftPriceLabel } from '@/lib/astrologers/gifts';

/** The app's GiftsSection: one sliding row of gifts priced for the buyer's country; tap one to send it. */
export function GiftsSection({
  astrologerId,
  astrologerName,
  countryCode,
}: {
  astrologerId: string;
  astrologerName: string;
  countryCode: string | null;
}) {
  const backend = useBackendClient();
  const [selected, setSelected] = useState<Gift | null>(null);
  const gifts = useQuery({
    queryKey: ['gifts', countryCode],
    queryFn: () => backend.get<Gift[]>(`/gifts${countryCode ? `?countryCode=${countryCode}` : ''}`),
    staleTime: 10 * 60 * 1000,
  });
  const list = availableGifts(Array.isArray(gifts.data) ? gifts.data : []);
  // Like the app: no section at all when there is nothing to send.
  if (!list.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-[18px] font-semibold text-[#4a1a1a]">Send a Gift</h2>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
        {list.map(gift => (
          <li key={gift._id} className="shrink-0">
            <button
              type="button"
              onClick={() => setSelected(gift)}
              className="flex w-[104px] flex-col items-center gap-1.5 rounded-[20px] border border-[#e3c9b5] bg-[#fbf6ee] px-2 pb-3 pt-3 text-center transition-colors hover:bg-[#f6ecdc]"
            >
              <GiftImage gift={gift} size={72} />
              <span className="line-clamp-1 w-full text-[14px] font-semibold text-[#4a1a1a]">
                {gift.title}
              </span>
              <span className="text-[13px] text-primary">{giftPriceLabel(gift)}</span>
            </button>
          </li>
        ))}
      </ul>
      <GiftSendSheet
        gift={selected}
        astrologerId={astrologerId}
        astrologerName={astrologerName}
        countryCode={countryCode}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
