import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Tag, Cpu, Monitor, Layers, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import * as svc from '../../services/catalogoService';
import type {
  TipoEquipoResponse, TipoEquipoRequest,
  MarcaResponse, MarcaRequest,
  ModeloResponse, ModeloRequest,
  SistemaOperativoResponse, SistemaOperativoRequest,
  AreaResponse, AreaRequest,
} from '../../services/catalogoService';

// ── Componente Field reutilizable ─────────────────────────────────────────
type FieldErrors = Record<string, string>;

function Field({ label, value, onChange, type = 'text', maxLength, error, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; error?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <Input type={type} value={value} maxLength={maxLength} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`h-9 ${error ? 'border-[#D91E18] focus:border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`} />
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error }: {
  label: string; value: number; onChange: (v: string) => void;
  options: { value: number; label: string }[]; error?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`w-full h-9 rounded-md border bg-white px-3 text-sm focus:outline-none
          ${error ? 'border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`}>
        <option value={0} disabled>Seleccionar...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}

// ── Tipos de Equipo Tab ────────────────────────────────────────────────────
function TiposTab() {
  const [items, setItems]     = useState<TipoEquipoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<TipoEquipoResponse | null>(null);
  const [form, setForm]         = useState<TipoEquipoRequest>({ nombreTipo: '', descripcion: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listarTipos()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ nombreTipo: '', descripcion: '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: TipoEquipoResponse) {
    setEditing(item);
    setForm({ nombreTipo: item.nombreTipo, descripcion: item.descripcion ?? '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.nombreTipo.trim()) e.nombreTipo = 'El nombre es obligatorio';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarTipo(editing.idTipo, form);
        setItems(prev => prev.map(i => i.idTipo === updated.idTipo ? updated : i));
      } else {
        const created = await svc.crearTipo(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} tipos registrados</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nuevo Tipo
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Nombre</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Descripción</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idTipo} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="font-semibold text-[#2C3E1F] text-sm">{item.nombreTipo}</TableCell>
                <TableCell className="text-[#5C6064] text-sm">{item.descripcion || '—'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Tipo de Equipo' : 'Nuevo Tipo de Equipo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Nombre *" value={form.nombreTipo} error={errors.nombreTipo} maxLength={50}
              onChange={v => { setForm(f => ({ ...f, nombreTipo: v })); setErrors(e => ({ ...e, nombreTipo: '' })); }} />
            <Field label="Descripción" value={form.descripcion ?? ''} maxLength={255}
              onChange={v => setForm(f => ({ ...f, descripcion: v }))} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Marcas Tab ────────────────────────────────────────────────────────────
function MarcasTab() {
  const [items, setItems]       = useState<MarcaResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<MarcaResponse | null>(null);
  const [form, setForm]         = useState<MarcaRequest>({ nombreMarca: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listarMarcas()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null); setForm({ nombreMarca: '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: MarcaResponse) {
    setEditing(item); setForm({ nombreMarca: item.nombreMarca });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.nombreMarca.trim()) e.nombreMarca = 'El nombre es obligatorio';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarMarca(editing.idMarca, form);
        setItems(prev => prev.map(i => i.idMarca === updated.idMarca ? updated : i));
      } else {
        const created = await svc.crearMarca(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} marcas registradas</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nueva Marca
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Nombre</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idMarca} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="font-semibold text-[#2C3E1F] text-sm">{item.nombreMarca}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Marca' : 'Nueva Marca'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Field label="Nombre *" value={form.nombreMarca} error={errors.nombreMarca} maxLength={80}
              onChange={v => { setForm({ nombreMarca: v }); setErrors(e => ({ ...e, nombreMarca: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Modelos Tab ───────────────────────────────────────────────────────────
function ModelosTab() {
  const [items, setItems]       = useState<ModeloResponse[]>([]);
  const [marcas, setMarcas]     = useState<MarcaResponse[]>([]);
  const [tipos, setTipos]       = useState<TipoEquipoResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<ModeloResponse | null>(null);
  const [form, setForm]         = useState<ModeloRequest>({ idMarca: 0, idTipo: 0, nombreModelo: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t, all] = await Promise.all([svc.listarMarcas(), svc.listarTipos(), svc.listarModelos()]);
      setMarcas(m); setTipos(t); setItems(all);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null); setForm({ idMarca: 0, idTipo: 0, nombreModelo: '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: ModeloResponse) {
    setEditing(item);
    setForm({ idMarca: item.idMarca, idTipo: item.idTipo, nombreModelo: item.nombreModelo });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.idMarca) e.idMarca = 'Seleccione la marca';
    if (!form.idTipo) e.idTipo = 'Seleccione el tipo';
    if (!form.nombreModelo.trim()) e.nombreModelo = 'El nombre es obligatorio';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarModelo(editing.idModelo, form);
        setItems(prev => prev.map(i => i.idModelo === updated.idModelo ? updated : i));
      } else {
        const created = await svc.crearModelo(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} modelos registrados</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nuevo Modelo
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Marca</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Tipo</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Modelo</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idModelo} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="text-[#5C6064] text-sm">{item.nombreMarca}</TableCell>
                <TableCell className="text-[#5C6064] text-sm">{item.nombreTipo}</TableCell>
                <TableCell className="font-semibold text-[#2C3E1F] text-sm">{item.nombreModelo}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Modelo' : 'Nuevo Modelo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <SelectField label="Marca *" value={form.idMarca} error={errors.idMarca}
              options={marcas.map(m => ({ value: m.idMarca, label: m.nombreMarca }))}
              onChange={v => { setForm(f => ({ ...f, idMarca: Number(v) })); setErrors(e => ({ ...e, idMarca: '' })); }} />
            <SelectField label="Tipo de Equipo *" value={form.idTipo} error={errors.idTipo}
              options={tipos.map(t => ({ value: t.idTipo, label: t.nombreTipo }))}
              onChange={v => { setForm(f => ({ ...f, idTipo: Number(v) })); setErrors(e => ({ ...e, idTipo: '' })); }} />
            <Field label="Nombre del Modelo *" value={form.nombreModelo} error={errors.nombreModelo} maxLength={80}
              onChange={v => { setForm(f => ({ ...f, nombreModelo: v })); setErrors(e => ({ ...e, nombreModelo: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Sistemas Operativos Tab ───────────────────────────────────────────────
function SistemasOperativosTab() {
  const [items, setItems]       = useState<SistemaOperativoResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<SistemaOperativoResponse | null>(null);
  const [form, setForm]         = useState<SistemaOperativoRequest>({ nombreSo: '', versionSo: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listarSO()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null); setForm({ nombreSo: '', versionSo: '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: SistemaOperativoResponse) {
    setEditing(item); setForm({ nombreSo: item.nombreSo, versionSo: item.versionSo });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.nombreSo.trim()) e.nombreSo = 'El nombre es obligatorio';
    if (!form.versionSo.trim()) e.versionSo = 'La versión es obligatoria';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarSO(editing.idSo, form);
        setItems(prev => prev.map(i => i.idSo === updated.idSo ? updated : i));
      } else {
        const created = await svc.crearSO(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} sistemas operativos registrados</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nuevo SO
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Sistema Operativo</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Versión</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idSo} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="font-semibold text-[#2C3E1F] text-sm">{item.nombreSo}</TableCell>
                <TableCell className="text-[#5C6064] text-sm">{item.versionSo}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Sistema Operativo' : 'Nuevo Sistema Operativo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Nombre *" value={form.nombreSo} error={errors.nombreSo} maxLength={80}
              placeholder="Windows, Ubuntu, macOS..."
              onChange={v => { setForm(f => ({ ...f, nombreSo: v })); setErrors(e => ({ ...e, nombreSo: '' })); }} />
            <Field label="Versión *" value={form.versionSo} error={errors.versionSo} maxLength={50}
              placeholder="11 Pro, 22.04 LTS, Ventura..."
              onChange={v => { setForm(f => ({ ...f, versionSo: v })); setErrors(e => ({ ...e, versionSo: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Áreas Tab ─────────────────────────────────────────────────────────────
function AreasTab() {
  const [items, setItems]       = useState<AreaResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<AreaResponse | null>(null);
  const [form, setForm]         = useState<AreaRequest>({
    codigoArea: '', nombreArea: '', descripcion: '',
    anioVigencia: new Date().getFullYear(),
  });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listarAreas()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ codigoArea: '', nombreArea: '', descripcion: '', anioVigencia: new Date().getFullYear() });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: AreaResponse) {
    setEditing(item);
    setForm({
      codigoArea: item.codigoArea, nombreArea: item.nombreArea,
      descripcion: item.descripcion ?? '', anioVigencia: item.anioVigencia,
    });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.codigoArea.trim()) e.codigoArea = 'El código es obligatorio';
    if (!form.nombreArea.trim()) e.nombreArea = 'El nombre es obligatorio';
    if (!form.anioVigencia || form.anioVigencia < 2000) e.anioVigencia = 'Año inválido';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarArea(editing.idArea, form);
        setItems(prev => prev.map(i => i.idArea === updated.idArea ? updated : i));
      } else {
        const created = await svc.crearArea(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} áreas registradas</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nueva Área
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Código</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Nombre</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Año Vigencia</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idArea} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="font-mono font-semibold text-[#2C3E1F] text-sm">{item.codigoArea}</TableCell>
                <TableCell className="text-[#2C3E1F] text-sm">{item.nombreArea}</TableCell>
                <TableCell className="text-[#5C6064] text-sm">{item.anioVigencia}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Área' : 'Nueva Área'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Código *" value={form.codigoArea} error={errors.codigoArea} maxLength={20}
              placeholder="DTIC, LOGISTICA, RRHH..."
              onChange={v => { setForm(f => ({ ...f, codigoArea: v.toUpperCase() })); setErrors(e => ({ ...e, codigoArea: '' })); }} />
            <Field label="Nombre *" value={form.nombreArea} error={errors.nombreArea} maxLength={100}
              onChange={v => { setForm(f => ({ ...f, nombreArea: v })); setErrors(e => ({ ...e, nombreArea: '' })); }} />
            <Field label="Descripción" value={form.descripcion ?? ''} maxLength={255}
              onChange={v => setForm(f => ({ ...f, descripcion: v }))} />
            <Field label="Año de Vigencia *" value={String(form.anioVigencia)} type="number"
              error={errors.anioVigencia}
              onChange={v => { setForm(f => ({ ...f, anioVigencia: Number(v) })); setErrors(e => ({ ...e, anioVigencia: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export function Catalogos() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
          style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          Configuración — Catálogos
        </h2>
        <p className="text-[#5C6064]">Administración de tablas maestras del sistema</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="tipos">
            <TabsList className="mb-6 bg-[#F5F5F0] border border-[#E8E8E3]">
              <TabsTrigger value="tipos" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <Tag className="w-4 h-4" /> Tipos de Equipo
              </TabsTrigger>
              <TabsTrigger value="marcas" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <Layers className="w-4 h-4" /> Marcas
              </TabsTrigger>
              <TabsTrigger value="modelos" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <Monitor className="w-4 h-4" /> Modelos
              </TabsTrigger>
              <TabsTrigger value="so" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <Cpu className="w-4 h-4" /> Sistemas Operativos
              </TabsTrigger>
              <TabsTrigger value="areas" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <MapPin className="w-4 h-4" /> Áreas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tipos"><TiposTab /></TabsContent>
            <TabsContent value="marcas"><MarcasTab /></TabsContent>
            <TabsContent value="modelos"><ModelosTab /></TabsContent>
            <TabsContent value="so"><SistemasOperativosTab /></TabsContent>
            <TabsContent value="areas"><AreasTab /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
