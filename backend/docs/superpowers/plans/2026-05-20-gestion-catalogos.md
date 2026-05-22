# Gestión de Catálogos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar CRUD completo para los catálogos del sistema (TipoEquipo, Marca, Modelo, SistemaOperativo, Área) exponiendo endpoints faltantes en el backend, una página de administración con tabs en el frontend, y botones "+" inline en el formulario de registro de equipos para crear catálogos sin salir del formulario.

**Architecture:** El backend ya tiene CRUD para TipoEquipo, Marca y Modelo; solo faltan endpoints para SistemaOperativo y Área. El frontend tendrá un nuevo `catalogoService.ts` con todas las funciones CRUD, un componente `Catalogos.tsx` (página bajo `/configuracion`) con 5 tabs — uno por catálogo — y `InventarioNuevo.tsx` recibirá botones "+" junto a cada dropdown que abren un modal de creación rápida y auto-seleccionan el nuevo ítem.

**Tech Stack:** Java 21 / Spring Boot 3.5 (backend), React 18 / TypeScript / Vite / Tailwind / shadcn-ui (frontend), Docker Compose (deploy).

---

## File Structure

### Backend — crear
- `src/main/java/pe/edu/emch/sgi/dto/catalogo/SistemaOperativoRequest.java`
- `src/main/java/pe/edu/emch/sgi/dto/catalogo/AreaRequest.java`

### Backend — modificar
- `src/main/java/pe/edu/emch/sgi/repository/SistemaOperativoRepository.java` → añadir métodos de existencia
- `src/main/java/pe/edu/emch/sgi/repository/AreaRepository.java` → añadir métodos de existencia
- `src/main/java/pe/edu/emch/sgi/service/CatalogoService.java` → añadir 4 métodos (crear/actualizar SO y Área)
- `src/main/java/pe/edu/emch/sgi/controller/CatalogoController.java` → añadir 4 endpoints

### Frontend — crear
- `frontend/src/services/catalogoService.ts`
- `frontend/src/app/components/Catalogos.tsx`

### Frontend — modificar
- `frontend/src/app/components/InventarioNuevo.tsx` → botones "+" con modales de creación rápida
- `frontend/src/app/App.tsx` → ruta `/configuracion` → `<Catalogos />`

---

## Task 1: Backend — DTOs de request + métodos de repositorio

**Files:**
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/catalogo/SistemaOperativoRequest.java`
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/catalogo/AreaRequest.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/SistemaOperativoRepository.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/AreaRepository.java`

- [ ] **Step 1: Crear `SistemaOperativoRequest.java`**

```java
package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SistemaOperativoRequest {

    @NotBlank(message = "El nombre del SO es obligatorio")
    @Size(max = 80, message = "El nombre no puede superar 80 caracteres")
    private String nombreSo;

    @NotBlank(message = "La versión del SO es obligatoria")
    @Size(max = 50, message = "La versión no puede superar 50 caracteres")
    private String versionSo;
}
```

- [ ] **Step 2: Crear `AreaRequest.java`**

```java
package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AreaRequest {

    @NotBlank(message = "El código de área es obligatorio")
    @Size(max = 20, message = "El código no puede superar 20 caracteres")
    private String codigoArea;

    @NotBlank(message = "El nombre del área es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombreArea;

    @Size(max = 255)
    private String descripcion;

    @NotNull(message = "El año de vigencia es obligatorio")
    private Integer anioVigencia;
}
```

- [ ] **Step 3: Actualizar `SistemaOperativoRepository.java`**

Reemplazar el contenido completo del archivo:

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.SistemaOperativo;

public interface SistemaOperativoRepository extends JpaRepository<SistemaOperativo, Integer> {
    boolean existsByNombreSoAndVersionSo(String nombreSo, String versionSo);
    boolean existsByNombreSoAndVersionSoAndIdSoNot(String nombreSo, String versionSo, Integer idSo);
}
```

- [ ] **Step 4: Actualizar `AreaRepository.java`**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Area;

import java.util.List;
import java.util.Optional;

public interface AreaRepository extends JpaRepository<Area, Integer> {
    List<Area> findByActivoTrue();
    Optional<Area> findByCodigoArea(String codigoArea);
    boolean existsByCodigoArea(String codigoArea);
    boolean existsByCodigoAreaAndIdAreaNot(String codigoArea, Integer idArea);
}
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/pe/edu/emch/sgi/dto/catalogo/SistemaOperativoRequest.java
git add backend/src/main/java/pe/edu/emch/sgi/dto/catalogo/AreaRequest.java
git add backend/src/main/java/pe/edu/emch/sgi/repository/SistemaOperativoRepository.java
git add backend/src/main/java/pe/edu/emch/sgi/repository/AreaRepository.java
git commit -m "feat(catalogos): add SO and Area request DTOs and repo existence checks"
```

---

## Task 2: Backend — CatalogoService: crear y actualizar SO y Área

**Files:**
- Modify: `backend/src/main/java/pe/edu/emch/sgi/service/CatalogoService.java`

El archivo ya tiene los imports de `DuplicateResourceException` y `ResourceNotFoundException`. Solo hay que añadir los 4 métodos nuevos y los 2 mappers.

- [ ] **Step 1: Añadir imports necesarios al inicio del archivo**

Verificar que ya están presentes (lo están). Si falta alguno, añadirlo:

