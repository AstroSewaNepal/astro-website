import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface UnpaidEarningsRow {
  astrologerId: string;
  fullName?: string;
  email?: string;
  count: number;
  totalGross: number;
  totalCommission: number;
  totalNet: number;
}

export interface UnpaidEarningsSummary {
  items: UnpaidEarningsRow[];
  total: number;
  page: number;
  limit: number;
}

export interface MarkAllPaidResult {
  updated: number;
  payoutReference: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { total: number; page: number; limit: number };
}

async function backendRequest<T>(
  path: string,
  token: string,
  method = 'GET',
  body?: unknown,
): Promise<ApiResponse<T>> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (res.ok) return res.json() as Promise<ApiResponse<T>>;

  let message = `HTTP ${res.status}`;
  try {
    const json = await res.json();
    message = json?.message ?? message;
  } catch {
    // ignore parse errors
  }
  throw new Error(message);
}

export async function fetchUnpaidEarningsSummary(
  token: string,
  page: number,
  limit: number,
  search?: string,
): Promise<UnpaidEarningsSummary> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  const res = await backendRequest<UnpaidEarningsRow[]>(
    `subscriptions/admin/earnings/unpaid-summary?${params.toString()}`,
    token,
  );
  return {
    items: res.data,
    total: res.pagination?.total ?? res.data.length,
    page: res.pagination?.page ?? page,
    limit: res.pagination?.limit ?? limit,
  };
}

export async function markAllEarningsPaid(
  token: string,
  astrologerId: string,
  payoutReference: string,
): Promise<MarkAllPaidResult> {
  const res = await backendRequest<MarkAllPaidResult>(
    `subscriptions/admin/earnings/${astrologerId}/mark-all-paid`,
    token,
    'PUT',
    { payoutReference },
  );
  return res.data;
}
