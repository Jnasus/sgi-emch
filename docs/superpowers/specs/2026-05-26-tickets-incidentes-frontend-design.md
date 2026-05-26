# Tickets / Incidentes — Frontend Design Spec

**Fecha:** 2026-05-26  
**Estado:** Aprobado

---

## Contexto

El módulo de Tickets (Incidentes) del SGI-EMCH gestiona el ciclo de vida de incidencias sobre el equipamiento inventariado. El backend está completamente implementado. Este spec cubre únicamente el frontend y los pequeños ajustes al backend requeridos.

---

## Decisiones de diseño

| Aspecto | Decisión |
|---|---|
| Layout principal (`/incidentes`) | Kanban con 4 columnas por estado |
| Carga de datos | Por columna: 4 fetches paralelos + "Ver más" por columna |
| Detalle del ticket | Página dedicada `/incidentes/:id` |
| Cambio de estado | Solo botones en la página de detalle (no drag-and-drop) |
| Crear ticket | Página dedicada `/incidentes/nuevo` |
| PDF del acta | Botón de descarga visible cuando `pdfActaPath != null` |

---

## Arquitectura y archivos

### Backend (ajustes mínimos)

**Modificar** `UsuarioController.java` — nuevo endpoint:
```java
@GetMapping("/tecnicos")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','TECNICO_CAMPO')")
@Operation(summary = "Listar técnicos de campo activos")
public ResponseEntity<ApiResponse<List<UsuarioResponse>>> listarTecnicos() {
    return ResponseEntity.ok(ApiResponse.ok("OK", usuarioService.listarTecnicos()));
}
```

**Modificar** `UsuarioService.java` — nuevo método:
```java
public List<UsuarioResponse> listarTecnicos() {
    // Busca el Rol con nombre "TECNICO_CAMPO", luego los usuarios activos con ese rol
    Rol rolTecnico = rolRepository.findByNombre("TECNICO_CAMPO")
        .orElseThrow(() -> new ResourceNotFoundException("Rol TECNICO_CAMPO no encontrado"));
    return usuarioRepository.findByRolAndActivoTrue(rolTecnico)
        .stream().map(usuarioMapper::toResponse).toList();
}
```

### Frontend — archivos nuevos

| Archivo | Responsabilidad |
|---|---|
| `src/services/ticketService.ts` | Todas las llamadas API de tickets + técnicos |
| `src/app/components/IncidenteDetalle.tsx` | Página `/incidentes/:id`: info + historial + cambio de estado |

### Frontend — archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/services/authService.ts` | Guardar `{idUsuario, username, rol, idArea}` al login; exponer `getCurrentUser()` |
| `src/app/components/Incidentes.tsx` | Reemplazar placeholder con Kanban real |
| `src/app/components/IncidenteNuevo.tsx` | Reemplazar placeholder con formulario real |
| `src/app/App.tsx` | Agregar ruta `<Route path="/incidentes/:id" element={<IncidenteDetalle />} />` |

---

## ticketService.ts — API surface

```typescript
// Tipos espejo de los DTOs del backend
interface TicketResponse {
  idTicket: number;
  numeroTicket: string;
  idEquipo: number;
  codigoEjercito: string;
  idTecnico: number;
  nombresTecnico: string;
  apellidosTecnico: string;
  idTipoIncidente: number;
  nombreTipoIncidente: string;
  titulo: string;
  descripcion: string;
  estado: 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  fechaApertura: string;       // ISO 8601
  fechaRespuesta: string | null;
  fechaResolucion: string | null;
  fechaCierre: string | null;
  fueraDeSla: boolean | null;
  pdfActaPath: string | null;
}

interface HistorialTicketResponse {
  idHistorial: number;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaCambio: string;
  nombreUsuario: string;
}

interface TicketCreateRequest {
  idEquipo: number;
  idTecnico: number;
  idTipoIncidente: number;
  titulo: string;
  descripcion: string;
  prioridad?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

// Funciones exportadas
listarTicketsPorEstado(estado: string, filtros?: {prioridad?: string; idTecnico?: number}, page?: number): Promise<PagedResponse<TicketResponse>>
obtenerTicket(id: number): Promise<TicketResponse>
crearTicket(data: TicketCreateRequest): Promise<TicketResponse>
cambiarEstado(id: number, estado: string): Promise<TicketResponse>
listarHistorial(id: number): Promise<HistorialTicketResponse[]>
listarTecnicos(): Promise<UsuarioResponse[]>
listarTiposIncidente(): Promise<TipoIncidenteResponse[]>
// Nota: si ya existe una función listarTiposIncidente() en catalogoService.ts, reusar esa en lugar de duplicar aquí
```

