# Especificaciones Técnicas — Frontend UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar al detalle de equipo un botón "Agregar/Editar Especificaciones" y un dialog modal con formulario de 18 campos (6 grupos: CPU, RAM, Disco, GPU, Monitor, Red) que guarda via `PUT /api/equipos/{id}/especificaciones`.

**Architecture:** Se modifica únicamente `inventarioService.ts` (nuevo tipo + función) y `InventarioDetalle.tsx` (nuevo estado, handlers y dialog JSX). El backend endpoint ya existe y funciona. El dialog sigue exactamente el mismo patrón que el dialog "Cambiar Estado" existente.

**Tech Stack:** React 18, TypeScript, shadcn-ui (Dialog, Input, Label, Button, ScrollArea), fetch nativo con JWT.

---

## File Map

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `frontend/src/services/inventarioService.ts` | Modificar | Agregar `EspecificacionTecnicaRequest` + `upsertEspecificaciones()` |
| `frontend/src/app/components/InventarioDetalle.tsx` | Modificar | Agregar estado modal, handlers, botón en card header, Dialog JSX |

**Working directory:** `C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch`

---

## Task 1: Agregar tipo y función al servicio

**Files:**
- Modify: `frontend/src/services/inventarioService.ts`

- [ ] **Step 1: Agregar `EspecificacionTecnicaRequest` después de `EspecificacionTecnicaResponse` (línea 25)**

Insertar el siguiente bloque inmediatamente después del cierre `}` de `EspecificacionTecnicaResponse`:

```typescript
export interface EspecificacionTecnicaRequest {
  procesador?: string;
  nucleos?: number;
  hilos?: number;
  ramModulos?: number;
  ramTotalGb?: number;
  ramVelocidadMhz?: number;
  ramMarca?: string;
  discoModelo?: string;
  discoInterface?: string;
  discoCapacidadGb?: number;
  discoUsadoGb?: number;
  discoLibreGb?: number;
  gpuMarca?: string;
  gpuModelo?: string;
  gpuVramGb?: number;
  monitorMarca?: string;
  monitorModelo?: string;
  redModelo?: string;
}
```

- [ ] **Step 2: Agregar `upsertEspecificaciones` al final del archivo (después de `listarAreas`)**

```typescript
export const upsertEspecificaciones = (id: number, data: EspecificacionTecnicaRequest) =>
  putJson<EspecificacionTecnicaResponse>(`/api/equipos/${id}/especificaciones`, data);
```

- [ ] **Step 3: Commit del servicio**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch"
git add frontend/src/services/inventarioService.ts
git commit -m "feat(frontend): add EspecificacionTecnicaRequest type and upsertEspecificaciones()"
```

---

## Task 2: Editar `InventarioDetalle.tsx` — imports y helpers

**Files:**
- Modify: `frontend/src/app/components/InventarioDetalle.tsx`

- [ ] **Step 1: Ampliar los imports de lucide-react** — agregar `Settings2` a la lista existente

Reemplazar:
```tsx
import {
  ArrowLeft, Package, Calendar, User, MapPin, FileText, Edit,
  CheckCircle, Clock, AlertCircle, XCircle, RefreshCw, Cpu,
} from 'lucide-react';
```

Con:
```tsx
import {
  ArrowLeft, Package, Calendar, User, MapPin, FileText, Edit,
  CheckCircle, Clock, AlertCircle, XCircle, RefreshCw, Cpu, Settings2,
} from 'lucide-react';
```

- [ ] **Step 2: Agregar imports de componentes UI faltantes**

Reemplazar las líneas de imports UI existentes:
```tsx
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
```

Con:
```tsx
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
```

- [ ] **Step 3: Ampliar el import de tipos del servicio**

Reemplazar:
```tsx
import type { EquipoResponse, HistorialEstadoResponse } from '../../services/inventarioService';
```

Con:
```tsx
import type {
  EquipoResponse, HistorialEstadoResponse,
  EspecificacionTecnicaResponse, EspecificacionTecnicaRequest,
} from '../../services/inventarioService';
```

- [ ] **Step 4: Agregar el bloque de helpers del formulario de especificaciones**

Insertar el siguiente bloque completo **antes** de la función `EstadoBadge` (después del bloque `// ── Estado config` con los ESTADOS):

