/**
 * API client with automatic access-token refresh on 401.
 *
 * - Access token is kept in memory (set by AuthContext after login / refresh).
 * - Refresh token lives in an httpOnly cookie managed by the backend.
 * - On a 401, we try POST /auth/refresh once; if it succeeds we replay the request.
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

type TokenListener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<TokenListener>();
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  listeners.forEach((fn) => fn(token));
}

export function onAccessTokenChange(fn: TokenListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
  }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  /** Set true to skip auth header (e.g. login, refresh). */
  skipAuth?: boolean;
  /** Internal: prevents infinite refresh loops. */
  _retry?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { data: { accessToken: string } };
      setAccessToken(json.data.accessToken);
      return json.data.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers = {}, skipAuth, _retry, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...headers };
  if (body !== undefined && !('Content-Type' in finalHeaders)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (!skipAuth && accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Attempt a single refresh on 401 (except for auth endpoints)
  if (res.status === 401 && !skipAuth && !_retry && !path.startsWith('/auth/')) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, _retry: true });
    }
    setAccessToken(null);
  }

  if (res.status === 204) return undefined as T;

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }

  if (!res.ok) {
    const message =
      (json && typeof json === 'object' && 'error' in json && typeof (json as { error: unknown }).error === 'string'
        ? (json as { error: string }).error
        : undefined) ?? `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, json);
  }

  // Unwrap { data: ... } envelope
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

/**
 * Attempts to restore a session silently at app boot using the refresh cookie.
 * Returns the new access token if successful, null otherwise.
 */
export async function bootstrapSession(): Promise<string | null> {
  return refreshAccessToken();
}
