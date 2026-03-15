/**
 * Centralized API client. Attaches Firebase ID token to requests.
 * All backend calls go through this client.
 */
import { API_BASE_URL } from '../config';
import { getFirebaseIdToken } from '../lib/firebase';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getHeaders(includeAuth: boolean, forceRefreshToken = false): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = await getFirebaseIdToken(forceRefreshToken);
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Request with optional auth. On 401 with auth, retries once with a fresh token.
 */
export async function request<T>(
  method: string,
  path: string,
  options?: { body?: unknown; auth?: boolean }
): Promise<T> {
  const useAuth = options?.auth !== false;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const doRequest = async (forceRefreshToken: boolean): Promise<Response> => {
    const headers = await getHeaders(useAuth, forceRefreshToken);
    return fetch(url, {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  };

  let res = await doRequest(false);
  if (res.status === 401 && useAuth) {
    res = await doRequest(true);
  }
  if (!res.ok) {
    const text = await res.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    const message = typeof body === 'object' && body !== null && 'detail' in body
      ? String((body as { detail: unknown }).detail)
      : res.statusText || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>('GET', path, { auth }),
  post: <T>(path: string, body?: unknown, auth = true) => request<T>('POST', path, { body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) => request<T>('PATCH', path, { body, auth }),
  delete: (path: string, auth = true) => request<void>('DELETE', path, { auth }),
};
