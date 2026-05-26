import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Save, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as ticketSvc from '../../services/ticketService';
import type { TipoIncidenteResponse, TecnicoResponse } from '../../services/ticketService';
import { listarEquipos } from '../../services/inventarioService';
import type { EquipoResponse } from '../../services/inventarioService';
import { getCurrentUser } from '../../services/authService';

export function IncidenteNuevo() {
  const navigate    = useNavigate();
  const currentUser = getCurrentUser();
  const esTecnico   = currentUser?.rol === 'TECNICO';

  // Campos del formulario
  const [idEquipo,        setIdEquipo]        = useState('');
  const [idTipoIncidente, setIdTipoIncidente] = useState('');
  const [idTecnico,       setIdTecnico]       = useState(
    esTecnico ? String(currentUser?.idUsuario ?? '') : ''
  );
  const [titulo,       setTitulo]      = useState('');
  const [descripcion,  setDescripcion] = useState('');
  const [prioridad,    setPrioridad]   = useState('MEDIA');
  const [busqEquipo,   setBusqEquipo]  = useState('');

  // Catálogos
  const [equipos,  setEquipos]  = useState<EquipoResponse[]>([]);
  const [tipos,    setTipos]    = useState<TipoIncidenteResponse[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoResponse[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  // Estado del submit
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    setCargandoCatalogos(true);
    Promise.all([
      listarEquipos(0, 500),
      ticketSvc.listarTiposIncidente(),
      ticketSvc.listarTecnicos(),
    ])
      .then(([eqs, tps, tecns]) => {
        setEquipos(eqs.content);
        setTipos(tps);
        setTecnicos(tecns);
      })
      .catch(() => setError('Error al cargar los datos del formulario.'))
      .finally(() => setCargandoCatalogos(false));
  }, []);

  const equiposFiltrados = busqEquipo.trim()
    ? equipos.filter(e =>
        e.codigoEjercito.toLowerCase().includes(busqEquipo.toLowerCase()))
    : equipos;

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!idEquipo || !idTipoIncidente || !idTecnico || !titulo.trim()) {
      setError('Complete todos los campos obligatorios (*).');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const ticket = await ticketSvc.crearTicket({
        idEquipo:        Number(idEquipo),
        idTecnico:       Number(idTecnico),
        idTipoIncidente: Number(idTipoIncidente),
        titulo:          titulo.trim(),
        descripcion:     descripcion.trim(),
        prioridad:       prioridad as 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA',
      });
      navigate(`/incidentes/${ticket.idTicket}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ticket.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline" size="icon"
          className="border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white"
          onClick={() => navigate('/incidentes')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Crear Nuevo Ticket
          </h2>
          <p className="text-[#5C6064]">Registre un nuevo incidente técnico</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-l-4 border-l-[#D91E18]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                       style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
              <AlertTriangle className="w-5 h-5 text-[#D91E18]" />
              Información del Incidente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoCatalogos ? (
              <p className="text-[#5C6064] text-sm py-4">Cargando formulario...</p>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Equipo */}
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wide text-[#2C3E1F]"
                           style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      Código de Equipo *
                    </Label>
                    <Input
                      placeholder="Filtrar equipo..."
                      value={busqEquipo}
                      onChange={e => setBusqEquipo(e.target.value)}
                      className="h-9 border-[#4A5D23]/30 focus:border-[#4A5D23] text-sm"
                    />
                    <Select value={idEquipo} onValueChange={setIdEquipo}>
                      <SelectTrigger className="h-11 border-[#4A5D23]/30">
                        <SelectValue placeholder="Seleccione equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equiposFiltrados.slice(0, 100).map(e => (
                          <SelectItem key={e.idEquipo} value={String(e.idEquipo)}>
                            {e.codigoEjercito} — {e.nombreModelo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipo de incidente */}
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wide text-[#2C3E1F]"
                           style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      Tipo de Incidente *
                    </Label>
                    <Select value={idTipoIncidente} onValueChange={setIdTipoIncidente}>
                      <SelectTrigger className="h-11 border-[#4A5D23]/30">
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tipos.map(t => (
                          <SelectItem key={t.idTipoIncidente} value={String(t.idTipoIncidente)}>
                            {t.nombreTipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Técnico asignado */}
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wide text-[#2C3E1F]"
                           style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      Técnico Asignado *
                    </Label>
                    <Select value={idTecnico} onValueChange={setIdTecnico} disabled={esTecnico}>
                      <SelectTrigger className="h-11 border-[#4A5D23]/30">
                        <SelectValue placeholder="Asignar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {tecnicos.map(t => (
                          <SelectItem key={t.idUsuario} value={String(t.idUsuario)}>
                            {t.nombres} {t.apellidos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {esTecnico && (
                      <p className="text-xs text-[#5C6064]">
                        Asignado automáticamente a tu usuario.
                      </p>
                    )}
                  </div>

                  {/* Prioridad */}
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wide text-[#2C3E1F]"
                           style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      Prioridad
                    </Label>
                    <Select value={prioridad} onValueChange={setPrioridad}>
                      <SelectTrigger className="h-11 border-[#4A5D23]/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BAJA">Baja</SelectItem>
                        <SelectItem value="MEDIA">Media</SelectItem>
                        <SelectItem value="ALTA">Alta</SelectItem>
                        <SelectItem value="CRITICA">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <Label className="uppercase tracking-wide text-[#2C3E1F]"
                         style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Título *
                  </Label>
                  <Input
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Ej: Laptop no enciende"
                    maxLength={200}
                    className="h-11 border-[#4A5D23]/30 focus:border-[#4A5D23]"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label className="uppercase tracking-wide text-[#2C3E1F]"
                         style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Descripción del Problema
                  </Label>
                  <Textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Describa detalladamente el incidente técnico..."
                    className="min-h-[120px] border-[#4A5D23]/30 focus:border-[#4A5D23]"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#E8E8E3]">
                  <Button
                    type="submit"
                    disabled={guardando}
                    className="gap-2 bg-[#D91E18] hover:bg-[#B81614] text-white"
                  >
                    <Save className="w-4 h-4" />
                    {guardando ? 'Creando...' : 'Crear Ticket'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white"
                    onClick={() => navigate('/incidentes')}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
