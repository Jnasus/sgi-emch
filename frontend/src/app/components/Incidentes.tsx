import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Plus, AlertCircle, Clock, CheckCircle2, XCircle, ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as ticketSvc from '../../services/ticketService';
import type { TicketResponse, TecnicoResponse } from '../../services/ticketService';

// ── Constantes ────────────────────────────────────────────────────────────────

const ESTADOS = ['ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'] as const;
type EstadoTicket = typeof ESTADOS[number];

const COL_CONFIG: Record<EstadoTicket, {
  label: string;
  headerClass: string;
  borderClass: string;
  Icon: LucideIcon;
}> = {
  ABIERTO:    { label: 'Abierto',    headerClass: 'bg-amber-50 border-b border-amber-200',  borderClass: 'border-2 border-amber-400',  Icon: AlertCircle  },
  EN_PROCESO: { label: 'En Proceso', headerClass: 'bg-blue-50 border-b border-blue-200',    borderClass: 'border-2 border-blue-400',   Icon: Clock        },
  RESUELTO:   { label: 'Resuelto',   headerClass: 'bg-green-50 border-b border-green-200',  borderClass: 'border-2 border-green-400',  Icon: CheckCircle2 },
  CERRADO:    { label: 'Cerrado',    headerClass: 'bg-gray-50 border-b border-gray-200',    borderClass: 'border-2 border-gray-300',   Icon: XCircle      },
};

