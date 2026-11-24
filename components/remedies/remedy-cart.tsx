'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import clsx from 'clsx';

import { CheckoutSheet } from '@/components/payments/checkout-sheet';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import { useRemedyCart } from '@/hooks/use-remedy-cart';
import {
  DEFAULT_DIAL_CODE,
  ME_QUERY_KEY,
  joinPhone,
  splitPhone,
  type MeResponse,
} from '@/lib/account/profile';
import { COUNTRIES } from '@/lib/data/countries';
import type { Purchase } from '@/lib/payments/checkout';
import {
  CART_QUERY_KEY,
  ZONE_OPTIONS,
  cartTotals,
  checkoutDetails,
  checkoutErrors,
  groupByDelivery,
  hasPlatformItem,
  itemCurrency,
  physicalBlocked,
  physicalZone,
  removedBySeller,
  unitPrice,
  type AttributionOption,
  type Cart,
  type CartItem,
  type CheckoutErrors,
  type CheckoutForm,
  type DeliveryZone,
} from '@/lib/remedies/cart';
import { REMEDIES_PATH, moneyLabel, remedyPath } from '@/lib/remedies/catalogue';

import { AttributionPicker } from './attribution-picker';

const section =
  'rounded-2xl border border-[#E5E5E5] bg-[#FFFAE6] p-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]';
const sectionTitle = 'font-raleway text-[18px] font-semibold text-[#1C1C1C]';
const field =
  'w-full rounded-xl border border-[#c9837a] bg-white/60 px-4 font-app text-[16px] text-[#4a1a1a] outline-none focus:border-primary';
const label = 'mb-1.5 block text-[15px] font-medium text-[#1C1C1C]';

const errorText = (error: unknown) =>
  error instanceof Error && error.message
    ? error.message
    : 'Something went wrong. Please try again.';

/** Today as YYYY-MM-DD in the buyer's time zone (the earliest onsite date). */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * The app's Cart screen, which is also its checkout: items with quantities, delivery details per delivery type,
 * contact phone, "recommended by", the order summary and Pay. The server prices the cart and places the order once
 * paid. Phones: the app's stacked sections with Pay at the bottom. Desktop: details on the left, summary on the right.
 */
