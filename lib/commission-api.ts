import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface CommissionSettings {
  commissionPercentage: number;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface UpdateCommissionInput {
  commissionPercentage: number;
}

async function backendRequest<T>(
  path: string,
  token: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  }
  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (res.ok) {
    return res.json() as Promise<T>;
  }

  let message = `HTTP ${res.status}`;
  try {
    const json = await res.json();
    message = json?.message ?? message;
  } catch {
    // ignore parse errors
  }
  throw new Error(message);
}

export async function fetchCommission(token: string): Promise<CommissionSettings> {
  return backendRequest<CommissionSettings>('subscriptions/admin/commission', token);
}

export async function updateCommission(
  token: string,
  input: UpdateCommissionInput,
): Promise<CommissionSettings> {
  return backendRequest<CommissionSettings>(
    'subscriptions/admin/commission',
    token,
    'PUT',
    input,
  );
}
