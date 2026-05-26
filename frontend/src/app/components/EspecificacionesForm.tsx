import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Save, Cpu, Database, HardDrive, Layers, Monitor,
  Network, Copy, Search, CheckCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import * as svc from '../../services/inventarioService';
import type {
  EspecificacionTecnicaResponse,
  EspecificacionTecnicaRequest,
  EquipoResponse,
} from '../../services/inventarioService';

// ── Form state (todo string para manejar inputs numéricos vacíos) ──────────
interface EspecForm {
  procesador: string; nucleos: string; hilos: string;
  ramModulos: string; ramTotalGb: string; ramVelocidadMhz: string; ramMarca: string;
  discoModelo: string; discoInterface: string;
  discoCapacidadGb: string; discoUsadoGb: string; discoLibreGb: string;
  gpuMarca: string; gpuModelo: string; gpuVramGb: string;
  monitorMarca: string; monitorModelo: string;
  redModelo: string;
}

const EMPTY: EspecForm = {
  procesador: '', nucleos: '', hilos: '',
  ramModulos: '', ramTotalGb: '', ramVelocidadMhz: '', ramMarca: '',
  discoModelo: '', discoInterface: '',
  discoCapacidadGb: '', discoUsadoGb: '', discoLibreGb: '',
  gpuMarca: '', gpuModelo: '', gpuVramGb: '',
  monitorMarca: '', monitorModelo: '',
  redModelo: '',
};

function toForm(s: EspecificacionTecnicaResponse | null | undefined): EspecForm {
  if (!s) return { ...EMPTY };
  const n = (v: number | null | undefined) => v != null ? String(v) : '';
  const t = (v: string | null | undefined) => v ?? '';
  return {
    procesador: t(s.procesador),
    nucleos: n(s.nucleos),
    hilos: n(s.hilos),
    ramModulos: n(s.ramModulos),
    ramTotalGb: n(s.ramTotalGb),
    ramVelocidadMhz: n(s.ramVelocidadMhz),
    ramMarca: t(s.ramMarca),
    discoModelo: t(s.discoModelo),
    discoInterface: t(s.discoInterface),
    discoCapacidadGb: n(s.discoCapacidadGb),
    discoUsadoGb: n(s.discoUsadoGb),
    discoLibreGb: n(s.discoLibreGb),
    gpuMarca: t(s.gpuMarca),
    gpuModelo: t(s.gpuModelo),
    gpuVramGb: n(s.gpuVramGb),
    monitorMarca: t(s.monitorMarca),
    monitorModelo: t(s.monitorModelo),
    redModelo: t(s.redModelo),
  };
}

function toRequest(f: EspecForm): EspecificacionTecnicaRequest {
  const num = (v: string) => v.trim() !== '' ? Number(v) : undefined;
  const str = (v: string) => v.trim() !== '' ? v.trim() : undefined;
  return {
    procesador: str(f.procesador),
    nucleos: num(f.nucleos),
    hilos: num(f.hilos),
    ramModulos: num(f.ramModulos),
    ramTotalGb: num(f.ramTotalGb),
    ramVelocidadMhz: num(f.ramVelocidadMhz),
    ramMarca: str(f.ramMarca),
    discoModelo: str(f.discoModelo),
    discoInterface: str(f.discoInterface),
    discoCapacidadGb: num(f.discoCapacidadGb),
    discoUsadoGb: num(f.discoUsadoGb),
    discoLibreGb: num(f.discoLibreGb),
    gpuMarca: str(f.gpuMarca),
    gpuModelo: str(f.gpuModelo),
    gpuVramGb: num(f.gpuVramGb),
    monitorMarca: str(f.monitorMarca),
    monitorModelo: str(f.monitorModelo),
    redModelo: str(f.redModelo),
  };
}

/** Devuelve true si el equipo ya tiene al menos un campo de specs cargado */
function tieneSpecs(e: EquipoResponse): boolean {
  const s = e.especificaciones;
  if (!s) return false;
  return !!(
    s.procesador || s.nucleos != null || s.ramTotalGb != null ||
    s.discoCapacidadGb != null || s.gpuModelo || s.monitorModelo || s.redModelo
  );
}

