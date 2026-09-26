import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export type ReportTargetType =
  | 'USER'
  | 'ASTROLOGER'
  | 'CHAT_MESSAGE'
  | 'LIVE_COMMENT'
  | 'LIVE_STREAM'
  | 'REVIEW';

export interface ReportUser {
  _id: string;
  fullName?: string;
  email?: string;
  roles?: string[];
  isSuspended?: boolean;
}

export interface ContentReportRow {
  _id: string;
  reporter: ReportUser | null;
  reportedUser: ReportUser | null;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string;
  contentSnapshot?: string;
  chatId?: string;
  roomName?: string;
  status: ReportStatus;
  resolutionNote?: string;
  resolvedBy?: ReportUser | null;
  resolvedAt?: string;
  createdAt: string;
}

export interface ContentReportsSummary {
  items: ContentReportRow[];
  total: number;
  page: number;
  limit: number;
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
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (res.ok) return res.json();
  let message = `HTTP ${res.status}`;
  try {
    const json = await res.json();
    message = json?.message ?? message;
  } catch {
    // Non-JSON error body; keep the HTTP status message.
  }
  throw new Error(message);
}

export async function fetchContentReports(
  token: string,
  page: number,
  limit: number,
  status?: ReportStatus,
): Promise<ContentReportsSummary> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  const res = await backendRequest<ContentReportRow[]>(`admin/reports?${params}`, token);
  return {
    items: res.data,
    total: res.pagination?.total ?? res.data.length,
    page: res.pagination?.page ?? page,
    limit: res.pagination?.limit ?? limit,
  };
}

export async function updateContentReportStatus(
  token: string,
  reportId: string,
  status: Exclude<ReportStatus, 'PENDING'>,
  resolutionNote?: string,
  suspendReportedUser?: boolean,
): Promise<ContentReportRow> {
  const res = await backendRequest<ContentReportRow>(`admin/reports/${reportId}`, token, 'PATCH', {
    status,
    resolutionNote,
    suspendReportedUser,
  });
  return res.data;
}

export async function updateUserSuspension(
  token: string,
  userId: string,
  suspended: boolean,
  reason?: string,
): Promise<{ userId: string; isSuspended: boolean }> {
  const res = await backendRequest<{ userId: string; isSuspended: boolean }>(
    `admin/users/${userId}/suspension`,
    token,
    'PATCH',
    { suspended, reason },
  );
  return res.data;
}