```java
import pe.edu.emch.sgi.dto.catalogo.AreaRequest;
import pe.edu.emch.sgi.dto.catalogo.SistemaOperativoRequest;
```

- [ ] **Step 2: Añadir los 4 métodos de servicio**

Insertar antes del comentario `// ── Mappers ──` del archivo:

```java
    @Transactional
    public SistemaOperativoResponse crearSistemaOperativo(SistemaOperativoRequest request) {
        if (sistemaOperativoRepository.existsByNombreSoAndVersionSo(
                request.getNombreSo(), request.getVersionSo())) {
            throw new DuplicateResourceException(
                "Ya existe el SO: " + request.getNombreSo() + " " + request.getVersionSo());
        }
        SistemaOperativo so = new SistemaOperativo();
        so.setNombreSo(request.getNombreSo());
        so.setVersionSo(request.getVersionSo());
        return toSoResponse(sistemaOperativoRepository.save(so));
    }

    @Transactional
    public SistemaOperativoResponse actualizarSistemaOperativo(Integer idSo, SistemaOperativoRequest request) {
        SistemaOperativo so = sistemaOperativoRepository.findById(idSo)
            .orElseThrow(() -> new ResourceNotFoundException("Sistema operativo no encontrado: " + idSo));
        if (sistemaOperativoRepository.existsByNombreSoAndVersionSoAndIdSoNot(
                request.getNombreSo(), request.getVersionSo(), idSo)) {
            throw new DuplicateResourceException(
                "Ya existe el SO: " + request.getNombreSo() + " " + request.getVersionSo());
        }
        so.setNombreSo(request.getNombreSo());
        so.setVersionSo(request.getVersionSo());
        return toSoResponse(sistemaOperativoRepository.save(so));
    }

    @Transactional(readOnly = true)
    public List<AreaResponse> listarTodasAreas() {
        return areaRepository.findAll().stream()
            .map(this::toAreaResponse).toList();
    }

    @Transactional
    public AreaResponse crearArea(AreaRequest request) {
        if (areaRepository.existsByCodigoArea(request.getCodigoArea())) {
            throw new DuplicateResourceException(
                "Ya existe un área con código: " + request.getCodigoArea());
        }
        Area area = new Area();
        area.setCodigoArea(request.getCodigoArea().toUpperCase());
        area.setNombreArea(request.getNombreArea());
        area.setDescripcion(request.getDescripcion());
        area.setAnioVigencia(request.getAnioVigencia());
        area.setActivo(true);
        area.setCreatedAt(java.time.LocalDateTime.now());
        return toAreaResponse(areaRepository.save(area));
    }

    @Transactional
    public AreaResponse actualizarArea(Integer idArea, AreaRequest request) {
        Area area = areaRepository.findById(idArea)
            .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada: " + idArea));
        if (areaRepository.existsByCodigoAreaAndIdAreaNot(request.getCodigoArea(), idArea)) {
            throw new DuplicateResourceException(
                "Ya existe un área con código: " + request.getCodigoArea());
        }
        area.setCodigoArea(request.getCodigoArea().toUpperCase());
        area.setNombreArea(request.getNombreArea());
        area.setDescripcion(request.getDescripcion());
        area.setAnioVigencia(request.getAnioVigencia());
        return toAreaResponse(areaRepository.save(area));
    }
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/pe/edu/emch/sgi/service/CatalogoService.java
git commit -m "feat(catalogos): add CRUD service methods for SO and Area"
```

---

## Task 3: Backend — CatalogoController: nuevos endpoints + build + deploy

**Files:**
- Modify: `backend/src/main/java/pe/edu/emch/sgi/controller/CatalogoController.java`

- [ ] **Step 1: Añadir imports al CatalogoController**

Verificar / añadir al bloque de imports:

```java
import pe.edu.emch.sgi.dto.catalogo.AreaRequest;
import pe.edu.emch.sgi.dto.catalogo.SistemaOperativoRequest;
```

- [ ] **Step 2: Añadir 6 endpoints al final del controlador (antes del cierre `}`)**

```java
    @PostMapping("/sistemas-operativos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear sistema operativo")
    public ResponseEntity<ApiResponse<SistemaOperativoResponse>> crearSistemaOperativo(
            @Valid @RequestBody SistemaOperativoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Sistema operativo creado",
                catalogoService.crearSistemaOperativo(request)));
    }

    @PutMapping("/sistemas-operativos/{idSo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar sistema operativo")
    public ResponseEntity<ApiResponse<SistemaOperativoResponse>> actualizarSistemaOperativo(
            @PathVariable Integer idSo,
            @Valid @RequestBody SistemaOperativoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Sistema operativo actualizado",
            catalogoService.actualizarSistemaOperativo(idSo, request)));
    }

    @GetMapping("/areas/todas")
    @Operation(summary = "Listar todas las áreas (incluye inactivas)")
    public ResponseEntity<ApiResponse<List<AreaResponse>>> listarTodasAreas() {
        return ResponseEntity.ok(ApiResponse.ok("OK", catalogoService.listarTodasAreas()));
    }

    @PostMapping("/areas")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear área")
    public ResponseEntity<ApiResponse<AreaResponse>> crearArea(
            @Valid @RequestBody AreaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Área creada", catalogoService.crearArea(request)));
    }

    @PutMapping("/areas/{idArea}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar área")
    public ResponseEntity<ApiResponse<AreaResponse>> actualizarArea(
            @PathVariable Integer idArea,
            @Valid @RequestBody AreaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Área actualizada",
            catalogoService.actualizarArea(idArea, request)));
    }
```