export function RemedyCart() {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const { countryCode } = useBuyerCountry();
  const { cart, items, setQuantity, remove } = useRemedyCart();
  const groups = useMemo(() => groupByDelivery(items), [items]);
  const totals = useMemo(() => cartTotals(items), [items]);
  const blocked = totals.mixedCurrency || physicalBlocked(groups, totals);

  const me = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => backend.get<MeResponse>('/users/me'),
  });
  const [form, setForm] = useState<CheckoutForm>({
    shippingAddress: '',
    onsiteAddress: '',
    onsiteDate: '',
    onsiteTime: '',
    countryCode: DEFAULT_DIAL_CODE,
    phone: '',
  });
  // Pre-fill the phone once the profile arrives (the app's contact info).
  const filled = useRef(false);
  useEffect(() => {
    if (filled.current || !me.data) return;
    filled.current = true;
    const saved = splitPhone(me.data.user.phoneNumber);
    setForm(f => ({ ...f, countryCode: saved.dialCode, phone: saved.phone }));
  }, [me.data]);
  const set = (key: keyof CheckoutForm) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const [tried, setTried] = useState(false);
  const errors: CheckoutErrors = tried ? checkoutErrors(form, groups) : {};
  const [attribution, setAttribution] = useState<AttributionOption | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  // A changed zone re-prices the physical lines: the server sets the charge when an item is added, so each line
  // goes out and back in with the new zone (the app does the same).
  const [changingZone, setChangingZone] = useState(false);
  const changeZone = async (zone: DeliveryZone) => {
    if (zone === physicalZone(groups) || changingZone) return;
    setChangingZone(true);
    setNotice(null);
    try {
      let latest: Cart | null = null;
      for (const item of groups.physical) {
        await backend.delete<Cart>(`/cart/items/${encodeURIComponent(item.id)}`);
        latest = await backend.post<Cart>('/cart/items', {
          remedyId: item.remedyId,
          quantity: item.quantity,
          deliveryZone: zone,
          ...(countryCode ? { countryCode } : {}),
        });
      }
      if (latest) queryClient.setQueryData(CART_QUERY_KEY, latest);
    } catch (error) {
      setNotice(errorText(error));
      void cart.refetch();
    } finally {
      setChangingZone(false);
    }
  };

  const pay = async () => {
    setTried(true);
    setNotice(null);
    if (Object.keys(checkoutErrors(form, groups)).length) return;
    setPreparing(true);
    try {
      // The phone is saved to the profile when it changed, as the app does before paying.
      const saved = me.data ? splitPhone(me.data.user.phoneNumber) : null;
      if (me.data && (saved?.phone !== form.phone || saved?.dialCode !== form.countryCode)) {
        const body = new FormData();
        body.append('fullName', me.data.user.fullName ?? '');
        body.append('phoneNumber', joinPhone(form.countryCode, form.phone));
        await backend.put('/users/me', body);
        void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      }
      // The seller may have changed or removed a product since the cart loaded: check before paying.
      const before = items;
      const fresh = await backend.get<Cart>('/cart');
      queryClient.setQueryData(CART_QUERY_KEY, fresh);
      const now = Array.isArray(fresh?.items) ? fresh.items : [];
      if (now.length === 0) {
        setNotice(
          'Your cart is now empty. The seller removed these products. Please choose other remedies.',
        );
        return;
      }
      if (removedBySeller(before, now).length) {
        setNotice(
          'The seller has just removed a product from your cart. Please review your cart before paying.',
        );
        return;
      }
      setPurchase({
        kind: 'remedy',
        details: checkoutDetails(form, groupByDelivery(now), attribution?.consultationId ?? null),
      });
    } catch (error) {
      setNotice(errorText(error));
    } finally {
      setPreparing(false);
    }
  };

  if (cart.isPending) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (cart.isError) {
    return (
      <div className="py-16 text-center text-[17px] text-[#4a1a1a]">
        <p>We could not load your cart.</p>
        <button
          type="button"
          onClick={() => cart.refetch()}
          className="mt-2 text-primary underline"
        >
          Try again
        </button>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex w-full flex-col">
        <h1 className="mb-4 text-[28px] font-normal text-primary lg:text-[34px]">My Cart</h1>
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <ShoppingCart className="h-14 w-14 text-primary/60" aria-hidden />
          <p className="font-raleway text-[20px] font-semibold text-primary">Your Cart is Empty</p>
          <p className="text-[15px] text-[#79787A]">Add some remedies to get started.</p>
          <Link
            href={REMEDIES_PATH}
            className="mt-2 rounded-full bg-primary px-6 py-2.5 text-[16px] text-white"
          >
            Browse Remedies
          </Link>
        </div>
      </div>
    );
  }

  const zone = physicalZone(groups);
  const totalLabel = moneyLabel(totals.currency, totals.total);
  const payButton = (
    <button
      type="button"
      onClick={() => void pay()}
      disabled={preparing || changingZone || blocked}
      className="flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[18px] text-[#F8F3DF] shadow-lg disabled:opacity-60"
    >
      {preparing ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
      Pay <span className="text-[22px] font-semibold">{totalLabel}</span>
    </button>
  );

  return (
    <div className="flex w-full flex-col">
      <h1 className="mb-4 text-[28px] font-normal text-primary lg:text-[34px]">My Cart</h1>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <section className={section}>
            <h2 className={clsx(sectionTitle, 'mb-3')}>Items</h2>
            <ul className="flex flex-col divide-y divide-dashed divide-[#E5E5E5]">
              {items.map(item => (
                <CartRow
                  key={item.id}
                  item={item}
                  busy={
                    changingZone ||
                    (setQuantity.isPending && setQuantity.variables?.itemId === item.id) ||
                    (remove.isPending && remove.variables === item.id)
                  }
                  onQuantity={quantity =>
                    quantity < 1
                      ? remove.mutate(item.id, { onError: e => setNotice(errorText(e)) })
                      : setQuantity.mutate(
                          { itemId: item.id, quantity },
                          { onError: e => setNotice(errorText(e)) },
                        )
                  }
                  onRemove={() => remove.mutate(item.id, { onError: e => setNotice(errorText(e)) })}
                />
              ))}
            </ul>
          </section>

          {groups.physical.length ? (
            <section className={clsx(section, 'flex flex-col gap-3')}>
              <h2 className={sectionTitle}>Physical Delivery</h2>
              <ItemNames items={groups.physical} />
              <fieldset disabled={changingZone}>
                <legend className={label}>Delivery Zone</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {ZONE_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 text-[15px]"
                    >
                      <input
                        type="radio"
                        name="zone"
                        checked={zone === option.value}
                        onChange={() => void changeZone(option.value)}
                        className="h-[18px] w-[18px] accent-primary"
                      />
                      <span className={zone === option.value ? 'text-primary' : 'text-[#1C1C1C]'}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                  {changingZone ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Updating" />
                  ) : null}
                </div>
              </fieldset>
              <div>
                <label htmlFor="cart-address" className={label}>
                  Shipping Address
                </label>
                <textarea
                  id="cart-address"
                  rows={3}
                  value={form.shippingAddress}
                  onChange={e => set('shippingAddress')(e.target.value)}
                  placeholder="House, street, city, landmark"
                  autoComplete="street-address"
                  maxLength={500}
                  className={clsx(field, 'resize-none py-3')}
                />
                <FieldError text={errors.shippingAddress} />
              </div>
              <div className="flex items-center justify-between text-[15px]">
                <span className="font-medium text-[#1C1C1C]">Delivery Charge</span>
                {totals.delivery > 0 ? (
                  <span className="font-semibold text-primary">
                    {moneyLabel(totals.currency, totals.delivery)}
                  </span>
                ) : (
                  <span className="font-semibold text-[#15B763]">FREE</span>
                )}
              </div>
            </section>
          ) : null}

          {groups.online.length ? (
            <section className={clsx(section, 'flex flex-col gap-2')}>
              <div className="flex items-center justify-between gap-2">
                <h2 className={sectionTitle}>Online Delivery</h2>
                <span className="text-[13px] text-[#79787A]">No delivery charge</span>
              </div>
              <ItemNames items={groups.online} />
              <p className="text-[14px] text-[#79787A]">
                We will provide updates to your email once your order is placed.
              </p>
            </section>
          ) : null}

          {groups.onsite.length ? (
            <section className={clsx(section, 'flex flex-col gap-3')}>
              <div className="flex items-center justify-between gap-2">
                <h2 className={sectionTitle}>Onsite Delivery</h2>
                <span className="text-[13px] text-[#79787A]">No delivery charge</span>
              </div>
              <ItemNames items={groups.onsite} />
              <div>
                <label htmlFor="cart-onsite-address" className={label}>
                  Onsite Address
                </label>
                <input
                  id="cart-onsite-address"
                  value={form.onsiteAddress}
                  onChange={e => set('onsiteAddress')(e.target.value)}
                  placeholder="Where should it take place?"
                  maxLength={300}
                  className={clsx(field, 'h-[48px]')}
                />
                <FieldError text={errors.onsiteAddress} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cart-onsite-date" className={label}>
                    Date
                  </label>
                  <input
                    id="cart-onsite-date"
                    type="date"
                    min={today()}
                    value={form.onsiteDate}
                    onChange={e => set('onsiteDate')(e.target.value)}
                    className={clsx(field, 'h-[48px]')}
                  />
                  <FieldError text={errors.onsiteDate} />
                </div>
                <div>
                  <label htmlFor="cart-onsite-time" className={label}>
                    Time
                  </label>
                  <input
                    id="cart-onsite-time"
                    type="time"
                    value={form.onsiteTime}
                    onChange={e => set('onsiteTime')(e.target.value)}
                    className={clsx(field, 'h-[48px]')}
                  />
                  <FieldError text={errors.onsiteTime} />
                </div>
              </div>
            </section>
          ) : null}

          <section className={clsx(section, 'flex flex-col gap-2')}>
            <h2 className={sectionTitle}>Contact Info</h2>
            <p className="text-[14px] text-[#79787A]">
              We&apos;ll call this number about your order.
            </p>
            <div className="flex gap-2">
              <select
                aria-label="Country code"
                value={form.countryCode}
                onChange={e => set('countryCode')(e.target.value)}
                className={clsx(field, 'h-[48px] w-[112px] shrink-0 appearance-none')}
              >
                {COUNTRIES.map(c => (
                  <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                    {c.dialCode} {c.name}
                  </option>
                ))}
              </select>
              <input
                aria-label="Phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={form.phone}
                onChange={e => set('phone')(e.target.value.replace(/\D/g, ''))}
                placeholder="Phone"
                className={clsx(field, 'h-[48px] min-w-0 flex-1')}
              />
            </div>
            <FieldError text={errors.countryCode ?? errors.phone} />
          </section>

          {hasPlatformItem(items) ? (
            <AttributionPicker value={attribution} onChange={setAttribution} />
          ) : null}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className={clsx(section, 'flex flex-col gap-2')}>
            <h2 className={clsx(sectionTitle, 'mb-1')}>Order Summary</h2>
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-2 text-[15px]">
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <span className="text-[13px] text-[#79787A]">x{item.quantity}</span>
                <span className="font-medium text-primary">
                  {moneyLabel(itemCurrency(item), unitPrice(item) * item.quantity)}
                </span>
              </div>
            ))}
            {groups.physical.length ? (
              <div className="flex items-center gap-2 text-[15px]">
                <span className="flex-1">Delivery Charge</span>
                {totals.delivery > 0 ? (
                  <span className="font-medium text-primary">
                    {moneyLabel(totals.currency, totals.delivery)}
                  </span>
                ) : (
                  <span className="font-medium text-[#15B763]">FREE</span>
                )}
              </div>
            ) : null}
            <div className="mt-1 flex items-center justify-between border-t border-[#E5E5E5] pt-2.5 text-[16px] font-semibold">
              <span>Total</span>
              <span className="text-primary">{totalLabel}</span>
            </div>
          </section>

          {blocked ? (
            <p
              role="alert"
              className="rounded-xl bg-[#fdecea] px-3 py-2 text-[14px] text-[#4a1a1a]"
            >
              {totals.mixedCurrency
                ? 'Your cart has prices in different currencies. Remove the items and add them again to pay.'
                : `Physical delivery can only be paid in NPR, and your prices are in ${totals.currency}. Remove the physical items to pay for the rest.`}
            </p>
          ) : null}
          {notice ? (
            <p
              role="alert"
              className="rounded-xl bg-[#fdecea] px-3 py-2 text-[14px] text-[#4a1a1a]"
            >
              {notice}
            </p>
          ) : null}

          <div className="hidden lg:block">{payButton}</div>
        </aside>
      </div>

      {/* Phones: Pay pinned above the tabs, as the app's footer. */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 -mx-4 mt-4 bg-gradient-to-b from-transparent to-[#F8F3DF] px-4 pb-3 pt-6 lg:hidden">
        {payButton}
      </div>

      <CheckoutSheet
        purchase={purchase}
        title="Remedy order"
        priceLabel={totalLabel}
        currency={totals.currency}
        backHref="/client/cart"
        onClose={() => setPurchase(null)}
      />
    </div>
  );
}

