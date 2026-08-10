export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const userFacingError = (reason: unknown, fallback: string) =>
  reason instanceof ApiError || reason instanceof Error ? reason.message : fallback;