- [ ] **Step 3: Compilar el backend**

Desde el directorio `backend/`:

```bash
./mvnw package -DskipTests -q
```

Expected: BUILD SUCCESS sin errores de compilación.

- [ ] **Step 4: Commit + push**

```bash
git add backend/src/main/java/pe/edu/emch/sgi/controller/CatalogoController.java
git commit -m "feat(catalogos): expose CRUD endpoints for SO and Area"
git push
```

- [ ] **Step 5: Rebuild y redeploy en servidor**

Ejecutar en el servidor (donde corre Docker):

```bash
docker compose pull
git pull
docker compose up -d --build backend
```

Expected: contenedor `sgi-emch-backend` reinicia con la nueva imagen. Verificar en Swagger (`/swagger-ui.html`) que aparecen los endpoints nuevos bajo "Catálogos".

---

## Task 4: Frontend — catalogoService.ts

**Files:**
- Create: `frontend/src/services/catalogoService.ts`

- [ ] **Step 1: Crear el servicio**

```typescript
import { fetchWithAuth } from '../lib/api';

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface TipoEquipoResponse {
  idTipo: number;
  nombreTipo: string;
  descripcion: string;
}

export interface TipoEquipoRequest {
  nombreTipo: string;
  descripcion?: string;
}

export interface MarcaResponse {
  idMarca: number;
  nombreMarca: string;
}

export interface MarcaRequest {
  nombreMarca: string;
}

export interface ModeloResponse {
  idModelo: number;
  idMarca: number;
  nombreMarca: string;
  idTipo: number;
  nombreTipo: string;
  nombreModelo: string;
}

export interface ModeloRequest {
  idMarca: number;
  idTipo: number;
  nombreModelo: string;
}

export interface SistemaOperativoResponse {
  idSo: number;
  nombreSo: string;
  versionSo: string;
}

export interface SistemaOperativoRequest {
  nombreSo: string;
  versionSo: string;
}

export interface AreaResponse {
  idArea: number;
  codigoArea: string;
  nombreArea: string;
  descripcion: string;
  anioVigencia: number;
}

export interface AreaRequest {
  codigoArea: string;
  nombreArea: string;
  descripcion?: string;
  anioVigencia: number;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).data as T;
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return (await res.json()).data as T;
}

async function putJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return (await res.json()).data as T;
}

// ── Tipos de Equipo ───────────────────────────────────────────────────────────

export const listarTipos = () =>
  getJson<TipoEquipoResponse[]>('/api/catalogos/tipos-equipo');

export const crearTipo = (data: TipoEquipoRequest) =>
  postJson<TipoEquipoResponse>('/api/catalogos/tipos-equipo', data);

export const actualizarTipo = (id: number, data: TipoEquipoRequest) =>
  putJson<TipoEquipoResponse>(`/api/catalogos/tipos-equipo/${id}`, data);

// ── Marcas ───────────────────────────────────────────────────────────────────

export const listarMarcas = () =>
  getJson<MarcaResponse[]>('/api/catalogos/marcas');

export const crearMarca = (data: MarcaRequest) =>
  postJson<MarcaResponse>('/api/catalogos/marcas', data);

export const actualizarMarca = (id: number, data: MarcaRequest) =>
  putJson<MarcaResponse>(`/api/catalogos/marcas/${id}`, data);

// ── Modelos ───────────────────────────────────────────────────────────────────

export const listarModelos = (marcaId?: number) => {
  const qs = marcaId ? `?marcaId=${marcaId}` : '';
  return getJson<ModeloResponse[]>(`/api/catalogos/modelos${qs}`);
};

export const crearModelo = (data: ModeloRequest) =>
  postJson<ModeloResponse>('/api/catalogos/modelos', data);

export const actualizarModelo = (id: number, data: ModeloRequest) =>
  putJson<ModeloResponse>(`/api/catalogos/modelos/${id}`, data);

// ── Sistemas Operativos ───────────────────────────────────────────────────────

export const listarSO = () =>
  getJson<SistemaOperativoResponse[]>('/api/catalogos/sistemas-operativos');

export const crearSO = (data: SistemaOperativoRequest) =>
  postJson<SistemaOperativoResponse>('/api/catalogos/sistemas-operativos', data);

export const actualizarSO = (id: number, data: SistemaOperativoRequest) =>
  putJson<SistemaOperativoResponse>(`/api/catalogos/sistemas-operativos/${id}`, data);

// ── Áreas ─────────────────────────────────────────────────────────────────────

export const listarAreas = () =>
  getJson<AreaResponse[]>('/api/catalogos/areas/todas');

export const crearArea = (data: AreaRequest) =>
  postJson<AreaResponse>('/api/catalogos/areas', data);

export const actualizarArea = (id: number, data: AreaRequest) =>
  putJson<AreaResponse>(`/api/catalogos/areas/${id}`, data);
```

- [ ] **Step 2: Verificar build**

```bash
cd frontend && npm run build
```

