import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Package, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import * as svc from '../../services/inventarioService';
import type {
  TipoEquipoResponse, MarcaResponse, ModeloResponse,
  SistemaOperativoResponse, AreaCatResponse,
} from '../../services/inventarioService';
import * as catalogoSvc from '../../services/catalogoService';

// ── Tipos locales ──────────────────────────────────────────────────────────
type FieldErrors = Record<string, string>;

interface EquipoForm {
  codigoEjercito: string;
  idTipo: number;
  idMarca: number;
  idModelo: number;
  idArea: number;
  idSo: number;
  numeroSerie: string;
  nombreResponsable: string;
  macAddress: string;
  ipAddress: string;
  tipoRed: string;
  fechaAdquisicion: string;
  observaciones: string;
}

const EMPTY: EquipoForm = {
  codigoEjercito: '', idTipo: 0, idMarca: 0, idModelo: 0, idArea: 0, idSo: 0,
  numeroSerie: '', nombreResponsable: '', macAddress: '',
  ipAddress: '', tipoRed: '', fechaAdquisicion: '', observaciones: '',
};

const MAC_RE = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

function validate(f: EquipoForm): FieldErrors {
  const e: FieldErrors = {};
  if (!f.codigoEjercito.trim()) e.codigoEjercito = 'El código ejército es obligatorio';
  else if (f.codigoEjercito.length > 20) e.codigoEjercito = 'Máximo 20 caracteres';
  if (!f.idTipo)  e.idTipo  = 'Seleccione el tipo de equipo';
  if (!f.idMarca) e.idMarca = 'Seleccione la marca';
  if (!f.idModelo) e.idModelo = 'Seleccione el modelo';
  if (!f.idArea)  e.idArea  = 'Seleccione el área';
  if (!f.idSo)    e.idSo    = 'Seleccione el sistema operativo';
  if (!f.numeroSerie.trim()) e.numeroSerie = 'El número de serie es obligatorio';
  else if (f.numeroSerie.length > 80) e.numeroSerie = 'Máximo 80 caracteres';
  if (!f.nombreResponsable.trim()) e.nombreResponsable = 'El responsable es obligatorio';
  else if (f.nombreResponsable.length > 150) e.nombreResponsable = 'Máximo 150 caracteres';
  if (f.macAddress && !MAC_RE.test(f.macAddress)) e.macAddress = 'Formato: XX:XX:XX:XX:XX:XX';
  return e;
}

// ── Componentes de campo ───────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', maxLength, error, className = '', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; error?: string; className?: string; placeholder?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <Input type={type} value={value} maxLength={maxLength} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`h-9 ${error ? 'border-[#D91E18] focus:border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`} />
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error, disabled = false }: {
  label: string; value: number; onChange: (v: string) => void;
  options: { value: number; label: string }[]; error?: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className={`w-full h-9 rounded-md border bg-white px-3 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`}>
        <option value={0} disabled>Seleccionar...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}

