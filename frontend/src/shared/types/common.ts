export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  page_size: number;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}
