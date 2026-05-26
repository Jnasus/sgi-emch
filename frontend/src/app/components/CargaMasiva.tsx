import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, RotateCcw, Download, ArrowLeft,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  listarTipos, listarMarcas, listarModelos,
  listarAreas, listarSO,
  type TipoEquipoResponse, type MarcaResponse,
  type ModeloResponse, type AreaResponse, type SistemaOperativoResponse,
} from '../../services/catalogoService';
import {
  descargarPlantilla, validarArchivo, revalidarFilas, confirmarCarga,
  type FilaCarga, type FilaValidada, type ConfirmacionResponse,
} from '../../services/cargaMasivaService';

// ── Catálogos pre-cargados para selects de edición ───────────────────────────

interface Catalogos {
  tipos: TipoEquipoResponse[];
  marcas: MarcaResponse[];
  modelos: ModeloResponse[];
  areas: AreaResponse[];
  sistemas: SistemaOperativoResponse[];
}

// ── Campos de texto libres editables ─────────────────────────────────────────

const COLS_TEXTO: Array<{ key: keyof FilaCarga; label: string }> = [
  { key: 'codigoEjercito',    label: 'Código Ejército' },
  { key: 'numeroSerie',       label: 'N° Serie' },
  { key: 'nombreResponsable', label: 'Responsable' },
  { key: 'macAddress',        label: 'MAC Address' },
  { key: 'ipAddress',         label: 'IP Address' },
  { key: 'fechaAdquisicion',  label: 'Fecha Adquisición (dd/MM/yyyy)' },
  { key: 'observaciones',     label: 'Observaciones' },
];

// ── Campos enum con opciones fijas ────────────────────────────────────────────

const COLS_ENUM: Array<{ key: keyof FilaCarga; label: string; opciones: string[] }> = [
  { key: 'tipoRed',       label: 'Tipo Red',       opciones: ['ETHERNET', 'WIFI', 'N/A'] },
  { key: 'estadoInicial', label: 'Estado Inicial',  opciones: ['EN_BODEGA', 'ASIGNADO', 'EN_REPARACION', 'PRESTADO', 'DADO_DE_BAJA'] },
];

// ── Subcomponente: panel de edición para una fila con errores ────────────────

