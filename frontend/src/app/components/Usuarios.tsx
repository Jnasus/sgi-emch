import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Users, Plus, Search, Shield, Edit, KeyRound,
  ToggleLeft, ToggleRight, ChevronLeft, ChevronRight,
  Eye, EyeOff,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import * as svc from '../../services/usuarioService';
import type { UsuarioResponse, RolResponse, AreaResponse } from '../../services/usuarioService';

// ── Tipos locales ──────────────────────────────────────────────────────────
type FieldErrors = Record<string, string>;

interface CreateForm {
  nombres: string; apellidos: string; dni: string; username: string;
  password: string; confirmPassword: string; email: string;
  idRol: number; idArea: number;
}
interface EditForm {
  nombres: string; apellidos: string; dni: string; username: string;
  email: string; idRol: number; idArea: number;
}
interface PwdForm { password: string; confirm: string; }

const EMPTY_CREATE: CreateForm = {
  nombres: '', apellidos: '', dni: '', username: '',
  password: '', confirmPassword: '', email: '', idRol: 0, idArea: 0,
};
const EMPTY_UPDATE: EditForm = {
  nombres: '', apellidos: '', dni: '', username: '', email: '', idRol: 0, idArea: 0,
};
const EMPTY_PWD: PwdForm = { password: '', confirm: '' };

// ── Validaciones ───────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCreate(f: CreateForm): FieldErrors {
  const e: FieldErrors = {};
  if (!f.nombres.trim())   e.nombres   = 'El nombre es obligatorio';
  if (!f.apellidos.trim()) e.apellidos = 'Los apellidos son obligatorios';
  if (!/^\d{8}$/.test(f.dni)) e.dni   = 'El DNI debe tener exactamente 8 dígitos';
  if (!f.username.trim())  e.username  = 'El usuario es obligatorio';
  if (f.password.length < 6) e.password = 'Mínimo 6 caracteres';
  if (f.confirmPassword !== f.password) e.confirmPassword = 'Las contraseñas no coinciden';
  if (f.email && !EMAIL_RE.test(f.email)) e.email = 'Formato de email inválido';
  if (!f.idRol)  e.idRol  = 'Seleccione un rol';
  if (!f.idArea) e.idArea = 'Seleccione un área';
  return e;
}

function validateEdit(f: EditForm): FieldErrors {
  const e: FieldErrors = {};
  if (!f.nombres.trim())   e.nombres   = 'El nombre es obligatorio';
  if (!f.apellidos.trim()) e.apellidos = 'Los apellidos son obligatorios';
  if (!/^\d{8}$/.test(f.dni)) e.dni   = 'El DNI debe tener exactamente 8 dígitos';
  if (!f.username.trim())  e.username  = 'El usuario es obligatorio';
  if (f.email && !EMAIL_RE.test(f.email)) e.email = 'Formato de email inválido';
  if (!f.idRol)  e.idRol  = 'Seleccione un rol';
  if (!f.idArea) e.idArea = 'Seleccione un área';
  return e;
}

