import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface RemediesCategoryImage {
  mediaId: string;
  url: string;
}

export interface RemediesCategory {
  _id: string;
  title: string;
  description: string;
  image?: RemediesCategoryImage;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRemediesCategoryInput {
  title: string;
  description: string;
  imageId: string;
}

export interface UpdateRemediesCategoryInput {
  title?: string;
  description?: string;
  imageId?: string;
}

async function backendRequest<T>(
  path: string,
  token: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  }
  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
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

export async function fetchRemediesCategories(
  token: string,
): Promise<RemediesCategory[]> {
  const res = await backendRequest<ApiResponse<RemediesCategory[]>>(
    "remedies-categories",
    token,
  );
  return res.data;
}

export async function createRemediesCategory(
  token: string,
  input: CreateRemediesCategoryInput,
): Promise<RemediesCategory> {
  const res = await backendRequest<ApiResponse<RemediesCategory>>(
    "remedies-categories",
    token,
    "POST",
    input,
  );
  return res.data;
}

export async function updateRemediesCategory(
  token: string,
  id: string,
  input: UpdateRemediesCategoryInput,
): Promise<RemediesCategory> {
  const res = await backendRequest<ApiResponse<RemediesCategory>>(
    `remedies-categories/${id}`,
    token,
    "PUT",
    input,
  );
  return res.data;
}

export async function deleteRemediesCategory(
  token: string,
  id: string,
): Promise<RemediesCategory> {
  const res = await backendRequest<ApiResponse<RemediesCategory>>(
    `remedies-categories/${id}`,
    token,
    "DELETE",
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
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${BACKEND_URL}/remedies-categories/media`, {
    method: "POST",
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
    `remedies-categories/media/${mediaId}`,
    token,
    "DELETE",
  );
}
