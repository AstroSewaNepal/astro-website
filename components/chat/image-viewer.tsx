'use client';

import { useCallback, useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ExternalLink, ImageOff, X } from 'lucide-react';

const HISTORY_FLAG = 'chatImageViewer';

function viewerEntryOnTop(): boolean {
  try {
    return !!(window.history.state as Record<string, unknown> | null)?.[HISTORY_FLAG];
  } catch {
    return false;
  }
}

/**
 * The app's image viewer (useImageViewer): a photo full screen over the chat. Opening adds a history entry, so the
 * phone's back button (or swipe) closes the photo instead of leaving the chat, like the app's BackHandler.
 * The entry is added on the tap, not in an effect, so React's dev double-effects can't push it twice.
 */
export function useImageViewer() {
  const [src, setSrc] = useState<string | null>(null);

  const open = useCallback((url: string) => {
    try {
      // Keep the router's own state on the new entry (Next reads it on back).
      window.history.pushState({ ...(window.history.state ?? {}), [HISTORY_FLAG]: true }, '');
    } catch {
      // No history (sandboxed frame): the viewer still opens; back just leaves the page.
    }
    setSrc(url);
  }, []);

  // Back (button, gesture or our own close) is the one way the photo closes while its entry is on top.
  useEffect(() => {
    if (!src) return;
    const onPop = () => setSrc(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [src]);

  const close = useCallback(() => {
    if (viewerEntryOnTop()) window.history.back();
    else setSrc(null);
  }, []);

  return { src, open, close };
}

export function ImageViewer({ src, onClose }: { src: string | null; onClose: () => void }) {
  const [broken, setBroken] = useState<string | null>(null);
  return (
    <DialogPrimitive.Root open={!!src} onOpenChange={next => (next ? null : onClose())}>
      <DialogPrimitive.Portal>
        {/* Above the full-screen phone chat (z-55) and its dialogs. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/90" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[91] flex items-center justify-center p-4 pb-[max(4rem,calc(env(safe-area-inset-bottom)+3.5rem))] pt-[max(4rem,calc(env(safe-area-inset-top)+3.5rem))] font-app outline-none"
          // Tapping beside the photo closes it, like the app.
          onClick={e => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <DialogPrimitive.Title className="sr-only">Photo</DialogPrimitive.Title>
          {src && broken !== src ? (
            // eslint-disable-next-line @next/next/no-img-element -- chat photos are backend media URLs
            <img
              src={src}
              alt="Photo"
              referrerPolicy="no-referrer"
              onError={() => setBroken(src)}
              className="max-h-full max-w-full select-none object-contain"
            />
          ) : src ? (
            <p className="flex flex-col items-center gap-2 text-white/80">
              <ImageOff className="h-10 w-10" aria-hidden />
              This photo could not be loaded.
            </p>
          ) : null}
          <DialogPrimitive.Close
            aria-label="Close photo"
            className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="h-6 w-6" aria-hidden />
          </DialogPrimitive.Close>
          {src ? (
            // The full photo in its own tab, where phones can pinch-zoom it.
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-[14px] font-medium text-white hover:bg-white/25"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open full size
            </a>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
