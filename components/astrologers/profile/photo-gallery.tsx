'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Photo = { _id: string; url: string; thumbnail?: { url?: string | null } | null };

/** The app's PhotoGallerySection: thumbnails, tap one to see it full size and swipe through the rest. */
export function PhotoGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return null;
  const current = open === null ? null : photos[open];
  const step = (by: number) =>
    setOpen(i => (i === null ? i : (i + by + photos.length) % photos.length));

  return (
    <section>
      <h2 className="mb-3 font-mukta text-[18px] font-semibold text-[#4a1a1a]">Photos</h2>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        {photos.map((photo, i) => (
          <button
            key={photo._id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="h-[96px] w-[96px] shrink-0 overflow-hidden rounded-xl bg-[#efe6da] lg:h-[120px] lg:w-[120px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- backend media URLs */}
            <img
              src={photo.thumbnail?.url || photo.url}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
      <p className="mt-1.5 font-mukta text-sm text-[#6d6d6d]">
        {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
      </p>

      <DialogPrimitive.Root open={current !== null} onOpenChange={o => !o && setOpen(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/85" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') step(1);
              if (e.key === 'ArrowLeft') step(-1);
            }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4 outline-none"
          >
            <DialogPrimitive.Title className="sr-only">
              Photos of {name}, {open === null ? 0 : open + 1} of {photos.length}
            </DialogPrimitive.Title>
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
              <img
                src={current.url}
                alt=""
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            ) : null}
            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => step(-1)}
                  className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => step(1)}
                  className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}
