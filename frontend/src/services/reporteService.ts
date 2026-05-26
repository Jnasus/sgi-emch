import { fetchWithAuth } from '../lib/api';

// ── Helper para descargar archivos autenticados ─────────────────────────────

async function descargarArchivo(path: string, nombreArchivo: string): Promise<void> {
  const res = await fetchWithAuth(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Error HTTP ${res.status}`);
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
