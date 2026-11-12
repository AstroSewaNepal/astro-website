'use client';

import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';

/** How long a finger has to stay down (Android's long-press time is 400-500 ms). */
const LONG_PRESS_MS = 500;
/** Moving further than this is a scroll, not a press. */
const MOVE_TOLERANCE_PX = 10;

/**
 * A long press with a finger or pen (the app's onLongPress). Mouse users keep their normal click and right-click.
 * Android also fires `contextmenu` on a long press; iPhones don't, hence the timer. The click that ends a long press
 * is swallowed so it doesn't also open what was pressed (a photo).
 */
export function useLongPress(onLongPress: () => void, enabled = true) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  const pointer = useRef<string>('mouse');
  const callback = useRef(onLongPress);
  useEffect(() => {
    callback.current = onLongPress;
  }, [onLongPress]);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!enabled) return {};

  const cancel = () => {
    clearTimeout(timer.current);
    start.current = null;
  };
  const fire = () => {
    cancel();
    fired.current = true;
    callback.current();
  };

  return {
    onPointerDown: (e: PointerEvent) => {
      pointer.current = e.pointerType;
      fired.current = false;
      if (e.pointerType === 'mouse') return;
      start.current = { x: e.clientX, y: e.clientY };
      clearTimeout(timer.current);
      timer.current = setTimeout(fire, LONG_PRESS_MS);
    },
    onPointerMove: (e: PointerEvent) => {
      const s = start.current;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > MOVE_TOLERANCE_PX) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e: MouseEvent) => {
      if (pointer.current === 'mouse') return;
      e.preventDefault();
      if (!fired.current) fire();
    },
    onClickCapture: (e: MouseEvent) => {
      if (!fired.current) return;
      fired.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
  };
}
