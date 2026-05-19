import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Download,
  FileText,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const inventoryData = [
  {
    id: 1,
    codigo: 'EJ-2024-001234',
    tipo: 'Laptop',
    marca: 'HP',
    modelo: 'EliteBook 840 G8',
    serie: 'SN123456789',
    area: 'Académica',
    usuario: 'Cap. Juan Pérez',
    estado: 'Asignado',
    fechaAsignacion: '2024-01-15',
    observaciones: 'En buen estado',
  },
  {
    id: 2,
    codigo: 'EJ-2024-001235',
    tipo: 'Desktop',
    marca: 'Dell',
    modelo: 'OptiPlex 7080',
    serie: 'SN987654321',
    area: 'DTIC',
    usuario: 'Tte. María García',
    estado: 'En Reparación',
    fechaAsignacion: '2024-02-20',
    observaciones: 'Placa madre dañada',
  },
  {
    id: 3,
    codigo: 'EJ-2024-001236',
    tipo: 'Monitor',
    marca: 'LG',
    modelo: '24MK430H-B',
    serie: 'SN456789123',
    area: 'Bodega',
    usuario: '-',
    estado: 'En Bodega',
    fechaAsignacion: '-',
    observaciones: 'Nuevo sin uso',
  },
  {
    id: 4,
    codigo: 'EJ-2024-001237',
    tipo: 'Impresora',
    marca: 'Canon',
    modelo: 'PIXMA G3110',
    serie: 'SN741852963',
    area: 'Logística',
    usuario: 'Sgt. Carlos López',
    estado: 'Asignado',
    fechaAsignacion: '2024-03-10',
    observaciones: 'Requiere mantenimiento preventivo',
  },
  {
    id: 5,
    codigo: 'EJ-2024-001238',
    tipo: 'Laptop',
    marca: 'Lenovo',
    modelo: 'ThinkPad T14',
    serie: 'SN852963741',
    area: 'Comando',
    usuario: 'May. Roberto Silva',
    estado: 'Asignado',
    fechaAsignacion: '2024-01-05',
    observaciones: 'Actualizado a Windows 11',
  },
  {
    id: 6,
    codigo: 'EJ-2024-001239',
    tipo: 'Desktop',
    marca: 'HP',
    modelo: 'ProDesk 400 G7',
    serie: 'SN369258147',
    area: 'Admin',
    usuario: 'Tte. Ana Vargas',
    estado: 'Prestado',
    fechaAsignacion: '2024-04-01',
    observaciones: 'Préstamo temporal por 30 días',
  },
  {
    id: 7,
    codigo: 'EJ-2023-009876',
    tipo: 'Laptop',
    marca: 'Dell',
    modelo: 'Latitude 5420',
    serie: 'SN147258369',
    area: 'Bodega',
    usuario: '-',
    estado: 'Dado de Baja',
    fechaAsignacion: '-',
    observaciones: 'Equipo obsoleto - Más de 7 años',
  },
  {
    id: 8,
    codigo: 'EJ-2024-001240',
    tipo: 'Mouse',
    marca: 'Logitech',
    modelo: 'M185',
    serie: 'SN963741852',
    area: 'Bodega',
    usuario: '-',
    estado: 'En Bodega',
    fechaAsignacion: '-',
    observaciones: 'Stock: 15 unidades',
  },
];

const statusConfig = {
  'En Bodega': { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Package },
  'Asignado': { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  'En Reparación': { color: 'bg-red-100 text-red-700 border-red-300', icon: AlertCircle },
  'Prestado': { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock },
  'Dado de Baja': { color: 'bg-gray-100 text-gray-500 border-gray-300', icon: XCircle },
};

export function Inventario() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch =
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.usuario.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'Todos' || item.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Inventario de Equipos
          </h2>
          <p className="text-[#5C6064]">Gestión completa del inventario de equipos informáticos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
            <Download className="w-4 h-4" />
            Excel
          </Button>
          <Button variant="outline" className="gap-2 border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white">
            <FileText className="w-4 h-4" />
            PDF
          </Button>
          <Link to="/inventario/nuevo">
            <Button className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              <Plus className="w-4 h-4" />
              Nuevo Equipo
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5C6064]" />
              <Input
                placeholder="Buscar por código, tipo, marca, modelo, área o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]"
              />
            </div>
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px] border-[#4A5D23]/30 h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los estados</SelectItem>
                  <SelectItem value="En Bodega">En Bodega</SelectItem>
                  <SelectItem value="Asignado">Asignado</SelectItem>
                  <SelectItem value="En Reparación">En Reparación</SelectItem>
                  <SelectItem value="Prestado">Prestado</SelectItem>
                  <SelectItem value="Dado de Baja">Dado de Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-[#5C6064]">
            <span>Mostrando <strong className="text-[#2C3E1F]">{filteredData.length}</strong> de <strong className="text-[#2C3E1F]">{inventoryData.length}</strong> equipos</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Código Ejército</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Tipo</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Marca/Modelo</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Serie</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Área</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Usuario</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Estado</TableHead>
                  <TableHead className="text-white uppercase tracking-wide text-right" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => {
                  const statusInfo = statusConfig[item.estado as keyof typeof statusConfig];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6] transition-colors"
                    >
                      <TableCell className="font-mono text-[#2C3E1F]" style={{ fontWeight: 600 }}>
                        {item.codigo}
                      </TableCell>
                      <TableCell className="text-[#5C6064]">{item.tipo}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>{item.marca}</p>
                          <p className="text-sm text-[#5C6064]">{item.modelo}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-[#5C6064]">{item.serie}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#4A5D23] text-[#4A5D23]">
                          {item.area}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#5C6064]">{item.usuario}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${statusInfo.color} border`}>
                          <StatusIcon className="w-3 h-3" />
                          {item.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/inventario/${item.id}`} className="flex items-center gap-2 cursor-pointer">
                                <Eye className="w-4 h-4" />
                                Ver Detalle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                              <Edit className="w-4 h-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                              <Download className="w-4 h-4" />
                              Exportar
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
        </CardContent>
      </Card>
    </div>
  );
}
