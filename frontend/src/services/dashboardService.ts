import { fetchWithAuth } from '../lib/api';

export interface DashboardResumen {
  nombreTipo: string;
  total: number;
  asignados: number;
  enBodega: number;
  enReparacion: number;
  dadosDeBaja: number;
  stockOperativo: number;
  umbralStockPct: number;
  pctOperativo: number;
  equiposMayores5Anios: number;
}

export interface StockCritico {
  idTipo: number;
  nombreTipo: string;
  totalEquipos: number;
  stockOperativo: number;
  umbralPct: number;
  pctActual: number;
  enAlerta: boolean;
}

export interface TicketActivo {
  idTicket: number;
  numeroTicket: string;
  codigoEjercito: string;
  nombreArea: string;
  tecnico: string;
  tipoIncidente: string;
  titulo: string;
  estado: string;
  prioridad: string;
  fechaApertura: string;
  slaMinutos: number;
  minutosTranscurridos: number;
  minutosRestantesSla: number;
  slaVencido: boolean;
  fueraDeSla: boolean;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.data as T;
}

export const getResumen = () => getJson<DashboardResumen[]>('/api/dashboard/resumen');
export const getStockCritico = () => getJson<StockCritico[]>('/api/dashboard/stock-critico');
export const getTicketsActivos = () => getJson<TicketActivo[]>('/api/dashboard/tickets-activos');
