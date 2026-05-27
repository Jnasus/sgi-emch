import { fetchWithAuth } from '../lib/api';

export interface NotificacionResponse {
  idNotif: number;
  idUsuario: number;
  tipoNotif: 'STOCK_CRITICO' | 'SLA_VENCIDO' | 'TICKET_ASIGNADO' | 'INFO';
  titulo: string;
  mensaje: string;
  leida: boolean;
  urlAccion: string | null;
  fechaCreacion: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).data as T;
}

async function patchJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'PATCH' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).data as T;
}

async function deleteVoid(path: string): Promise<void> {
  const res = await fetchWithAuth(path, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export function listarNotificaciones(
  leida?: boolean,
  page = 0,
  size = 20,
): Promise<PagedResponse<NotificacionResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (leida !== undefined) params.append('leida', String(leida));
  return getJson<PagedResponse<NotificacionResponse>>(`/api/notificaciones?${params}`);
}

export const marcarLeida = (id: number): Promise<NotificacionResponse> =>
  patchJson<NotificacionResponse>(`/api/notificaciones/${id}/leer`);

export const marcarTodasLeidas = (): Promise<void> => {
  return fetchWithAuth('/api/notificaciones/leer-todas', { method: 'PATCH' }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
};

export const eliminarNotificacion = (id: number): Promise<void> =>
  deleteVoid(`/api/notificaciones/${id}`);

export async function contarNoLeidas(): Promise<number> {
  const r = await listarNotificaciones(false, 0, 1);
  return r.totalElements;
}
