/**
 * Shared types. Domain entities are defined in `./domain`.
 */
export * from './domain';

export type ApiResponse<T> = {
  data: T;
  message?: string;
};
