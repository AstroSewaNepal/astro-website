'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Gift } from 'lucide-react';

import { FLOAT_MS, MAX_FLOATS, floatKeyframes, floatPath, giftsToFly, hasFlown, markFlown } from '@/lib/live/gifts';
import type { LiveGift } from '@/lib/live/messages';

/** Floats start a little above the bottom (around the chat) and rise most of the player's height. */
const START_BOTTOM = 120;

/**
 * The app's LiveGiftFloatOverlay: each gift sent while watching flies up the player once (see lib/live/gifts). Up to
 * MAX_FLOATS at a time, the rest wait. Reads the gifts the stream already has; no extra requests. Nothing can be
 * tapped here, and people who ask for less motion get the chat line only.
 */
export function LiveGiftFloats({ gifts }: { gifts: LiveGift[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<LiveGift[]>([]);
  const playingRef = useRef<LiveGift[]>([]);
  const queue = useRef<LiveGift[]>([]);

  const pump = useCallback(() => {
    const next = [...playingRef.current];
    while (next.length < MAX_FLOATS && queue.current.length) {
      const gift = queue.current.shift()!;
      // Counted as flown when it starts, so an unmount mid-queue leaves the rest for the next mount.
      if (hasFlown(gift.id)) continue;
      markFlown(gift.id);
      next.push(gift);
    }
    if (next.length !== playingRef.current.length) {
      playingRef.current = next;
      setPlaying(next);
    }
  }, []);

  useEffect(() => {
    const here = new Set([...queue.current, ...playingRef.current].map(g => g.id));
    const fresh = giftsToFly(gifts, here);
    if (!fresh.length) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      fresh.forEach(g => markFlown(g.id));
      return;
    }
    queue.current.push(...fresh);
    pump();
  }, [gifts, pump]);

  const done = useCallback(
    (id: string) => {
      playingRef.current = playingRef.current.filter(g => g.id !== id);
      setPlaying(playingRef.current);
      pump();
    },
    [pump],
  );

  return (
    <div ref={box} data-gift-floats className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden>
      {playing.map(g => (
        <Float key={g.id} gift={g} box={box} onDone={done} />
      ))}
    </div>
  );
}

function Float({ gift, box, onDone }: { gift: LiveGift; box: React.RefObject<HTMLDivElement | null>; onDone: (id: string) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const [broken, setBroken] = useState(false);

  useLayoutEffect(() => {
    const node = el.current;
    const area = box.current;
    if (!node || !area || typeof node.animate !== 'function') {
      onDone(gift.id);
      return;
    }
    const path = floatPath(area.clientWidth * 0.12, Math.max(0, area.clientHeight * 0.85 - START_BOTTOM / 2));
    const animation = node.animate(floatKeyframes(path), { duration: FLOAT_MS, fill: 'forwards' });
    animation.onfinish = () => onDone(gift.id);
    return () => {
      animation.onfinish = null;
      animation.cancel();
    };
    // Starts once per gift (ids are unique).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={el} className="absolute inset-x-0 flex justify-center opacity-0" style={{ bottom: START_BOTTOM }}>
      {gift.giftImageUrl && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
        <img src={gift.giftImageUrl} alt="" className="h-[54px] w-[54px] object-contain drop-shadow" decoding="async" onError={() => setBroken(true)} />
      ) : (
        <Gift className="h-12 w-12 text-[#F5C542] drop-shadow" strokeWidth={1.5} />
      )}
    </div>
  );
}
