import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface OnboardingStageStatus {
  stage: string;
  title: string;
  description: string;
  state: string;
  updatedAt?: string | null;
}

export interface OnboardingDecisionRecord {
  decision: 'APPROVED' | 'REJECTED';
  reason?: string | null;
  notes?: string | null;
  decidedBy: string;
  decidedAt: string;
}

export interface OnboardingUserSummary {
  _id?: string;
  fullName?: string | null;
  email?: string;
  phoneNumber?: string | null;
  roles?: string[];
}

export interface OnboardingAstrologerSummary {
  _id?: string;
  yearsOfExperience?: number;
  bio?: string | null;
  services?: string[];
  language?: string[];
  specialist?: string[];
  phoneNumber?: string | null;
  chatAvailable?: boolean;
  callAvailable?: boolean;
  isBookingEnabled?: boolean;
  isAstrologerActive?: boolean;
}

export interface OnboardingStatusDetail {
  astrologerId: string;
  status: OnboardingStageStatus[];
  finalDecision?: OnboardingDecisionRecord | null;
  decisionHistory?: OnboardingDecisionRecord[];
  rejectionCount?: number;
  user?: OnboardingUserSummary | null;
  astrologer?: OnboardingAstrologerSummary | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PendingOnboardingList {
  items: OnboardingStatusDetail[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateFinalDecisionInput {
  decision: 'APPROVED' | 'REJECTED';
  reason?: string;
  notes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
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
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
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

export async function fetchPendingOnboardingAstrologers(
  token: string,
  page: number,
  limit: number,
  search?: string,
): Promise<PendingOnboardingList> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  const res = await backendRequest<OnboardingStatusDetail[]>(
    `onboarding-status/pending?${params.toString()}`,
    token,
  );
  return {
    items: res.data,
    total: res.pagination?.total ?? res.data.length,
    page: res.pagination?.page ?? page,
    limit: res.pagination?.limit ?? limit,
  };
}

export async function fetchOnboardingStatusDetail(
  token: string,
  astrologerId: string,
): Promise<OnboardingStatusDetail> {
  const res = await backendRequest<OnboardingStatusDetail>(
    `onboarding-status/${astrologerId}`,
    token,
  );
  return res.data;
}

export async function updateFinalDecision(
  token: string,
  astrologerId: string,
  input: UpdateFinalDecisionInput,
): Promise<void> {
  await backendRequest(`onboarding-status/${astrologerId}/decision`, token, 'PUT', input);
}
