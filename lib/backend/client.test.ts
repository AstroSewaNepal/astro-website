import { describe, expect, it, vi } from 'vitest';

import { BackendError, createBackendClient } from './client';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function setup(
  responses: Response[],
  opts: { token?: string | null; refreshed?: string | null } = {},
) {
  const fetchImpl = vi.fn(async () => responses.shift() ?? json(500, {}));
  const refreshToken = vi.fn(async () => (opts.refreshed === undefined ? 'new' : opts.refreshed));
  const onAuthLost = vi.fn();
  const client = createBackendClient({
    baseUrl: 'https://api.example.com/api/v1/',
    getToken: async () => (opts.token === undefined ? 'old' : opts.token),
    refreshToken,
    onAuthLost,
    timeZone: 'Asia/Kathmandu',
    fetchImpl,
  });
  const authOf = (call: number) =>
    (fetchImpl.mock.calls[call] as unknown as [string, RequestInit])[1].headers as Record<
      string,
      string
    >;
  return { client, fetchImpl, refreshToken, onAuthLost, authOf };
}

describe('createBackendClient', () => {
  it('unwraps the backend envelope and sends token + timezone', async () => {
    const { client, fetchImpl, authOf } = setup([json(200, { success: true, data: { id: 1 } })]);
    expect(await client.get('/consultations')).toEqual({ id: 1 });
    expect((fetchImpl.mock.calls[0] as unknown as [string])[0]).toBe(
      'https://api.example.com/api/v1/consultations',
    );
    expect(authOf(0)).toMatchObject({
      Authorization: 'Bearer old',
      'x-timezone': 'Asia/Kathmandu',
    });
  });

  it('keeps pagination', async () => {
    const { client } = setup([json(200, { success: true, data: [1], pagination: { page: 2 } })]);
    expect(await client.request('GET', '/list')).toMatchObject({
      data: [1],
      pagination: { page: 2 },
    });
  });

  it('reads routes that answer without the envelope', async () => {
    const status = { pidx: 'p1', status: 'Completed', fulfilment: null };
    const { client, fetchImpl } = setup([json(200, status), json(201, { pidx: 'p2' })]);
    expect(await client.bare.get('/subscription/payments/hbl/status/p1')).toEqual(status);
    expect(await client.bare.post('/subscription/payments/hbl/plans/initiate', { a: 1 })).toEqual({
      pidx: 'p2',
    });
    expect((fetchImpl.mock.calls[1] as unknown as [string, RequestInit])[1].body).toBe('{"a":1}');
  });

  it('still throws on a failed bare request', async () => {
    const { client } = setup([json(404, { message: 'Payment not found' })]);
    await expect(client.bare.get('/x')).rejects.toThrow('Payment not found');
  });

  it('retries once with a refreshed token after a 401', async () => {
    const { client, refreshToken, authOf } = setup([
      json(401, {}),
      json(200, { success: true, data: 'ok' }),
    ]);
    expect(await client.get('/me')).toBe('ok');
    expect(refreshToken).toHaveBeenCalledWith('old');
    expect(authOf(1).Authorization).toBe('Bearer new');
  });

  it('does not log out on a second 401 (only a refused refresh does)', async () => {
    const { client, onAuthLost, fetchImpl } = setup([json(401, {}), json(401, {})]);
    await expect(client.get('/me')).rejects.toMatchObject({ status: 401 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(onAuthLost).not.toHaveBeenCalled();
  });

  it('logs out when the refresh is refused', async () => {
    const { client, onAuthLost, fetchImpl } = setup([json(401, {})], { refreshed: null });
    await expect(client.get('/me')).rejects.toBeInstanceOf(BackendError);
    expect(onAuthLost).toHaveBeenCalledOnce();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('sends no token and never refreshes when logged out', async () => {
    const { client, refreshToken, authOf } = setup([json(401, {})], { token: null });
    await expect(client.get('/me')).rejects.toMatchObject({ status: 401 });
    expect(authOf(0).Authorization).toBeUndefined();
    expect(refreshToken).not.toHaveBeenCalled();
  });

  it('uses the backend error message', async () => {
    const { client } = setup([
      json(400, { success: false, errors: [{ statusCode: 400, message: 'Slot already booked' }] }),
    ]);
    await expect(client.post('/bookings', {})).rejects.toMatchObject({
      message: 'Slot already booked',
      status: 400,
    });
  });
});