Expected: BUILD SUCCESS (solo warnings de tamaño de chunk).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/catalogoService.ts
git commit -m "feat(catalogos): add catalogoService.ts with full CRUD for all catalogs"
```

---

## Task 5: Frontend — Catalogos.tsx (página de administración con 5 tabs)

**Files:**
- Create: `frontend/src/app/components/Catalogos.tsx`

El componente tiene 5 tabs. Cada tab sigue el mismo patrón: tabla de ítems existentes + botón "Nuevo" + modal de creación/edición (reutilizado).

- [ ] **Step 1: Crear `Catalogos.tsx`**

```tsx
import { useEffect, useState, useCallback } from 'react';
import { Settings, Plus, Edit, Tag, Cpu, Monitor, Layers, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import * as svc from '../../services/catalogoService';
import type {
  TipoEquipoResponse, TipoEquipoRequest,
  MarcaResponse, MarcaRequest,
  ModeloResponse, ModeloRequest,
  SistemaOperativoResponse, SistemaOperativoRequest,
  AreaResponse, AreaRequest,
} from '../../services/catalogoService';

// ── Componente Field reutilizable ─────────────────────────────────────────
type FieldErrors = Record<string, string>;

function Field({ label, value, onChange, type = 'text', maxLength, error, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; error?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <Input type={type} value={value} maxLength={maxLength} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`h-9 ${error ? 'border-[#D91E18] focus:border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`} />
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error }: {
  label: string; value: number; onChange: (v: string) => void;
  options: { value: number; label: string }[]; error?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`w-full h-9 rounded-md border bg-white px-3 text-sm focus:outline-none
          ${error ? 'border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`}>
        <option value={0} disabled>Seleccionar...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}

