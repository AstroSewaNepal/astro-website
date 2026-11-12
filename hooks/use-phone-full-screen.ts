'use client';

import { useEffect, type RefObject } from 'react';

/** Below Tailwind's `lg`: the phone layout. */
const PHONE_QUERY = '(max-width: 1023.98px)';

/**
 * On phones, pins `ref` over the whole visible area (the app's full-screen chat) and stops the page behind it from
 * scrolling. The element follows the visual viewport, so when the on-screen keyboard opens it shrinks to the space
 * above the keyboard instead of the browser scrolling the page (which pulled the site footer up on Android, and
 * covers the composer on iPhones). The element's own classes do the fixed positioning; this sets top and height.
 */
export function usePhoneFullScreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const phone = window.matchMedia(PHONE_QUERY);
    const vv = window.visualViewport;
    const root = document.documentElement;
    const body = document.body;
    let saved: { root: string; body: string } | null = null;

    const lock = () => {
      if (saved) return;
      saved = { root: root.style.overflow, body: body.style.overflow };
      root.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    };
    const unlock = () => {
      if (!saved) return;
      root.style.overflow = saved.root;
      body.style.overflow = saved.body;
      saved = null;
    };

    const apply = () => {
      if (!phone.matches) {
        unlock();
        el.style.removeProperty('top');
        el.style.removeProperty('height');
        el.style.removeProperty('bottom');
        return;
      }
      lock();
      // Without visualViewport (old browsers) the classes' full-window box stands.
      if (!vv) return;
      // Android with resizes-content (the chat page's viewport) shrinks the window itself, in step with the
      // keyboard: the classes already fit it. Only browsers that leave the window as it is (iPhones) need the box
      // sized to the visible part by hand, which lags the keyboard a little.
      if (vv.height >= window.innerHeight - 1) {
        el.style.removeProperty('top');
        el.style.removeProperty('height');
        el.style.removeProperty('bottom');
        return;
      }
      el.style.top = `${vv.offsetTop}px`;
      el.style.height = `${vv.height}px`;
      el.style.bottom = 'auto';
    };

    apply();
    vv?.addEventListener('resize', apply);
    vv?.addEventListener('scroll', apply);
    phone.addEventListener('change', apply);
    return () => {
      vv?.removeEventListener('resize', apply);
      vv?.removeEventListener('scroll', apply);
      phone.removeEventListener('change', apply);
      unlock();
      el.style.removeProperty('top');
      el.style.removeProperty('height');
      el.style.removeProperty('bottom');
    };
  }, [ref]);
}