function CartRow({
  item,
  busy,
  onQuantity,
  onRemove,
}: {
  item: CartItem;
  busy: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Link
        href={remedyPath(item.remedyId)}
        className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-[#F1DBD7]"
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-raleway text-[24px] font-bold text-primary">
            {item.name.charAt(0).toUpperCase()}
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={remedyPath(item.remedyId)}
          className="line-clamp-2 text-[15px] font-semibold leading-5 text-[#1C1C1C] hover:underline"
        >
          {item.name}
        </Link>
        <span className="text-[15px] font-medium text-primary">
          {moneyLabel(itemCurrency(item), unitPrice(item))}
        </span>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex h-[34px] items-center gap-1 rounded-lg border border-[#BE7B71] px-1">
            <button
              type="button"
              onClick={() => onQuantity(item.quantity - 1)}
              disabled={busy}
              aria-label={item.quantity > 1 ? `One less ${item.name}` : `Remove ${item.name}`}
              className="flex h-7 w-7 items-center justify-center text-primary disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-6 text-center text-[15px] font-semibold" aria-live="polite">
              {busy ? (
                <Loader2
                  className="mx-auto h-4 w-4 animate-spin text-primary"
                  aria-label="Updating"
                />
              ) : (
                item.quantity
              )}
            </span>
            <button
              type="button"
              onClick={() => onQuantity(item.quantity + 1)}
              disabled={busy}
              aria-label={`One more ${item.name}`}
              className="flex h-7 w-7 items-center justify-center text-primary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="flex items-center gap-1 text-[14px] text-[#FF3B3B] disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

function ItemNames({ items }: { items: CartItem[] }) {
  return (
    <ul className="flex flex-col gap-0.5 text-[14px] text-[#79787A]">
      {items.map(item => (
        <li key={item.id} className="truncate">
          • {item.name}
        </li>
      ))}
    </ul>
  );
}

function FieldError({ text }: { text?: string }) {
  return text ? (
    <p role="alert" className="mt-1 text-[13px] text-[#b3261e]">
      {text}
    </p>
  ) : null;
}
