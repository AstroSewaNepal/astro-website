import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface DeliveryCharge {
  _id: string;
  insideValley: number;
  outsideValley: number;
  outOfCountry: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeliveryChargeInput {
  insideValley: number;
  outsideValley: number;
  outOfCountry: number;
}

export interface UpdateDeliveryChargeInput {
  insideValley?: number;
  outsideValley?: number;
  outOfCountry?: number;
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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchDeliveryCharges(token: string): Promise<DeliveryCharge[]> {
  const res = await backendRequest<ApiResponse<DeliveryCharge[]>>('delivery-charges', token);
  return res.data;
}

export async function createDeliveryCharge(
  token: string,
  input: CreateDeliveryChargeInput,
): Promise<DeliveryCharge> {
  const res = await backendRequest<ApiResponse<DeliveryCharge>>(
    'delivery-charges',
    token,
    'POST',
    input,
  );
  return res.data;
}

export async function updateDeliveryCharge(
  token: string,
  id: string,
  input: UpdateDeliveryChargeInput,
): Promise<DeliveryCharge> {
  const res = await backendRequest<ApiResponse<DeliveryCharge>>(
    `delivery-charges/${id}`,
    token,
    'PUT',
    input,
  );
  return res.data;
}

export async function deleteDeliveryCharge(token: string, id: string): Promise<DeliveryCharge> {
  const res = await backendRequest<ApiResponse<DeliveryCharge>>(
    `delivery-charges/${id}`,
    token,
    'DELETE',
  );
  return res.data;
}