// ── Tipos de Equipo Tab ────────────────────────────────────────────────────
function TiposTab() {
  const [items, setItems]     = useState<TipoEquipoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<TipoEquipoResponse | null>(null);
  const [form, setForm]         = useState<TipoEquipoRequest>({ nombreTipo: '', descripcion: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listarTipos()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ nombreTipo: '', descripcion: '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: TipoEquipoResponse) {
    setEditing(item);
    setForm({ nombreTipo: item.nombreTipo, descripcion: item.descripcion ?? '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.nombreTipo.trim()) e.nombreTipo = 'El nombre es obligatorio';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarTipo(editing.idTipo, form);
        setItems(prev => prev.map(i => i.idTipo === updated.idTipo ? updated : i));
      } else {
        const created = await svc.crearTipo(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} tipos registrados</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nuevo Tipo
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Nombre</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Descripción</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idTipo} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="font-semibold text-[#2C3E1F] text-sm">{item.nombreTipo}</TableCell>
                <TableCell className="text-[#5C6064] text-sm">{item.descripcion || '—'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Tipo de Equipo' : 'Nuevo Tipo de Equipo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Nombre *" value={form.nombreTipo} error={errors.nombreTipo} maxLength={50}
              onChange={v => { setForm(f => ({ ...f, nombreTipo: v })); setErrors(e => ({ ...e, nombreTipo: '' })); }} />
            <Field label="Descripción" value={form.descripcion ?? ''} maxLength={255}
              onChange={v => setForm(f => ({ ...f, descripcion: v }))} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Marcas Tab ────────────────────────────────────────────────────────────
function MarcasTab() {
  const [items, setItems]       = useState<MarcaResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<MarcaResponse | null>(null);
  const [form, setForm]         = useState<MarcaRequest>({ nombreMarca: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listarMarcas()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null); setForm({ nombreMarca: '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: MarcaResponse) {
    setEditing(item); setForm({ nombreMarca: item.nombreMarca });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.nombreMarca.trim()) e.nombreMarca = 'El nombre es obligatorio';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarMarca(editing.idMarca, form);
        setItems(prev => prev.map(i => i.idMarca === updated.idMarca ? updated : i));
      } else {
        const created = await svc.crearMarca(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} marcas registradas</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nueva Marca
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Nombre</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idMarca} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="font-semibold text-[#2C3E1F] text-sm">{item.nombreMarca}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Marca' : 'Nueva Marca'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Field label="Nombre *" value={form.nombreMarca} error={errors.nombreMarca} maxLength={80}
              onChange={v => { setForm({ nombreMarca: v }); setErrors(e => ({ ...e, nombreMarca: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Modelos Tab ───────────────────────────────────────────────────────────
function ModelosTab() {
  const [items, setItems]       = useState<ModeloResponse[]>([]);
  const [marcas, setMarcas]     = useState<MarcaResponse[]>([]);
  const [tipos, setTipos]       = useState<TipoEquipoResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<ModeloResponse | null>(null);
  const [form, setForm]         = useState<ModeloRequest>({ idMarca: 0, idTipo: 0, nombreModelo: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t, all] = await Promise.all([svc.listarMarcas(), svc.listarTipos(), svc.listarModelos()]);
      setMarcas(m); setTipos(t); setItems(all);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null); setForm({ idMarca: 0, idTipo: 0, nombreModelo: '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: ModeloResponse) {
    setEditing(item);
    setForm({ idMarca: item.idMarca, idTipo: item.idTipo, nombreModelo: item.nombreModelo });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.idMarca) e.idMarca = 'Seleccione la marca';
    if (!form.idTipo) e.idTipo = 'Seleccione el tipo';
    if (!form.nombreModelo.trim()) e.nombreModelo = 'El nombre es obligatorio';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarModelo(editing.idModelo, form);
        setItems(prev => prev.map(i => i.idModelo === updated.idModelo ? updated : i));
      } else {
        const created = await svc.crearModelo(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} modelos registrados</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nuevo Modelo
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Marca</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Tipo</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Modelo</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idModelo} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="text-[#5C6064] text-sm">{item.nombreMarca}</TableCell>
                <TableCell className="text-[#5C6064] text-sm">{item.nombreTipo}</TableCell>
                <TableCell className="font-semibold text-[#2C3E1F] text-sm">{item.nombreModelo}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Modelo' : 'Nuevo Modelo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <SelectField label="Marca *" value={form.idMarca} error={errors.idMarca}
              options={marcas.map(m => ({ value: m.idMarca, label: m.nombreMarca }))}
              onChange={v => { setForm(f => ({ ...f, idMarca: Number(v) })); setErrors(e => ({ ...e, idMarca: '' })); }} />
            <SelectField label="Tipo de Equipo *" value={form.idTipo} error={errors.idTipo}
              options={tipos.map(t => ({ value: t.idTipo, label: t.nombreTipo }))}
              onChange={v => { setForm(f => ({ ...f, idTipo: Number(v) })); setErrors(e => ({ ...e, idTipo: '' })); }} />
            <Field label="Nombre del Modelo *" value={form.nombreModelo} error={errors.nombreModelo} maxLength={80}
              onChange={v => { setForm(f => ({ ...f, nombreModelo: v })); setErrors(e => ({ ...e, nombreModelo: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Sistemas Operativos Tab ───────────────────────────────────────────────
function SistemasOperativosTab() {
  const [items, setItems]       = useState<SistemaOperativoResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<SistemaOperativoResponse | null>(null);
  const [form, setForm]         = useState<SistemaOperativoRequest>({ nombreSo: '', versionSo: '' });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listarSO()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null); setForm({ nombreSo: '', versionSo: '' });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: SistemaOperativoResponse) {
    setEditing(item); setForm({ nombreSo: item.nombreSo, versionSo: item.versionSo });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.nombreSo.trim()) e.nombreSo = 'El nombre es obligatorio';
    if (!form.versionSo.trim()) e.versionSo = 'La versión es obligatoria';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarSO(editing.idSo, form);
        setItems(prev => prev.map(i => i.idSo === updated.idSo ? updated : i));
      } else {
        const created = await svc.crearSO(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} sistemas operativos registrados</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nuevo SO
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Sistema Operativo</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Versión</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idSo} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="font-semibold text-[#2C3E1F] text-sm">{item.nombreSo}</TableCell>
                <TableCell className="text-[#5C6064] text-sm">{item.versionSo}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Sistema Operativo' : 'Nuevo Sistema Operativo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Nombre *" value={form.nombreSo} error={errors.nombreSo} maxLength={80}
              placeholder="Windows, Ubuntu, macOS..."
              onChange={v => { setForm(f => ({ ...f, nombreSo: v })); setErrors(e => ({ ...e, nombreSo: '' })); }} />
            <Field label="Versión *" value={form.versionSo} error={errors.versionSo} maxLength={50}
              placeholder="11 Pro, 22.04 LTS, Ventura..."
              onChange={v => { setForm(f => ({ ...f, versionSo: v })); setErrors(e => ({ ...e, versionSo: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Áreas Tab ─────────────────────────────────────────────────────────────
function AreasTab() {
  const [items, setItems]       = useState<AreaResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<AreaResponse | null>(null);
  const [form, setForm]         = useState<AreaRequest>({
    codigoArea: '', nombreArea: '', descripcion: '',
    anioVigencia: new Date().getFullYear(),
  });
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await svc.listarAreas()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ codigoArea: '', nombreArea: '', descripcion: '', anioVigencia: new Date().getFullYear() });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  function openEdit(item: AreaResponse) {
    setEditing(item);
    setForm({
      codigoArea: item.codigoArea, nombreArea: item.nombreArea,
      descripcion: item.descripcion ?? '', anioVigencia: item.anioVigencia,
    });
    setErrors({}); setApiError(null); setShowModal(true);
  }

  async function handleSave() {
    const e: FieldErrors = {};
    if (!form.codigoArea.trim()) e.codigoArea = 'El código es obligatorio';
    if (!form.nombreArea.trim()) e.nombreArea = 'El nombre es obligatorio';
    if (!form.anioVigencia || form.anioVigencia < 2000) e.anioVigencia = 'Año inválido';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setApiError(null);
    try {
      if (editing) {
        const updated = await svc.actualizarArea(editing.idArea, form);
        setItems(prev => prev.map(i => i.idArea === updated.idArea ? updated : i));
      } else {
        const created = await svc.crearArea(form);
        setItems(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#5C6064]">{items.length} áreas registradas</p>
        <Button onClick={openCreate} className="gap-2 bg-[#4A5D23] hover:bg-[#3A4D29] text-white h-9">
          <Plus className="w-4 h-4" /> Nueva Área
        </Button>
      </div>
      {loading ? <p className="text-center py-8 text-[#5C6064]">Cargando...</p> : (
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4A5D23] hover:bg-[#4A5D23]">
              <TableHead className="text-white text-xs uppercase tracking-wide">Código</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Nombre</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide">Año Vigencia</TableHead>
              <TableHead className="text-white text-xs uppercase tracking-wide text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.idArea} className="border-b border-[#E8E8E3] hover:bg-[#F9F9F6]">
                <TableCell className="font-mono font-semibold text-[#2C3E1F] text-sm">{item.codigoArea}</TableCell>
                <TableCell className="text-[#2C3E1F] text-sm">{item.nombreArea}</TableCell>
                <TableCell className="text-[#5C6064] text-sm">{item.anioVigencia}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                    onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2C3E1F]">
              {editing ? 'Editar Área' : 'Nueva Área'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Código *" value={form.codigoArea} error={errors.codigoArea} maxLength={20}
              placeholder="DTIC, LOGISTICA, RRHH..."
              onChange={v => { setForm(f => ({ ...f, codigoArea: v.toUpperCase() })); setErrors(e => ({ ...e, codigoArea: '' })); }} />
            <Field label="Nombre *" value={form.nombreArea} error={errors.nombreArea} maxLength={100}
              onChange={v => { setForm(f => ({ ...f, nombreArea: v })); setErrors(e => ({ ...e, nombreArea: '' })); }} />
            <Field label="Descripción" value={form.descripcion ?? ''} maxLength={255}
              onChange={v => setForm(f => ({ ...f, descripcion: v }))} />
            <Field label="Año de Vigencia *" value={String(form.anioVigencia)} type="number"
              error={errors.anioVigencia}
              onChange={v => { setForm(f => ({ ...f, anioVigencia: Number(v) })); setErrors(e => ({ ...e, anioVigencia: '' })); }} />
          </div>
          {apiError && <p className="text-sm text-[#D91E18]">{apiError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export function Catalogos() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
          style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          Configuración — Catálogos
        </h2>
        <p className="text-[#5C6064]">Administración de tablas maestras del sistema</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="tipos">
            <TabsList className="mb-6 bg-[#F5F5F0] border border-[#E8E8E3]">
              <TabsTrigger value="tipos" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <Tag className="w-4 h-4" /> Tipos de Equipo
              </TabsTrigger>
              <TabsTrigger value="marcas" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <Layers className="w-4 h-4" /> Marcas
              </TabsTrigger>
              <TabsTrigger value="modelos" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <Monitor className="w-4 h-4" /> Modelos
              </TabsTrigger>
              <TabsTrigger value="so" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <Cpu className="w-4 h-4" /> Sistemas Operativos
              </TabsTrigger>
              <TabsTrigger value="areas" className="gap-2 data-[state=active]:bg-[#4A5D23] data-[state=active]:text-white">
                <MapPin className="w-4 h-4" /> Áreas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tipos"><TiposTab /></TabsContent>
            <TabsContent value="marcas"><MarcasTab /></TabsContent>
            <TabsContent value="modelos"><ModelosTab /></TabsContent>
            <TabsContent value="so"><SistemasOperativosTab /></TabsContent>
            <TabsContent value="areas"><AreasTab /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
cd frontend && npm run build
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/components/Catalogos.tsx
git commit -m "feat(catalogos): add Catalogos.tsx management page with 5 tabs"
```

---

## Task 6: Frontend — Botones "+" en InventarioNuevo + routing

**Files:**
- Modify: `frontend/src/app/components/InventarioNuevo.tsx`
- Modify: `frontend/src/app/App.tsx`

El objetivo es añadir junto a cada `SelectField` un botón "+" que abre un mini-modal de creación rápida. Después de guardar, el ítem nuevo se añade a la lista local y se auto-selecciona en el dropdown.

- [ ] **Step 1: Añadir imports de catalogoService a InventarioNuevo.tsx**

En la sección de imports, añadir al final:

```tsx
import * as catalogoSvc from '../../services/catalogoService';
```

- [ ] **Step 2: Añadir estado para los 5 modales quick-create**

Después del bloque de estado de catálogos (`const [areas, setAreas] = useState...`), añadir:

```tsx
  // quick-create modals
  const [showPlusTipo,   setShowPlusTipo]   = useState(false);
  const [showPlusMarca,  setShowPlusMarca]  = useState(false);
  const [showPlusModelo, setShowPlusModelo] = useState(false);
  const [showPlusSo,     setShowPlusSo]     = useState(false);
  const [showPlusArea,   setShowPlusArea]   = useState(false);
  const [plusSaving,     setPlusSaving]     = useState(false);
  const [plusError,      setPlusError]      = useState<string | null>(null);
  // quick-create form state
  const [plusTipo,   setPlusTipo]   = useState('');
  const [plusMarca,  setPlusMarca]  = useState('');
  const [plusModelo, setPlusModelo] = useState({ idMarca: 0, idTipo: 0, nombre: '' });
  const [plusSo,     setPlusSo]     = useState({ nombre: '', version: '' });
  const [plusArea,   setPlusArea]   = useState({ codigo: '', nombre: '', anio: new Date().getFullYear() });
```

- [ ] **Step 3: Añadir handlers de quick-create**

Añadir antes de `const backTo = ...`:

```tsx
  async function quickCreateTipo() {
    if (!plusTipo.trim()) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearTipo({ nombreTipo: plusTipo.trim() });
      setTipos(prev => [...prev, created]);
      setForm(f => ({ ...f, idTipo: created.idTipo }));
      setErrors(e => ({ ...e, idTipo: '' }));
      setShowPlusTipo(false); setPlusTipo('');
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  async function quickCreateMarca() {
    if (!plusMarca.trim()) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearMarca({ nombreMarca: plusMarca.trim() });
      setMarcas(prev => [...prev, created]);
      setModelos([]);
      setForm(f => ({ ...f, idMarca: created.idMarca, idModelo: 0 }));
      setErrors(e => ({ ...e, idMarca: '', idModelo: '' }));
      setShowPlusMarca(false); setPlusMarca('');
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  async function quickCreateModelo() {
    if (!plusModelo.nombre.trim() || !plusModelo.idMarca || !plusModelo.idTipo) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearModelo({
        idMarca: plusModelo.idMarca, idTipo: plusModelo.idTipo, nombreModelo: plusModelo.nombre.trim(),
      });
      setModelos(prev => [...prev, created]);
      setForm(f => ({ ...f, idModelo: created.idModelo }));
      setErrors(e => ({ ...e, idModelo: '' }));
      setShowPlusModelo(false); setPlusModelo({ idMarca: form.idMarca, idTipo: form.idTipo, nombre: '' });
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  async function quickCreateSo() {
    if (!plusSo.nombre.trim() || !plusSo.version.trim()) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearSO({ nombreSo: plusSo.nombre.trim(), versionSo: plusSo.version.trim() });
      setSos(prev => [...prev, created]);
      setForm(f => ({ ...f, idSo: created.idSo }));
      setErrors(e => ({ ...e, idSo: '' }));
      setShowPlusSo(false); setPlusSo({ nombre: '', version: '' });
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }

  async function quickCreateArea() {
    if (!plusArea.codigo.trim() || !plusArea.nombre.trim()) return;
    setPlusSaving(true); setPlusError(null);
    try {
      const created = await catalogoSvc.crearArea({
        codigoArea: plusArea.codigo.trim().toUpperCase(),
        nombreArea: plusArea.nombre.trim(),
        anioVigencia: plusArea.anio,
      });
      setAreas(prev => [...prev, created]);
      setForm(f => ({ ...f, idArea: created.idArea }));
      setErrors(e => ({ ...e, idArea: '' }));
      setShowPlusArea(false); setPlusArea({ codigo: '', nombre: '', anio: new Date().getFullYear() });
    } catch (e: unknown) {
      setPlusError(e instanceof Error ? e.message : 'Error');
    } finally { setPlusSaving(false); }
  }
```

- [ ] **Step 4: Extraer componente `SelectWithPlus` y reemplazar los 5 SelectField relevantes**

Añadir este componente helper justo antes de `export function InventarioNuevo()`:

```tsx
function SelectWithPlus({ label, value, onChange, options, error, disabled = false, onPlus }: {
  label: string; value: number; onChange: (v: string) => void;
  options: { value: number; label: string }[]; error?: string;
  disabled?: boolean; onPlus: () => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#5C6064] uppercase tracking-wide">{label}</Label>
      <div className="flex gap-2">
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          className={`flex-1 h-9 rounded-md border bg-white px-3 text-sm focus:outline-none disabled:opacity-50
            ${error ? 'border-[#D91E18]' : 'border-[#4A5D23]/30 focus:border-[#4A5D23]'}`}>
          <option value={0} disabled>Seleccionar...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" onClick={onPlus} title={`Nuevo ${label}`}
          className="h-9 w-9 flex items-center justify-center rounded-md border border-[#4A5D23]/30 text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-xs text-[#D91E18]">{error}</p>}
    </div>
  );
}
```

Reemplazar en el JSX del formulario los 5 `<SelectField>` de Tipo, Marca, Modelo, Área y SO por `<SelectWithPlus>` con el prop `onPlus` apuntando al correspondiente `setShowPlus*`.

Ejemplo para Tipo:
```tsx
<SelectWithPlus label="Tipo de Equipo *" value={form.idTipo} error={errors.idTipo}
  options={tipos.map(t => ({ value: t.idTipo, label: t.nombreTipo }))}
  onChange={v => { setForm(f => ({ ...f, idTipo: Number(v) })); setErrors(e => ({ ...e, idTipo: '' })); }}
  onPlus={() => { setPlusTipo(''); setPlusError(null); setShowPlusTipo(true); }} />
```

Aplicar igual para Marca, Modelo, SO y Área.

- [ ] **Step 5: Añadir los 5 modales quick-create al JSX (al final, antes del `</div>` final del return)**

```tsx
      {/* ── Quick-create modals ─────────────────────────────────────────────── */}

      {/* Tipo */}
      <Dialog open={showPlusTipo} onOpenChange={setShowPlusTipo}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nuevo Tipo de Equipo</DialogTitle></DialogHeader>
          <div className="py-2">
            <Field label="Nombre *" value={plusTipo} placeholder="Laptop, Monitor, Switch..."
              onChange={v => { setPlusTipo(v); setPlusError(null); }} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusTipo(false)}>Cancelar</Button>
            <Button onClick={quickCreateTipo} disabled={plusSaving || !plusTipo.trim()}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Marca */}
      <Dialog open={showPlusMarca} onOpenChange={setShowPlusMarca}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nueva Marca</DialogTitle></DialogHeader>
          <div className="py-2">
            <Field label="Nombre *" value={plusMarca} placeholder="HP, Dell, Lenovo..."
              onChange={v => { setPlusMarca(v); setPlusError(null); }} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusMarca(false)}>Cancelar</Button>
            <Button onClick={quickCreateMarca} disabled={plusSaving || !plusMarca.trim()}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modelo */}
      <Dialog open={showPlusModelo} onOpenChange={setShowPlusModelo}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nuevo Modelo</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <SelectField label="Marca *" value={plusModelo.idMarca}
              options={marcas.map(m => ({ value: m.idMarca, label: m.nombreMarca }))}
              onChange={v => setPlusModelo(p => ({ ...p, idMarca: Number(v) }))} />
            <SelectField label="Tipo *" value={plusModelo.idTipo}
              options={tipos.map(t => ({ value: t.idTipo, label: t.nombreTipo }))}
              onChange={v => setPlusModelo(p => ({ ...p, idTipo: Number(v) }))} />
            <Field label="Nombre del modelo *" value={plusModelo.nombre} placeholder="EliteBook 840 G9..."
              onChange={v => { setPlusModelo(p => ({ ...p, nombre: v })); setPlusError(null); }} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusModelo(false)}>Cancelar</Button>
            <Button onClick={quickCreateModelo}
              disabled={plusSaving || !plusModelo.nombre.trim() || !plusModelo.idMarca || !plusModelo.idTipo}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SO */}
      <Dialog open={showPlusSo} onOpenChange={setShowPlusSo}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nuevo Sistema Operativo</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Nombre *" value={plusSo.nombre} placeholder="Windows, Ubuntu..."
              onChange={v => { setPlusSo(p => ({ ...p, nombre: v })); setPlusError(null); }} />
            <Field label="Versión *" value={plusSo.version} placeholder="11 Pro, 22.04 LTS..."
              onChange={v => { setPlusSo(p => ({ ...p, version: v })); setPlusError(null); }} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusSo(false)}>Cancelar</Button>
            <Button onClick={quickCreateSo}
              disabled={plusSaving || !plusSo.nombre.trim() || !plusSo.version.trim()}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Área */}
      <Dialog open={showPlusArea} onOpenChange={setShowPlusArea}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-[#2C3E1F]">Nueva Área</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Código *" value={plusArea.codigo} placeholder="DTIC, LOGISTICA..."
              onChange={v => { setPlusArea(p => ({ ...p, codigo: v.toUpperCase() })); setPlusError(null); }} />
            <Field label="Nombre *" value={plusArea.nombre}
              onChange={v => { setPlusArea(p => ({ ...p, nombre: v })); setPlusError(null); }} />
            <Field label="Año vigencia *" value={String(plusArea.anio)} type="number"
              onChange={v => setPlusArea(p => ({ ...p, anio: Number(v) }))} />
          </div>
          {plusError && <p className="text-sm text-[#D91E18]">{plusError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlusArea(false)}>Cancelar</Button>
            <Button onClick={quickCreateArea}
              disabled={plusSaving || !plusArea.codigo.trim() || !plusArea.nombre.trim()}
              className="bg-[#4A5D23] hover:bg-[#3A4D29] text-white">
              {plusSaving ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
```

- [ ] **Step 6: Actualizar App.tsx — importar Catalogos y cambiar la ruta `/configuracion`**

Añadir import:
```tsx
import { Catalogos } from './components/Catalogos';
```

Cambiar:
```tsx
// antes:
<Route path="/configuracion" element={<Dashboard />} />
// después:
<Route path="/configuracion" element={<Catalogos />} />
```

- [ ] **Step 7: Build final**

```bash
cd frontend && npm run build
```

Expected: BUILD SUCCESS.

- [ ] **Step 8: Commit + push**

```bash
git add frontend/src/app/components/InventarioNuevo.tsx
git add frontend/src/app/App.tsx
git commit -m "feat(catalogos): add + buttons in InventarioNuevo and wire /configuracion to Catalogos"
git push
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Botón "+" en cada campo catalog de InventarioNuevo → Task 6
- ✅ Modal de creación rápida por catálogo → Task 6
- ✅ Auto-selección del ítem creado → handlers en Task 6
- ✅ Menú/sección de administración de catálogos → Task 5 (Catalogos.tsx bajo /configuracion)
- ✅ CRUD completo para TipoEquipo, Marca, Modelo → ya en backend, wired en Tasks 4-5
- ✅ CRUD completo para SistemaOperativo → Tasks 1-3 (backend) + Tasks 4-5 (frontend)
- ✅ CRUD completo para Área → Tasks 1-3 (backend) + Tasks 4-5 (frontend)

**2. Placeholder scan:** Ninguno — todos los steps tienen código completo.

**3. Type consistency:**
- `catalogoService.ts` usa `AreaResponse` con `idArea`, `codigoArea`, `nombreArea`, `descripcion`, `anioVigencia` — coincide con lo que devuelve el backend `AreaResponse.java`.
- `SistemaOperativoRequest` front y back usan `nombreSo` / `versionSo`.
- `SelectWithPlus` espera `onPlus: () => void` — todos los usos en Step 4 lo proveen.
- Los handlers `quickCreate*` usan las funciones del `catalogoService` con los tipos correctos.
