import { motion } from 'motion/react';
import { FileText, Download, Printer, Calendar, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const reportTypes = [
  { id: 1, name: 'Equipos por Área', description: 'Reporte detallado de distribución de equipos por área operativa', icon: FileText, color: '#4A5D23' },
  { id: 2, name: 'Equipos Antiguos', description: 'Listado de equipos con más de 5 años para evaluación de reemplazo', icon: FileText, color: '#D91E18' },
  { id: 3, name: 'Incidentes por Tipo', description: 'Análisis estadístico de incidentes categorizados por tipo', icon: FileText, color: '#5C6064' },
  { id: 4, name: 'Inventario General', description: 'Reporte completo del inventario con todos los detalles', icon: FileText, color: '#7A8F3A' },
  { id: 5, name: 'Stock Crítico', description: 'Equipos y componentes con niveles críticos de inventario', icon: FileText, color: '#D91E18' },
  { id: 6, name: 'Equipos en Reparación', description: 'Estado actual de equipos en proceso de reparación', icon: FileText, color: '#5C6064' },
];

export function Reportes() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          Reportes del Sistema
        </h2>
        <p className="text-[#5C6064]">Genere reportes y análisis del inventario</p>
      </div>

      <Card className="border-l-4 border-l-[#4A5D23]">
        <CardHeader>
          <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
            Filtros de Generación
          </CardTitle>
          <CardDescription>Configure los parámetros para los reportes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="uppercase tracking-wide text-[#2C3E1F] flex items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <Calendar className="w-4 h-4" />
                Fecha Inicio
              </Label>
              <input
                type="date"
                className="flex h-11 w-full rounded-sm border border-[#4A5D23]/30 bg-background px-3 py-2 text-sm focus:border-[#4A5D23] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wide text-[#2C3E1F] flex items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <Calendar className="w-4 h-4" />
                Fecha Fin
              </Label>
              <input
                type="date"
                className="flex h-11 w-full rounded-sm border border-[#4A5D23]/30 bg-background px-3 py-2 text-sm focus:border-[#4A5D23] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wide text-[#2C3E1F] flex items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <Filter className="w-4 h-4" />
                Área
              </Label>
              <Select>
                <SelectTrigger className="h-11 border-[#4A5D23]/30">
                  <SelectValue placeholder="Todas las áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las áreas</SelectItem>
                  <SelectItem value="admin">Administrativa</SelectItem>
                  <SelectItem value="dtic">DTIC</SelectItem>
                  <SelectItem value="academica">Académica</SelectItem>
                  <SelectItem value="logistica">Logística</SelectItem>
                  <SelectItem value="comando">Comando</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-t-4 hover:shadow-lg transition-shadow h-full" style={{ borderTopColor: report.color }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-sm bg-[#F5F5F0]">
                      <Icon className="w-6 h-6" style={{ color: report.color }} strokeWidth={1.5} />
                    </div>
                  </div>
                  <CardTitle className="uppercase tracking-wide mt-4" style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                    {report.name}
                  </CardTitle>
                  <CardDescription className="text-sm">{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
                      <Download className="w-4 h-4" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2 border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white">
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2 border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white">
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
