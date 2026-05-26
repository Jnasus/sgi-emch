import { API_BASE } from '../lib/api';

const TOKEN_KEY = 'sgi_token';
const USER_KEY  = 'sgi_user';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  idUsuario: number;
  username: string;
  rol: string;
  idArea: number;
}

export interface CurrentUser {
  idUsuario: number;
  username: string;
  rol: string;   // 'ADMINISTRADOR' | 'TECNICO' | 'SUPERVISOR'
  idArea: number;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error('Credenciales inválidas');
  }
  const body = await res.json();
  const data: LoginResponse = body.data;
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify({
    idUsuario: data.idUsuario,
    username:  data.username,
    rol:       data.rol,
    idArea:    data.idArea,
  }));
  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as CurrentUser) : null;
}
