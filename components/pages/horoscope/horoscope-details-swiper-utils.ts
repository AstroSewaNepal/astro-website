'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';

export function useSwiperScrollToIndex(activeIndex: number) {
  const ref = useRef<SwiperType | null>(null);

  useEffect(() => {
    const s = ref.current;
    if (!s || activeIndex < 0) {
      return;
    }

    queueMicrotask(() => {
      s.slideTo(activeIndex, 0);
    });
  }, [activeIndex]);

  const onSwiper = useCallback(
    (s: SwiperType) => {
      ref.current = s;
      if (activeIndex >= 0) {
        queueMicrotask(() => s.slideTo(activeIndex, 0));
      }
    },
    [activeIndex],
  );

  return onSwiper;
}
