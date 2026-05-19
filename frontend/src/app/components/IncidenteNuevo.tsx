import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function IncidenteNuevo() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/incidentes">
            <Button variant="outline" size="icon" className="border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
              Crear Nuevo Ticket
            </h2>
            <p className="text-[#5C6064]">Registre un nuevo incidente técnico</p>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-l-4 border-l-[#D91E18]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
              <AlertTriangle className="w-5 h-5 text-[#D91E18]" />
              Información del Incidente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Código de Equipo *
                  </Label>
                  <Input placeholder="EJ-2024-001XXX" className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]" />
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Tipo de Incidente *
                  </Label>
                  <Select>
                    <SelectTrigger className="h-11 border-[#4A5D23]/30">
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="impresora">Impresora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Prioridad *
                  </Label>
                  <Select>
                    <SelectTrigger className="h-11 border-[#4A5D23]/30">
                      <SelectValue placeholder="Seleccione prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Técnico Asignado *
                  </Label>
                  <Select>
                    <SelectTrigger className="h-11 border-[#4A5D23]/30">
                      <SelectValue placeholder="Asignar técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="garcia">Tte. García</SelectItem>
                      <SelectItem value="lopez">Sgt. López</SelectItem>
                      <SelectItem value="vargas">Sgt. Vargas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-wide text-[#2C3E1F]" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Descripción del Problema *
                </Label>
                <Textarea
                  placeholder="Describa detalladamente el incidente técnico..."
                  className="min-h-[120px] border-[#4A5D23]/30 focus:border-[#4A5D23]"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E8E8E3]">
                <Button type="submit" className="gap-2 bg-[#D91E18] hover:bg-[#B81614] text-white">
                  <Save className="w-4 h-4" />
                  Crear Ticket
                </Button>
                <Link to="/incidentes">
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
