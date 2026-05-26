import { fetchWithAuth } from '../lib/api';

// ── Tipos (mirrors de los DTOs del backend) ──────────────────────────────────

export interface FilaCarga {
  codigoEjercito: string;
  tipo: string;
  marca: string;
  modelo: string;
  area: string;
  sistemaOperativo: string;
  numeroSerie: string;
  nombreResponsable: string;
  macAddress: string;
  ipAddress: string;
  tipoRed: string;
  estadoInicial: string;
  fechaAdquisicion: string;
  observaciones: string;
  procesador: string;
  nucleos: string;
  hilos: string;
  ramModulos: string;
  ramTotalGb: string;
  ramVelocidadMhz: string;
  ramMarca: string;
  discoModelo: string;
  discoInterface: string;
  discoCapacidadGb: string;
  discoUsadoGb: string;
  discoLibreGb: string;
  gpuMarca: string;
  gpuModelo: string;
  gpuVramGb: string;
  monitorMarca: string;
  monitorModelo: string;
  redModelo: string;
}

export interface ErrorFila {
  columna: string;
  mensaje: string;
}

export interface FilaValidada {
  numeroFila: number;
  datos: FilaCarga;
  estado: 'OK' | 'ERROR';
  errores: ErrorFila[];
  idTipoResuelto: number | null;
  idModeloResuelto: number | null;
  idAreaResuelta: number | null;
  idSoResuelto: number | null;
}

export interface ValidacionResponse {
  total: number;
  totalErrores: number;
  filas: FilaValidada[];
}

export interface ConfirmacionResponse {
  total: number;
  guardados: number;
  errores: number;
  detalleErrores: ErrorFila[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return ((await res.json()) as { data: T }).data;
}

// ── API ──────────────────────────────────────────────────────────────────────

/** Descarga la plantilla Excel generada dinámicamente con los catálogos actuales. */
export async function descargarPlantilla(): Promise<void> {
  const res = await fetchWithAuth('/api/equipos/carga-masiva/plantilla');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `plantilla-carga-masiva-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Sube el archivo Excel al backend para parseo y validación (sin guardar en BD). */
export async function validarArchivo(file: File): Promise<ValidacionResponse> {
  const form = new FormData();
  form.append('file', file);
  // fetchWithAuth detecta FormData y omite Content-Type (el browser agrega el boundary)
  const res = await fetchWithAuth('/api/equipos/carga-masiva/validar', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return ((await res.json()) as { data: ValidacionResponse }).data;
}

/**
 * Re-valida una o varias FilaCarga enviadas como JSON.
 * Usada para re-validar filas individuales tras edición en la UI.
 */
export async function revalidarFilas(filas: FilaCarga[]): Promise<ValidacionResponse> {
  return postJson<ValidacionResponse>('/api/equipos/carga-masiva/validar-json', { filas });
}

/** Envía las filas validadas al backend para persistirlas en una transacción. */
export async function confirmarCarga(filas: FilaValidada[]): Promise<ConfirmacionResponse> {
  return postJson<ConfirmacionResponse>('/api/equipos/carga-masiva/confirmar', { filas });
}
