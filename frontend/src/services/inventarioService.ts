import { fetchWithAuth } from '../lib/api';

// ── Response types (match backend DTOs) ────────────────────────────────────

export interface EspecificacionTecnicaResponse {
  idEspec: number;
  procesador: string | null;
  nucleos: number | null;
  hilos: number | null;
  ramModulos: number | null;
  ramTotalGb: number | null;
  ramVelocidadMhz: number | null;
  ramMarca: string | null;
  discoModelo: string | null;
  discoInterface: string | null;
  discoCapacidadGb: number | null;
  discoUsadoGb: number | null;
  discoLibreGb: number | null;
  gpuMarca: string | null;
  gpuModelo: string | null;
  gpuVramGb: number | null;
  monitorMarca: string | null;
  monitorModelo: string | null;
  redModelo: string | null;
}

export interface EspecificacionTecnicaRequest {
  procesador?: string;
  nucleos?: number;
  hilos?: number;
  ramModulos?: number;
  ramTotalGb?: number;
  ramVelocidadMhz?: number;
  ramMarca?: string;
  discoModelo?: string;
  discoInterface?: string;
  discoCapacidadGb?: number;
  discoUsadoGb?: number;
  discoLibreGb?: number;
  gpuMarca?: string;
  gpuModelo?: string;
  gpuVramGb?: number;
  monitorMarca?: string;
  monitorModelo?: string;
  redModelo?: string;
}

export interface EquipoResponse {
  idEquipo: number;
  codigoEjercito: string;
  idTipo: number;
  nombreTipo: string;
  idModelo: number;
  nombreModelo: string;
  idArea: number;
  nombreArea: string;
  idSo: number;
  nombreSo: string;
  versionSo: string;
  numeroSerie: string;
  nombreResponsable: string;
  macAddress: string | null;
  ipAddress: string | null;
  tipoRed: string | null;
  estado: string;
  fechaAdquisicion: string | null;
  fechaRegistro: string | null;
  fechaBaja: string | null;
  observaciones: string | null;
  especificaciones: EspecificacionTecnicaResponse | null;
}

export interface HistorialEstadoResponse {
  idHistorial: number;
  estadoAnterior: string;
  estadoNuevo: string;
  motivo: string | null;
  fechaCambio: string;
  idUsuario: number;
  nombresUsuario: string;
  apellidosUsuario: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TipoEquipoResponse {
  idTipo: number;
  nombreTipo: string;
  descripcion: string;
}

export interface MarcaResponse {
  idMarca: number;
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

export interface SistemaOperativoResponse {
  idSo: number;
  nombreSo: string;
  versionSo: string;
}

export interface AreaCatResponse {
  idArea: number;
  codigoArea: string;
  nombreArea: string;
}

export interface EquipoRequest {
  codigoEjercito: string;
  idTipo: number;
  idModelo: number;
  idArea: number;
  idSo: number;
  numeroSerie: string;
  nombreResponsable: string;
  macAddress?: string;
  ipAddress?: string;
  tipoRed?: string;
  fechaAdquisicion?: string;
  observaciones?: string;
}

export interface CambioEstadoRequest {
  estado: string;
  motivo?: string;
}

// ── HTTP helpers ────────────────────────────────────────────────────────────

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.data as T;
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

async function putJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

async function patchJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'PATCH', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

// ── API functions ───────────────────────────────────────────────────────────

export const listarEquipos = (page = 0, size = 20, estado?: string, idArea?: number, idTipo?: number) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (estado) params.append('estado', estado);
  if (idArea) params.append('idArea', String(idArea));
  if (idTipo) params.append('idTipo', String(idTipo));
  return getJson<PagedResponse<EquipoResponse>>(`/api/equipos?${params}`);
};

export const obtenerEquipo = (id: number) =>
  getJson<EquipoResponse>(`/api/equipos/${id}`);

export const crearEquipo = (data: EquipoRequest) =>
  postJson<EquipoResponse>('/api/equipos', data);

export const actualizarEquipo = (id: number, data: EquipoRequest) =>
  putJson<EquipoResponse>(`/api/equipos/${id}`, data);

export const cambiarEstado = (id: number, data: CambioEstadoRequest) =>
  patchJson<EquipoResponse>(`/api/equipos/${id}/estado`, data);

export const listarHistorial = (id: number) =>
  getJson<HistorialEstadoResponse[]>(`/api/equipos/${id}/historial`);

export const listarTipos = () =>
  getJson<TipoEquipoResponse[]>('/api/catalogos/tipos-equipo');

export const listarMarcas = () =>
  getJson<MarcaResponse[]>('/api/catalogos/marcas');

export const listarModelos = (marcaId?: number) => {
  const qs = marcaId ? `?marcaId=${marcaId}` : '';
  return getJson<ModeloResponse[]>(`/api/catalogos/modelos${qs}`);
};

export const listarSO = () =>
  getJson<SistemaOperativoResponse[]>('/api/catalogos/sistemas-operativos');

export const listarAreas = () =>
  getJson<AreaCatResponse[]>('/api/catalogos/areas');

export const upsertEspecificaciones = (id: number, data: EspecificacionTecnicaRequest) =>
  putJson<EspecificacionTecnicaResponse>(`/api/equipos/${id}/especificaciones`, data);

// ── Exportación de reportes ──────────────────────────────────────────────────

async function descargarArchivo(path: string, nombreArchivo: string): Promise<void> {
  const res = await fetchWithAuth(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const exportarInventarioExcel = () =>
  descargarArchivo(
    '/api/reportes/inventario/excel',
    `inventario-equipos-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );

export const exportarInventarioPdf = () =>
  descargarArchivo(
    '/api/reportes/inventario/pdf',
    `inventario-equipos-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