```tsx
// ── Espec form ────────────────────────────────────────────────────────────
interface EspecForm {
  procesador: string; nucleos: string; hilos: string;
  ramModulos: string; ramTotalGb: string; ramVelocidadMhz: string; ramMarca: string;
  discoModelo: string; discoInterface: string;
  discoCapacidadGb: string; discoUsadoGb: string; discoLibreGb: string;
  gpuMarca: string; gpuModelo: string; gpuVramGb: string;
  monitorMarca: string; monitorModelo: string;
  redModelo: string;
}

const EMPTY_ESPEC: EspecForm = {
  procesador: '', nucleos: '', hilos: '',
  ramModulos: '', ramTotalGb: '', ramVelocidadMhz: '', ramMarca: '',
  discoModelo: '', discoInterface: '',
  discoCapacidadGb: '', discoUsadoGb: '', discoLibreGb: '',
  gpuMarca: '', gpuModelo: '', gpuVramGb: '',
  monitorMarca: '', monitorModelo: '',
  redModelo: '',
};

function toEspecForm(s: EspecificacionTecnicaResponse | null | undefined): EspecForm {
  if (!s) return { ...EMPTY_ESPEC };
  return {
    procesador: s.procesador ?? '',
    nucleos: s.nucleos != null ? String(s.nucleos) : '',
    hilos: s.hilos != null ? String(s.hilos) : '',
    ramModulos: s.ramModulos != null ? String(s.ramModulos) : '',
    ramTotalGb: s.ramTotalGb != null ? String(s.ramTotalGb) : '',
    ramVelocidadMhz: s.ramVelocidadMhz != null ? String(s.ramVelocidadMhz) : '',
    ramMarca: s.ramMarca ?? '',
    discoModelo: s.discoModelo ?? '',
    discoInterface: s.discoInterface ?? '',
    discoCapacidadGb: s.discoCapacidadGb != null ? String(s.discoCapacidadGb) : '',
    discoUsadoGb: s.discoUsadoGb != null ? String(s.discoUsadoGb) : '',
    discoLibreGb: s.discoLibreGb != null ? String(s.discoLibreGb) : '',
    gpuMarca: s.gpuMarca ?? '',
    gpuModelo: s.gpuModelo ?? '',
    gpuVramGb: s.gpuVramGb != null ? String(s.gpuVramGb) : '',
    monitorMarca: s.monitorMarca ?? '',
    monitorModelo: s.monitorModelo ?? '',
    redModelo: s.redModelo ?? '',
  };
}

function toEspecRequest(f: EspecForm): EspecificacionTecnicaRequest {
  const num = (v: string) => v.trim() !== '' ? Number(v) : undefined;
  const str = (v: string) => v.trim() !== '' ? v.trim() : undefined;
  return {
    procesador: str(f.procesador),
    nucleos: num(f.nucleos),
    hilos: num(f.hilos),
    ramModulos: num(f.ramModulos),
    ramTotalGb: num(f.ramTotalGb),
    ramVelocidadMhz: num(f.ramVelocidadMhz),
    ramMarca: str(f.ramMarca),
    discoModelo: str(f.discoModelo),
    discoInterface: str(f.discoInterface),
    discoCapacidadGb: num(f.discoCapacidadGb),
    discoUsadoGb: num(f.discoUsadoGb),
    discoLibreGb: num(f.discoLibreGb),
    gpuMarca: str(f.gpuMarca),
    gpuModelo: str(f.gpuModelo),
    gpuVramGb: num(f.gpuVramGb),
    monitorMarca: str(f.monitorMarca),
    monitorModelo: str(f.monitorModelo),
    redModelo: str(f.redModelo),
  };
}
```

---

## Task 3: Editar `InventarioDetalle.tsx` — estado y handlers

**Files:**
- Modify: `frontend/src/app/components/InventarioDetalle.tsx`

- [ ] **Step 1: Agregar estado del modal de especificaciones dentro de `InventarioDetalle`**

Dentro de la función `InventarioDetalle`, después del bloque de estado del modal de estado (`// modal cambiar estado`):

```tsx
  // modal especificaciones
  const [showEspec,   setShowEspec]   = useState(false);
  const [especForm,   setEspecForm]   = useState<EspecForm>(EMPTY_ESPEC);
  const [especSaving, setEspecSaving] = useState(false);
  const [especError,  setEspecError]  = useState<string | null>(null);
```

- [ ] **Step 2: Agregar funciones `openEspecModal`, `handleSaveEspec` y `setEspec`**

Después de la función `handleCambiarEstado` (y antes del bloque de renders `if (loading) ...`):

