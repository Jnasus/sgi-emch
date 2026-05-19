import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { AlertTriangle, Search, Filter, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const incidentsData = [
  { id: 1234, codigo: 'EJ-2024-001234', tipo: 'Hardware', descripcion: 'Laptop no enciende - posible problema con placa madre', tecnico: 'Tte. García', fecha: '2024-04-14 09:30', estado: 'Abierto', prioridad: 'Alta' },
  { id: 1235, codigo: 'EJ-2024-001240', tipo: 'Software', descripcion: 'Sistema operativo lento - requiere optimización', tecnico: 'Sgt. López', fecha: '2024-04-14 10:15', estado: 'En Proceso', prioridad: 'Media' },
  { id: 1236, codigo: 'EJ-2024-001237', tipo: 'Impresora', descripcion: 'Impresora sin conectividad de red', tecnico: 'Tte. García', fecha: '2024-04-13 14:20', estado: 'Abierto', prioridad: 'Alta' },
  { id: 1237, codigo: 'EJ-2024-001235', tipo: 'Hardware', descripcion: 'Monitor con pantalla parpadeante', tecnico: 'Sgt. Vargas', fecha: '2024-04-13 11:45', estado: 'Resuelto', prioridad: 'Baja' },
  { id: 1238, codigo: 'EJ-2024-001242', tipo: 'Red', descripcion: 'Sin acceso a internet - problema de DNS', tecnico: 'Tte. García', fecha: '2024-04-12 16:30', estado: 'Cerrado', prioridad: 'Media' },
];

const statusConfig = {
  'Abierto': { color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle },
  'En Proceso': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
  'Resuelto': { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
  'Cerrado': { color: 'bg-gray-100 text-gray-500 border-gray-300', icon: XCircle },
};

export function Incidentes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredData = incidentsData.filter((item) => {
    const matchesSearch =
      item.id.toString().includes(searchTerm) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || item.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Mesa de Ayuda - Incidentes
          </h2>
          <p className="text-[#5C6064]">Gestión de tickets e incidentes técnicos</p>
        </div>
        <Link to="/incidentes/nuevo">
          <Button className="gap-2 bg-[#D91E18] hover:bg-[#B81614] text-white">
            <Plus className="w-4 h-4" />
            Nuevo Ticket
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5C6064]" />
              <Input
                placeholder="Buscar por ticket, código, tipo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px] border-[#4A5D23]/30 h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Abierto">Abierto</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Resuelto">Resuelto</SelectItem>
                <SelectItem value="Cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#D91E18] hover:bg-[#D91E18]">
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>N° Ticket</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Código Equipo</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Tipo</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Descripción</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Técnico</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Fecha</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Estado</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Prioridad</TableHead>
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
                      className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6] transition-colors cursor-pointer"
                    >
                      <TableCell className="font-mono text-[#2C3E1F]" style={{ fontWeight: 600 }}>#{item.id}</TableCell>
                      <TableCell className="font-mono text-[#5C6064]">{item.codigo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#5C6064] text-[#5C6064]">{item.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-[#2C3E1F] max-w-md">{item.descripcion}</TableCell>
                      <TableCell className="text-[#5C6064]">{item.tecnico}</TableCell>
                      <TableCell className="text-sm text-[#5C6064]">{item.fecha}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${statusInfo.color} border`}>
                          <StatusIcon className="w-3 h-3" />
                          {item.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${item.prioridad === 'Alta' ? 'border-red-500 text-red-700' : item.prioridad === 'Media' ? 'border-yellow-500 text-yellow-700' : 'border-gray-500 text-gray-700'}`}>
                          {item.prioridad}
                        </Badge>
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