function validatePwd(f: PwdForm): FieldErrors {
  const e: FieldErrors = {};
  if (f.password.length < 6) e.password = 'Mínimo 6 caracteres';
  if (f.confirm !== f.password) e.confirm = 'Las contraseñas no coinciden';
  return e;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const ROL_COLORS: Record<string, string> = {
  ADMINISTRADOR: 'bg-red-100 text-red-700 border-red-300',
  TECNICO:       'bg-blue-100 text-blue-700 border-blue-300',
  SUPERVISOR:    'bg-purple-100 text-purple-700 border-purple-300',
};

function formatFecha(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

// ── Componente principal ───────────────────────────────────────────────────
export function Usuarios() {
  const [usuarios, setUsuarios]   = useState<UsuarioResponse[]>([]);
  const [roles, setRoles]         = useState<RolResponse[]>([]);
  const [areas, setAreas]         = useState<AreaResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showCreate,   setShowCreate]   = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selected,     setSelected]     = useState<UsuarioResponse | null>(null);

  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [editForm,   setEditForm]   = useState<EditForm>(EMPTY_UPDATE);
  const [pwdForm,    setPwdForm]    = useState<PwdForm>(EMPTY_PWD);

  const [createErrors, setCreateErrors] = useState<FieldErrors>({});
  const [editErrors,   setEditErrors]   = useState<FieldErrors>({});
  const [pwdErrors,    setPwdErrors]    = useState<FieldErrors>({});
  const [apiError,     setApiError]     = useState<string | null>(null);
  const [saving,       setSaving]       = useState(false);

  // ── Carga ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [data, r, a] = await Promise.all([
        svc.listarUsuarios(page),
        roles.length ? Promise.resolve(roles) : svc.listarRoles(),
        areas.length ? Promise.resolve(areas) : svc.listarAreas(),
      ]);
      setUsuarios(data.content);
      setTotalPages(data.totalPages);
      if (!roles.length) setRoles(r as RolResponse[]);
      if (!areas.length) setAreas(a as AreaResponse[]);
    } catch {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const filtered = usuarios.filter((u) => {
    const q = search.toLowerCase();
    return u.nombres.toLowerCase().includes(q)
      || u.apellidos.toLowerCase().includes(q)
      || u.username.toLowerCase().includes(q)
      || u.nombreArea.toLowerCase().includes(q);
  });

  // ── Crear ─────────────────────────────────────────────────────────────────
  async function handleCreate() {
    const errs = validateCreate(createForm);
    setCreateErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true); setApiError(null);
    try {
      const { confirmPassword: _, ...payload } = createForm;
      await svc.crearUsuario(payload);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      await load();
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  }

  // ── Editar ────────────────────────────────────────────────────────────────
  function openEdit(u: UsuarioResponse) {
    setSelected(u);
    setEditForm({ nombres: u.nombres, apellidos: u.apellidos, dni: u.dni,
      username: u.username, email: u.email ?? '', idRol: u.idRol, idArea: u.idArea });
    setEditErrors({}); setApiError(null); setShowEdit(true);
  }

  async function handleEdit() {
    const errs = validateEdit(editForm);
    setEditErrors(errs);
    if (Object.keys(errs).length || !selected) return;
    setSaving(true); setApiError(null);
    try {
      await svc.actualizarUsuario(selected.idUsuario, editForm);
      setShowEdit(false);
      await load();
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle estado ─────────────────────────────────────────────────────────
  async function handleToggleEstado(u: UsuarioResponse) {
    try {
      await svc.cambiarEstado(u.idUsuario, !u.activo);
      await load();
    } catch {
      alert('No se pudo cambiar el estado del usuario.');
    }
  }

  // ── Reset password ────────────────────────────────────────────────────────
  function openPassword(u: UsuarioResponse) {
    setSelected(u); setPwdForm(EMPTY_PWD);
    setPwdErrors({}); setApiError(null); setShowPassword(true);
  }

  async function handleResetPassword() {
    const errs = validatePwd(pwdForm);
    setPwdErrors(errs);
    if (Object.keys(errs).length || !selected) return;
    setSaving(true); setApiError(null);
    try {
      await svc.resetPassword(selected.idUsuario, pwdForm.password);
      setShowPassword(false);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
            style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Gestión de Usuarios
          </h2>
          <p className="text-[#5C6064]">Administración de usuarios y permisos del sistema</p>
        </div>
        <Button onClick={() => { setCreateForm(EMPTY_CREATE); setCreateErrors({}); setApiError(null); setShowCreate(true); }}
          className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6064]" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, usuario o área..."
              className="pl-10 h-10 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-12 text-[#5C6064]">Cargando usuarios...</p>
          ) : error ? (
            <p className="text-center py-12 text-[#D91E18]">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
                    {['Nombre Completo', 'Usuario', 'DNI', 'Rol', 'Área', 'Estado', 'Último Acceso', 'Acciones'].map(h => (
                      <TableHead key={h} className={`text-white uppercase tracking-wide text-xs ${h === 'Acciones' ? 'text-right' : ''}`}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-[#5C6064]">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((u, i) => (
                    <motion.tr key={u.idUsuario}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6] transition-colors">
                      <TableCell className="font-semibold text-[#2C3E1F]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#4A5D23] flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          {u.apellidos}, {u.nombres}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-[#5C6064]">{u.username}</TableCell>
                      <TableCell className="font-mono text-sm text-[#5C6064]">{u.dni}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border text-xs ${ROL_COLORS[u.nombreRol] ?? 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                          {u.nombreRol}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#5C6064]">{u.nombreArea}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={u.activo
                          ? 'border-green-500 text-green-700 bg-green-50'
                          : 'border-gray-400 text-gray-600 bg-gray-50'}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#5C6064]">{formatFecha(u.ultimoAcceso)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Editar"
                            className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                            onClick={() => openEdit(u)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Resetear contraseña"
                            className="h-8 w-8 text-[#5C6064] hover:bg-[#5C6064] hover:text-white"
                            onClick={() => openPassword(u)}>
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title={u.activo ? 'Desactivar' : 'Activar'}
                            className={`h-8 w-8 ${u.activo ? 'text-[#D91E18] hover:bg-[#D91E18]' : 'text-green-600 hover:bg-green-600'} hover:text-white`}
                            onClick={() => handleToggleEstado(u)}>
                            {u.activo ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E8E3]">
              <span className="text-sm text-[#5C6064]">Página {page + 1} de {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modal Crear ───────────────────────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2C3E1F]">
              <Users className="w-5 h-5 text-[#4A5D23]" /> Nuevo Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 py-2">
            <Field label="Nombres *" value={createForm.nombres} error={createErrors.nombres}
              onChange={v => { setCreateForm(f => ({ ...f, nombres: v })); setCreateErrors(e => ({ ...e, nombres: '' })); }} />
            <Field label="Apellidos *" value={createForm.apellidos} error={createErrors.apellidos}
              onChange={v => { setCreateForm(f => ({ ...f, apellidos: v })); setCreateErrors(e => ({ ...e, apellidos: '' })); }} />
            <Field label="DNI *" value={createForm.dni} error={createErrors.dni} maxLength={8}
              onChange={v => { setCreateForm(f => ({ ...f, dni: v.replace(/\D/g, '') })); setCreateErrors(e => ({ ...e, dni: '' })); }} />
            <Field label="Username *" value={createForm.username} error={createErrors.username}
              onChange={v => { setCreateForm(f => ({ ...f, username: v })); setCreateErrors(e => ({ ...e, username: '' })); }} />
            <Field label="Email" value={createForm.email} type="email" error={createErrors.email} className="col-span-2"
              onChange={v => { setCreateForm(f => ({ ...f, email: v })); setCreateErrors(e => ({ ...e, email: '' })); }} />
            <PasswordField label="Contraseña *" value={createForm.password} error={createErrors.password}
              onChange={v => { setCreateForm(f => ({ ...f, password: v })); setCreateErrors(e => ({ ...e, password: '' })); }} />
            <PasswordField label="Confirmar contraseña *" value={createForm.confirmPassword} error={createErrors.confirmPassword}
              onChange={v => { setCreateForm(f => ({ ...f, confirmPassword: v })); setCreateErrors(e => ({ ...e, confirmPassword: '' })); }} />
            <SelectField label="Rol *" value={createForm.idRol} error={createErrors.idRol}
              onChange={v => { setCreateForm(f => ({ ...f, idRol: Number(v) })); setCreateErrors(e => ({ ...e, idRol: '' })); }}
              options={roles.map(r => ({ value: r.idRol, label: r.nombreRol }))} />
            <SelectField label="Área *" value={createForm.idArea} error={createErrors.idArea}
              onChange={v => { setCreateForm(f => ({ ...f, idArea: Number(v) })); setCreateErrors(e => ({ ...e, idArea: '' })); }}
              options={areas.map(a => ({ value: a.idArea, label: a.nombreArea }))} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18] mt-1">{apiError}</p>}
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Editar ──────────────────────────────────────────────────────── */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2C3E1F]">
              <Edit className="w-5 h-5 text-[#4A5D23]" /> Editar Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 py-2">
            <Field label="Nombres *" value={editForm.nombres} error={editErrors.nombres}
              onChange={v => { setEditForm(f => ({ ...f, nombres: v })); setEditErrors(e => ({ ...e, nombres: '' })); }} />
            <Field label="Apellidos *" value={editForm.apellidos} error={editErrors.apellidos}
              onChange={v => { setEditForm(f => ({ ...f, apellidos: v })); setEditErrors(e => ({ ...e, apellidos: '' })); }} />
            <Field label="DNI *" value={editForm.dni} error={editErrors.dni} maxLength={8}
              onChange={v => { setEditForm(f => ({ ...f, dni: v.replace(/\D/g, '') })); setEditErrors(e => ({ ...e, dni: '' })); }} />
            <Field label="Username *" value={editForm.username} error={editErrors.username}
              onChange={v => { setEditForm(f => ({ ...f, username: v })); setEditErrors(e => ({ ...e, username: '' })); }} />
            <Field label="Email" value={editForm.email} type="email" error={editErrors.email} className="col-span-2"
              onChange={v => { setEditForm(f => ({ ...f, email: v })); setEditErrors(e => ({ ...e, email: '' })); }} />
            <SelectField label="Rol *" value={editForm.idRol} error={editErrors.idRol}
              onChange={v => { setEditForm(f => ({ ...f, idRol: Number(v) })); setEditErrors(e => ({ ...e, idRol: '' })); }}
              options={roles.map(r => ({ value: r.idRol, label: r.nombreRol }))} />
            <SelectField label="Área *" value={editForm.idArea} error={editErrors.idArea}
              onChange={v => { setEditForm(f => ({ ...f, idArea: Number(v) })); setEditErrors(e => ({ ...e, idArea: '' })); }}
              options={areas.map(a => ({ value: a.idArea, label: a.nombreArea }))} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18] mt-1">{apiError}</p>}
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Reset Password ──────────────────────────────────────────────── */}
      <Dialog open={showPassword} onOpenChange={setShowPassword}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2C3E1F]">
              <KeyRound className="w-5 h-5 text-[#4A5D23]" /> Resetear Contraseña
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#5C6064]">
            Usuario: <span className="font-semibold text-[#2C3E1F]">{selected?.username}</span>
          </p>
          <div className="space-y-1 mt-1">
            <PasswordField label="Nueva contraseña *" value={pwdForm.password} error={pwdErrors.password}
              onChange={v => { setPwdForm(f => ({ ...f, password: v })); setPwdErrors(e => ({ ...e, password: '' })); }} />
            <PasswordField label="Confirmar contraseña *" value={pwdForm.confirm} error={pwdErrors.confirm}
              onChange={v => { setPwdForm(f => ({ ...f, confirm: v })); setPwdErrors(e => ({ ...e, confirm: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18] mt-1">{apiError}</p>}
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowPassword(false)}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Componentes de formulario ──────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', maxLength, error, className = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; error?: string; className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <Input type={type} value={value} maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        className={`h-9 ${error ? 'border-[#D91E18] focus:border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`} />
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}

function PasswordField({ label, value, onChange, error }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <div className="relative">
        <Input type={show ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)}
          className={`h-9 pr-10 ${error ? 'border-[#D91E18] focus:border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`} />
        <button type="button" tabIndex={-1}
          onClick={() => setShow(s => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5C6064] hover:text-[#2C3E1F]">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
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