```tsx
  function openEspecModal() {
    setEspecForm(toEspecForm(equipo?.especificaciones));
    setEspecError(null);
    setShowEspec(true);
  }

  async function handleSaveEspec() {
    if (!equipo) return;
    setEspecSaving(true); setEspecError(null);
    try {
      await svc.upsertEspecificaciones(equipo.idEquipo, toEspecRequest(especForm));
      const refreshed = await svc.obtenerEquipo(equipo.idEquipo);
      setEquipo(refreshed);
      setShowEspec(false);
    } catch (e: unknown) {
      setEspecError(e instanceof Error ? e.message : 'Error al guardar especificaciones');
    } finally {
      setEspecSaving(false);
    }
  }

  function setEspec(key: keyof EspecForm, value: string) {
    setEspecForm(prev => ({ ...prev, [key]: value }));
  }
```

---

## Task 4: Editar `InventarioDetalle.tsx` — specs card y dialog JSX

**Files:**
- Modify: `frontend/src/app/components/InventarioDetalle.tsx`

- [ ] **Step 1: Reemplazar el bloque de la specs card (líneas 195-227 aproximadamente)**

Localizar y reemplazar **todo** el bloque:
```tsx
          {/* Especificaciones técnicas (solo si existen) */}
          {specs && (
            <Card className="border-l-4 border-l-[#5C6064]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem' }}>
                  <Cpu className="w-5 h-5 text-[#5C6064]" /> Especificaciones Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {specs.procesador && <InfoField label="Procesador" value={specs.procesador} />}
                  {specs.nucleos != null && (
                    <InfoField label="Núcleos / Hilos" value={`${specs.nucleos} / ${specs.hilos ?? '?'}`} />
                  )}
                  {specs.ramTotalGb != null && (
                    <InfoField label="RAM"
                      value={`${specs.ramTotalGb} GB${specs.ramMarca ? ` ${specs.ramMarca}` : ''}`} />
                  )}
                  {specs.discoCapacidadGb != null && (
                    <InfoField label="Disco"
                      value={`${specs.discoCapacidadGb} GB${specs.discoInterface ? ` ${specs.discoInterface}` : ''}`} />
                  )}
                  {specs.gpuModelo && (
                    <InfoField label="GPU" value={`${specs.gpuMarca ?? ''} ${specs.gpuModelo}`.trim()} />
                  )}
                  {specs.monitorModelo && (
                    <InfoField label="Monitor" value={`${specs.monitorMarca ?? ''} ${specs.monitorModelo}`.trim()} />
                  )}
                  {specs.redModelo && <InfoField label="Tarjeta de red" value={specs.redModelo} />}
                </div>
              </CardContent>
            </Card>
          )}
```

Con:
```tsx
          {/* Especificaciones técnicas */}
          <Card className="border-l-4 border-l-[#5C6064]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide" style={{ fontSize: '1rem' }}>
                <Cpu className="w-5 h-5 text-[#5C6064]" /> Especificaciones Técnicas
              </CardTitle>
              <Button variant="outline" size="sm" onClick={openEspecModal}
                className="gap-1 border-[#5C6064] text-[#5C6064] hover:bg-[#5C6064] hover:text-white">
                <Settings2 className="w-4 h-4" />
                {specs && (specs.procesador || specs.ramTotalGb != null || specs.discoCapacidadGb != null)
                  ? 'Editar Specs' : 'Agregar Specs'}
              </Button>
            </CardHeader>
            <CardContent>
              {specs && (specs.procesador || specs.nucleos != null || specs.ramTotalGb != null ||
                         specs.discoCapacidadGb != null || specs.gpuModelo || specs.monitorModelo || specs.redModelo) ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {specs.procesador && <InfoField label="Procesador" value={specs.procesador} />}
                  {specs.nucleos != null && (
                    <InfoField label="Núcleos / Hilos" value={`${specs.nucleos} / ${specs.hilos ?? '?'}`} />
                  )}
                  {specs.ramTotalGb != null && (
                    <InfoField label="RAM"
                      value={`${specs.ramTotalGb} GB${specs.ramMarca ? ` ${specs.ramMarca}` : ''}`} />
                  )}
                  {specs.discoCapacidadGb != null && (
                    <InfoField label="Disco"
                      value={`${specs.discoCapacidadGb} GB${specs.discoInterface ? ` ${specs.discoInterface}` : ''}`} />
                  )}
                  {specs.gpuModelo && (
                    <InfoField label="GPU" value={`${specs.gpuMarca ?? ''} ${specs.gpuModelo}`.trim()} />
                  )}
                  {specs.monitorModelo && (
                    <InfoField label="Monitor" value={`${specs.monitorMarca ?? ''} ${specs.monitorModelo}`.trim()} />
                  )}
                  {specs.redModelo && <InfoField label="Tarjeta de red" value={specs.redModelo} />}
                </div>
              ) : (
                <p className="text-sm text-[#5C6064]">
                  Sin especificaciones técnicas registradas. Haga clic en{' '}
                  <em>Agregar Specs</em> para ingresar los datos de hardware.
                </p>
              )}
            </CardContent>
          </Card>
```

