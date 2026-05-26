import { fetchWithAuth } from '../lib/api';

// ── Helpers de descarga ─────────────────────────────────────────────────────

async function descargarBlob(res: Response, nombreArchivo: string): Promise<void> {
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

async function descargarArchivo(path: string, nombreArchivo: string): Promise<void> {
  const res = await fetchWithAuth(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Error HTTP ${res.status}`);
  }
  await descargarBlob(res, nombreArchivo);
}

async function postDescargarArchivo(
  path: string,
  body: unknown,
  nombreArchivo: string,
): Promise<void> {
  const res = await fetchWithAuth(path, { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error((b as { message?: string }).message ?? `Error HTTP ${res.status}`);
  }
  await descargarBlob(res, nombreArchivo);
}

function buildParams(
  params: Record<string, string | number | undefined | null>,
): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') p.append(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

const hoy = () => new Date().toISOString().slice(0, 10);

// ── Inventario General (con filtros opcionales) ─────────────────────────────

export const inventarioExcel = (estado?: string, idArea?: number) =>
  descargarArchivo(
    `/api/reportes/inventario/excel${buildParams({ estado, idArea })}`,
    `inventario-general-${hoy()}.xlsx`,
  );

export const inventarioPdf = (estado?: string, idArea?: number) =>
  descargarArchivo(
    `/api/reportes/inventario/pdf${buildParams({ estado, idArea })}`,
    `inventario-general-${hoy()}.pdf`,
  );

// ── Selección manual (por IDs) ──────────────────────────────────────────────

export const seleccionExcel = (ids: number[]) =>
  postDescargarArchivo(
    '/api/reportes/seleccion/excel',
    { ids },
    `seleccion-equipos-${hoy()}.xlsx`,
  );

export const seleccionPdf = (ids: number[]) =>
  postDescargarArchivo(
    '/api/reportes/seleccion/pdf',
    { ids },
    `seleccion-equipos-${hoy()}.pdf`,
  );

// ── Equipos Antiguos ────────────────────────────────────────────────────────

export const antiguosExcel = (anios = 5) =>
  descargarArchivo(
    `/api/reportes/equipos-antiguos/excel?anios=${anios}`,
    `equipos-antiguos-${anios}anios-${hoy()}.xlsx`,
  );

export const antiguosPdf = (anios = 5) =>
  descargarArchivo(
    `/api/reportes/equipos-antiguos/pdf?anios=${anios}`,
    `equipos-antiguos-${anios}anios-${hoy()}.pdf`,
  );
