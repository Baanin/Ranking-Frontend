/**
 * Types partagés dans l'application.
 */
export type ApiResponse<T> = {
  data: T;
  message?: string;
};
