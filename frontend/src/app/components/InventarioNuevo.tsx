import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import * as svc from '../../services/inventarioService';
import type {
  TipoEquipoResponse, MarcaResponse, ModeloResponse,
  SistemaOperativoResponse, AreaCatResponse,
} from '../../services/inventarioService';

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

                <SelectField label="Tipo de Equipo *" value={form.idTipo} error={errors.idTipo}
                  options={tipos.map(t => ({ value: t.idTipo, label: t.nombreTipo }))}
                  onChange={v => { setForm(f => ({ ...f, idTipo: Number(v) })); setErrors(e => ({ ...e, idTipo: '' })); }} />

                <SelectField label="Marca *" value={form.idMarca} error={errors.idMarca}
                  options={marcas.map(m => ({ value: m.idMarca, label: m.nombreMarca }))}
                  onChange={handleMarcaChange} />

                <SelectField label="Modelo *" value={form.idModelo} error={errors.idModelo}
                  options={modelos.map(m => ({ value: m.idModelo, label: m.nombreModelo }))}
                  disabled={!form.idMarca}
                  onChange={v => { setForm(f => ({ ...f, idModelo: Number(v) })); setErrors(e => ({ ...e, idModelo: '' })); }} />

                <SelectField label="Área *" value={form.idArea} error={errors.idArea}
                  options={areas.map(a => ({ value: a.idArea, label: a.nombreArea }))}
                  onChange={v => { setForm(f => ({ ...f, idArea: Number(v) })); setErrors(e => ({ ...e, idArea: '' })); }} />

                <SelectField label="Sistema Operativo *" value={form.idSo} error={errors.idSo}
                  options={sos.map(s => ({ value: s.idSo, label: `${s.nombreSo} ${s.versionSo ?? ''}`.trim() }))}
                  onChange={v => { setForm(f => ({ ...f, idSo: Number(v) })); setErrors(e => ({ ...e, idSo: '' })); }} />

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
    </div>
  );
}
