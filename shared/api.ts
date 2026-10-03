export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type SuccessResponse<T> = {
  data: T;
  error?: never;
};

export type ErrorResponse = {
  data?: never;
  error: unknown;
  cause?: unknown;
};

export type Resolution = "day" | "week" | "month";
