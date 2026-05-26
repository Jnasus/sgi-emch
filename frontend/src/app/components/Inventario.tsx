import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import {
  Package, Search, Filter, Plus, Edit, Eye,
  FileSpreadsheet, FileText, MoreVertical,
  CheckCircle, Clock, AlertCircle, XCircle,
  ChevronLeft, ChevronRight, RefreshCw,
  ListChecks, Loader2, X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import * as svc from '../../services/inventarioService';
import * as reporteSvc from '../../services/reporteService';
import type { EquipoResponse } from '../../services/inventarioService';

// ── Estado config ──────────────────────────────────────────────────────────
const ESTADOS = [
  { value: 'EN_BODEGA',     label: 'En Bodega',     color: 'bg-gray-100 text-gray-700 border-gray-300',    icon: Package },
  { value: 'ASIGNADO',      label: 'Asignado',      color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  { value: 'EN_REPARACION', label: 'En Reparación', color: 'bg-red-100 text-red-700 border-red-300',       icon: AlertCircle },
  { value: 'PRESTADO',      label: 'Prestado',       color: 'bg-blue-100 text-blue-700 border-blue-300',    icon: Clock },
  { value: 'DADO_DE_BAJA',  label: 'Dado de Baja',  color: 'bg-gray-100 text-gray-500 border-gray-300',    icon: XCircle },
];

function estadoInfo(valor: string) {
  return ESTADOS.find(e => e.value === valor) ?? { label: valor, color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Package };
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

// ── Componente principal ───────────────────────────────────────────────────
export function Inventario() {
  const navigate = useNavigate();
  const [equipos, setEquipos]             = useState<EquipoResponse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch]               = useState('');
  const [filterEstado, setFilterEstado]   = useState('');

  // Modal cambiar estado
  const [showEstado,  setShowEstado]  = useState(false);
  const [selected,    setSelected]    = useState<EquipoResponse | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [motivo,      setMotivo]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);

  // Exportación (para selección)
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf,   setExportingPdf]   = useState(false);
  const [exportError,    setExportError]    = useState<string | null>(null);

  // Modo selección
  const [selectionMode,    setSelectionMode]    = useState(false);
  const [selectedIds,      setSelectedIds]      = useState<Set<number>>(new Set());
  const [selectionLoading, setSelectionLoading] = useState(false);

  // ── Carga ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await svc.listarEquipos(page, 20, filterEstado || undefined);
      setEquipos(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      setError('No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }, [page, filterEstado]);

  useEffect(() => { load(); }, [load]);

  // Salir de selección si el filtro cambia
  useEffect(() => {
    if (selectionMode) exitSelectionMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado]);

  // ── Filtro cliente (búsqueda de texto sobre la página actual) ─────────────

  const filtered = equipos.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.codigoEjercito.toLowerCase().includes(q)
      || e.nombreTipo.toLowerCase().includes(q)
      || e.nombreModelo.toLowerCase().includes(q)
      || e.numeroSerie.toLowerCase().includes(q)
      || e.nombreArea.toLowerCase().includes(q)
      || e.nombreResponsable.toLowerCase().includes(q);
  });

  // ── Modo selección ─────────────────────────────────────────────────────────

  async function enterSelectionMode() {
    setSelectionLoading(true);
    try {
      // Carga todos los equipos que coinciden con el filtro actual (sin paginación)
      const all = await svc.listarEquipos(0, 9999, filterEstado || undefined);
      setSelectedIds(new Set(all.content.map(e => e.idEquipo)));
      setSelectionMode(true);
    } catch {
      // Fallback: solo la página actual visible
      setSelectedIds(new Set(filtered.map(e => e.idEquipo)));
      setSelectionMode(true);
    } finally {
      setSelectionLoading(false);
    }
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setExportError(null);
  }

  function toggleSelectionMode() {
    if (selectionMode) exitSelectionMode();
    else void enterSelectionMode();
  }

  // Toggle de un equipo individual
  function toggleItem(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Seleccionar / deseleccionar todos los de la página actual (visible en pantalla)
  const allOnPageSelected = filtered.length > 0 && filtered.every(e => selectedIds.has(e.idEquipo));
  const someOnPageSelected = filtered.some(e => selectedIds.has(e.idEquipo));

  function togglePageSelection() {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        filtered.forEach(e => next.delete(e.idEquipo));
      } else {
        filtered.forEach(e => next.add(e.idEquipo));
      }
      return next;
    });
  }

  // ── Exportación ────────────────────────────────────────────────────────────

  async function handleExportExcel() {
    setExportingExcel(true); setExportError(null);
    try {
      await reporteSvc.seleccionExcel(Array.from(selectedIds));
    } catch (e: unknown) {
      setExportError(e instanceof Error ? e.message : 'Error al exportar Excel');
    } finally {
      setExportingExcel(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true); setExportError(null);
    try {
      await reporteSvc.seleccionPdf(Array.from(selectedIds));
    } catch (e: unknown) {
      setExportError(e instanceof Error ? e.message : 'Error al exportar PDF');
    } finally {
      setExportingPdf(false);
    }
  }

  // ── Modal cambiar estado ───────────────────────────────────────────────────

  function openEstadoModal(equipo: EquipoResponse, presetEstado?: string) {
    setSelected(equipo);
    setNuevoEstado(presetEstado ?? equipo.estado);
    setMotivo('');
    setApiError(null);
    setShowEstado(true);
  }

  async function handleCambiarEstado() {
    if (!selected || !nuevoEstado) return;
    setSaving(true); setApiError(null);
    try {
      await svc.cambiarEstado(selected.idEquipo, { estado: nuevoEstado, motivo: motivo || undefined });
      setShowEstado(false);
      await load();
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cambiar estado');
    } finally {
      setSaving(false);
    }
  }

  // ── Número de columnas (cambia al entrar en modo selección) ───────────────
  const colSpanTotal = selectionMode ? 9 : 8;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
            style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Inventario de Equipos
          </h2>
          <p className="text-[#5C6064]">Gestión completa del inventario de equipos informáticos</p>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          {/* Botón modo selección */}
          <Button
            variant={selectionMode ? 'default' : 'outline'}
            disabled={selectionLoading}
            onClick={toggleSelectionMode}
            className={selectionMode
              ? 'gap-2 bg-[#2C3E1F] hover:bg-[#1a2512] text-white'
              : 'gap-2 border-[#2C3E1F] text-[#2C3E1F] hover:bg-[#2C3E1F] hover:text-white'}
          >
            {selectionLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : selectionMode
                ? <X className="w-4 h-4" />
                : <ListChecks className="w-4 h-4" />}
            {selectionLoading
              ? 'Cargando...'
              : selectionMode
                ? 'Cancelar Selección'
                : 'Seleccionar para Reporte'}
          </Button>

          {/* Excel — solo activo en modo selección con ≥1 elemento */}
          <Button
            onClick={handleExportExcel}
            disabled={!selectionMode || selectedIds.size === 0 || exportingExcel || exportingPdf}
            variant="outline"
            className="gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white disabled:opacity-40"
          >
            {exportingExcel
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FileSpreadsheet className="w-4 h-4" />}
            {exportingExcel ? 'Generando...' : 'Excel'}
          </Button>

          {/* PDF — solo activo en modo selección con ≥1 elemento */}
          <Button
            onClick={handleExportPdf}
            disabled={!selectionMode || selectedIds.size === 0 || exportingExcel || exportingPdf}
            variant="outline"
            className="gap-2 border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white disabled:opacity-40"
          >
            {exportingPdf
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FileText className="w-4 h-4" />}
            {exportingPdf ? 'Generando...' : 'PDF'}
          </Button>

          <Link to="/inventario/nuevo">
            <Button className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              <Plus className="w-4 h-4" /> Nuevo Equipo
            </Button>
          </Link>
        </div>
      </div>

      {/* Banner de selección activa */}
      {selectionMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 rounded-md border border-[#4A5D23]/40 bg-[#F0F4E8] px-4 py-2.5"
        >
          <span className="text-sm text-[#2C3E1F]">
            <strong>{selectedIds.size}</strong> equipo{selectedIds.size !== 1 ? 's' : ''} seleccionado{selectedIds.size !== 1 ? 's' : ''}.
            {' '}Marque o desmarque filas individualmente, o use el checkbox del encabezado para esta página.
          </span>
          <Button variant="ghost" size="sm" className="text-[#5C6064] h-7 px-2"
            onClick={() => setSelectedIds(new Set())}>
            Deseleccionar todos
          </Button>
        </motion.div>
      )}

      {/* Error de exportación */}
      {exportError && (
        <p className="text-sm text-[#D91E18] bg-red-50 border border-red-200 rounded-md px-4 py-2">
          {exportError}
        </p>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6064]" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por código, tipo, modelo, serie, área o responsable..."
                className="pl-10 h-10 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
            </div>
            <Select
              value={filterEstado || 'TODOS'}
              onValueChange={v => { setFilterEstado(v === 'TODOS' ? '' : v); setPage(0); }}>
              <SelectTrigger className="w-[200px] border-[#4A5D23]/30 h-10">
                <Filter className="w-4 h-4 mr-2 text-[#5C6064]" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                {ESTADOS.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-3 text-sm text-[#5C6064]">
            Mostrando <strong className="text-[#2C3E1F]">{filtered.length}</strong> de{' '}
            <strong className="text-[#2C3E1F]">{totalElements}</strong> equipos
          </p>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-12 text-[#5C6064]">Cargando inventario...</p>
          ) : error ? (
            <p className="text-center py-12 text-[#D91E18]">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">

                    {/* Columna checkbox — solo en modo selección */}
                    {selectionMode && (
                      <TableHead className="w-10 text-center">
                        <Checkbox
                          checked={allOnPageSelected}
                          data-state={someOnPageSelected && !allOnPageSelected ? 'indeterminate' : undefined}
                          onCheckedChange={togglePageSelection}
                          className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#4A5D23]"
                          aria-label="Seleccionar todos en esta página"
                        />
                      </TableHead>
                    )}

                    {['Código Ejército', 'Tipo', 'Modelo', 'N° Serie', 'Área', 'Responsable', 'Estado', 'Acciones'].map(h => (
                      <TableHead key={h}
                        className={`text-white uppercase tracking-wide text-xs ${h === 'Acciones' ? 'text-right' : ''}`}>
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={colSpanTotal} className="text-center py-10 text-[#5C6064]">
                        No se encontraron equipos
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((e, i) => {
                    const isChecked = selectedIds.has(e.idEquipo);

                    // En modo selección las celdas de datos alternan selección;
                    // en modo normal navegan al detalle. La celda Acciones
                    // nunca tiene onClick propio para no interferir con el dropdown.
                    const handleCellClick = selectionMode
                      ? () => toggleItem(e.idEquipo)
                      : () => navigate(`/inventario/${e.idEquipo}`);

                    return (
                      <motion.tr key={e.idEquipo}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-b border-[#E8E8E3] transition-colors
                          ${isChecked && selectionMode
                            ? 'bg-[#EDF3E0] hover:bg-[#E3EDD6]'
                            : 'hover:bg-[#F0F4E8]'}`}>

                        {/* Checkbox de fila — solo en modo selección */}
                        {selectionMode && (
                          <TableCell className="w-10 text-center cursor-pointer" onClick={handleCellClick}>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleItem(e.idEquipo)}
                              className="border-[#4A5D23] data-[state=checked]:bg-[#4A5D23]"
                              aria-label={`Seleccionar ${e.codigoEjercito}`}
                            />
                          </TableCell>
                        )}

                        <TableCell className="font-mono font-semibold text-[#2C3E1F] text-sm cursor-pointer" onClick={handleCellClick}>
                          {e.codigoEjercito}
                        </TableCell>
                        <TableCell className="text-[#5C6064] text-sm cursor-pointer" onClick={handleCellClick}>{e.nombreTipo}</TableCell>
                        <TableCell className="text-sm text-[#2C3E1F] font-medium cursor-pointer" onClick={handleCellClick}>{e.nombreModelo}</TableCell>
                        <TableCell className="font-mono text-sm text-[#5C6064] cursor-pointer" onClick={handleCellClick}>{e.numeroSerie}</TableCell>
                        <TableCell className="cursor-pointer" onClick={handleCellClick}>
                          <Badge variant="outline" className="border-[#4A5D23] text-[#4A5D23] text-xs">
                            {e.nombreArea}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[#5C6064] cursor-pointer" onClick={handleCellClick}>{e.nombreResponsable}</TableCell>
                        <TableCell className="cursor-pointer" onClick={handleCellClick}><EstadoBadge estado={e.estado} /></TableCell>

                        {/* Celda Acciones: SIN onClick en el td — el dropdown maneja sus propios eventos */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/inventario/${e.idEquipo}`} className="flex items-center gap-2 cursor-pointer">
                                  <Eye className="w-4 h-4" /> Ver Detalle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/inventario/${e.idEquipo}/editar`} className="flex items-center gap-2 cursor-pointer">
                                  <Edit className="w-4 h-4" /> Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEstadoModal(e)}
                                className="flex items-center gap-2 cursor-pointer">
                                <RefreshCw className="w-4 h-4" /> Cambiar Estado
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openEstadoModal(e, 'DADO_DE_BAJA')}
                                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                <XCircle className="w-4 h-4" /> Dar de Baja
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
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

      {/* Modal Cambiar Estado */}
      <Dialog open={showEstado} onOpenChange={setShowEstado}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2C3E1F]">
              <RefreshCw className="w-5 h-5 text-[#4A5D23]" /> Cambiar Estado
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#5C6064]">
            Equipo: <span className="font-semibold text-[#2C3E1F]">{selected?.codigoEjercito}</span>
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
