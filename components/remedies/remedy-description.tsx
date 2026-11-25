'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import DOMPurify from 'dompurify';

import { descriptionHtml } from '@/lib/remedies/description';

// Astrologers write these: only text formatting and links survive (no images, styles, forms or scripts).
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'code',
  'pre',
  'blockquote',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'span',
  'div',
];

let hooked = false;
function purifier() {
  if (!hooked) {
    hooked = true;
    // Links leave the site in a new tab, without handing it this page.
    DOMPurify.addHook('afterSanitizeAttributes', node => {
      if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer nofollow');
      }
    });
  }
  return DOMPurify;
}

/** About five lines of text (15px at 1.6 line height); longer descriptions fold behind "Read more". */
const FOLDED_PX = 120;

/** The product description, sanitized in the browser (the page itself is client-rendered). */
export function RemedyDescription({ description }: { description: unknown }) {
  const html = useMemo(() => {
    const raw = descriptionHtml(description);
    if (!raw || typeof window === 'undefined') return '';
    return purifier().sanitize(raw, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ['href'],
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
    });
  }, [description]);

  const body = useRef<HTMLDivElement>(null);
  const [long, setLong] = useState(false);
  const [open, setOpen] = useState(false);
  // Measure the full text (also when the width changes) to know whether it needs folding.
  useEffect(() => {
    const node = body.current;
    if (!node) return;
    const measure = () => setLong(node.scrollHeight > FOLDED_PX + 24);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [html]);

  if (!html) return null;
  const folded = long && !open;
  return (
    <div>
      <div className="relative">
        <div
          ref={body}
          id="remedy-description"
          style={folded ? { maxHeight: FOLDED_PX } : undefined}
          className={clsx(
            'overflow-hidden text-[15px] leading-[1.6] text-[#79787A] [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_h1]:mb-1.5 [&_h1]:mt-2 [&_h1]:text-[20px] [&_h1]:font-bold [&_h1]:text-[#1C1C1C] [&_h2]:mb-1 [&_h2]:mt-2 [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:text-[#1C1C1C] [&_h3]:mb-1 [&_h3]:mt-1.5 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-[#1C1C1C] [&_li]:mb-0.5 [&_ol]:mb-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p:last-child]:mb-0 [&_p]:mb-1.5 [&_pre]:rounded-lg [&_pre]:bg-[#F1DBD7] [&_pre]:p-3 [&_strong]:font-bold [&_strong]:text-[#1C1C1C] [&_ul]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5',
          )}
          // Sanitized above with DOMPurify (tight allowlist).
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {folded ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[#F8F3DF] lg:to-[#FFFAE6]"
          />
        ) : null}
      </div>
      {long ? (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="remedy-description"
          className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold text-primary hover:underline"
        >
          {open ? 'Show less' : 'Read more'}
          {open ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </button>
      ) : null}
    </div>
  );
}
