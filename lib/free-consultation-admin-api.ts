import { backendRequest } from '@/lib/astrologers-admin-api';

/** Free consultation settings as the backend returns them (admin only). */
export interface FreeConsultationSettings {
  /** Server switch (AWS FREE_CONSULTATION_ENABLED), not editable here. */
  enabled: boolean;
  minutes: number;
  cooldownMonths: number;
  /** null until an admin saves: the server defaults are in use. */
  updatedAt: string | null;
}

/** Same limits as the backend. */
export const FREE_MINUTES_RANGE = { min: 1, max: 15 } as const;
export const FREE_COOLDOWN_MONTHS_RANGE = { min: 1, max: 24 } as const;

export async function fetchFreeConsultationSettings(
  token: string,
): Promise<FreeConsultationSettings> {
  const res = await backendRequest<FreeConsultationSettings>(
    'free-consultation/admin/settings',
    token,
  );
  return res.data;
}

export async function updateFreeConsultationSettings(
  token: string,
  input: { minutes: number; cooldownMonths: number },
): Promise<FreeConsultationSettings> {
  const res = await backendRequest<FreeConsultationSettings>(
    'free-consultation/admin/settings',
    token,
    'PUT',
    input,
  );
  return res.data;
}

export async function updateFreeConsultationEligible(
  token: string,
  astrologerUserId: string,
  eligible: boolean,
): Promise<void> {
  await backendRequest<unknown>(
    `free-consultation/admin/astrologers/${encodeURIComponent(astrologerUserId)}`,
    token,
    'PATCH',
    { eligible },
  );
}
