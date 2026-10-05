const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';
const API_ORIGIN = API_URL.replace(/\/v1\/?$/, '');

/** Rewrite stored media hosts (LAN IP, etc.) to the API origin used by admin. */
export function resolveMediaUrl(uri?: string | null) {
  if (!uri) return '';
  try {
    const parsed = new URL(uri);
    if (parsed.pathname.startsWith('/media/')) {
      return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
    }
    return uri;
  } catch {
    if (uri.startsWith('/media/')) return `${API_ORIGIN}${uri}`;
    return uri;
  }
}

const ACCESS = 'wishdrop.admin.access';
const REFRESH = 'wishdrop.admin.refresh';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  lifecycle: string;
  createdAt?: string;
};

let accessToken = localStorage.getItem(ACCESS);
let refreshToken = localStorage.getItem(REFRESH);

export function getStoredTokens() {
  return { accessToken, refreshToken };
}

export function setTokens(tokens: { accessToken: string; refreshToken: string } | null) {
  if (!tokens) {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    return;
  }
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  localStorage.setItem(ACCESS, tokens.accessToken);
  localStorage.setItem(REFRESH, tokens.refreshToken);
}

async function refreshSession() {
  if (!refreshToken) return false;
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    setTokens(null);
    return false;
  }
  const body = await response.json();
  setTokens({ accessToken: body.accessToken, refreshToken: body.refreshToken });
  return true;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    if (await refreshSession()) return request<T>(path, options, false);
  }
  if (!response.ok) {
    throw new Error(typeof body.message === 'string' ? body.message : `Request failed (${response.status})`);
  }
  return body as T;
}

export const api = {
  login: async (email: string, password: string) => {
    const result = await request<{ user: AdminUser; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.user.role !== 'admin') {
      throw new Error('Admin access required.');
    }
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    return result;
  },
  me: () => request<{ user: AdminUser }>('/admin/me'),
  stats: () => request<any>('/admin/stats'),
  analytics: () => request<any>('/admin/analytics'),
  surprises: (params = '') => request<any>(`/admin/surprises${params}`),
  surprise: (id: string) => request<any>(`/admin/surprises/${id}`),
  patchSurprise: (id: string, payload: Record<string, unknown>) =>
    request<any>(`/admin/surprises/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  regenerateInvite: (id: string) => request<any>(`/admin/surprises/${id}/invite/regenerate`, { method: 'POST' }),
  disableInvite: (id: string) => request<any>(`/admin/surprises/${id}/invite/disable`, { method: 'POST' }),
  wishes: (params = '') => request<any>(`/admin/wishes${params}`),
  wish: (id: string) => request<any>(`/admin/wishes/${id}`),
  patchWish: (id: string, payload: Record<string, unknown>) =>
    request<any>(`/admin/wishes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteWish: (id: string) => request<any>(`/admin/wishes/${id}`, { method: 'DELETE' }),
  reports: (params = '') => request<any>(`/admin/reports${params}`),
  report: (id: string) => request<any>(`/admin/reports/${id}`),
  patchReport: (id: string, payload: Record<string, unknown>) =>
    request<any>(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  users: (params = '') => request<any>(`/admin/users${params}`),
  user: (id: string) => request<any>(`/admin/users/${id}`),
  patchUser: (id: string, payload: Record<string, unknown>) =>
    request<any>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  media: (params = '') => request<any>(`/admin/media${params}`),
  deleteMedia: (id: string) => request<any>(`/admin/media/${id}`, { method: 'DELETE' }),
  inviteLinks: (params = '') => request<any>(`/admin/invite-links${params}`),
  notifications: (params = '') => request<any>(`/admin/notifications${params}`),
  readNotification: (id: string) => request<any>(`/admin/notifications/${id}/read`, { method: 'PATCH' }),
  settings: () => request<any>('/admin/settings'),
  patchSettings: (payload: Record<string, unknown>) =>
    request<any>('/admin/settings', { method: 'PATCH', body: JSON.stringify(payload) }),
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setTokens(null);
    }
  },
};
