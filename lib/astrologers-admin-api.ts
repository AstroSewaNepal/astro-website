import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface AstrologerListTag {
  _id: string;
  name: string;
  type: string;
  commissionPercentage?: number | null;
}

export interface AdminAstrologer {
  _id: string;
  user?: {
    _id?: string | null;
    fullName?: string | null;
    email?: string;
  } | null;
  tags?: AstrologerListTag[];
  tierId?: string | null;
  yearsOfExperience?: number;
  isAstrologerActive?: boolean;
  isBookingEnabled?: boolean;
  createdAt?: string;
}

export interface AdminAstrologerList {
  items: AdminAstrologer[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number };
}

async function backendRequest<T>(path: string, token: string): Promise<ApiResponse<T>> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

  const res = await fetch(`${base}/${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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

export async function fetchAdminAstrologers(
  token: string,
  page: number,
  limit: number,
  search?: string,
): Promise<AdminAstrologerList> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    // Any non-boolean value clears the backend's default isBookingEnabled=true
    // filter, so booking-disabled (e.g. freshly approved) astrologers show too.
    isBookingEnabled: 'all',
  });
  if (search) params.set('search', search);
  const res = await backendRequest<AdminAstrologer[]>(
    `astrologer-details?${params.toString()}`,
    token,
  );
  return {
    items: res.data,
    total: res.pagination?.total ?? res.data.length,
    page: res.pagination?.page ?? page,
    limit: res.pagination?.limit ?? limit,
  };
}
