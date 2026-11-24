'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Minus, Plus, Share2, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';

import { useRemedyCart, useRemedyCartLine } from '@/hooks/use-remedy-cart';
import {
  CART_PATH,
  ORDERS_PATH,
  moneyLabel,
  remedyPath,
  type Remedy,
} from '@/lib/remedies/catalogue';

/** The app's cart icon with the units badge (clients only). */
export function CartButton() {
  const { isClient, count } = useRemedyCart();
  if (!isClient) return null;
  return (
    <Link
      href={CART_PATH}
      aria-label={count ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart'}
      className="relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-[#BE7B71] text-primary"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] leading-none text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}

/** The app's "Orders" pill (My Payments, remedies only). */
export function OrdersButton() {
  const { isClient } = useRemedyCart();
  if (!isClient) return null;
  return (
    <Link
      href={ORDERS_PATH}
      className="flex h-[38px] shrink-0 items-center rounded-full border-[1.5px] border-primary px-4 font-app text-[15px] text-primary"
    >
      Orders
    </Link>
  );
}

/** Page title row: the app's header with Orders + cart on the right. */
export function RemediesHeader({ title, orders = false }: { title: string; orders?: boolean }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h1 className="min-w-0 truncate text-[28px] font-normal text-primary lg:text-[34px]">
        {title}
      </h1>
      <div className="flex shrink-0 items-center gap-2">
        {orders ? <OrdersButton /> : null}
        <CartButton />
      </div>
    </div>
  );
}

/** Add to Cart, or − quantity + once it's in the cart (the app's RemedyCartControls). */
export function CartControls({
  remedy,
  variant,
}: {
  remedy: Pick<Remedy, 'id' | 'deliveryType'>;
  variant: 'card' | 'footer';
}) {
  const { canBuy, line, busy, error, addToCart, increase, decrease } = useRemedyCartLine(remedy);
  if (!canBuy) return null;
  const footer = variant === 'footer';
  // Inside a card that is itself a link: keep the click on the button.
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  return (
    <div className="flex flex-col gap-1">
      {line ? (
        <div
          className={clsx(
            'flex items-center justify-between',
            footer
              ? 'h-[52px] justify-center gap-8'
              : 'h-[34px] rounded-lg border border-[#BE7B71] px-2',
          )}
        >
          <button
            type="button"
            onClick={stop(decrease)}
            disabled={busy}
            aria-label={line.quantity > 1 ? 'Remove one' : 'Remove from cart'}
            className={clsx(
              'flex items-center justify-center text-primary disabled:opacity-50',
              footer ? 'h-11 w-11 rounded-full border border-[#BE7B71]' : 'h-7 w-7',
            )}
          >
            <Minus className={footer ? 'h-5 w-5' : 'h-4 w-4'} aria-hidden />
          </button>
          <span
            aria-live="polite"
            className={clsx(
              'min-w-6 text-center font-semibold text-[#1C1C1C]',
              footer ? 'text-[20px]' : 'text-[15px]',
            )}
          >
            {busy ? (
              <Loader2
                className="mx-auto h-4 w-4 animate-spin text-primary"
                aria-label="Updating"
              />
            ) : (
              line.quantity
            )}
          </span>
          <button
            type="button"
            onClick={stop(increase)}
            disabled={busy}
            aria-label="Add one more"
            className={clsx(
              'flex items-center justify-center text-primary disabled:opacity-50',
              footer ? 'h-11 w-11 rounded-full border border-[#BE7B71]' : 'h-7 w-7',
            )}
          >
            <Plus className={footer ? 'h-5 w-5' : 'h-4 w-4'} aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={stop(addToCart)}
          disabled={busy}
          className={clsx(
            'flex w-full items-center justify-center gap-2 bg-primary text-white disabled:opacity-60',
            footer
              ? 'h-[52px] rounded-full text-[17px] font-semibold'
              : 'h-[34px] rounded-lg text-[14px]',
          )}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : footer ? (
            <ShoppingCart className="h-5 w-5" aria-hidden />
          ) : null}
          Add to Cart
        </button>
      )}
      {error ? (
        <p role="alert" className="text-[12px] leading-4 text-[#b3261e]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Share a product: the phone's share sheet, else copy the link (the app's shareRemedy text). */
export function ShareRemedyButton({
  remedy,
  price,
  className,
}: {
  remedy: Pick<Remedy, 'id' | 'name' | 'discount'>;
  price: { currency: string; value: number };
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}${remedyPath(remedy.id)}`;
    const off = remedy.discount > 0 ? ` (${remedy.discount}% OFF)` : '';
    const text = `Check out "${remedy.name}" on AstroSewa!\n${moneyLabel(price.currency, price.value)}${off}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: remedy.name, text, url });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return; // closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  };
  return (
    <button
      type="button"
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        void share();
      }}
      aria-label={copied ? 'Link copied' : `Share ${remedy.name}`}
      className={clsx('relative flex shrink-0 items-center justify-center text-primary', className)}
    >
      <Share2 className="h-[18px] w-[18px]" aria-hidden />
      {copied ? (
        <span className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded-md bg-[#1C1C1C] px-2 py-1 text-[12px] text-white">
          Link copied
        </span>
      ) : null}
    </button>
  );
}

/** A floating "Go to Cart (n)" bar over the list on phones, as the app (sits above the tabs). */
export function GoToCartBar() {
  const { isClient, count } = useRemedyCart();
  if (!isClient || count === 0) return null;
  return (
    <div className="pointer-events-none sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 -mx-4 mt-4 bg-gradient-to-b from-transparent to-[#F8F3DF] px-4 pb-3 pt-6 lg:hidden">
      <Link
        href={CART_PATH}
        className="pointer-events-auto flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[17px] text-[#F8F3DF] shadow-lg"
      >
        <ShoppingCart className="h-5 w-5" aria-hidden />
        Go to Cart
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F8F3DF] px-1 text-[12px] text-primary">
          {count}
        </span>
      </Link>
    </div>
  );
}
