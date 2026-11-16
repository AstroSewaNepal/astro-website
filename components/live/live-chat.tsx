'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { Gift, MessageCircle, SendHorizontal } from 'lucide-react';

import { MAX_CHAT_TEXT_LENGTH } from '@/lib/live/messages';
import type { LiveFeedItem } from '@/lib/live/ui';

/** The app's LiveCommentsFeed: dark bubbles over the video, newest at the bottom, gift lines with a gold border. */
export function LiveChatFeed({ items, className }: { items: LiveFeedItem[]; className?: string }) {
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
              'flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[#D4A017] bg-black/40 px-3 py-1.5 font-app text-[12px] text-white',
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
            <div className="min-w-0 rounded-2xl bg-black/45 px-3 py-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-app text-[12px] font-bold text-white/85">{item.name}</span>
                {item.isHost ? (
                  <span className="rounded-full bg-primary px-1.5 font-app text-[9px] font-bold tracking-wide text-white">
                    Host
                  </span>
                ) : null}
              </div>
              <div className="my-px h-px bg-white/20" />
              <p className="break-words font-app text-[13px] leading-[17px] text-white">{item.text}</p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

/** The app's message bar: a dark pill with the chat icon, the text and a send arrow. */
export function LiveComposer({
  onSend,
  disabled,
  className,
}: {
  onSend: (text: string) => boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [text, setText] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (onSend(text)) setText('');
  };
  return (
    <form onSubmit={submit} className={clsx('flex items-center gap-2 rounded-full bg-black/80 py-1 pl-3 pr-1', className)}>
      <MessageCircle className="h-5 w-5 shrink-0 text-[#D9B88A]" aria-hidden />
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={MAX_CHAT_TEXT_LENGTH}
        disabled={disabled}
        placeholder="Write message here..."
        aria-label="Message"
        enterKeyHint="send"
        className="h-9 min-w-0 flex-1 bg-transparent font-app text-[15px] text-white placeholder:text-white/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Send"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
      >
        <SendHorizontal className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