- [ ] **Step 2: Agregar el Dialog de especificaciones técnicas**

Insertar el siguiente bloque **inmediatamente antes** del cierre final `</div>` del componente (después del `{/* Modal Cambiar Estado */}` ya existente, y antes del último `</div>` y `)`):

```tsx
      {/* Dialog Especificaciones Técnicas */}
      <Dialog open={showEspec} onOpenChange={setShowEspec}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2C3E1F]">
              <Cpu className="w-5 h-5 text-[#5C6064]" /> Especificaciones Técnicas
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6 py-1 pr-4">

              {/* CPU */}
              <div>
                <p className="text-xs font-semibold text-[#4A5D23] uppercase tracking-wide mb-3">🖥️ Procesador</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Modelo de Procesador</Label>
                    <Input value={especForm.procesador}
                      onChange={e => setEspec('procesador', e.target.value)}
                      placeholder="ej. Intel Core i7-1165G7"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Núcleos</Label>
                    <Input type="number" min={0} value={especForm.nucleos}
                      onChange={e => setEspec('nucleos', e.target.value)}
                      placeholder="ej. 4"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Hilos</Label>
                    <Input type="number" min={0} value={especForm.hilos}
                      onChange={e => setEspec('hilos', e.target.value)}
                      placeholder="ej. 8"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                </div>
              </div>

              {/* RAM */}
              <div>
                <p className="text-xs font-semibold text-[#4A5D23] uppercase tracking-wide mb-3">🧠 Memoria RAM</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Módulos</Label>
                    <Input type="number" min={0} value={especForm.ramModulos}
                      onChange={e => setEspec('ramModulos', e.target.value)}
                      placeholder="ej. 2"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Total (GB)</Label>
                    <Input type="number" min={0} value={especForm.ramTotalGb}
                      onChange={e => setEspec('ramTotalGb', e.target.value)}
                      placeholder="ej. 16"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Velocidad (MHz)</Label>
                    <Input type="number" min={0} value={especForm.ramVelocidadMhz}
                      onChange={e => setEspec('ramVelocidadMhz', e.target.value)}
                      placeholder="ej. 3200"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Marca RAM</Label>
                    <Input value={especForm.ramMarca}
                      onChange={e => setEspec('ramMarca', e.target.value)}
                      placeholder="ej. Kingston"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                </div>
              </div>

              {/* Disco */}
              <div>
                <p className="text-xs font-semibold text-[#4A5D23] uppercase tracking-wide mb-3">💾 Almacenamiento</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Modelo de Disco</Label>
                    <Input value={especForm.discoModelo}
                      onChange={e => setEspec('discoModelo', e.target.value)}
                      placeholder="ej. Samsung 870 EVO"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Interfaz</Label>
                    <select value={especForm.discoInterface}
                      onChange={e => setEspec('discoInterface', e.target.value)}
                      className="mt-1 w-full h-9 rounded-md border border-[#4A5D23]/30 bg-white px-3 text-sm focus:outline-none focus:border-[#4A5D23]">
                      <option value="">— Seleccionar —</option>
                      <option>SATA</option>
                      <option>NVMe</option>
                      <option>M.2</option>
                      <option>HDD</option>
                      <option>eMMC</option>
                      <option>SSD</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Capacidad (GB)</Label>
                    <Input type="number" min={0} step="0.01" value={especForm.discoCapacidadGb}
                      onChange={e => setEspec('discoCapacidadGb', e.target.value)}
                      placeholder="ej. 512"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Usado (GB)</Label>
                    <Input type="number" min={0} step="0.01" value={especForm.discoUsadoGb}
                      onChange={e => setEspec('discoUsadoGb', e.target.value)}
                      placeholder="ej. 120.50"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Libre (GB)</Label>
                    <Input type="number" min={0} step="0.01" value={especForm.discoLibreGb}
                      onChange={e => setEspec('discoLibreGb', e.target.value)}
                      placeholder="ej. 391.50"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                </div>
              </div>

              {/* GPU */}
              <div>
                <p className="text-xs font-semibold text-[#4A5D23] uppercase tracking-wide mb-3">🎮 Tarjeta Gráfica (GPU)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Marca GPU</Label>
                    <Input value={especForm.gpuMarca}
                      onChange={e => setEspec('gpuMarca', e.target.value)}
                      placeholder="ej. NVIDIA"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Modelo GPU</Label>
                    <Input value={especForm.gpuModelo}
                      onChange={e => setEspec('gpuModelo', e.target.value)}
                      placeholder="ej. RTX 3060"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">VRAM (GB)</Label>
                    <Input type="number" min={0} step="0.01" value={especForm.gpuVramGb}
                      onChange={e => setEspec('gpuVramGb', e.target.value)}
                      placeholder="ej. 6"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                </div>
              </div>

              {/* Monitor */}
              <div>
                <p className="text-xs font-semibold text-[#4A5D23] uppercase tracking-wide mb-3">🖥️ Monitor</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Marca Monitor</Label>
                    <Input value={especForm.monitorMarca}
                      onChange={e => setEspec('monitorMarca', e.target.value)}
                      placeholder="ej. Dell"
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Modelo Monitor</Label>
                    <Input value={especForm.monitorModelo}
                      onChange={e => setEspec('monitorModelo', e.target.value)}
                      placeholder="ej. P2422H 24\""
                      className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                  </div>
                </div>
              </div>

              {/* Red */}
              <div>
                <p className="text-xs font-semibold text-[#4A5D23] uppercase tracking-wide mb-3">🌐 Tarjeta de Red</p>
                <div>
                  <Label className="text-xs text-[#5C6064] uppercase tracking-wide">Modelo</Label>
                  <Input value={especForm.redModelo}
                    onChange={e => setEspec('redModelo', e.target.value)}
                    placeholder="ej. Intel I219-LM Gigabit"
                    className="mt-1 border-[#4A5D23]/30 focus-visible:ring-[#4A5D23]" />
                </div>
              </div>

            </div>
          </ScrollArea>

          {especError && (
            <p className="text-sm text-[#D91E18] mt-2">{especError}</p>
          )}

          <DialogFooter className="mt-4 pt-4 border-t border-[#E8E8E3]">
            <Button variant="outline" onClick={() => setShowEspec(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEspec} disabled={especSaving}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {especSaving ? 'Guardando...' : 'Guardar Especificaciones'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
```

