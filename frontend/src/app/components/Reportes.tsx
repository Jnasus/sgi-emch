import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Clock,
  Loader2,
  AlertCircle,
  LayoutList,
  Wrench,
  ArchiveX,
  Timer,
  BarChart3,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { listarAreas } from '../../services/inventarioService';
import type { AreaCatResponse } from '../../services/inventarioService';
import * as reporteService from '../../services/reporteService';

// ── Constantes ──────────────────────────────────────────────────────────────

const ESTADO_TODOS  = 'TODOS';
const AREA_TODAS    = '_todas';

const ESTADOS: { value: string; label: string }[] = [
  { value: ESTADO_TODOS,    label: 'Todos los estados'  },
  { value: 'ASIGNADO',      label: 'Asignado'           },
  { value: 'EN_BODEGA',     label: 'En Bodega'          },
  { value: 'EN_REPARACION', label: 'En Reparación'      },
  { value: 'PRESTADO',      label: 'Prestado'           },
  { value: 'DADO_DE_BAJA',  label: 'Dado de Baja'       },
];

// ── Tipos ───────────────────────────────────────────────────────────────────

interface ReportCard {
  id: string;
  name: string;
  description: string;
  color: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  onExcel: () => Promise<void>;
  onPdf:   () => Promise<void>;
  comingSoon?: boolean;
}

// ── Componente ──────────────────────────────────────────────────────────────

