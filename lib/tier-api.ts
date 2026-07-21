import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface Tier {
  _id: string;
  name: string;
  commissionPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTierInput {
  name: string;
  commissionPercentage: number;
}

export interface UpdateTierInput {
  name?: string;
  commissionPercentage?: number;
}

interface BackendEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
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

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = undefined;
  }

  if (!res.ok) {
    const message = (json as { message?: string } | undefined)?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return (json as BackendEnvelope<T>).data;
}

export async function fetchTiers(token: string): Promise<Tier[]> {
  return backendRequest<Tier[]>('tiers', token);
}

export async function createTier(token: string, input: CreateTierInput): Promise<Tier> {
  return backendRequest<Tier>('tiers', token, 'POST', input);
}

export async function updateTier(
  token: string,
  tierId: string,
  input: UpdateTierInput,
): Promise<Tier> {
  return backendRequest<Tier>(`tiers/${tierId}`, token, 'PUT', input);
}

export async function deleteTier(token: string, tierId: string): Promise<void> {
  await backendRequest<unknown>(`tiers/${tierId}`, token, 'DELETE');
}

export async function assignAstrologerTier(
  token: string,
  astrologerId: string,
  tierId: string | null,
): Promise<void> {
  await backendRequest<unknown>(`astrologer-tier-assignment/${astrologerId}`, token, 'PUT', {
    tierId,
  });
}
