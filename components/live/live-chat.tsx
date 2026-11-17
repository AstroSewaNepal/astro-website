'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { Gift, MessageCircle, SendHorizontal } from 'lucide-react';

import { MAX_CHAT_TEXT_LENGTH } from '@/lib/live/messages';
import type { LiveFeedItem } from '@/lib/live/ui';

/** Over the video (phone) the bubbles are dark; on the desktop chat panel they sit on a light card. */
export type ChatTone = 'dark' | 'light';

/** The app's LiveCommentsFeed: bubbles with the sender's initial, newest at the bottom, gift lines with a gold border. */
export function LiveChatFeed({ items, className, tone = 'dark' }: { items: LiveFeedItem[]; className?: string; tone?: ChatTone }) {
  const list = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const onScroll = () => {
    const el = list.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };
  // New lines scroll into view unless the person scrolled up to read.
  useEffect(() => {
    const el = list.current;
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }, [items]);

  const dark = tone === 'dark';
  return (
    <div
      ref={list}
      onScroll={onScroll}
      className={clsx('flex flex-col gap-1.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:none]', className)}
      aria-live="polite"
      aria-label="Live chat"
    >
      {/* New lines sit at the bottom (the first one pushes down from the top), like a chat. */}
      {items.map((item, i) =>
        item.kind === 'gift' ? (
          <div
            key={item.id}
            className={clsx(
              'flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#D4A017] px-3 py-1.5 font-app text-[12px]',
              dark ? 'bg-black/40 text-white' : 'bg-[#fff6dc] text-[#4a1a1a]',
              i === 0 && 'mt-auto',
            )}
          >
            {item.giftImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.giftImageUrl} alt="" className="h-5 w-5 rounded object-cover" />
            ) : (
              <Gift className="h-4 w-4 text-[#D4A017]" aria-hidden />
            )}
            <span>
              <span className="font-semibold">{item.name}</span> sent a {item.giftTitle}
            </span>
          </div>
        ) : (
          <div key={item.id} className={clsx('flex max-w-full items-start gap-2', i === 0 && 'mt-auto')}>
            <span className="mt-0.5 flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full bg-primary font-app text-[12px] font-bold text-white">
              {item.name.charAt(0).toUpperCase()}
            </span>
            <div className={clsx('min-w-0 rounded-2xl px-3 py-1', dark ? 'bg-black/45' : 'bg-white/70')}>
              <div className="flex items-center gap-1.5">
                <span className={clsx('truncate font-app text-[12px] font-bold', dark ? 'text-white/85' : 'text-[#6d3b2a]')}>{item.name}</span>
                {item.isHost ? (
                  <span className="rounded-full bg-primary px-1.5 font-app text-[9px] font-bold tracking-wide text-white">
                    Host
                  </span>
                ) : null}
              </div>
              <div className={clsx('my-px h-px', dark ? 'bg-white/20' : 'bg-[#BE7B71]/40')} />
              <p className={clsx('break-words font-app text-[13px] leading-[17px]', dark ? 'text-white' : 'text-[#1C1C1C]')}>{item.text}</p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

/** The app's message bar: a pill with the chat icon, the text and a send arrow. */
export function LiveComposer({
  onSend,
  disabled,
  className,
  tone = 'dark',
}: {
  onSend: (text: string) => boolean;
  disabled?: boolean;
  className?: string;
  tone?: ChatTone;
}) {
  const [text, setText] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (onSend(text)) setText('');
  };
  const dark = tone === 'dark';
  return (
    <form
      onSubmit={submit}
      className={clsx(
        'flex items-center gap-2 rounded-full py-1 pl-3 pr-1',
        dark ? 'bg-black/80' : 'border border-[#BE7B71] bg-white',
        className,
      )}
    >
      <MessageCircle className={clsx('h-5 w-5 shrink-0', dark ? 'text-[#D9B88A]' : 'text-primary')} aria-hidden />
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={MAX_CHAT_TEXT_LENGTH}
        disabled={disabled}
        placeholder="Write message here..."
        aria-label="Message"
        enterKeyHint="send"
        className={clsx(
          'h-9 min-w-0 flex-1 bg-transparent font-app text-[15px] focus:outline-none',
          dark ? 'text-white placeholder:text-white/60' : 'text-[#1C1C1C] placeholder:text-[#8a7a6a]',
        )}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Send"
        className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:opacity-40', dark ? 'text-white' : 'text-primary')}
      >
        <SendHorizontal className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
