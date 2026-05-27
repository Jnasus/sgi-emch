import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, AlertTriangle, Clock, Tag, Info,
  CheckCircle, X, ChevronDown, type LucideIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import * as notifSvc from '../../services/notificacionService';
import type { NotificacionResponse } from '../../services/notificacionService';

// ── Configuración por tipo ─────────────────────────────────────────────────────

const TIPO_CFG: Record<NotificacionResponse['tipoNotif'], {
  Icon: LucideIcon;
  borderClass: string;
  iconClass: string;
  badgeClass: string;
  label: string;
}> = {
  STOCK_CRITICO:    { Icon: AlertTriangle, borderClass: 'border-l-red-500',    iconClass: 'text-red-600',    badgeClass: 'bg-red-100 text-red-700',    label: 'Stock Crítico'    },
  SLA_VENCIDO:      { Icon: Clock,         borderClass: 'border-l-orange-500',  iconClass: 'text-orange-600', badgeClass: 'bg-orange-100 text-orange-700', label: 'SLA Vencido'   },
  TICKET_ASIGNADO:  { Icon: Tag,           borderClass: 'border-l-blue-500',    iconClass: 'text-blue-600',   badgeClass: 'bg-blue-100 text-blue-700',   label: 'Ticket Asignado'  },
  INFO:             { Icon: Info,          borderClass: 'border-l-gray-400',    iconClass: 'text-gray-500',   badgeClass: 'bg-gray-100 text-gray-600',   label: 'Información'      },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fechaRelativa(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24)   return `Hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
}

// ── Componente ────────────────────────────────────────────────────────────────

type Filtro = 'TODAS' | 'NO_LEIDAS';

export function Notificaciones() {
  const navigate = useNavigate();

  const [notifs,    setNotifs]    = useState<NotificacionResponse[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filtro,    setFiltro]    = useState<Filtro>('TODAS');
  const [pagina,    setPagina]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [cargandoMas, setCargandoMas]     = useState(false);
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const noLeidas = notifs.filter(n => !n.leida).length;

  function cargar(pag: number, fil: Filtro, reset: boolean) {
    const leida = fil === 'NO_LEIDAS' ? false : undefined;
    if (pag === 0) { setCargando(true); setError(null); }
    else setCargandoMas(true);

    notifSvc.listarNotificaciones(leida, pag, 20)
      .then(r => {
        setNotifs(prev => reset ? r.content : [...prev, ...r.content]);
        setTotalElements(r.totalElements);
        setPagina(pag);
      })
      .catch(() => setError('Error al cargar las notificaciones.'))
      .finally(() => { setCargando(false); setCargandoMas(false); });
  }

  useEffect(() => {
    cargar(0, filtro, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  function cambiarFiltro(f: Filtro) {
    setFiltro(f);
    setPagina(0);
    setNotifs([]);
  }

  async function handleMarcarLeida(id: number) {
    try {
      const actualizada = await notifSvc.marcarLeida(id);
      setNotifs(prev => prev.map(n => n.idNotif === id ? actualizada : n));
    } catch {
      // silencioso — la notificación no cambia de estado visualmente
    }
  }

  async function handleEliminar(id: number) {
    try {
      await notifSvc.eliminarNotificacion(id);
      setNotifs(prev => prev.filter(n => n.idNotif !== id));
      setTotalElements(t => t - 1);
    } catch {
      // silencioso
    }
  }

  async function handleMarcarTodas() {
    setMarcandoTodas(true);
    try {
      await notifSvc.marcarTodasLeidas();
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    } catch {
      // silencioso
    } finally {
      setMarcandoTodas(false);
    }
  }

  const hayMas = notifs.length < totalElements;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Centro de Notificaciones
          </h2>
          <p className="text-[#5C6064]">Alertas y notificaciones del sistema</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
          disabled={marcandoTodas || noLeidas === 0}
          onClick={handleMarcarTodas}
        >
          <CheckCircle className="w-4 h-4" />
          {marcandoTodas ? 'Marcando...' : 'Marcar Todas Leídas'}
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        {(['TODAS', 'NO_LEIDAS'] as Filtro[]).map(f => (
          <Button
            key={f}
            variant={filtro === f ? 'default' : 'outline'}
            size="sm"
            className={filtro === f
              ? 'bg-[#2C3E1F] text-white hover:bg-[#2C3E1F]'
              : 'border-[#4A5D23]/40 text-[#5C6064]'}
            onClick={() => cambiarFiltro(f)}
          >
            {f === 'TODAS' ? 'Todas' : (
              <span className="flex items-center gap-1.5">
                No leídas
                {noLeidas > 0 && (
                  <Badge className="bg-[#D91E18] text-white h-4 px-1.5 text-[10px] hover:bg-[#D91E18]">
                    {noLeidas}
                  </Badge>
                )}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lista */}
      {cargando ? (
        <div className="flex items-center justify-center h-40 text-[#5C6064]">
          Cargando notificaciones...
        </div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#5C6064]">
          <Bell className="w-10 h-10 opacity-30" />
          <p className="text-sm">
            {filtro === 'NO_LEIDAS' ? 'No tienes notificaciones sin leer.' : 'No hay notificaciones.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {notifs.map((notif, idx) => {
              const cfg = TIPO_CFG[notif.tipoNotif];
              const { Icon } = cfg;
              return (
                <motion.div
                  key={notif.idNotif}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ delay: idx < 5 ? idx * 0.04 : 0 }}
                >
                  <Card
                    className={`border-l-4 ${cfg.borderClass} ${!notif.leida ? 'shadow-md bg-white' : 'bg-[#FAFAFA]'} transition-all`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-full bg-white border ${cfg.iconClass} shrink-0`}>
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="text-[#2C3E1F] text-sm truncate" style={{ fontWeight: 600 }}>
                                {notif.titulo}
                              </h3>
                              {!notif.leida && (
                                <span className="w-2 h-2 rounded-full bg-[#D91E18] shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!notif.leida && (
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-7 w-7 text-[#5C6064] hover:text-[#4A5D23]"
                                  title="Marcar como leída"
                                  onClick={() => handleMarcarLeida(notif.idNotif)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-[#5C6064] hover:text-[#D91E18]"
                                title="Eliminar"
                                onClick={() => handleEliminar(notif.idNotif)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-[#5C6064] text-sm leading-snug mb-2.5">{notif.mensaje}</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className={`${cfg.badgeClass} border-0 text-xs`}>
                              {cfg.label}
                            </Badge>
                            <span className="text-xs text-[#5C6064]">{fechaRelativa(notif.fechaCreacion)}</span>
                            {notif.urlAccion && (
                              <Button
                                variant="link" size="sm"
                                className="h-auto p-0 text-xs text-[#4A5D23] underline-offset-2"
                                onClick={() => navigate(notif.urlAccion!)}
                              >
                                Ver detalle →
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {hayMas && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline" size="sm"
                className="gap-2 border-[#4A5D23]/40 text-[#5C6064]"
                disabled={cargandoMas}
                onClick={() => cargar(pagina + 1, filtro, false)}
              >
                <ChevronDown className="w-4 h-4" />
                {cargandoMas ? 'Cargando...' : 'Ver más'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
