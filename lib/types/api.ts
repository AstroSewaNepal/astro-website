/**
 * Shared JSON envelope returned by astro-sewa-backend (nestjs Result wrapper).
 */
export interface AstroBackendResult<T> {
  success: boolean;
  data: T | null;
  time: string;
  message?: string;
  errors?: { message?: string; code?: string }[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