- [ ] **Step 3: Commit del componente**

```
git add frontend/src/app/components/InventarioDetalle.tsx
git commit -m "feat(frontend): add EspecificacionTecnica edit dialog to InventarioDetalle"
```

---

## Task 5: Verificación manual

- [ ] **Step 1: Levantar el frontend**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npm run dev
```

Abrir `http://localhost:5173`, iniciar sesión, navegar a Inventario → click en cualquier equipo.

- [ ] **Step 2: Verificar UI cuando NO hay specs**

Comprobar:
- La card "Especificaciones Técnicas" se muestra siempre (ya no está oculta)
- Muestra el texto "Sin especificaciones técnicas registradas..."
- El botón dice **"Agregar Specs"** con el ícono ⚙️

- [ ] **Step 3: Verificar el dialog**

Hacer clic en "Agregar Specs":
- Se abre el dialog con 6 secciones: Procesador, Memoria RAM, Almacenamiento, GPU, Monitor, Red
- Todos los campos están vacíos
- El scroll funciona (puede desplazarse hacia abajo)
- Los campos numéricos solo aceptan números

- [ ] **Step 4: Guardar y verificar round-trip**

Llenar algunos campos (ej. Procesador: "Intel Core i5-10400", RAM Total: 8, Interfaz: SATA, Capacidad: 500):
- Clic en **"Guardar Especificaciones"**
- El dialog se cierra
- La card se actualiza mostrando los datos recién guardados
- El botón cambia a **"Editar Specs"**

- [ ] **Step 5: Commit final (si hay ajustes menores)**

```
git add frontend/src/
git commit -m "fix(frontend): minor adjustments after manual verification of EspecificacionTecnica dialog"
```