// ── Campo de texto / número reutilizable ───────────────────────────────────
function Field({
  label, value, onChange,
  type = 'text', placeholder = '',
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <Input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="h-9 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]"
      />
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export function EspecificacionesForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Estado del formulario ────────────────────────────────────────────────
  const [form, setForm]           = useState<EspecForm>(EMPTY);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);
  const [codigoEquipo, setCodigoEquipo] = useState('');

  // ── Estado del modal "Precargar de otro equipo" ──────────────────────────
  const [showPrecargar,    setShowPrecargar]    = useState(false);
  const [precargarBusqueda, setPrecargarBusqueda] = useState('');
  const [precargarEquipos, setPrecargarEquipos]  = useState<EquipoResponse[]>([]);
  const [precargarLoading, setPrecargarLoading]  = useState(false);
  const [precargarError,   setPrecargarError]    = useState<string | null>(null);
  const [aplicandoId,      setAplicandoId]       = useState<number | null>(null);

  // ── Carga inicial del equipo actual ─────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    svc.obtenerEquipo(Number(id))
      .then(eq => {
        setCodigoEquipo(eq.codigoEjercito);
        setForm(toForm(eq.especificaciones));
      })
      .catch(() => setApiError('No se pudo cargar el equipo.'))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: keyof EspecForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // ── Guardar ──────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!id) return;
    setSaving(true); setApiError(null);
    try {
      await svc.upsertEspecificaciones(Number(id), toRequest(form));
      navigate(`/inventario/${id}`);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al guardar las especificaciones');
    } finally {
      setSaving(false);
    }
  }

  // ── Modal: abrir y cargar lista de equipos ───────────────────────────────
  async function openPrecargar() {
    setPrecargarBusqueda('');
    setPrecargarError(null);
    setShowPrecargar(true);

    // Solo cargamos la lista una vez; recargamos si estaba vacía
    if (precargarEquipos.length > 0) return;

    setPrecargarLoading(true);
    try {
      // Carga hasta 200 equipos para cubrir inventarios medianos
      const data = await svc.listarEquipos(0, 200);
      setPrecargarEquipos(data.content);
    } catch {
      setPrecargarError('No se pudo cargar la lista de equipos.');
    } finally {
      setPrecargarLoading(false);
    }
  }

  // ── Modal: aplicar specs del equipo seleccionado ─────────────────────────
  async function aplicarEspecsDe(equipoId: number) {
    setAplicandoId(equipoId);
    try {
      const eq = await svc.obtenerEquipo(equipoId);
      setForm(toForm(eq.especificaciones));
      setShowPrecargar(false);
    } catch {
      setPrecargarError('No se pudieron obtener las especificaciones del equipo seleccionado.');
    } finally {
      setAplicandoId(null);
    }
  }

  // ── Filtrado en el modal ─────────────────────────────────────────────────
  const precargarFiltrado = precargarEquipos.filter(e => {
    if (e.idEquipo === Number(id)) return false; // excluir equipo actual
    if (!precargarBusqueda.trim()) return true;
    const q = precargarBusqueda.toLowerCase();
    return (
      e.codigoEjercito.toLowerCase().includes(q) ||
      e.nombreTipo.toLowerCase().includes(q) ||
      e.nombreModelo.toLowerCase().includes(q) ||
      e.nombreArea.toLowerCase().includes(q) ||
      e.nombreResponsable.toLowerCase().includes(q)
    );
  });

  const backTo = `/inventario/${id}`;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={backTo}>
            <Button variant="outline" size="icon"
              className="border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
              Especificaciones Técnicas
            </h2>
            <p className="text-[#5C6064]">
              {codigoEquipo ? `Equipo: ${codigoEquipo}` : 'Cargando...'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Botón precargar */}
          <Button
            variant="outline"
            onClick={openPrecargar}
            disabled={loading}
            className="gap-2 border-[#4A5D23]/60 text-[#4A5D23] hover:bg-[#4A5D23]/10">
            <Copy className="w-4 h-4" />
            Precargar de otro equipo
          </Button>

          <Link to={backTo}>
            <Button variant="outline"
              className="border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white">
              Cancelar
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving || loading}
            className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Especificaciones'}
          </Button>
        </div>
      </div>

      {/* ── Cargando ────────────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-[#5C6064] py-8 text-center">Cargando datos del equipo...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Columna principal ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Procesador */}
            <Card className="border-l-4 border-l-[#4A5D23]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                  style={{ fontSize: '1rem' }}>
                  <Cpu className="w-5 h-5 text-[#4A5D23]" /> Procesador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <Field label="Modelo de Procesador" value={form.procesador}
                      placeholder="ej. Intel Core i7-1165G7"
                      onChange={v => set('procesador', v)} />
                  </div>
                  <Field label="Núcleos" value={form.nucleos} type="number"
                    placeholder="ej. 4" onChange={v => set('nucleos', v)} />
                  <Field label="Hilos" value={form.hilos} type="number"
                    placeholder="ej. 8" onChange={v => set('hilos', v)} />
                </div>
              </CardContent>
            </Card>

            {/* Memoria RAM */}
            <Card className="border-l-4 border-l-[#4A5D23]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                  style={{ fontSize: '1rem' }}>
                  <Database className="w-5 h-5 text-[#4A5D23]" /> Memoria RAM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Módulos" value={form.ramModulos} type="number"
                    placeholder="ej. 2" onChange={v => set('ramModulos', v)} />
                  <Field label="Capacidad Total (GB)" value={form.ramTotalGb} type="number"
                    placeholder="ej. 16" onChange={v => set('ramTotalGb', v)} />
                  <Field label="Velocidad (MHz)" value={form.ramVelocidadMhz} type="number"
                    placeholder="ej. 3200" onChange={v => set('ramVelocidadMhz', v)} />
                  <Field label="Marca" value={form.ramMarca}
                    placeholder="ej. Kingston" onChange={v => set('ramMarca', v)} />
                </div>
              </CardContent>
            </Card>

            {/* Almacenamiento */}
            <Card className="border-l-4 border-l-[#4A5D23]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                  style={{ fontSize: '1rem' }}>
                  <HardDrive className="w-5 h-5 text-[#4A5D23]" /> Almacenamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Modelo de Disco" value={form.discoModelo}
                    placeholder="ej. Samsung 870 EVO"
                    onChange={v => set('discoModelo', v)} />

                  <div className="space-y-1">
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Interfaz</Label>
                    <select
                      value={form.discoInterface}
                      onChange={e => set('discoInterface', e.target.value)}
                      className="w-full h-9 rounded-md border border-[#4A5D23]/30 bg-white px-3 text-sm focus:outline-none focus:border-[#4A5D23]">
                      <option value="">Sin especificar</option>
                      <option>SATA</option>
                      <option>NVMe</option>
                      <option>M.2</option>
                      <option>HDD</option>
                      <option>eMMC</option>
                      <option>SSD</option>
                    </select>
                  </div>

                  <Field label="Capacidad (GB)" value={form.discoCapacidadGb} type="number"
                    placeholder="ej. 512"
                    onChange={v => set('discoCapacidadGb', v)} />
                  <Field label="Espacio Usado (GB)" value={form.discoUsadoGb} type="number"
                    placeholder="ej. 120.50"
                    onChange={v => set('discoUsadoGb', v)} />
                  <Field label="Espacio Libre (GB)" value={form.discoLibreGb} type="number"
                    placeholder="ej. 391.50"
                    onChange={v => set('discoLibreGb', v)} />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Tarjeta Gráfica */}
            <Card className="border-t-4 border-t-[#4A5D23]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                  style={{ fontSize: '1rem' }}>
                  <Layers className="w-5 h-5 text-[#4A5D23]" /> Tarjeta Gráfica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Marca" value={form.gpuMarca}
                  placeholder="ej. NVIDIA" onChange={v => set('gpuMarca', v)} />
                <Field label="Modelo" value={form.gpuModelo}
                  placeholder="ej. RTX 3060" onChange={v => set('gpuModelo', v)} />
                <Field label="VRAM (GB)" value={form.gpuVramGb} type="number"
                  placeholder="ej. 6" onChange={v => set('gpuVramGb', v)} />
              </CardContent>
            </Card>

            {/* Monitor */}
            <Card className="border-t-4 border-t-[#4A5D23]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                  style={{ fontSize: '1rem' }}>
                  <Monitor className="w-5 h-5 text-[#4A5D23]" /> Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Marca" value={form.monitorMarca}
                  placeholder="ej. Dell" onChange={v => set('monitorMarca', v)} />
                <Field label="Modelo" value={form.monitorModelo}
                  placeholder='ej. P2422H 24"' onChange={v => set('monitorModelo', v)} />
              </CardContent>
            </Card>

            {/* Tarjeta de Red */}
            <Card className="border-t-4 border-t-[#4A5D23]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                  style={{ fontSize: '1rem' }}>
                  <Network className="w-5 h-5 text-[#4A5D23]" /> Tarjeta de Red
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Field label="Modelo" value={form.redModelo}
                  placeholder="ej. Intel I219-LM Gigabit"
                  onChange={v => set('redModelo', v)} />
              </CardContent>
            </Card>

          </div>
        </motion.div>
      )}

      {/* ── Error global ────────────────────────────────────────────────── */}
      {apiError && (
        <p className="text-sm text-[#D91E18] bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {apiError}
        </p>
      )}

      {/* ── Modal: Precargar especificaciones de otro equipo ─────────────── */}
      <Dialog open={showPrecargar} onOpenChange={setShowPrecargar}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0">

          {/* Cabecera fija */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E8E8E3]">
            <DialogTitle className="flex items-center gap-2 text-[#2C3E1F]">
              <Copy className="w-5 h-5 text-[#4A5D23]" />
              Precargar especificaciones de otro equipo
            </DialogTitle>
            <p className="text-sm text-[#5C6064] mt-1">
              Selecciona un equipo para copiar sus especificaciones al formulario.
              Podrás ajustar los campos que difieran antes de guardar.
            </p>
          </DialogHeader>

          {/* Buscador */}
          <div className="px-6 py-3 border-b border-[#E8E8E3]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6064]" />
              <Input
                value={precargarBusqueda}
                onChange={e => setPrecargarBusqueda(e.target.value)}
                placeholder="Buscar por código, tipo, modelo, área o responsable..."
                className="pl-10 h-9 border-[#4A5D23]/30 focus:border-[#4A5D23]"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de equipos */}
          <div className="flex-1 overflow-y-auto">
            {precargarLoading ? (
              <p className="text-center py-10 text-[#5C6064]">Cargando equipos...</p>
            ) : precargarError ? (
              <p className="text-center py-10 text-[#D91E18] text-sm">{precargarError}</p>
            ) : precargarFiltrado.length === 0 ? (
              <p className="text-center py-10 text-[#5C6064] text-sm">
                {precargarBusqueda ? 'Sin resultados para la búsqueda.' : 'No hay otros equipos disponibles.'}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#F9F9F6] border-b border-[#E8E8E3]">
                  <tr>
                    {['Código', 'Tipo', 'Modelo', 'Área', 'Specs'].map(h => (
                      <th key={h}
                        className="px-4 py-2 text-left text-xs text-[#5C6064] uppercase tracking-wide font-semibold">
                        {h}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {precargarFiltrado.map(e => {
                    const conSpecs = tieneSpecs(e);
                    const cargando = aplicandoId === e.idEquipo;
                    return (
                      <tr
                        key={e.idEquipo}
                        className="border-b border-[#E8E8E3] hover:bg-[#F0F4E8] transition-colors cursor-pointer"
                        onClick={() => !aplicandoId && aplicarEspecsDe(e.idEquipo)}>
                        <td className="px-4 py-3 font-mono font-semibold text-[#2C3E1F]">
                          {e.codigoEjercito}
                        </td>
                        <td className="px-4 py-3 text-[#5C6064]">{e.nombreTipo}</td>
                        <td className="px-4 py-3 text-[#2C3E1F]">{e.nombreModelo}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline"
                            className="border-[#4A5D23] text-[#4A5D23] text-xs">
                            {e.nombreArea}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {conSpecs && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                              <CheckCircle className="w-3.5 h-3.5" /> Con specs
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline" size="sm"
                            disabled={!!aplicandoId}
                            className="text-xs gap-1 border-[#4A5D23]/40 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
                            {cargando ? 'Cargando...' : 'Usar estas specs'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pie fijo */}
          <div className="px-6 py-4 border-t border-[#E8E8E3] flex items-center justify-between bg-[#F9F9F6]">
            <p className="text-xs text-[#5C6064]">
              {precargarFiltrado.length > 0 && !precargarLoading
                ? `${precargarFiltrado.length} equipo${precargarFiltrado.length !== 1 ? 's' : ''} disponible${precargarFiltrado.length !== 1 ? 's' : ''}`
                : ''}
            </p>
            <Button variant="outline" onClick={() => setShowPrecargar(false)}
              className="border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white">
              Cancelar
            </Button>
          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}
