import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface GiftPrices {
  npr: number;
  inr: number;
  usd: number;
}

export interface GiftImage {
  mediaId: string;
  url: string;
}

export interface Gift {
  _id: string;
  title: string;
  image?: GiftImage;
  prices: GiftPrices;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGiftInput {
  title: string;
  imageId: string;
  prices: GiftPrices;
  isActive?: boolean;
}

export interface UpdateGiftInput {
  title?: string;
  imageId?: string;
  prices?: GiftPrices;
  isActive?: boolean;
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
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      message = json?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchGifts(token: string): Promise<Gift[]> {
  const res = await backendRequest<ApiResponse<Gift[]>>('gifts', token);
  return res.data;
}

export async function createGift(
  token: string,
  input: CreateGiftInput,
): Promise<Gift> {
  const res = await backendRequest<ApiResponse<Gift>>(
    'gifts',
    token,
    'POST',
    input,
  );
  return res.data;
}

export async function updateGift(
  token: string,
  id: string,
  input: UpdateGiftInput,
): Promise<Gift> {
  const res = await backendRequest<ApiResponse<Gift>>(
    `gifts/${id}`,
    token,
    'PUT',
    input,
  );
  return res.data;
}

export async function deleteGift(token: string, id: string): Promise<Gift> {
  const res = await backendRequest<ApiResponse<Gift>>(
    `gifts/${id}`,
    token,
    'DELETE',
  );
  return res.data;
}

interface MediaUploadData {
  mediaId: string;
  url: string;
  compressedUrl: string;
  thumbnailUrl: string;
  originalName: string;
}

export async function uploadMedia(
  token: string,
  file: File,
): Promise<{ mediaId: string; url: string }> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  }

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${base}/gifts/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      message = json?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const json = (await res.json()) as ApiResponse<MediaUploadData>;
  return {
    mediaId: json.data.mediaId,
    url: json.data.compressedUrl ?? json.data.url,
  };
}

export async function deleteMedia(token: string, mediaId: string): Promise<void> {
  await backendRequest<ApiResponse<unknown>>(
    `gifts/media/${mediaId}`,
    token,
    'DELETE',
  );
}
