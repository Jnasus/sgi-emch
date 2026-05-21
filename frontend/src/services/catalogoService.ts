import { fetchWithAuth } from '../lib/api';

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface TipoEquipoResponse {
  idTipo: number;
  nombreTipo: string;
  descripcion: string;
}

export interface TipoEquipoRequest {
  nombreTipo: string;
  descripcion?: string;
}

export interface MarcaResponse {
  idMarca: number;
  nombreMarca: string;
}

export interface MarcaRequest {
  nombreMarca: string;
}

export interface ModeloResponse {
  idModelo: number;
  idMarca: number;
  nombreMarca: string;
  idTipo: number;
  nombreTipo: string;
  nombreModelo: string;
}

export interface ModeloRequest {
  idMarca: number;
  idTipo: number;
  nombreModelo: string;
}

export interface SistemaOperativoResponse {
  idSo: number;
  nombreSo: string;
  versionSo: string;
}

export interface SistemaOperativoRequest {
  nombreSo: string;
  versionSo: string;
}

export interface AreaResponse {
  idArea: number;
  codigoArea: string;
  nombreArea: string;
  descripcion: string;
  anioVigencia: number;
  activo: boolean;
}

export interface AreaRequest {
  codigoArea: string;
  nombreArea: string;
  descripcion?: string;
  anioVigencia: number;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).data as T;
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return (await res.json()).data as T;
}

async function putJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return (await res.json()).data as T;
}

// ── Tipos de Equipo ───────────────────────────────────────────────────────────

export const listarTipos = () =>
  getJson<TipoEquipoResponse[]>('/api/catalogos/tipos-equipo');

export const crearTipo = (data: TipoEquipoRequest) =>
  postJson<TipoEquipoResponse>('/api/catalogos/tipos-equipo', data);

export const actualizarTipo = (id: number, data: TipoEquipoRequest) =>
  putJson<TipoEquipoResponse>(`/api/catalogos/tipos-equipo/${id}`, data);

// ── Marcas ───────────────────────────────────────────────────────────────────

export const listarMarcas = () =>
  getJson<MarcaResponse[]>('/api/catalogos/marcas');

export const crearMarca = (data: MarcaRequest) =>
  postJson<MarcaResponse>('/api/catalogos/marcas', data);

export const actualizarMarca = (id: number, data: MarcaRequest) =>
  putJson<MarcaResponse>(`/api/catalogos/marcas/${id}`, data);

// ── Modelos ───────────────────────────────────────────────────────────────────

export const listarModelos = (marcaId?: number) => {
  const qs = marcaId ? `?marcaId=${marcaId}` : '';
  return getJson<ModeloResponse[]>(`/api/catalogos/modelos${qs}`);
};

export const crearModelo = (data: ModeloRequest) =>
  postJson<ModeloResponse>('/api/catalogos/modelos', data);

export const actualizarModelo = (id: number, data: ModeloRequest) =>
  putJson<ModeloResponse>(`/api/catalogos/modelos/${id}`, data);

// ── Sistemas Operativos ───────────────────────────────────────────────────────

export const listarSO = () =>
  getJson<SistemaOperativoResponse[]>('/api/catalogos/sistemas-operativos');

export const crearSO = (data: SistemaOperativoRequest) =>
  postJson<SistemaOperativoResponse>('/api/catalogos/sistemas-operativos', data);

export const actualizarSO = (id: number, data: SistemaOperativoRequest) =>
  putJson<SistemaOperativoResponse>(`/api/catalogos/sistemas-operativos/${id}`, data);

// ── Áreas ─────────────────────────────────────────────────────────────────────

export const listarAreas = () =>
  getJson<AreaResponse[]>('/api/catalogos/areas/todas');

export const crearArea = (data: AreaRequest) =>
  postJson<AreaResponse>('/api/catalogos/areas', data);

export const actualizarArea = (id: number, data: AreaRequest) =>
  putJson<AreaResponse>(`/api/catalogos/areas/${id}`, data);