function PanelEdicion({
  filaIdx, fila, catalogos, onCambio,
}: {
  filaIdx: number;
  fila: FilaValidada;
  catalogos: Catalogos;
  onCambio: (idx: number, campo: keyof FilaCarga, valor: string) => void;
}) {
  const { datos, errores } = fila;
  const conError = (k: string) => errores.some(e => e.columna === k);
  const msgError = (k: string) => errores.find(e => e.columna === k)?.mensaje;

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      {/* Campos de texto libres */}
      {COLS_TEXTO.map(({ key, label }) => (
        <div key={key}
          className={`p-1.5 rounded ${conError(key) ? 'bg-red-100 ring-1 ring-red-400' : 'bg-white border'}`}>
          <label className="font-medium text-[#5C6064] block mb-0.5">{label}</label>
          <input
            className="w-full border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6B7F3A]"
            value={(datos[key] as string) ?? ''}
            onChange={e => onCambio(filaIdx, key, e.target.value)}
          />
          {conError(key) && <p className="text-red-500 text-[10px] mt-0.5">{msgError(key)}</p>}
        </div>
      ))}

      {/* Campos enum */}
      {COLS_ENUM.map(({ key, label, opciones }) => (
        <div key={key}
          className={`p-1.5 rounded ${conError(key) ? 'bg-red-100 ring-1 ring-red-400' : 'bg-white border'}`}>
          <label className="font-medium text-[#5C6064] block mb-0.5">{label}</label>
          <select
            className="w-full border rounded px-1.5 py-0.5 text-xs focus:outline-none"
            value={(datos[key] as string) ?? ''}
            onChange={e => onCambio(filaIdx, key, e.target.value)}
          >
            <option value="">— elegir —</option>
            {opciones.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {conError(key) && <p className="text-red-500 text-[10px] mt-0.5">{msgError(key)}</p>}
        </div>
      ))}

      {/* Tipo */}
      <div className={`p-1.5 rounded ${conError('tipo') ? 'bg-red-100 ring-1 ring-red-400' : 'bg-white border'}`}>
        <label className="font-medium text-[#5C6064] block mb-0.5">Tipo de Equipo</label>
        <select className="w-full border rounded px-1.5 py-0.5 text-xs"
          value={datos.tipo} onChange={e => onCambio(filaIdx, 'tipo', e.target.value)}>
          <option value="">— elegir —</option>
          {catalogos.tipos.map(t => <option key={t.idTipo} value={t.nombreTipo}>{t.nombreTipo}</option>)}
        </select>
        {conError('tipo') && <p className="text-red-500 text-[10px] mt-0.5">{msgError('tipo')}</p>}
      </div>

      {/* Marca */}
      <div className={`p-1.5 rounded ${conError('marca') ? 'bg-red-100 ring-1 ring-red-400' : 'bg-white border'}`}>
        <label className="font-medium text-[#5C6064] block mb-0.5">Marca</label>
        <select className="w-full border rounded px-1.5 py-0.5 text-xs"
          value={datos.marca} onChange={e => onCambio(filaIdx, 'marca', e.target.value)}>
          <option value="">— elegir —</option>
          {catalogos.marcas.map(m => <option key={m.idMarca} value={m.nombreMarca}>{m.nombreMarca}</option>)}
        </select>
        {conError('marca') && <p className="text-red-500 text-[10px] mt-0.5">{msgError('marca')}</p>}
      </div>

      {/* Modelo — filtrado por marca seleccionada */}
      <div className={`p-1.5 rounded ${conError('modelo') ? 'bg-red-100 ring-1 ring-red-400' : 'bg-white border'}`}>
        <label className="font-medium text-[#5C6064] block mb-0.5">Modelo</label>
        <select className="w-full border rounded px-1.5 py-0.5 text-xs"
          value={datos.modelo} onChange={e => onCambio(filaIdx, 'modelo', e.target.value)}>
          <option value="">— elegir —</option>
          {catalogos.modelos
            .filter(m => !datos.marca || m.nombreMarca === datos.marca)
            .map(m => <option key={m.idModelo} value={m.nombreModelo}>{m.nombreModelo}</option>)}
        </select>
        {conError('modelo') && <p className="text-red-500 text-[10px] mt-0.5">{msgError('modelo')}</p>}
      </div>

      {/* Área */}
      <div className={`p-1.5 rounded ${conError('area') ? 'bg-red-100 ring-1 ring-red-400' : 'bg-white border'}`}>
        <label className="font-medium text-[#5C6064] block mb-0.5">Área</label>
        <select className="w-full border rounded px-1.5 py-0.5 text-xs"
          value={datos.area} onChange={e => onCambio(filaIdx, 'area', e.target.value)}>
          <option value="">— elegir —</option>
          {catalogos.areas.map(a => <option key={a.idArea} value={a.nombreArea}>{a.nombreArea}</option>)}
        </select>
        {conError('area') && <p className="text-red-500 text-[10px] mt-0.5">{msgError('area')}</p>}
      </div>

      {/* Sistema Operativo */}
      <div className={`p-1.5 rounded ${conError('sistemaOperativo') ? 'bg-red-100 ring-1 ring-red-400' : 'bg-white border'}`}>
        <label className="font-medium text-[#5C6064] block mb-0.5">Sistema Operativo</label>
        <select className="w-full border rounded px-1.5 py-0.5 text-xs"
          value={datos.sistemaOperativo}
          onChange={e => onCambio(filaIdx, 'sistemaOperativo', e.target.value)}>
          <option value="">— elegir —</option>
          {catalogos.sistemas.map(s => {
            const label = `${s.nombreSo} ${s.versionSo}`.trim();
            return <option key={s.idSo} value={label}>{label}</option>;
          })}
        </select>
        {conError('sistemaOperativo') && (
          <p className="text-red-500 text-[10px] mt-0.5">{msgError('sistemaOperativo')}</p>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function CargaMasiva() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paso, setPaso] = useState<1 | 2 | 3>(1);

  // Paso 1
  const [archivo, setArchivo] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  // Paso 2
  const [filas, setFilas] = useState<FilaValidada[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [revalidando, setRevalidando] = useState<Set<number>>(new Set());
  const [revalidandoTodo, setRevalidandoTodo] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  // Paso 3
  const [resultado, setResultado] = useState<ConfirmacionResponse | null>(null);

  // ── Paso 1: subir archivo ─────────────────────────────────────────────────

  const handleFileChange = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setErrorSubida('Solo se aceptan archivos .xlsx');
      return;
    }
    setArchivo(file);
    setErrorSubida(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleValidarArchivo = async () => {
    if (!archivo) return;
    setSubiendo(true);
    setErrorSubida(null);
    try {
      const [respValidacion, tipos, marcas, modelos, areas, sistemas] = await Promise.all([
        validarArchivo(archivo),
        listarTipos(),
        listarMarcas(),
        listarModelos(),
        listarAreas(),
        listarSO(),
      ]);
      setFilas(respValidacion.filas);
      setCatalogos({ tipos, marcas, modelos, areas, sistemas });
      setPaso(2);
    } catch (err) {
      setErrorSubida(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setSubiendo(false);
    }
  };

  // ── Paso 2: edición en vivo ───────────────────────────────────────────────

  const actualizarCampo = useCallback(
    (filaIdx: number, campo: keyof FilaCarga, valor: string) => {
      setFilas(prev => prev.map((f, i) =>
        i === filaIdx ? { ...f, datos: { ...f.datos, [campo]: valor } } : f,
      ));
    },
    [],
  );

  const revalidarFila = async (filaIdx: number) => {
    setRevalidando(prev => new Set(prev).add(filaIdx));
    try {
      const fila = filas[filaIdx];
      const resp = await revalidarFilas([fila.datos]);
      const nueva = resp.filas[0];
      setFilas(prev => prev.map((f, i) =>
        i === filaIdx ? { ...nueva, numeroFila: fila.numeroFila } : f,
      ));
    } catch {
      // mantener la fila actual si falla la red
    } finally {
      setRevalidando(prev => { const s = new Set(prev); s.delete(filaIdx); return s; });
    }
  };

  const revalidarTodo = async () => {
    setRevalidandoTodo(true);
    try {
      const resp = await revalidarFilas(filas.map(f => f.datos));
      setFilas(prev =>
        resp.filas.map((nueva, i) => ({ ...nueva, numeroFila: prev[i]?.numeroFila ?? i + 2 })),
      );
    } catch {
      // mantener estado actual
    } finally {
      setRevalidandoTodo(false);
    }
  };

  const todasOk = filas.length > 0 && filas.every(f => f.estado === 'OK');
  const totalErrores = filas.filter(f => f.estado === 'ERROR').length;

  const handleConfirmar = async () => {
    setConfirmando(true);
    try {
      const resp = await confirmarCarga(filas.filter(f => f.estado === 'OK'));
      setResultado(resp);
      setPaso(3);
    } catch (err) {
      setErrorSubida(err instanceof Error ? err.message : 'Error al confirmar la carga');
    } finally {
      setConfirmando(false);
    }
  };

  const reiniciar = () => {
    setPaso(1);
    setArchivo(null);
    setFilas([]);
    setCatalogos(null);
    setResultado(null);
    setErrorSubida(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/inventario')}
          className="text-[#5C6064] hover:text-[#2C3E50] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[#2C3E50]">Carga Masiva de Equipos</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 select-none">
        {[
          { n: 1, label: 'Subir archivo' },
          { n: 2, label: 'Revisar y editar' },
          { n: 3, label: 'Resultado' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
              ${paso === n
                ? 'bg-[#6B7F3A] text-white'
                : paso > n
                  ? 'bg-[#4A5D23] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
              {paso > n ? <CheckCircle2 className="w-4 h-4" /> : n}
            </div>
            <span className={`text-sm font-medium ${paso === n ? 'text-[#2C3E50]' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── PASO 1: SUBIR ARCHIVO ─────────────────────────────────────── */}
        {paso === 1 && (
          <motion.div key="paso1"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>

            {/* Banner de plantilla */}
            <div className="mb-6 p-4 bg-[#F0F4E8] rounded-xl border border-[#C4CF9A] flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#2C3E50]">Plantilla Excel</p>
                <p className="text-sm text-[#5C6064]">
                  Descarga la plantilla con los catálogos actuales y dropdowns de validación precargados.
                </p>
              </div>
              <Button
                variant="outline" size="sm"
                className="shrink-0 border-[#6B7F3A] text-[#6B7F3A] hover:bg-[#6B7F3A] hover:text-white"
                onClick={() => descargarPlantilla().catch(e => setErrorSubida(e.message))}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar plantilla
              </Button>
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                ${dragging
                  ? 'border-[#6B7F3A] bg-[#F0F4E8]'
                  : 'border-gray-300 hover:border-[#6B7F3A] hover:bg-gray-50'
                }`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef} type="file" accept=".xlsx" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }}
              />
              {archivo ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="w-12 h-12 text-[#6B7F3A]" />
                  <p className="font-semibold text-[#2C3E50]">{archivo.name}</p>
                  <p className="text-sm text-[#5C6064]">
                    {(archivo.size / 1024).toFixed(1)} KB — haz clic para cambiar
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Upload className="w-12 h-12" />
                  <p className="text-lg font-medium">Arrastra el archivo Excel aquí</p>
                  <p className="text-sm">o haz clic para seleccionar (.xlsx)</p>
                </div>
              )}
            </div>

            {errorSubida && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorSubida}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                disabled={!archivo || subiendo}
                className="bg-[#6B7F3A] hover:bg-[#4A5D23] text-white px-6"
                onClick={handleValidarArchivo}
              >
                {subiendo ? 'Procesando…' : 'Validar archivo'}
                {!subiendo && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── PASO 2: REVISAR Y EDITAR ──────────────────────────────────── */}
        {paso === 2 && (
          <motion.div key="paso2"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>

            {/* Barra de resumen */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex gap-4 text-sm">
                <span className="text-[#5C6064]">
                  Total: <strong className="text-[#2C3E50]">{filas.length}</strong>
                </span>
                <span className="text-green-700">
                  OK: <strong>{filas.length - totalErrores}</strong>
                </span>
                {totalErrores > 0 && (
                  <span className="text-red-600">
                    Con errores: <strong>{totalErrores}</strong>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={revalidandoTodo}
                  onClick={revalidarTodo}>
                  <RotateCcw className={`w-3 h-3 mr-1.5 ${revalidandoTodo ? 'animate-spin' : ''}`} />
                  Re-validar todo
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPaso(1)}>
                  <ArrowLeft className="w-3 h-3 mr-1.5" />
                  Cambiar archivo
                </Button>
              </div>
            </div>

            {/* Lista de filas */}
            <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
              {filas.map((fila, idx) => (
                <div key={idx}
                  className={`rounded-xl border p-4 transition-colors
                    ${fila.estado === 'OK'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                    }`}>

                  {/* Header de la fila */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {fila.estado === 'OK'
                        ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      <span className="font-semibold text-[#2C3E50] text-sm">
                        Fila {fila.numeroFila}
                        {fila.datos.codigoEjercito && (
                          <span className="font-normal text-[#5C6064]">
                            {' '}— {fila.datos.codigoEjercito}
                          </span>
                        )}
                      </span>
                    </div>
                    {fila.estado === 'ERROR' && (
                      <Button
                        variant="ghost" size="sm"
                        disabled={revalidando.has(idx)}
                        onClick={() => revalidarFila(idx)}
                        className="text-[#6B7F3A] hover:bg-[#F0F4E8] h-7 px-2 text-xs"
                      >
                        <RotateCcw className={`w-3 h-3 mr-1 ${revalidando.has(idx) ? 'animate-spin' : ''}`} />
                        Re-validar
                      </Button>
                    )}
                  </div>

                  {/* Errores actuales */}
                  {fila.estado === 'ERROR' && fila.errores.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {fila.errores.map((e, ei) => (
                        <p key={ei} className="text-red-600 text-xs">
                          <strong className="font-semibold">{e.columna}:</strong> {e.mensaje}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Panel de edición (solo filas con error) */}
                  {fila.estado === 'ERROR' && catalogos && (
                    <details className="mt-3">
                      <summary className="text-xs font-medium text-[#6B7F3A] cursor-pointer select-none hover:text-[#4A5D23]">
                        Editar campos de esta fila
                      </summary>
                      <PanelEdicion
                        filaIdx={idx}
                        fila={fila}
                        catalogos={catalogos}
                        onCambio={actualizarCampo}
                      />
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* Footer: confirmar */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <p className={`text-sm ${todasOk ? 'text-green-700' : 'text-[#5C6064]'}`}>
                {todasOk
                  ? '✓ Todas las filas son válidas. Puedes confirmar la carga.'
                  : `Corrige los ${totalErrores} error(es) y re-valida antes de confirmar.`}
              </p>
              <Button
                disabled={!todasOk || confirmando}
                className="bg-[#4A5D23] hover:bg-[#2C3E0D] text-white px-6"
                onClick={handleConfirmar}
              >
                {confirmando
                  ? 'Guardando…'
                  : `Confirmar carga (${filas.length} equipo${filas.length !== 1 ? 's' : ''})`}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── PASO 3: RESULTADO ────────────────────────────────────────── */}
        {paso === 3 && resultado && (
          <motion.div key="paso3"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12">

            {resultado.errores === 0 ? (
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            )}

            <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
              {resultado.errores === 0 ? 'Carga completada' : 'Carga con advertencias'}
            </h2>
            <p className="text-[#5C6064] mb-6">
              {resultado.guardados} de {resultado.total} equipo
              {resultado.total !== 1 ? 's' : ''} guardado
              {resultado.guardados !== 1 ? 's' : ''} correctamente.
            </p>

            {resultado.detalleErrores.length > 0 && (
              <div className="mb-6 text-left bg-red-50 border border-red-200 rounded-xl p-4 max-w-lg mx-auto">
                <p className="font-semibold text-red-700 mb-2">Errores al guardar:</p>
                {resultado.detalleErrores.map((e, i) => (
                  <p key={i} className="text-red-600 text-sm">
                    <strong>{e.columna}:</strong> {e.mensaje}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={reiniciar}>
                Nueva carga
              </Button>
              <Button
                className="bg-[#6B7F3A] hover:bg-[#4A5D23] text-white"
                onClick={() => navigate('/inventario')}
              >
                Ir al inventario
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
