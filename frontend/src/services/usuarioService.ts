import { fetchWithAuth } from '../lib/api';

export interface UsuarioResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  dni: string;
  username: string;
  email: string;
  idRol: number;
  nombreRol: string;
  idArea: number;
  nombreArea: string;
  activo: boolean;
  createdAt: string;
  ultimoAcceso: string | null;
}

export interface RolResponse {
  idRol: number;
  nombreRol: string;
  descripcion: string;
}

export interface AreaResponse {
  idArea: number;
  codigoArea: string;
  nombreArea: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UsuarioCreateRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  username: string;
  password: string;
  email: string;
  idRol: number;
  idArea: number;
}

export interface UsuarioUpdateRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  username: string;
  email: string;
  idRol: number;
  idArea: number;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.data as T;
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

async function putJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

async function patchJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

export const listarUsuarios = (page = 0, size = 20, activo?: boolean, idRol?: number) => {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: 'apellidos' });
  if (activo !== undefined) params.append('activo', String(activo));
  if (idRol !== undefined) params.append('idRol', String(idRol));
  return getJson<PagedResponse<UsuarioResponse>>(`/api/usuarios?${params}`);
};

export const listarRoles = () => getJson<RolResponse[]>('/api/usuarios/roles');

export const listarAreas = () => getJson<AreaResponse[]>('/api/catalogos/areas');

export const crearUsuario = (data: UsuarioCreateRequest) =>
  postJson<UsuarioResponse>('/api/usuarios', data);

export const actualizarUsuario = (id: number, data: UsuarioUpdateRequest) =>
  putJson<UsuarioResponse>(`/api/usuarios/${id}`, data);

export const cambiarEstado = (id: number, activo: boolean) =>
  patchJson<UsuarioResponse>(`/api/usuarios/${id}/estado`, { activo });

export const resetPassword = (id: number, nuevaPassword: string) =>
  putJson<void>(`/api/usuarios/${id}/password`, { nuevaPassword });
