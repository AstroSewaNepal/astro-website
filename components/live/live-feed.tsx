'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Radio } from 'lucide-react';

import { useBackendClient } from '@/hooks/use-backend-client';
import { liveApi, type LiveRoomSummary } from '@/lib/live/api';
import { cardServices, LIVE_FEED_POLL_MS, livePath, stableRooms, watchingLabel } from '@/lib/live/feed';

export const LIVE_ROOMS_KEY = ['live', 'rooms'] as const;

/**
 * Live Astrologers (the app's LiveFeedScreen in Browse mode): everyone who is live right now, open to guests.
 * Tapping a card opens the stream at /live/<astrologerId>, where the swiping between streams lives.
 */
export function LiveFeed() {
  const backend = useBackendClient();
  const rooms = useQuery({
    queryKey: LIVE_ROOMS_KEY,
    queryFn: () => liveApi(backend).activeRooms(),
    refetchInterval: LIVE_FEED_POLL_MS,
    staleTime: 10_000,
  });

  // The order the person already sees survives each poll (the app's stableRooms). Adjusted while rendering, the
  // React way to derive state from a changed input (React Query keeps `data`'s identity when nothing changed).
  const [order, setOrder] = useState<{ source: LiveRoomSummary[] | undefined; shown: LiveRoomSummary[] }>({
    source: undefined,
    shown: [],
  });
  if (rooms.data && rooms.data !== order.source) {
    setOrder({ source: rooms.data, shown: stableRooms(order.shown, rooms.data) });
  }
  const shown = order.shown;

  return (
    <div className="w-full">
      <h1 className="mb-5 text-center text-[28px] font-normal text-primary lg:text-left lg:text-[34px]">
        Live Astrologers
      </h1>

      {rooms.isPending ? (
        <div className="flex justify-center py-20" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : rooms.isError && !shown.length ? (
        <div className="py-16 text-center font-app text-[17px] text-[#4a1a1a]">
          <p>Could not load live streams.</p>
          <button type="button" onClick={() => rooms.refetch()} className="mt-2 text-primary underline">
            Try again
          </button>
        </div>
      ) : !shown.length ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Radio className="h-16 w-16 text-primary" strokeWidth={1.25} aria-hidden />
          <p className="font-app text-[20px] text-primary">No one is live right now</p>
          <p className="font-app text-[15px] text-[#8a7a6a]">Check back soon!</p>
          <Link
            href="/astrologers"
            className="rounded-full bg-primary px-6 py-2.5 font-app text-[16px] text-white"
          >
            Find astrologers
          </Link>
        </div>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
          {shown.map(room => (
            <LiveRoomCard key={room.roomId} room={room} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** The app's LiveBrowseRoomCard: avatar in a maroon ring with a Live badge, name, "N watching" or the services. */
function LiveRoomCard({ room }: { room: LiveRoomSummary }) {
  const name = room.astrologerName ?? 'Astrologer';
  const label = watchingLabel(room);
  const services = cardServices(room);
  return (
    <li>
      <Link
        href={livePath(room.astrologerId)}
        className="flex items-center gap-3 rounded-lg border border-[#BE7B71] bg-[#FFFAE6] p-2 transition-colors hover:bg-[#fff5d6] md:gap-4 md:p-3"
        aria-label={`Watch ${name} live`}
      >
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary md:h-20 md:w-20">
          {room.astrologerAvatar ? (
            // Backend photos come from many hosts; next/image needs each one allow-listed.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={room.astrologerAvatar}
              alt=""
              className="h-14 w-14 rounded-full object-cover md:h-[70px] md:w-[70px]"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1DBD7] font-app text-[18px] font-semibold text-primary md:h-[70px] md:w-[70px]">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="absolute -bottom-2 rounded border-[1.5px] border-white bg-primary px-1.5 py-px font-app text-[11px] font-semibold leading-4 text-white">
            Live
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-app text-[17px] font-semibold text-primary md:text-[18px]">{name}</span>
          {label ? (
            <span className="truncate font-app text-[14px] text-[#1C1C1C]">{label}</span>
          ) : (
            <span className="truncate font-app text-[14px] text-[#1C1C1C]">{services.join(', ')}</span>
          )}
        </span>
      </Link>
    </li>
  );
}