---

## authService.ts — cambios

```typescript
// Clave adicional en localStorage
const USER_KEY = 'sgi_user';

interface CurrentUser {
  idUsuario: number;
  username: string;
  rol: string;        // 'ADMINISTRADOR' | 'TECNICO_CAMPO' | 'SUPERVISOR'
  idArea: number;
}

// login() agrega al final:
localStorage.setItem(USER_KEY, JSON.stringify({
  idUsuario: data.idUsuario,
  username: data.username,
  rol: data.rol,
  idArea: data.idArea,
}));

// logout() agrega:
localStorage.removeItem(USER_KEY);

// Nuevo export:
export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
```

---

## Incidentes.tsx — Kanban Board

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  🎫 Incidentes / Tickets              [+ Nuevo Ticket]  │
│  Filtros: [Prioridad ▼] [Técnico ▼]                    │
├───────────────┬───────────────┬──────────────┬──────────┤
│  ABIERTO (N)  │ EN PROCESO (N)│ RESUELTO (N) │CERRADO(N)│
│               │               │              │          │
│  [Tarjeta]    │  [Tarjeta]    │  [Tarjeta]   │ [Tarjeta]│
│  [Tarjeta]    │  [Tarjeta]    │  [Tarjeta]   │ [Tarjeta]│
│               │               │              │          │
│  [Ver más ↓]  │  [Ver más ↓]  │  [Ver más ↓] │[Ver más ↓│
└───────────────┴───────────────┴──────────────┴──────────┘
```

### Tarjeta de ticket

```
┌─────────────────────────────────┐
│ TKT-202605-0001          🔴ALTA │  ← badge de prioridad
│ "Pantalla no enciende"          │
│ 💻 PC-EJTO-001                  │  ← codigoEjercito
│ 👤 Sgto. García                 │  ← nombresTecnico apellidosTecnico
│ 🕐 hace 2 horas                 │  ← fechaApertura relativa
└─────────────────────────────────┘
```

Colores de prioridad:
- BAJA → gris
- MEDIA → azul
- ALTA → naranja
- CRITICA → rojo

Colores de columna (header):
- ABIERTO → amarillo/ámbar
- EN_PROCESO → azul
- RESUELTO → verde
- CERRADO → gris

### Comportamiento

- Al montar, se hacen 4 fetches en paralelo (`Promise.all`): uno por estado (page=0, size=10)
- Cambio de filtros (prioridad, técnico) → resetea todas las columnas y recarga
- "Ver más" incrementa la página de la columna correspondiente y appends las tarjetas
- Click en tarjeta → `navigate('/incidentes/:id')`
- "Nuevo Ticket" → `navigate('/incidentes/nuevo')`

---

## IncidenteNuevo.tsx — Formulario de creación

### Campos

| Campo | Control | Fuente | Validación |
|---|---|---|---|
| Equipo | `<Select>` con búsqueda por codigoEjercito | `GET /api/equipos?size=500&sort=codigoEjercito,asc` | Requerido |
| Tipo de incidente | `<Select>` | `GET /api/catalogos/tipos-incidente` | Requerido |
| Técnico asignado | `<Select>` (pre-selecciona al usuario actual si TECNICO_CAMPO) | `GET /api/usuarios/tecnicos` | Requerido |
| Título | `<Input>` | — | Requerido, max 255 |
| Descripción | `<Textarea>` | — | Requerido |
| Prioridad | `<Select>` | enum fijo | Opcional (default MEDIA) |

### Comportamiento

- Todos los selects se cargan al montar con `Promise.all`
- Si el usuario actual es TECNICO_CAMPO (`getCurrentUser().rol === 'TECNICO_CAMPO'`): el select Técnico se pre-llena con `getCurrentUser().idUsuario` y queda deshabilitado
- Si es ADMINISTRADOR: select Técnico editable, lista completa
- Al submit → `POST /api/tickets` → en caso de éxito → `navigate('/incidentes/:idTicket')`
- Botón "Cancelar" → `navigate('/incidentes')`

---

## IncidenteDetalle.tsx — Página de detalle

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Volver a Incidentes                                   │
│                                                         │
│  TKT-202605-0001             [ABIERTO] [🔴 ALTA]       │
│  "Pantalla no enciende"                                 │
│                                                         │
│  ┌── Información ───────────┐  ┌── Acciones ──────────┐ │
│  │ Equipo: PC-EJTO-001      │  │ [→ Pasar a EN        │ │
│  │ Tipo: Falla hardware     │  │    PROCESO]          │ │
│  │ Técnico: Sgto. García    │  │                      │ │
│  │ Apertura: 26/05 09:00    │  │ [⬇ Descargar PDF]   │ │
│  │ Fuera de SLA: ❌ No      │  │  (si pdfActaPath)    │ │
│  │                          │  └──────────────────────┘ │
│  │ Descripción:             │                           │
│  │ "El monitor no presenta  │                           │
│  │  señal al encender..."   │                           │
│  └──────────────────────────┘                           │
│                                                         │
│  ┌── Historial de cambios ───────────────────────────── │
│  │ 26/05 10:30  ABIERTO → EN_PROCESO  (Admin López)    │
│  │ 26/05 09:00  Ticket creado          (Admin López)    │
│  └─────────────────────────────────────────────────── ─ │
└─────────────────────────────────────────────────────────┘
```

### Máquina de estados para el botón de avance

```
ABIERTO     → botón "Pasar a EN PROCESO"
EN_PROCESO  → botón "Marcar como RESUELTO"
RESUELTO    → botón "Cerrar Ticket"
CERRADO     → sin botón de avance
```

El botón de avance solo se muestra si:
- `getCurrentUser().rol === 'ADMINISTRADOR' || 'TECNICO_CAMPO'`

Al hacer click: `PATCH /api/tickets/:id/estado` con el nuevo estado → recarga el ticket y el historial.

### PDF

Si `ticket.pdfActaPath !== null`:
- Se muestra botón "Descargar Acta"
- Al hacer click: abre `pdfActaPath` en nueva pestaña (`window.open(pdfActaPath, '_blank')`)
- Nota: si la ruta es relativa (ej. `/files/actas/TKT-xxx.pdf`), se construye con `API_BASE + pdfActaPath`

### Carga de datos

- Al montar: fetch `obtenerTicket(id)` y `listarHistorial(id)` en paralelo
- Estado de carga mientras esperan los dos fetches
- Error 404 → mostrar "Ticket no encontrado" con botón volver

---

## Rutas en App.tsx

Agregar:
```tsx
<Route path="/incidentes/:id" element={<IncidenteDetalle />} />
```

Las rutas `/incidentes` y `/incidentes/nuevo` ya existen.

---

## Error handling

- Todos los errores de red muestran un alert descriptivo inline (no modal)
- 404 en detalle → "Ticket no encontrado"
- Error en cambio de estado → alert en la sección de acciones, no navega
- Error en crear ticket → alert debajo del formulario

---

## Consideraciones de accesibilidad y UX

- Columnas del Kanban con scroll vertical independiente (`overflow-y: auto`, `max-height`)
- Las tarjetas son clickeables con `cursor-pointer` y `hover` sutil
- El número de ticket `TKT-YYYYMM-NNNN` siempre en monospace para alineación visual
- Historial en orden cronológico inverso (más reciente arriba)
- Fechas formateadas como `dd/MM/yyyy HH:mm` (locale es-PE)

---

## Fuera de scope (esta iteración)

- Drag-and-drop en el Kanban
- Filtro por equipo en el Kanban
- Generación del PDF desde el frontend (solo descarga si ya existe)
- Notificaciones en tiempo real de nuevos tickets