const PRIORIDAD_CLASS: Record<string, string> = {
  BAJA:    'bg-gray-100 text-gray-600 border-gray-300',
  MEDIA:   'bg-blue-100 text-blue-700 border-blue-300',
  ALTA:    'bg-orange-100 text-orange-700 border-orange-300',
  CRITICA: 'bg-red-100 text-red-700 border-red-300',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function tiempoRelativo(fechaIso: string): string {
  const mins = Math.floor((Date.now() - new Date(fechaIso).getTime()) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  return `hace ${dias} día${dias !== 1 ? 's' : ''}`;
}

// ── Tipos internos ────────────────────────────────────────────────────────────

interface ColState {
  tickets: TicketResponse[];
  pagina: number;
  totalElements: number;
  cargandoMas: boolean;
}

function colInicial(): ColState {
  return { tickets: [], pagina: 0, totalElements: 0, cargandoMas: false };
}

type ColsMap = Record<EstadoTicket, ColState>;

// ── Componente ────────────────────────────────────────────────────────────────

export function Incidentes() {
  const navigate = useNavigate();

  const [cols, setCols] = useState<ColsMap>({
    ABIERTO: colInicial(), EN_PROCESO: colInicial(),
    RESUELTO: colInicial(), CERRADO: colInicial(),
  });
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [tecnicos, setTecnicos]               = useState<TecnicoResponse[]>([]);
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroTecnico, setFiltroTecnico]     = useState('');

  // Cargar lista de técnicos para el filtro (una sola vez)
  useEffect(() => {
    ticketSvc.listarTecnicos().then(setTecnicos).catch(() => {});
  }, []);

  // Recargar todas las columnas cuando cambien los filtros
  useEffect(() => {
    const filtros = {
      prioridad: filtroPrioridad || undefined,
      idTecnico: filtroTecnico ? Number(filtroTecnico) : undefined,
    };
    setCargandoInicial(true);
    setError(null);
    Promise.all(ESTADOS.map(e => ticketSvc.listarTicketsPorEstado(e, filtros, 0)))
      .then(resultados => {
        const nuevasCols = {} as ColsMap;
        ESTADOS.forEach((e, i) => {
          nuevasCols[e] = {
            tickets: resultados[i].content,
            pagina: 0,
            totalElements: resultados[i].totalElements,
            cargandoMas: false,
          };
        });
        setCols(nuevasCols);
      })
      .catch(() => setError('Error al cargar los tickets. Intente nuevamente.'))
      .finally(() => setCargandoInicial(false));
  }, [filtroPrioridad, filtroTecnico]);

  function verMas(estado: EstadoTicket) {
    const col = cols[estado];
    const siguientePagina = col.pagina + 1;
    const filtros = {
      prioridad: filtroPrioridad || undefined,
      idTecnico: filtroTecnico ? Number(filtroTecnico) : undefined,
    };
    setCols(prev => ({ ...prev, [estado]: { ...prev[estado], cargandoMas: true } }));
    ticketSvc.listarTicketsPorEstado(estado, filtros, siguientePagina)
      .then(resp => {
        setCols(prev => ({
          ...prev,
          [estado]: {
            tickets: [...prev[estado].tickets, ...resp.content],
            pagina: siguientePagina,
            totalElements: resp.totalElements,
            cargandoMas: false,
          },
        }));
      })
      .catch(() => {
        setCols(prev => ({ ...prev, [estado]: { ...prev[estado], cargandoMas: false } }));
      });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Mesa de Ayuda — Incidentes
          </h2>
          <p className="text-[#5C6064]">Gestión de tickets e incidentes técnicos</p>
        </div>
        <Button
          className="gap-2 bg-[#D91E18] hover:bg-[#B81614] text-white"
          onClick={() => navigate('/incidentes/nuevo')}
        >
          <Plus className="w-4 h-4" />
          Nuevo Ticket
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
            <SelectTrigger className="w-[200px] border-[#4A5D23]/30 h-10">
              <SelectValue placeholder="Todas las prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las prioridades</SelectItem>
              <SelectItem value="CRITICA">Crítica</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="BAJA">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroTecnico} onValueChange={setFiltroTecnico}>
            <SelectTrigger className="w-[230px] border-[#4A5D23]/30 h-10">
              <SelectValue placeholder="Todos los técnicos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los técnicos</SelectItem>
              {tecnicos.map(t => (
                <SelectItem key={t.idUsuario} value={String(t.idUsuario)}>
                  {t.nombres} {t.apellidos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban */}
      {cargandoInicial ? (
        <div className="flex items-center justify-center h-64 text-[#5C6064]">
          Cargando tickets...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {ESTADOS.map(estado => {
            const cfg = COL_CONFIG[estado];
            const { Icon } = cfg;
            const col = cols[estado];
            const hayMas = col.tickets.length < col.totalElements;
            return (
              <div key={estado} className={`rounded-xl overflow-hidden flex flex-col ${cfg.borderClass}`}>
                {/* Cabecera de columna */}
                <div className={`px-4 py-3 flex items-center justify-between ${cfg.headerClass}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-sm uppercase tracking-wide">
                      {cfg.label}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">{col.totalElements}</Badge>
                </div>

                {/* Tarjetas */}
                <div className="overflow-y-auto max-h-[600px] p-3 space-y-3 bg-white">
                  {col.tickets.length === 0 ? (
                    <p className="text-center text-[#5C6064] text-sm py-10">Sin tickets</p>
                  ) : (
                    col.tickets.map((ticket, idx) => (
                      <motion.div
                        key={ticket.idTicket}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-white border border-[#E8E8E3] rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-[#4A5D23]/40 transition-all"
                        onClick={() => navigate(`/incidentes/${ticket.idTicket}`)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-xs text-[#5C6064] truncate">
                            {ticket.numeroTicket}
                          </span>
                          <Badge variant="outline"
                                 className={`text-xs shrink-0 ${PRIORIDAD_CLASS[ticket.prioridad] ?? ''}`}>
                            {ticket.prioridad}
                          </Badge>
                        </div>
                        <p className="text-[#2C3E1F] text-sm font-medium leading-snug mb-2 line-clamp-2">
                          {ticket.titulo}
                        </p>
                        <div className="space-y-0.5 text-xs text-[#5C6064]">
                          <div className="flex items-center gap-1">
                            <span>💻</span>
                            <span className="font-mono">{ticket.codigoEjercito}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span>{ticket.nombresTecnico} {ticket.apellidosTecnico}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🕐</span>
                            <span>{tiempoRelativo(ticket.fechaApertura)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}

                  {hayMas && (
                    <Button
                      variant="ghost" size="sm"
                      className="w-full text-[#5C6064] hover:text-[#2C3E1F]"
                      disabled={col.cargandoMas}
                      onClick={() => verMas(estado)}
                    >
                      <ChevronDown className="w-4 h-4 mr-1" />
                      {col.cargandoMas ? 'Cargando...' : 'Ver más'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
