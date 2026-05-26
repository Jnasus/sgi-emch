import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, AlertCircle, Clock, CheckCircle2, XCircle,
  ChevronRight, Download, FileText, type LucideIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import * as ticketSvc from '../../services/ticketService';
import type { TicketResponse, HistorialTicketResponse } from '../../services/ticketService';
import { getCurrentUser } from '../../services/authService';
import { API_BASE } from '../../lib/api';

// ── Configuración ─────────────────────────────────────────────────────────────

const ESTADO_CFG: Record<string, {
  label: string;
  badgeClass: string;
  Icon: LucideIcon;
}> = {
  ABIERTO:    { label: 'Abierto',    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',  Icon: AlertCircle  },
  EN_PROCESO: { label: 'En Proceso', badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',     Icon: Clock        },
  RESUELTO:   { label: 'Resuelto',   badgeClass: 'bg-green-100 text-green-700 border-green-300',  Icon: CheckCircle2 },
  CERRADO:    { label: 'Cerrado',    badgeClass: 'bg-gray-100 text-gray-600 border-gray-300',     Icon: XCircle      },
};

const PRIORIDAD_CLASS: Record<string, string> = {
  BAJA:    'bg-gray-100 text-gray-600 border-gray-300',
  MEDIA:   'bg-blue-100 text-blue-700 border-blue-300',
  ALTA:    'bg-orange-100 text-orange-700 border-orange-300',
  CRITICA: 'bg-red-100 text-red-700 border-red-300',
};

/** El siguiente estado en la máquina de estados de tickets */
const SIGUIENTE: Record<string, string> = {
  ABIERTO:    'EN_PROCESO',
  EN_PROCESO: 'RESUELTO',
  RESUELTO:   'CERRADO',
};

const LABEL_SIGUIENTE: Record<string, string> = {
  ABIERTO:    'Pasar a EN PROCESO',
  EN_PROCESO: 'Marcar como RESUELTO',
  RESUELTO:   'Cerrar Ticket',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fechaHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-[#5C6064] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[#2C3E1F] font-semibold text-sm">{value || '—'}</p>
    </div>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export function IncidenteDetalle() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const currentUser = getCurrentUser();
  const puedeAvanzar =
    currentUser?.rol === 'ADMINISTRADOR' || currentUser?.rol === 'TECNICO';

  const [ticket,    setTicket]   = useState<TicketResponse | null>(null);
  const [historial, setHistorial] = useState<HistorialTicketResponse[]>([]);
  const [cargando,  setCargando] = useState(true);
  const [error,     setError]    = useState<string | null>(null);

  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorEstado,     setErrorEstado]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const idNum = Number(id);
    setCargando(true);
    setError(null);
    Promise.all([
      ticketSvc.obtenerTicket(idNum),
      ticketSvc.listarHistorial(idNum),
    ])
      .then(([t, h]) => { setTicket(t); setHistorial(h); })
      .catch(err => {
        const msg = err instanceof Error ? err.message : '';
        setError(msg.includes('404') ? 'Ticket no encontrado.' : 'Error al cargar el ticket.');
      })
      .finally(() => setCargando(false));
  }, [id]);

  async function handleAvanzarEstado() {
    if (!ticket) return;
    const siguiente = SIGUIENTE[ticket.estado];
    if (!siguiente) return;
    setCambiandoEstado(true);
    setErrorEstado(null);
    try {
      const actualizado = await ticketSvc.cambiarEstado(
        ticket.idTicket,
        siguiente as 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO',
      );
      setTicket(actualizado);
      const h = await ticketSvc.listarHistorial(ticket.idTicket);
      setHistorial(h);
    } catch (err) {
      setErrorEstado(err instanceof Error ? err.message : 'Error al cambiar el estado.');
    } finally {
      setCambiandoEstado(false);
    }
  }

  // ── Render: loading / error ───────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64 text-[#5C6064]">
        Cargando ticket...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" className="gap-2"
                onClick={() => navigate('/incidentes')}>
          <ArrowLeft className="w-4 h-4" /> Volver a Incidentes
        </Button>
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const estadoCfg    = ESTADO_CFG[ticket.estado] ?? ESTADO_CFG['ABIERTO'];
  const { Icon: EstadoIcon } = estadoCfg;
  const siguienteEstado      = SIGUIENTE[ticket.estado];

  // ── Render: detalle ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb + título */}
      <div className="flex items-start gap-4 flex-wrap">
        <Button
          variant="outline" size="icon"
          className="border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white shrink-0"
          onClick={() => navigate('/incidentes')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-0.5 font-mono"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            {ticket.numeroTicket}
          </h2>
          <p className="text-[#5C6064] text-sm truncate">{ticket.titulo}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`gap-1 text-xs ${estadoCfg.badgeClass}`}>
            <EstadoIcon className="w-3 h-3" />
            {estadoCfg.label}
          </Badge>
          <Badge variant="outline" className={`text-xs ${PRIORIDAD_CLASS[ticket.prioridad] ?? ''}`}>
            {ticket.prioridad}
          </Badge>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Columna principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Datos */}
          <Card className="border-l-4 border-l-[#D91E18]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                         style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                <FileText className="w-4 h-4 text-[#D91E18]" />
                Información del Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Equipo"          value={ticket.codigoEjercito} />
              <InfoField label="Tipo"            value={ticket.nombreTipoIncidente} />
              <InfoField label="Técnico"         value={`${ticket.nombresTecnico} ${ticket.apellidosTecnico}`} />
              <InfoField label="Fecha apertura"  value={fechaHora(ticket.fechaApertura)} />
              {ticket.fechaRespuesta  && <InfoField label="Fecha respuesta"  value={fechaHora(ticket.fechaRespuesta)} />}
              {ticket.fechaResolucion && <InfoField label="Fecha resolución" value={fechaHora(ticket.fechaResolucion)} />}
              {ticket.fechaCierre     && <InfoField label="Fecha cierre"     value={fechaHora(ticket.fechaCierre)} />}
              {ticket.fueraDeSla !== null && (
                <div>
                  <p className="text-xs text-[#5C6064] uppercase tracking-wide mb-1">SLA</p>
                  <p className={`text-sm font-semibold ${ticket.fueraDeSla ? 'text-red-600' : 'text-green-600'}`}>
                    {ticket.fueraDeSla ? '❌ Fuera de SLA' : '✅ Dentro de SLA'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descripción */}
          {ticket.descripcion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                           style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                  <FileText className="w-4 h-4 text-[#4A5D23]" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#2C3E1F] text-sm whitespace-pre-wrap leading-relaxed">
                  {ticket.descripcion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Historial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                         style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                <Clock className="w-4 h-4 text-[#4A5D23]" />
                Historial de Cambios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {historial.length === 0 ? (
                <p className="text-[#5C6064] text-sm">Sin cambios registrados.</p>
              ) : (
                historial.map((h, idx) => (
                  <div key={h.idHistTicket}>
                    {idx > 0 && <Separator className="my-3" />}
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#4A5D23] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {h.estadoAnterior ? (
                            <>
                              <Badge variant="outline" className="text-xs">{h.estadoAnterior}</Badge>
                              <ChevronRight className="w-3 h-3 text-[#5C6064]" />
                            </>
                          ) : (
                            <span className="text-xs text-[#5C6064]">Ticket creado →</span>
                          )}
                          <Badge variant="outline" className="text-xs">{h.estadoNuevo}</Badge>
                        </div>
                        <p className="text-xs text-[#5C6064]">
                          {fechaHora(h.fechaCambio)} · {h.nombresUsuario} {h.apellidosUsuario}
                        </p>
                        {h.comentario && (
                          <p className="text-sm text-[#2C3E1F] mt-1">{h.comentario}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna acciones (1/3) */}
        <div className="space-y-4">
          {puedeAvanzar && siguienteEstado && (
            <Card>
              <CardHeader>
                <CardTitle className="uppercase tracking-wide"
                           style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {errorEstado && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errorEstado}</span>
                  </div>
                )}
                <Button
                  className="w-full gap-2 bg-[#4A5D23] hover:bg-[#3A4A1C] text-white"
                  disabled={cambiandoEstado}
                  onClick={handleAvanzarEstado}
                >
                  <ChevronRight className="w-4 h-4" />
                  {cambiandoEstado ? 'Actualizando...' : LABEL_SIGUIENTE[ticket.estado]}
                </Button>
              </CardContent>
            </Card>
          )}

          {ticket.pdfActaPath && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                  onClick={() => {
                    const url = ticket.pdfActaPath!.startsWith('http')
                      ? ticket.pdfActaPath!
                      : `${API_BASE}${ticket.pdfActaPath}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Descargar Acta PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
