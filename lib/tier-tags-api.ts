import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface TierTag {
  _id: string;
  name: string;
  type: string;
  description?: string;
  commissionPercentage: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateTierTagCommissionInput {
  commissionPercentage: number;
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
    const message =
      (json as { message?: string } | undefined)?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return (json as BackendEnvelope<T>).data;
}

export async function fetchTierTags(token: string): Promise<TierTag[]> {
  // Admin-only endpoint: tier tags (and commission rates) are hidden from
  // the public astrologer-tags listing.
  return backendRequest<TierTag[]>('astrologer-tags/tiers', token);
}

export async function updateTierTagCommission(
  token: string,
  tagId: string,
  input: UpdateTierTagCommissionInput,
): Promise<TierTag> {
  return backendRequest<TierTag>(`astrologer-tags/${tagId}`, token, 'PUT', input);
}

export async function updateAstrologerTier(
  token: string,
  astrologerId: string,
  tierTagId: string,
): Promise<void> {
  await backendRequest<unknown>(`astrologer-tags-assignment/${astrologerId}`, token, 'PUT', {
    tags: [tierTagId],
  });
}
