import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Shield, Edit, KeyRound, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import * as svc from '../../services/usuarioService';
import type { UsuarioResponse, RolResponse, AreaResponse } from '../../services/usuarioService';

const ROL_COLORS: Record<string, string> = {
  ADMINISTRADOR: 'bg-red-100 text-red-700 border-red-300',
  TECNICO:       'bg-blue-100 text-blue-700 border-blue-300',
  SUPERVISOR:    'bg-purple-100 text-purple-700 border-purple-300',
};

function formatFecha(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

const EMPTY_CREATE = { nombres: '', apellidos: '', dni: '', username: '', password: '', email: '', idRol: 0, idArea: 0 };
const EMPTY_UPDATE = { nombres: '', apellidos: '', dni: '', username: '', email: '', idRol: 0, idArea: 0 };

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [roles, setRoles] = useState<RolResponse[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selected, setSelected] = useState<UsuarioResponse | null>(null);

  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editForm, setEditForm] = useState(EMPTY_UPDATE);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    return (
      u.nombres.toLowerCase().includes(q) ||
      u.apellidos.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.nombreArea.toLowerCase().includes(q)
    );
  });

  // ── Crear ─────────────────────────────────────────────────────────────────
  async function handleCreate() {
    setSaving(true);
    setFormError(null);
    try {
      await svc.crearUsuario(createForm);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  }

  // ── Editar ────────────────────────────────────────────────────────────────
  function openEdit(u: UsuarioResponse) {
    setSelected(u);
    setEditForm({ nombres: u.nombres, apellidos: u.apellidos, dni: u.dni, username: u.username, email: u.email ?? '', idRol: u.idRol, idArea: u.idArea });
    setFormError(null);
    setShowEdit(true);
  }

  async function handleEdit() {
    if (!selected) return;
    setSaving(true);
    setFormError(null);
    try {
      await svc.actualizarUsuario(selected.idUsuario, editForm);
      setShowEdit(false);
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error al actualizar usuario');
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
    setSelected(u);
    setNewPassword('');
    setFormError(null);
    setShowPassword(true);
  }

  async function handleResetPassword() {
    if (!selected) return;
    setSaving(true);
    setFormError(null);
    try {
      await svc.resetPassword(selected.idUsuario, newPassword);
      setShowPassword(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Gestión de Usuarios
          </h2>
          <p className="text-[#5C6064]">Administración de usuarios y permisos del sistema</p>
        </div>
        <Button onClick={() => { setCreateForm(EMPTY_CREATE); setFormError(null); setShowCreate(true); }}
          className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6064]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, usuario o área..."
              className="pl-10 h-10 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
                    {['Nombre Completo', 'Usuario', 'DNI', 'Rol', 'Área', 'Estado', 'Último Acceso', 'Acciones'].map((h) => (
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white" title="Editar"
                            onClick={() => openEdit(u)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5C6064] hover:bg-[#5C6064] hover:text-white" title="Resetear contraseña"
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

          {/* Paginación */}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2C3E1F]">
              <Users className="w-5 h-5 text-[#4A5D23]" /> Nuevo Usuario
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <Field label="Nombres" value={createForm.nombres} onChange={v => setCreateForm(f => ({ ...f, nombres: v }))} />
            <Field label="Apellidos" value={createForm.apellidos} onChange={v => setCreateForm(f => ({ ...f, apellidos: v }))} />
            <Field label="DNI" value={createForm.dni} onChange={v => setCreateForm(f => ({ ...f, dni: v }))} maxLength={8} />
            <Field label="Username" value={createForm.username} onChange={v => setCreateForm(f => ({ ...f, username: v }))} />
            <Field label="Contraseña" value={createForm.password} onChange={v => setCreateForm(f => ({ ...f, password: v }))} type="password" />
            <Field label="Email" value={createForm.email} onChange={v => setCreateForm(f => ({ ...f, email: v }))} type="email" />
            <SelectField label="Rol" value={createForm.idRol}
              onChange={v => setCreateForm(f => ({ ...f, idRol: Number(v) }))}
              options={roles.map(r => ({ value: r.idRol, label: r.nombreRol }))} />
            <SelectField label="Área" value={createForm.idArea}
              onChange={v => setCreateForm(f => ({ ...f, idArea: Number(v) }))}
              options={areas.map(a => ({ value: a.idArea, label: a.nombreArea }))} />
          </div>
          {formError && <p className="text-sm text-[#D91E18]">{formError}</p>}
          <DialogFooter>
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
          <div className="grid grid-cols-2 gap-4 py-2">
            <Field label="Nombres" value={editForm.nombres} onChange={v => setEditForm(f => ({ ...f, nombres: v }))} />
            <Field label="Apellidos" value={editForm.apellidos} onChange={v => setEditForm(f => ({ ...f, apellidos: v }))} />
            <Field label="DNI" value={editForm.dni} onChange={v => setEditForm(f => ({ ...f, dni: v }))} maxLength={8} />
            <Field label="Username" value={editForm.username} onChange={v => setEditForm(f => ({ ...f, username: v }))} />
            <Field label="Email" value={editForm.email} onChange={v => setEditForm(f => ({ ...f, email: v }))} type="email" className="col-span-2" />
            <SelectField label="Rol" value={editForm.idRol}
              onChange={v => setEditForm(f => ({ ...f, idRol: Number(v) }))}
              options={roles.map(r => ({ value: r.idRol, label: r.nombreRol }))} />
            <SelectField label="Área" value={editForm.idArea}
              onChange={v => setEditForm(f => ({ ...f, idArea: Number(v) }))}
              options={areas.map(a => ({ value: a.idArea, label: a.nombreArea }))} />
          </div>
          {formError && <p className="text-sm text-[#D91E18]">{formError}</p>}
          <DialogFooter>
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
          <Field label="Nueva contraseña" value={newPassword} onChange={setNewPassword} type="password" />
          {formError && <p className="text-sm text-[#D91E18]">{formError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPassword(false)}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={saving || newPassword.length < 6}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helpers de formulario ──────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', maxLength, className = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        className="h-9 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: number;
  onChange: (v: string) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-9 rounded-md border border-[#4A5D23]/30 bg-white px-3 text-sm focus:outline-none focus:border-[#4A5D23]">
        <option value={0} disabled>Seleccionar...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
