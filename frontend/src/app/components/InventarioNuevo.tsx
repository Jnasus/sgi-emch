import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function InventarioNuevo() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inventario">
            <Button variant="outline" size="icon" className="border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
              Registrar Nuevo Equipo
            </h2>
            <p className="text-[#5C6064]">Complete los datos del equipo para agregarlo al inventario</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-l-4 border-l-[#4A5D23]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
              <Package className="w-5 h-5 text-[#4A5D23]" />
              Información del Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Código Ejército *
                  </Label>
                  <Input id="codigo" placeholder="EJ-2024-001XXX" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Tipo de Equipo *
                  </Label>
                  <Select>
                    <SelectTrigger className="h-11 border-[#4A5D23]/30">
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="impresora">Impresora</SelectItem>
                      <SelectItem value="mouse">Mouse</SelectItem>
                      <SelectItem value="teclado">Teclado</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marca" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Marca *
                  </Label>
                  <Input id="marca" placeholder="HP, Dell, Lenovo..." className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelo" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Modelo *
                  </Label>
                  <Input id="modelo" placeholder="EliteBook 840 G8" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serie" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Número de Serie *
                  </Label>
                  <Input id="serie" placeholder="SN123456789" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proveedor" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Proveedor
                  </Label>
                  <Input id="proveedor" placeholder="Nombre del proveedor" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaAdquisicion" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Fecha de Adquisición *
                  </Label>
                  <Input id="fechaAdquisicion" type="date" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Valor de Adquisición
                  </Label>
                  <Input id="valor" type="number" placeholder="0.00" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procesador" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Procesador
                  </Label>
                  <Input id="procesador" placeholder="Intel Core i7-1165G7" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ram" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Memoria RAM
                  </Label>
                  <Input id="ram" placeholder="16 GB DDR4" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="almacenamiento" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Almacenamiento
                  </Label>
                  <Input id="almacenamiento" placeholder="512 GB SSD NVMe" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="so" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Sistema Operativo
                  </Label>
                  <Input id="so" placeholder="Windows 11 Pro" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones" className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Observaciones
                </Label>
                <Textarea
                  id="observaciones"
                  placeholder="Ingrese observaciones adicionales sobre el equipo..."
                  className="min-h-[100px] border-[#4A5D23]/30 focus:border-[#4A5D23]"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E8E8E3]">
                <Button type="submit" className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
                  <Save className="w-4 h-4" />
                  Guardar Equipo
                </Button>
                <Link to="/inventario">
                  <Button type="button" variant="outline" className="border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