export function Reportes() {
  const [areas,   setAreas]   = useState<AreaCatResponse[]>([]);
  const [estado,  setEstado]  = useState<string>(ESTADO_TODOS);
  const [areaVal, setAreaVal] = useState<string>(AREA_TODAS);
  const [anios,   setAnios]   = useState(5);

  // loading: 'excel' | 'pdf' | null por cada tarjeta
  const [loading, setLoading] = useState<Record<string, 'excel' | 'pdf' | null>>({});
  const [errors,  setErrors]  = useState<Record<string, string | null>>({});

  useEffect(() => {
    listarAreas()
      .then(setAreas)
      .catch(() => {/* silencioso */});
  }, []);

  // Helpers que convierten sentinel → undefined para la API
  const estadoParam = () => estado === ESTADO_TODOS ? undefined : estado;
  const idAreaParam = () => areaVal === AREA_TODAS  ? undefined : Number(areaVal);

  // ── Descarga ──────────────────────────────────────────────────────────────

  const handleDownload = async (
    key: string,
    tipo: 'excel' | 'pdf',
    fn: () => Promise<void>,
  ) => {
    setLoading(prev => ({ ...prev, [key]: tipo }));
    setErrors(prev =>  ({ ...prev, [key]: null }));
    try {
      await fn();
    } catch (err: unknown) {
      setErrors(prev => ({
        ...prev,
        [key]: err instanceof Error ? err.message : 'Error al generar el reporte',
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: null }));
    }
  };

  // ── Tarjetas ───────────────────────────────────────────────────────────────
  // Se recalcula en cada render para capturar los valores de filtro actuales

  const reports: ReportCard[] = [
    {
      id: 'inventario',
      name: 'Inventario General',
      description:
        'Reporte completo del inventario aplicando el estado y el área seleccionados en los filtros.',
      color: '#4A5D23',
      Icon: LayoutList,
      onExcel: () => reporteService.inventarioExcel(estadoParam(), idAreaParam()),
      onPdf:   () => reporteService.inventarioPdf(estadoParam(), idAreaParam()),
    },
    {
      id: 'por-area',
      name: 'Equipos por Área',
      description:
        'Lista todos los equipos del área seleccionada sin importar su estado.',
      color: '#2C3E1F',
      Icon: Filter,
      onExcel: () => reporteService.inventarioExcel(undefined, idAreaParam()),
      onPdf:   () => reporteService.inventarioPdf(undefined, idAreaParam()),
    },
    {
      id: 'reparacion',
      name: 'Equipos en Reparación',
      description:
        'Todos los equipos con estado "En Reparación". El filtro de área se aplica si está seleccionado.',
      color: '#D97706',
      Icon: Wrench,
      onExcel: () => reporteService.inventarioExcel('EN_REPARACION', idAreaParam()),
      onPdf:   () => reporteService.inventarioPdf('EN_REPARACION', idAreaParam()),
    },
    {
      id: 'baja',
      name: 'Equipos Dados de Baja',
      description:
        'Historial de equipos retirados del servicio. El filtro de área se aplica si está seleccionado.',
      color: '#D91E18',
      Icon: ArchiveX,
      onExcel: () => reporteService.inventarioExcel('DADO_DE_BAJA', idAreaParam()),
      onPdf:   () => reporteService.inventarioPdf('DADO_DE_BAJA', idAreaParam()),
    },
    {
      id: 'antiguos',
      name: `Equipos Antiguos (≥ ${anios} años)`,
      description: `Equipos adquiridos hace más de ${anios} años. Útil para planificación de renovación tecnológica.`,
      color: '#7A6030',
      Icon: Timer,
      onExcel: () => reporteService.antiguosExcel(anios),
      onPdf:   () => reporteService.antiguosPdf(anios),
    },
    {
      id: 'incidentes',
      name: 'Incidentes por Tipo',
      description:
        'Análisis estadístico de incidentes categorizados por tipo. Módulo en desarrollo.',
      color: '#5C6064',
      Icon: BarChart3,
      onExcel: () => Promise.resolve(),
      onPdf:   () => Promise.resolve(),
      comingSoon: true,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h2
          className="text-[#2C3E1F] uppercase tracking-wider mb-1"
          style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}
        >
          Reportes del Sistema
        </h2>
        <p className="text-[#5C6064]">
          Genere reportes del inventario en formato Excel o PDF
        </p>
      </div>

      {/* Panel de filtros */}
      <Card className="border-l-4 border-l-[#4A5D23]">
        <CardHeader>
          <CardTitle
            className="uppercase tracking-wide flex items-center gap-2"
            style={{ fontSize: '1rem', letterSpacing: '0.05em' }}
          >
            <Filter className="w-4 h-4 text-[#4A5D23]" />
            Filtros de Generación
          </CardTitle>
          <CardDescription>
            Configure los parámetros que se aplicarán a cada reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Estado */}
            <div className="space-y-2">
              <Label
                className="uppercase tracking-wide text-[#2C3E1F]"
                style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
              >
                Estado
              </Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map(e => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#5C6064]">
                Aplica a Inventario General
              </p>
            </div>

            {/* Área */}
            <div className="space-y-2">
              <Label
                className="uppercase tracking-wide text-[#2C3E1F]"
                style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
              >
                Área
              </Label>
              <Select value={areaVal} onValueChange={setAreaVal}>
                <SelectTrigger className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AREA_TODAS}>Todas las áreas</SelectItem>
                  {areas.map(a => (
                    <SelectItem key={a.idArea} value={String(a.idArea)}>
                      {a.nombreArea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#5C6064]">
                Aplica a todos los reportes excepto Incidentes
              </p>
            </div>

            {/* Antigüedad */}
            <div className="space-y-2">
              <Label
                htmlFor="anios"
                className="uppercase tracking-wide text-[#2C3E1F]"
                style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
              >
                Antigüedad (años)
              </Label>
              <input
                id="anios"
                type="number"
                min={1}
                max={30}
                value={anios}
                onChange={e => setAnios(Math.max(1, Number(e.target.value)))}
                className="flex h-11 w-full rounded-sm border border-[#4A5D23]/30 bg-background px-3 py-2 text-sm focus:border-[#4A5D23] focus:outline-none"
              />
              <p className="text-xs text-[#5C6064]">
                Aplica al reporte de Equipos Antiguos
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Tarjetas de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => {
          const Icon           = report.Icon;
          const isLoadingExcel = loading[report.id] === 'excel';
          const isLoadingPdf   = loading[report.id] === 'pdf';
          const error          = errors[report.id];

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="border-t-4 hover:shadow-lg transition-shadow h-full flex flex-col"
                style={{ borderTopColor: report.color }}
              >
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-sm bg-[#F5F5F0]">
                      <Icon
                        className="w-6 h-6"
                        strokeWidth={1.5}
                        style={{ color: report.color }}
                      />
                    </div>
                    {report.comingSoon && (
                      <span className="flex items-center gap-1 text-xs bg-[#F5F5F0] text-[#5C6064] px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        Próximamente
                      </span>
                    )}
                  </div>
                  <CardTitle
                    className="uppercase tracking-wide mt-4"
                    style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}
                  >
                    {report.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {report.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 pt-0">
                  {error && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!!report.comingSoon || isLoadingExcel || isLoadingPdf}
                      onClick={() => handleDownload(report.id, 'excel', report.onExcel)}
                      className="flex-1 gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white disabled:opacity-40"
                    >
                      {isLoadingExcel
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <FileSpreadsheet className="w-4 h-4" />}
                      {isLoadingExcel ? 'Generando…' : 'Excel'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!!report.comingSoon || isLoadingExcel || isLoadingPdf}
                      onClick={() => handleDownload(report.id, 'pdf', report.onPdf)}
                      className="flex-1 gap-2 border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white disabled:opacity-40"
                    >
                      {isLoadingPdf
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <FileText className="w-4 h-4" />}
                      {isLoadingPdf ? 'Generando…' : 'PDF'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
