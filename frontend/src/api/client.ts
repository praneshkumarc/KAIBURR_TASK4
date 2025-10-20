// src/api/client.ts
const configuredBaseRaw =
  import.meta.env.VITE_API_BASE_URL?.trim() ?? import.meta.env.VITE_BASE_URL?.trim();

const ensureApiPath = (base?: string) => {
  if (!base) return undefined;
  try {
    const url = new URL(base);
    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = '/api';
    }
    return url.toString().replace(/\/+$/, '');
  } catch {
    const trimmed = base.replace(/\/+$/, '');
    if (trimmed.startsWith('/')) {
      return trimmed.length ? trimmed : undefined;
    }
    return undefined;
  }
};

const sanitizedBase = ensureApiPath(configuredBaseRaw);

const resolveDefaultOrigin = (): string => {
  if (typeof window === 'undefined' || !window.location?.origin) {
    return 'http://localhost:8081';
  }

  const { protocol, hostname, port } = window.location;
  const normalizedHost = hostname || 'localhost';
  const normalizedProtocol = protocol || 'http:';
  const trimmedOrigin = `${normalizedProtocol}//${normalizedHost}${port ? `:${port}` : ''}`.replace(
    /\/+$/,
    '',
  );

  if (port === '5173') {
    const targetHost = normalizedHost === '127.0.0.1' ? normalizedHost : 'localhost';
    return `http://${targetHost}:8081`;
  }

  return trimmedOrigin;
};

const defaultOrigin = resolveDefaultOrigin();

const BASE = sanitizedBase ?? `${defaultOrigin}/api`;
export const API_BASE = BASE;

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    // 404 on search should return [] to keep UX smooth
    if (res.status === 404) {
      // @ts-expect-error: caller decides what to do
      return [];
    }
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string) => request<T>(`${BASE}${path}`),
  put: <T>(path: string, body?: unknown) =>
    request<T>(`${BASE}${path}`, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) =>
    request<T>(`${BASE}${path}`, { method: 'DELETE' }),
};
