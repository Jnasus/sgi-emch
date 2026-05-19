import { motion } from 'motion/react';
import { Users, Plus, Search, Shield, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const usersData = [
  { id: 1, nombre: 'Coronel Pedro Sánchez', usuario: 'psanchez', rol: 'Administrador', area: 'DTIC', estado: 'Activo', ultimoAcceso: '2024-04-14 14:30' },
  { id: 2, nombre: 'Mayor Roberto Silva', usuario: 'rsilva', rol: 'Jefe DTIC', area: 'DTIC', estado: 'Activo', ultimoAcceso: '2024-04-14 10:15' },
  { id: 3, nombre: 'Capitán Juan Pérez', usuario: 'jperez', rol: 'Subjefe DTIC', area: 'DTIC', estado: 'Activo', ultimoAcceso: '2024-04-14 09:20' },
  { id: 4, nombre: 'Teniente María García', usuario: 'mgarcia', rol: 'Técnico de Campo', area: 'DTIC', estado: 'Activo', ultimoAcceso: '2024-04-14 13:45' },
  { id: 5, nombre: 'Sargento Carlos López', usuario: 'clopez', rol: 'Técnico de Campo', area: 'DTIC', estado: 'Activo', ultimoAcceso: '2024-04-14 11:30' },
  { id: 6, nombre: 'Teniente Ana Vargas', usuario: 'avargas', rol: 'Directivo', area: 'Académica', estado: 'Activo', ultimoAcceso: '2024-04-13 16:20' },
  { id: 7, nombre: 'Mayor Luis Torres', usuario: 'ltorres', rol: 'Directivo', area: 'Logística', estado: 'Inactivo', ultimoAcceso: '2024-04-10 08:45' },
];

const roleColors = {
  'Administrador': 'bg-red-100 text-red-700 border-red-300',
  'Jefe DTIC': 'bg-blue-100 text-blue-700 border-blue-300',
  'Subjefe DTIC': 'bg-green-100 text-green-700 border-green-300',
  'Técnico de Campo': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Directivo': 'bg-purple-100 text-purple-700 border-purple-300',
};

export function Usuarios() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Gestión de Usuarios
          </h2>
          <p className="text-[#5C6064]">Administración de usuarios y permisos del sistema</p>
        </div>
        <Button className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5C6064]" />
            <Input
              placeholder="Buscar por nombre, usuario o área..."
              className="pl-10 h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Nombre Completo</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Usuario</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Rol</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Área</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Estado</TableHead>
                  <TableHead className="text-white uppercase tracking-wide" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Último Acceso</TableHead>
                  <TableHead className="text-white uppercase tracking-wide text-right" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6] transition-colors"
                  >
                    <TableCell className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4A5D23] flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        {user.nombre}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[#5C6064]">{user.usuario}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border ${roleColors[user.rol as keyof typeof roleColors]}`}>
                        {user.rol}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#5C6064]">{user.area}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.estado === 'Activo' ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-500 text-gray-700 bg-gray-50'}>
                        {user.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#5C6064]">{user.ultimoAcceso}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#D91E18] hover:bg-[#D91E18] hover:text-white">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
