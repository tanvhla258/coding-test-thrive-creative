export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
