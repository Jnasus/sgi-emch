import { fetchWithAuth } from '../lib/api';

// ── Tipos (mirrors de los DTOs del backend) ───────────────────────────────────

export interface TicketResponse {
  idTicket: number;
  numeroTicket: string;
  idEquipo: number;
  codigoEjercito: string;
  idTecnico: number;
  nombresTecnico: string;
  apellidosTecnico: string;
  idTipoIncidente: number;
  nombreTipoIncidente: string;
  titulo: string;
  descripcion: string;
  estado: 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  fechaApertura: string;
  fechaRespuesta: string | null;
  fechaResolucion: string | null;
  fechaCierre: string | null;
  fueraDeSla: boolean | null;
  pdfActaPath: string | null;
}

export interface HistorialTicketResponse {
  idHistTicket: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  fechaCambio: string;
  idUsuario: number;
  nombresUsuario: string;
  apellidosUsuario: string;
}

export interface TicketCreateRequest {
  idEquipo: number;
  idTecnico: number;
  idTipoIncidente: number;
  titulo: string;
  descripcion: string;
  prioridad?: string;
}

export interface TipoIncidenteResponse {
  idTipoIncidente: number;
  nombreTipo: string;
  tiempoRespuestaMin: number;
  tiempoResolucionMin: number;
  descripcion: string;
}

/** Subconjunto de UsuarioResponse que necesitamos para el select de técnicos */
export interface TecnicoResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  nombreRol: string;
  activo: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).data as T;
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return (await res.json()).data as T;
}

async function patchJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'PATCH', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return (await res.json()).data as T;
}

// ── API ───────────────────────────────────────────────────────────────────────

/**
 * Lista tickets de una columna del Kanban.
 * @param estado    'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO'
 * @param filtros   { prioridad?, idTecnico? }
 * @param pagina    0-based page number
 * @param tamanio   items per page (default 10)
 */
export function listarTicketsPorEstado(
  estado: string,
  filtros: { prioridad?: string; idTecnico?: number } = {},
  pagina = 0,
  tamanio = 10,
): Promise<PagedResponse<TicketResponse>> {
  const params = new URLSearchParams({
    estado,
    page: String(pagina),
    size: String(tamanio),
    sort: 'fechaApertura,desc',
  });
  if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
  if (filtros.idTecnico) params.append('idTecnico', String(filtros.idTecnico));
  return getJson<PagedResponse<TicketResponse>>(`/api/tickets?${params}`);
}

export const obtenerTicket = (id: number): Promise<TicketResponse> =>
  getJson<TicketResponse>(`/api/tickets/${id}`);

export const crearTicket = (data: TicketCreateRequest): Promise<TicketResponse> =>
  postJson<TicketResponse>('/api/tickets', data);

export const cambiarEstado = (id: number, estado: string): Promise<TicketResponse> =>
  patchJson<TicketResponse>(`/api/tickets/${id}/estado`, { estado });

export const listarHistorial = (id: number): Promise<HistorialTicketResponse[]> =>
  getJson<HistorialTicketResponse[]>(`/api/tickets/${id}/historial`);

/** Lista usuarios activos con rol TECNICO. Accesible a ADMIN y TECNICO. */
export const listarTecnicos = (): Promise<TecnicoResponse[]> =>
  getJson<TecnicoResponse[]>('/api/usuarios/tecnicos');

export const listarTiposIncidente = (): Promise<TipoIncidenteResponse[]> =>
  getJson<TipoIncidenteResponse[]>('/api/catalogos/tipos-incidente');