function SelectWithPlus({ label, value, onChange, options, error, disabled = false, onPlus }: {
  label: string; value: number; onChange: (v: string) => void;
  options: { value: number; label: string }[]; error?: string;
  disabled?: boolean; onPlus: () => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <div className="flex gap-2">
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          className={`flex-1 h-9 rounded-md border bg-white px-3 text-sm focus:outline-none disabled:opacity-50
            ${error ? 'border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`}>
          <option value={0} disabled>Seleccionar...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" onClick={onPlus} title={`Nuevo ${label}`}
          className="h-9 w-9 flex items-center justify-center rounded-md border border-[#4A5D23]/30 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export function InventarioNuevo() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm]         = useState<EquipoForm>(EMPTY);
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);

  const [tipos, setTipos]     = useState<TipoEquipoResponse[]>([]);
  const [marcas, setMarcas]   = useState<MarcaResponse[]>([]);
  const [modelos, setModelos] = useState<ModeloResponse[]>([]);
  const [sos, setSos]         = useState<SistemaOperativoResponse[]>([]);
  const [areas, setAreas]     = useState<AreaCatResponse[]>([]);

  // quick-create modals
  const [showPlusTipo,   setShowPlusTipo]   = useState(false);
  const [showPlusMarca,  setShowPlusMarca]  = useState(false);
  const [showPlusModelo, setShowPlusModelo] = useState(false);
  const [showPlusSo,     setShowPlusSo]     = useState(false);
  const [showPlusArea,   setShowPlusArea]   = useState(false);
  const [plusSaving,     setPlusSaving]     = useState(false);
  const [plusError,      setPlusError]      = useState<string | null>(null);
  const [plusTipo,   setPlusTipo]   = useState('');
  const [plusMarca,  setPlusMarca]  = useState('');
  const [plusModelo, setPlusModelo] = useState({ idMarca: 0, idTipo: 0, nombre: '' });
  const [plusSo,     setPlusSo]     = useState({ nombre: '', version: '' });
  const [plusArea,   setPlusArea]   = useState({ codigo: '', nombre: '', anio: new Date().getFullYear() });

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [t, m, s, a, allModelos] = await Promise.all([
          svc.listarTipos(),
          svc.listarMarcas(),
          svc.listarSO(),
          svc.listarAreas(),
          isEdit ? svc.listarModelos() : Promise.resolve<ModeloResponse[]>([]),
        ]);
        setTipos(t);
        setMarcas(m);
        setSos(s);
        setAreas(a);

        if (isEdit && id) {
          const equipo = await svc.obtenerEquipo(Number(id));
          const modeloEncontrado = allModelos.find(mo => mo.idModelo === equipo.idModelo);
          const idMarca = modeloEncontrado?.idMarca ?? 0;
          setModelos(allModelos.filter(mo => mo.idMarca === idMarca));
          setForm({
            codigoEjercito: equipo.codigoEjercito,
            idTipo: equipo.idTipo,
            idMarca,
            idModelo: equipo.idModelo,
            idArea: equipo.idArea,
            idSo: equipo.idSo,
            numeroSerie: equipo.numeroSerie,
            nombreResponsable: equipo.nombreResponsable,
            macAddress: equipo.macAddress ?? '',
            ipAddress: equipo.ipAddress ?? '',
            tipoRed: equipo.tipoRed ?? '',
            fechaAdquisicion: equipo.fechaAdquisicion ?? '',
            observaciones: equipo.observaciones ?? '',
          });
        }
      } catch {
        setApiError('No se pudieron cargar los datos necesarios.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEdit]);

  async function handleMarcaChange(idMarcaStr: string) {
    const idMarca = Number(idMarcaStr);
    setForm(f => ({ ...f, idMarca, idModelo: 0 }));
    setErrors(e => ({ ...e, idMarca: '', idModelo: '' }));
    if (!idMarca) { setModelos([]); return; }
    try {
      const m = await svc.listarModelos(idMarca);
      setModelos(m);
    } catch {
      setModelos([]);
    }
  }

  async function handleSubmit() {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true); setApiError(null);
    const payload: svc.EquipoRequest = {
      codigoEjercito: form.codigoEjercito.trim(),
      idTipo: form.idTipo,
      idModelo: form.idModelo,
      idArea: form.idArea,
      idSo: form.idSo,
      numeroSerie: form.numeroSerie.trim(),
      nombreResponsable: form.nombreResponsable.trim(),
      macAddress: form.macAddress || undefined,
      ipAddress: form.ipAddress || undefined,
      tipoRed: form.tipoRed || undefined,
      fechaAdquisicion: form.fechaAdquisicion || undefined,
      observaciones: form.observaciones || undefined,
    };

    try {
      if (isEdit && id) {
        await svc.actualizarEquipo(Number(id), payload);
        navigate(`/inventario/${id}`);
      } else {
        const created = await svc.crearEquipo(payload);
        navigate(`/inventario/${created.idEquipo}`);
      }
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al guardar el equipo');
    } finally {
      setSaving(false);
    }
  }

  async function quickCreateTipo() {
    if (!plusTipo.trim()) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearTipo({ nombreTipo: plusTipo.trim() });
      setTipos(prev => [...prev, created]);
      setForm(f => ({ ...f, idTipo: created.idTipo }));
      setErrors(e => ({ ...e, idTipo: '' }));
      setShowPlusTipo(false); setPlusTipo('');
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  async function quickCreateMarca() {
    if (!plusMarca.trim()) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearMarca({ nombreMarca: plusMarca.trim() });
      setMarcas(prev => [...prev, created]);
      setModelos([]);
      setForm(f => ({ ...f, idMarca: created.idMarca, idModelo: 0 }));
      setErrors(e => ({ ...e, idMarca: '', idModelo: '' }));
      setShowPlusMarca(false); setPlusMarca('');
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  async function quickCreateModelo() {
    if (!plusModelo.nombre.trim() || !plusModelo.idMarca || !plusModelo.idTipo) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearModelo({
        idMarca: plusModelo.idMarca, idTipo: plusModelo.idTipo, nombreModelo: plusModelo.nombre.trim(),
      });
      setModelos(prev => [...prev, created]);
      setForm(f => ({ ...f, idModelo: created.idModelo }));
      setErrors(e => ({ ...e, idModelo: '' }));
      setShowPlusModelo(false); setPlusModelo({ idMarca: form.idMarca, idTipo: form.idTipo, nombre: '' });
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  async function quickCreateSo() {
    if (!plusSo.nombre.trim() || !plusSo.version.trim()) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearSO({ nombreSo: plusSo.nombre.trim(), versionSo: plusSo.version.trim() });
      setSos(prev => [...prev, created]);
      setForm(f => ({ ...f, idSo: created.idSo }));
      setErrors(e => ({ ...e, idSo: '' }));
      setShowPlusSo(false); setPlusSo({ nombre: '', version: '' });
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  async function quickCreateArea() {
    if (!plusArea.codigo.trim() || !plusArea.nombre.trim()) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearArea({
        codigoArea: plusArea.codigo.trim().toUpperCase(),
        nombreArea: plusArea.nombre.trim(),
        anioVigencia: plusArea.anio,
      });
      setAreas(prev => [...prev, created]);
      setForm(f => ({ ...f, idArea: created.idArea }));
      setErrors(e => ({ ...e, idArea: '' }));
      setShowPlusArea(false); setPlusArea({ codigo: '', nombre: '', anio: new Date().getFullYear() });
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  const backTo = isEdit ? `/inventario/${id}` : '/inventario';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
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
            {isEdit ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
          </h2>
          <p className="text-[#5C6064]">
            {isEdit
              ? 'Modifique los datos del equipo'
              : 'Complete los datos del equipo para agregarlo al inventario'}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-[#5C6064] py-8 text-center">Cargando datos...</p>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-[#4A5D23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                <Package className="w-5 h-5 text-[#4A5D23]" /> Información del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Código Ejército *" value={form.codigoEjercito}
                  placeholder="EJ-2024-001XXX" maxLength={20} error={errors.codigoEjercito}
                  onChange={v => { setForm(f => ({ ...f, codigoEjercito: v })); setErrors(e => ({ ...e, codigoEjercito: '' })); }} />

                <SelectWithPlus label="Tipo de Equipo *" value={form.idTipo} error={errors.idTipo}
                  options={tipos.map(t => ({ value: t.idTipo, label: t.nombreTipo }))}
                  onChange={v => { setForm(f => ({ ...f, idTipo: Number(v) })); setErrors(e => ({ ...e, idTipo: '' })); }}
                  onPlus={() => { setPlusTipo(''); setPlusError(null); setShowPlusTipo(true); }} />

                <SelectWithPlus label="Marca *" value={form.idMarca} error={errors.idMarca}
                  options={marcas.map(m => ({ value: m.idMarca, label: m.nombreMarca }))}
                  onChange={handleMarcaChange}
                  onPlus={() => { setPlusMarca(''); setPlusError(null); setShowPlusMarca(true); }} />

                <SelectWithPlus label="Modelo *" value={form.idModelo} error={errors.idModelo}
                  options={modelos.map(m => ({ value: m.idModelo, label: m.nombreModelo }))}
                  disabled={!form.idMarca}
                  onChange={v => { setForm(f => ({ ...f, idModelo: Number(v) })); setErrors(e => ({ ...e, idModelo: '' })); }}
                  onPlus={() => { setPlusModelo({ idMarca: form.idMarca, idTipo: form.idTipo, nombre: '' }); setPlusError(null); setShowPlusModelo(true); }} />

                <SelectWithPlus label="Área *" value={form.idArea} error={errors.idArea}
                  options={areas.map(a => ({ value: a.idArea, label: a.nombreArea }))}
                  onChange={v => { setForm(f => ({ ...f, idArea: Number(v) })); setErrors(e => ({ ...e, idArea: '' })); }}
                  onPlus={() => { setPlusArea({ codigo: '', nombre: '', anio: new Date().getFullYear() }); setPlusError(null); setShowPlusArea(true); }} />

                <SelectWithPlus label="Sistema Operativo *" value={form.idSo} error={errors.idSo}
                  options={sos.map(s => ({ value: s.idSo, label: `${s.nombreSo} ${s.versionSo ?? ''}`.trim() }))}
                  onChange={v => { setForm(f => ({ ...f, idSo: Number(v) })); setErrors(e => ({ ...e, idSo: '' })); }}
                  onPlus={() => { setPlusSo({ nombre: '', version: '' }); setPlusError(null); setShowPlusSo(true); }} />

                <Field label="N° Serie *" value={form.numeroSerie}
                  placeholder="SN123456789" maxLength={80} error={errors.numeroSerie}
                  onChange={v => { setForm(f => ({ ...f, numeroSerie: v })); setErrors(e => ({ ...e, numeroSerie: '' })); }} />

                <Field label="Responsable *" value={form.nombreResponsable}
                  placeholder="Nombre completo del responsable" maxLength={150} error={errors.nombreResponsable}
                  onChange={v => { setForm(f => ({ ...f, nombreResponsable: v })); setErrors(e => ({ ...e, nombreResponsable: '' })); }} />

                <Field label="MAC Address" value={form.macAddress}
                  placeholder="AA:BB:CC:DD:EE:FF" error={errors.macAddress}
                  onChange={v => { setForm(f => ({ ...f, macAddress: v })); setErrors(e => ({ ...e, macAddress: '' })); }} />

                <Field label="IP Address" value={form.ipAddress}
                  placeholder="192.168.1.100"
                  onChange={v => setForm(f => ({ ...f, ipAddress: v }))} />

                <div className="space-y-1">
                  <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Tipo de Red</Label>
                  <select value={form.tipoRed} onChange={e => setForm(f => ({ ...f, tipoRed: e.target.value }))}
                    className="w-full h-9 rounded-md border border-[#4A5D23]/30 bg-white px-3 text-sm focus:outline-none focus:border-[#4A5D23]">
                    <option value="">Sin especificar</option>
                    <option value="ETHERNET">Ethernet</option>
                    <option value="WIFI">Wi-Fi</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>

                <Field label="Fecha de Adquisición" value={form.fechaAdquisicion}
                  type="date"
                  onChange={v => setForm(f => ({ ...f, fechaAdquisicion: v }))} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Observaciones</Label>
                <Textarea value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales sobre el equipo..."
                  className="min-h-[80px] border-[#4A5D23]/30 focus:border-[#4A5D23] resize-none" />
              </div>

              {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}

              <div className="flex gap-3 pt-4 border-t border-[#E8E8E3]">
                <Button onClick={handleSubmit} disabled={saving}
                  className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Registrar Equipo'}
                </Button>
                <Link to={backTo}>
                  <Button type="button" variant="outline"
                    className="border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Quick-create modals ─────────────────────────────────────────────── */}

      {/* Tipo */}
      <Dialog open={showPlusTipo} onOpenChange={setShowPlusTipo}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nuevo Tipo de Equipo</DialogTitle></DialogHeader>
          <div className="py-2">
            <Field label="Nombre *" value={plusTipo} placeholder="Laptop, Monitor, Switch..."
              onChange={v => { setPlusTipo(v); setPlusError(null); }} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusTipo(false)}>Cancelar</Button>
            <Button onClick={quickCreateTipo} disabled={plusSaving || !plusTipo.trim()}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Marca */}
      <Dialog open={showPlusMarca} onOpenChange={setShowPlusMarca}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nueva Marca</DialogTitle></DialogHeader>
          <div className="py-2">
            <Field label="Nombre *" value={plusMarca} placeholder="HP, Dell, Lenovo..."
              onChange={v => { setPlusMarca(v); setPlusError(null); }} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusMarca(false)}>Cancelar</Button>
            <Button onClick={quickCreateMarca} disabled={plusSaving || !plusMarca.trim()}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modelo */}
      <Dialog open={showPlusModelo} onOpenChange={setShowPlusModelo}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nuevo Modelo</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <SelectField label="Marca *" value={plusModelo.idMarca}
              options={marcas.map(m => ({ value: m.idMarca, label: m.nombreMarca }))}
              onChange={v => setPlusModelo(p => ({ ...p, idMarca: Number(v) }))} />
            <SelectField label="Tipo *" value={plusModelo.idTipo}
              options={tipos.map(t => ({ value: t.idTipo, label: t.nombreTipo }))}
              onChange={v => setPlusModelo(p => ({ ...p, idTipo: Number(v) }))} />
            <Field label="Nombre del modelo *" value={plusModelo.nombre} placeholder="EliteBook 840 G9..."
              onChange={v => { setPlusModelo(p => ({ ...p, nombre: v })); setPlusError(null); }} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusModelo(false)}>Cancelar</Button>
            <Button onClick={quickCreateModelo}
              disabled={plusSaving || !plusModelo.nombre.trim() || !plusModelo.idMarca || !plusModelo.idTipo}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SO */}
      <Dialog open={showPlusSo} onOpenChange={setShowPlusSo}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nuevo Sistema Operativo</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Nombre *" value={plusSo.nombre} placeholder="Windows, Ubuntu..."
              onChange={v => { setPlusSo(p => ({ ...p, nombre: v })); setPlusError(null); }} />
            <Field label="Versión *" value={plusSo.version} placeholder="11 Pro, 22.04 LTS..."
              onChange={v => { setPlusSo(p => ({ ...p, version: v })); setPlusError(null); }} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusSo(false)}>Cancelar</Button>
            <Button onClick={quickCreateSo}
              disabled={plusSaving || !plusSo.nombre.trim() || !plusSo.version.trim()}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Área */}
      <Dialog open={showPlusArea} onOpenChange={setShowPlusArea}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nueva Área</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Código *" value={plusArea.codigo} placeholder="DTIC, LOGISTICA..."
              onChange={v => { setPlusArea(p => ({ ...p, codigo: v.toUpperCase() })); setPlusError(null); }} />
            <Field label="Nombre *" value={plusArea.nombre}
              onChange={v => { setPlusArea(p => ({ ...p, nombre: v })); setPlusError(null); }} />
            <Field label="Año vigencia *" value={String(plusArea.anio)} type="number"
              onChange={v => setPlusArea(p => ({ ...p, anio: Number(v) }))} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusArea(false)}>Cancelar</Button>
            <Button onClick={quickCreateArea}
              disabled={plusSaving || !plusArea.codigo.trim() || !plusArea.nombre.trim()}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
