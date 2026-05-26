import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft, Package, Calendar, User, MapPin, FileText, Edit,
  CheckCircle, Clock, AlertCircle, XCircle, RefreshCw, Cpu, Settings2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import * as svc from '../../services/inventarioService';
import type {
  EquipoResponse, HistorialEstadoResponse,
  EspecificacionTecnicaResponse,
} from '../../services/inventarioService';

// ── Estado config (igual que Inventario.tsx) ───────────────────────────────
const ESTADOS = [
  { value: 'EN_BODEGA',     label: 'En Bodega',     color: 'bg-gray-100 text-gray-700 border-gray-300',    icon: Package },
  { value: 'ASIGNADO',      label: 'Asignado',      color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  { value: 'EN_REPARACION', label: 'En Reparación', color: 'bg-red-100 text-red-700 border-red-300',       icon: AlertCircle },
  { value: 'PRESTADO',      label: 'Prestado',       color: 'bg-blue-100 text-blue-700 border-blue-300',    icon: Clock },
  { value: 'DADO_DE_BAJA',  label: 'Dado de Baja',  color: 'bg-gray-100 text-gray-500 border-gray-300',    icon: XCircle },
];

function estadoInfo(v: string) {
  return ESTADOS.find(e => e.value === v) ?? { label: v, color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Package };
}

function EstadoBadge({ estado }: { estado: string }) {
  const info = estadoInfo(estado);
  const Icon = info.icon;
  return (
    <Badge variant="outline" className={`gap-1 border text-xs ${info.color}`}>
      <Icon className="w-3 h-3" />{info.label}
    </Badge>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fecha(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE');
}

function fechaHora(iso: string | null | undefined) {
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

// ── Componente principal ───────────────────────────────────────────────────
export function InventarioDetalle() {
  const { id } = useParams<{ id: string }>();

  const [equipo, setEquipo]       = useState<EquipoResponse | null>(null);
  const [historial, setHistorial] = useState<HistorialEstadoResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // modal cambiar estado
  const [showEstado,  setShowEstado]  = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [motivo,      setMotivo]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);

  async function loadAll(idNum: number) {
    const [eq, hist] = await Promise.all([
      svc.obtenerEquipo(idNum),
      svc.listarHistorial(idNum),
    ]);
    setEquipo(eq);
    setHistorial(hist);
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadAll(Number(id))
      .catch(() => setError('No se pudo cargar el equipo.'))
      .finally(() => setLoading(false));
  }, [id]);

  function openEstadoModal() {
    if (!equipo) return;
    setNuevoEstado(equipo.estado);
    setMotivo('');
    setApiError(null);
    setShowEstado(true);
  }

  async function handleCambiarEstado() {
    if (!equipo || !nuevoEstado) return;
    setSaving(true); setApiError(null);
    try {
      const updated = await svc.cambiarEstado(equipo.idEquipo, { estado: nuevoEstado, motivo: motivo || undefined });
      setEquipo(updated);
      const hist = await svc.listarHistorial(equipo.idEquipo);
      setHistorial(hist);
      setShowEstado(false);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cambiar estado');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-center py-12 text-[#5C6064]">Cargando...</p>;
  if (error || !equipo) return <p className="text-center py-12 text-[#D91E18]">{error ?? 'Equipo no encontrado'}</p>;

  const specs = equipo.especificaciones;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inventario">
            <Button variant="outline" size="icon"
              className="border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
              Detalle de Equipo
            </h2>
            <p className="text-[#5C6064] font-mono font-semibold">{equipo.codigoEjercito}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/inventario/${id}/editar`}>
            <Button variant="outline" className="gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
              <Edit className="w-4 h-4" /> Editar
            </Button>
          </Link>
          <Button onClick={openEstadoModal} variant="outline"
            className="gap-2 border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white">
            <RefreshCw className="w-4 h-4" /> Cambiar Estado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6">

          {/* Información general */}
          <Card className="border-l-4 border-l-[#4A5D23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem' }}>
                <Package className="w-5 h-5 text-[#4A5D23]" /> Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoField label="Tipo" value={equipo.nombreTipo} />
                <InfoField label="Modelo" value={equipo.nombreModelo} />
                <div>
                  <p className="text-xs text-[#5C6064] uppercase tracking-wide mb-1">Estado</p>
                  <EstadoBadge estado={equipo.estado} />
                </div>
                <InfoField label="N° Serie" value={equipo.numeroSerie} />
                <InfoField label="Sistema Operativo"
                  value={equipo.nombreSo ? `${equipo.nombreSo} ${equipo.versionSo ?? ''}`.trim() : null} />
                <InfoField label="Tipo de Red" value={equipo.tipoRed} />
                <InfoField label="MAC Address" value={equipo.macAddress} />
                <InfoField label="IP Address" value={equipo.ipAddress} />
                <InfoField label="Fecha Adquisición" value={fecha(equipo.fechaAdquisicion)} />
              </div>
              {equipo.observaciones && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-[#5C6064] uppercase tracking-wide mb-1">Observaciones</p>
                    <p className="text-[#2C3E1F] text-sm">{equipo.observaciones}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Especificaciones técnicas */}
          <Card className="border-l-4 border-l-[#5C6064]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem' }}>
                <Cpu className="w-5 h-5 text-[#5C6064]" /> Especificaciones Técnicas
              </CardTitle>
              <Link to={`/inventario/${id}/especificaciones`}>
                <Button variant="outline" size="sm"
                  className="gap-1 border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white">
                  <Settings2 className="w-4 h-4" />
                  {specs && (specs.procesador || specs.ramTotalGb != null || specs.discoCapacidadGb != null)
                    ? 'Editar Especificaciones' : 'Registrar Especificaciones'}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {specs && (specs.procesador || specs.nucleos != null || specs.ramTotalGb != null ||
                         specs.discoCapacidadGb != null || specs.gpuModelo || specs.monitorModelo || specs.redModelo) ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {specs.procesador && <InfoField label="Procesador" value={specs.procesador} />}
                  {specs.nucleos != null && (
                    <InfoField label="Núcleos / Hilos" value={`${specs.nucleos} / ${specs.hilos ?? '?'}`} />
                  )}
                  {specs.ramTotalGb != null && (
                    <InfoField label="RAM"
                      value={`${specs.ramTotalGb} GB${specs.ramMarca ? ` ${specs.ramMarca}` : ''}`} />
                  )}
                  {specs.discoCapacidadGb != null && (
                    <InfoField label="Disco"
                      value={`${specs.discoCapacidadGb} GB${specs.discoInterface ? ` ${specs.discoInterface}` : ''}`} />
                  )}
                  {specs.gpuModelo && (
                    <InfoField label="GPU" value={`${specs.gpuMarca ?? ''} ${specs.gpuModelo}`.trim()} />
                  )}
                  {specs.monitorModelo && (
                    <InfoField label="Monitor" value={`${specs.monitorMarca ?? ''} ${specs.monitorModelo}`.trim()} />
                  )}
                  {specs.redModelo && <InfoField label="Tarjeta de red" value={specs.redModelo} />}
                </div>
              ) : (
                <p className="text-sm text-[#5C6064]">
                  Sin especificaciones técnicas registradas. Haga clic en{' '}
                  <em>Agregar Specs</em> para ingresar los datos de hardware.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Historial de estados */}
          <Card className="border-l-4 border-l-[#4A5D23]/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem' }}>
                <FileText className="w-5 h-5 text-[#5C6064]" /> Historial de Estados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historial.length === 0 ? (
                <p className="text-sm text-[#5C6064]">Sin movimientos registrados.</p>
              ) : (
                <div className="space-y-3">
                  {historial.map(h => (
                    <div key={h.idHistorial}
                      className="flex gap-3 pb-3 border-b last:border-0 border-[#E8E8E3]">
                      <div className="w-2 h-2 rounded-full bg-[#4A5D23] mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <EstadoBadge estado={h.estadoAnterior} />
                          <span className="text-[#5C6064] text-xs">→</span>
                          <EstadoBadge estado={h.estadoNuevo} />
                        </div>
                        {h.motivo && (
                          <p className="text-sm text-[#2C3E1F] mt-1">{h.motivo}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-[#5C6064]">{fechaHora(h.fechaCambio)}</span>
                          <span className="text-[#5C6064]">•</span>
                          <span className="text-xs text-[#5C6064]">
                            {h.apellidosUsuario}, {h.nombresUsuario}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="space-y-6">

          <Card className="border-t-4 border-t-[#4A5D23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem' }}>
                <User className="w-5 h-5 text-[#4A5D23]" /> Asignación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoField label="Responsable" value={equipo.nombreResponsable} />
              <div>
                <p className="text-xs text-[#5C6064] uppercase tracking-wide mb-1">Área</p>
                <Badge variant="outline" className="border-[#4A5D23] text-[#4A5D23] gap-1">
                  <MapPin className="w-3 h-3" />{equipo.nombreArea}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-[#D91E18]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem' }}>
                <Calendar className="w-5 h-5 text-[#D91E18]" /> Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoField label="Registro" value={fecha(equipo.fechaRegistro)} />
              <InfoField label="Adquisición" value={fecha(equipo.fechaAdquisicion)} />
              {equipo.fechaBaja && (
                <InfoField label="Fecha de Baja" value={fecha(equipo.fechaBaja)} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal Cambiar Estado */}
      <Dialog open={showEstado} onOpenChange={setShowEstado}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2C3E1F]">
              <RefreshCw className="w-5 h-5 text-[#4A5D23]" /> Cambiar Estado
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#5C6064]">
            Equipo: <span className="font-semibold text-[#2C3E1F]">{equipo.codigoEjercito}</span>
          </p>
          <div className="space-y-3 mt-1">
            <div className="space-y-1">
              <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Nuevo Estado *</Label>
              <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}
                className="w-full h-9 rounded-md border border-[#4A5D23]/30 bg-white px-3 text-sm focus:outline-none focus:border-[#4A5D23]">
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Motivo</Label>
              <Textarea value={motivo} onChange={e => setMotivo(e.target.value)}
                placeholder="Descripción del motivo del cambio..."
                className="min-h-[80px] border-[#4A5D23]/30 focus:border-[#4A5D23] resize-none" />
            </div>
          </div>
          {apiError && <p className="text-sm text-[#D91E18] mt-1">{apiError}</p>}
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowEstado(false)}>Cancelar</Button>
            <Button onClick={handleCambiarEstado} disabled={saving}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
