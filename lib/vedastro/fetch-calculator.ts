import {
  getPublicBackendBaseCandidates,
  resolveVedastroCalculatorUrl,
  type VedastroCalculatorEndpoint,
} from '@/lib/utils/url';

export async function fetchVedastroCalculator<T>(
  endpoint: VedastroCalculatorEndpoint,
  query: URLSearchParams,
): Promise<T> {
  const attemptErrors: string[] = [];

  for (const base of getPublicBackendBaseCandidates()) {
    const url = resolveVedastroCalculatorUrl(base, endpoint, query);
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        attemptErrors.push(
          `Non-JSON from ${url} (${response.status}): ${text.slice(0, 80)}`,
        );
        continue;
      }

      const json = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: T;
        errors?: Array<{ message?: string }>;
      };

      if (!response.ok || json.success === false || json.data === undefined) {
        attemptErrors.push(
          json.message ||
            json.errors?.[0]?.message ||
            `Request failed (${response.status})`,
        );
        continue;
      }

      return json.data;
    } catch (error) {
      attemptErrors.push(error instanceof Error ? error.message : 'Network error');
    }
  }

  throw new Error(attemptErrors[attemptErrors.length - 1] ?? 'Calculator request failed');
}
