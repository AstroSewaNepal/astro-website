'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

import { useBackendClient } from '@/hooks/use-backend-client';
import {
  type FonepayBank,
  bankAppLink,
  outcomeOf,
  readStatus,
  statusPath,
} from '@/lib/payments/checkout';

const POLL_MS = 5000;

const noSubscribe = () => () => {};
/** Touch devices get the bank-app buttons first (their own screen can't scan its own QR). */
function useDevice(): { touch: boolean; android: boolean } | null {
  // A string snapshot: React compares snapshots by value.
  const snap = useSyncExternalStore(
    noSubscribe,
    () =>
      `${window.matchMedia('(pointer: coarse)').matches ? 't' : '-'}${/Android/i.test(navigator.userAgent) ? 'a' : '-'}`,
    () => '',
  );
  return snap ? { touch: snap[0] === 't', android: snap[1] === 'a' } : null;
}

/**
 * Fonepay has no redirect: like the app, the buyer pays in their bank app, from the QR (another phone, or a
 * laptop screen) or, on a phone, a button that opens the bank app with the payment. Fonepay's websocket says the
 * moment it's paid; the server's purchase check (which also delivers it) is the one that counts, and is polled
 * in case the socket never answers.
 */
export function FonepayPanel({
  payment,
  onSettled,
}: {
  payment: { pidx: string; qrMessage: string; websocketUrl: string | null };
  /** Paid, failed or expired: the return page shows the verdict. */
  onSettled: () => void;
}) {
  const backend = useBackendClient();
  const device = useDevice();
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    QRCode.toDataURL(payment.qrMessage, { margin: 1, width: 240 })
      .then(url => live && setQrImage(url))
      .catch(() => live && setQrImage(null));
    return () => {
      live = false;
    };
  }, [payment.qrMessage]);

  const status = useQuery({
    queryKey: ['payments', 'fonepay', payment.pidx],
    queryFn: async () => readStatus(await backend.bare.get(statusPath('fonepay', payment.pidx))),
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    retry: false,
  });
  const settled = status.data ? outcomeOf(status.data) !== 'waiting' : false;
  useEffect(() => {
    if (settled) onSettled();
  }, [settled, onSettled]);

  // Fonepay's own socket: re-check right away when it reports a result.
  const { refetch } = status;
  useEffect(() => {
    const url = payment.websocketUrl;
    if (!url || !/^wss:\/\//i.test(url)) return;
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(url);
      socket.onmessage = event => {
        if (typeof event.data === 'string' && /paymentSuccess/.test(event.data)) void refetch();
      };
    } catch {
      // Polling covers it.
    }
    return () => socket?.close();
  }, [payment.websocketUrl, refetch]);

  const banks = useQuery({
    queryKey: ['payments', 'fonepay-banks'],
    queryFn: () => backend.bare.get<FonepayBank[]>('/payments/fonepay/banks'),
    staleTime: 60 * 60 * 1000,
    enabled: device?.touch === true,
  });
  const bankLinks = (Array.isArray(banks.data) ? banks.data : [])
    .map(b => ({ bank: b, href: bankAppLink(b, payment.qrMessage, device?.android === true) }))
    .filter((b): b is { bank: FonepayBank; href: string } => !!b.href);

  const qr = (
    <div className="flex flex-col items-center gap-2">
      {qrImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- generated QR
        <img
          src={qrImage}
          alt="Fonepay payment QR code"
          width={240}
          height={240}
          className="rounded-lg bg-white p-2"
        />
      ) : (
        <span className="flex h-[240px] w-[240px] items-center justify-center rounded-lg bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        </span>
      )}
      <p className="max-w-[300px] text-center text-[14px] text-[#4a4a4a]">
        Scan with your bank app or any Fonepay-enabled wallet, then confirm the payment there.
      </p>
    </div>
  );

  return (
    <div className="mt-4 flex min-h-0 flex-col gap-4 overflow-y-auto">
      <p
        role="status"
        className="flex items-center justify-center gap-2 text-center text-[15px] text-[#4a1a1a]"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Waiting for your payment...
      </p>
      {device?.touch ? (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="font-raleway text-[17px] font-semibold text-primary">
              Pay in your bank app
            </h2>
            {banks.isPending ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" aria-label="Loading" />
            ) : bankLinks.length ? (
              <ul className="grid grid-cols-2 gap-2">
                {bankLinks.map(({ bank, href }) => (
                  <li key={bank.bankCode ?? bank.bankName}>
                    <a
                      href={href}
                      className="flex h-full items-center gap-2 rounded-lg border border-[#BE7B71] bg-white/60 px-2 py-2 text-[13px] text-[#1C1C1C]"
                    >
                      {bank.bankIcon && /^https:\/\//.test(bank.bankIcon) ? (
                        // eslint-disable-next-line @next/next/no-img-element -- Fonepay's bank icons
                        <img
                          src={bank.bankIcon}
                          alt=""
                          width={28}
                          height={28}
                          // Fonepay's icons are big files: only the ones on screen load.
                          loading="lazy"
                          decoding="async"
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="h-7 w-7 shrink-0 object-contain"
                        />
                      ) : null}
                      <span className="min-w-0 leading-tight">{bank.bankName}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-[#6d6d6d]">
                Open your bank app and scan the QR below from another screen.
              </p>
            )}
          </section>
          <details className="rounded-lg border border-[#e8ddd0] px-3 py-2">
            <summary className="cursor-pointer text-[15px] font-semibold text-primary">
              Or show the QR code
            </summary>
            <div className="mt-3">{qr}</div>
          </details>
        </>
      ) : (
        qr
      )}
    </div>
  );
}
