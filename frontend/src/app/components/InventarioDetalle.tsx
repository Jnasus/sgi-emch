import { motion } from 'motion/react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  MapPin,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

export function InventarioDetalle() {
  const { id } = useParams();

  const equipmentDetail = {
    codigo: 'EJ-2024-001234',
    tipo: 'Laptop',
    marca: 'HP',
    modelo: 'EliteBook 840 G8',
    serie: 'SN123456789',
    procesador: 'Intel Core i7-1165G7',
    ram: '16 GB DDR4',
    almacenamiento: '512 GB SSD NVMe',
    sistemaOperativo: 'Windows 11 Pro',
    area: 'Académica',
    usuario: 'Cap. Juan Pérez',
    estado: 'Asignado',
    fechaAdquisicion: '2024-01-10',
    fechaAsignacion: '2024-01-15',
    valorAdquisicion: 'S/. 4,500.00',
    proveedor: 'Importaciones ABC S.A.C.',
    garantia: 'Hasta 2027-01-10',
    observaciones: 'En buen estado. Última actualización de sistema: 2024-04-01',
    historial: [
      { fecha: '2024-04-01', accion: 'Mantenimiento preventivo realizado', usuario: 'Técnico DTIC' },
      { fecha: '2024-03-15', accion: 'Actualización de sistema operativo', usuario: 'Técnico DTIC' },
      { fecha: '2024-01-15', accion: 'Asignado a Área Académica', usuario: 'Jefe DTIC' },
      { fecha: '2024-01-10', accion: 'Registrado en inventario', usuario: 'Admin DTIC' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inventario">
            <Button variant="outline" size="icon" className="border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
              Detalle de Equipo
            </h2>
            <p className="text-[#5C6064] font-mono" style={{ fontWeight: 600 }}>{equipmentDetail.codigo}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          <Button variant="outline" className="gap-2 border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white">
            <Trash2 className="w-4 h-4" />
            Dar de Baja
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="border-l-4 border-l-[#4A5D23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                <Package className="w-5 h-5 text-[#4A5D23]" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Tipo de Equipo</p>
                  <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Estado</p>
                  <Badge className="bg-green-100 text-green-700 border border-green-300 gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {equipmentDetail.estado}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Marca</p>
                  <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.marca}</p>
                </div>
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Modelo</p>
                  <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Serie</p>
                  <p className="text-[#2C3E1F] font-mono" style={{ fontWeight: 600 }}>{equipmentDetail.serie}</p>
                </div>
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Proveedor</p>
                  <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.proveedor}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Procesador</p>
                  <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.procesador}</p>
                </div>
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>RAM</p>
                  <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.ram}</p>
                </div>
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Almacenamiento</p>
                  <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.almacenamiento}</p>
                </div>
                <div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Sistema Operativo</p>
                  <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.sistemaOperativo}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Observaciones</p>
                <p className="text-[#2C3E1F]">{equipmentDetail.observaciones}</p>
              </div>
            </CardContent>
          </Card>

          {/* Historial */}
          <Card className="border-l-4 border-l-[#5C6064]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                <FileText className="w-5 h-5 text-[#5C6064]" />
                Historial de Movimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipmentDetail.historial.map((item, index) => (
                  <div key={index} className="flex gap-3 pb-3 border-b last:border-0 border-[#E8E8E3]">
                    <div className="w-2 h-2 rounded-full bg-[#4A5D23] mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{item.accion}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-[#5C6064]">{item.fecha}</p>
                        <span className="text-[#5C6064]">•</span>
                        <p className="text-sm text-[#5C6064]">{item.usuario}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="border-t-4 border-t-[#4A5D23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                <User className="w-5 h-5 text-[#4A5D23]" />
                Asignación Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Usuario</p>
                <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.usuario}</p>
              </div>
              <div>
                <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Área</p>
                <Badge variant="outline" className="border-[#4A5D23] text-[#4A5D23]">
                  <MapPin className="w-3 h-3 mr-1" />
                  {equipmentDetail.area}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Fecha de Asignación</p>
                <p className="text-[#2C3E1F] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {equipmentDetail.fechaAsignacion}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-[#D91E18]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                <Calendar className="w-5 h-5 text-[#D91E18]" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Fecha de Adquisición</p>
                <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.fechaAdquisicion}</p>
              </div>
              <div>
                <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Valor de Adquisición</p>
                <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.valorAdquisicion}</p>
              </div>
              <div>
                <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Garantía</p>
                <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{equipmentDetail.garantia}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
