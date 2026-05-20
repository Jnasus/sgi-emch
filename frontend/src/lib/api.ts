export const API_BASE = 'http://localhost:8080';

export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('sgi_token');
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
