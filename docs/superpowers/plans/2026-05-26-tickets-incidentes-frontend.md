# Tickets / Incidentes — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el frontend completo del módulo Tickets/Incidentes: Kanban board, formulario de creación, página de detalle con historial y cambio de estado, más el endpoint backend `/api/usuarios/tecnicos`.

**Architecture:** Kanban de 4 columnas (ABIERTO/EN_PROCESO/RESUELTO/CERRADO) con carga por columna y "Ver más". Detalle en página dedicada `/incidentes/:id`. Creación en `/incidentes/nuevo`. Un servicio `ticketService.ts` agrupa todas las llamadas API. Backend añade un endpoint mínimo `/api/usuarios/tecnicos` accesible a ADMIN y TECNICO_CAMPO.

**Tech Stack:** Java 21 / Spring Boot (backend), React 18 / TypeScript / shadcn-ui / motion/react / fetchWithAuth (frontend), Maven (build backend), Vite + npx tsc (build frontend)

**Working directories:**
- Backend: `C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\backend`
- Frontend: `C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend`

---

## File map

| Archivo | Acción |
|---|---|
| `backend/.../repository/UsuarioRepository.java` | Modificar — agregar `findTecnicosCampoActivos()` |
| `backend/.../service/UsuarioService.java` | Modificar — agregar `listarTecnicos()` |
| `backend/.../controller/UsuarioController.java` | Modificar — agregar `GET /api/usuarios/tecnicos` |
| `frontend/src/services/authService.ts` | Modificar — guardar user info al login, `getCurrentUser()` |
| `frontend/src/services/ticketService.ts` | Crear — tipos + 7 funciones API |
| `frontend/src/app/components/Incidentes.tsx` | Reemplazar — Kanban real |
| `frontend/src/app/components/IncidenteNuevo.tsx` | Reemplazar — formulario real |
| `frontend/src/app/components/IncidenteDetalle.tsx` | Crear — página de detalle |
| `frontend/src/app/App.tsx` | Modificar — ruta `/incidentes/:id` |

---

## Task 1: Backend — endpoint GET /api/usuarios/tecnicos

**Files:**
- Modify: `src/main/java/pe/edu/emch/sgi/repository/UsuarioRepository.java`
- Modify: `src/main/java/pe/edu/emch/sgi/service/UsuarioService.java`
- Modify: `src/main/java/pe/edu/emch/sgi/controller/UsuarioController.java`

- [ ] **Step 1: Agregar query en UsuarioRepository**

Abrir `src/main/java/pe/edu/emch/sgi/repository/UsuarioRepository.java`.

Agregar `import java.util.List;` junto al import existente de `Optional`.

Agregar al final de la interfaz (antes del `}`):

```java
@Query("SELECT u FROM Usuario u WHERE u.rol.nombreRol = 'TECNICO_CAMPO' AND u.activo = true ORDER BY u.apellidos")
List<Usuario> findTecnicosCampoActivos();
```

El archivo completo debe quedar:

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByUsernameAndActivoTrue(String username);

    boolean existsByDni(String dni);

    boolean existsByUsername(String username);

    boolean existsByDniAndIdUsuarioNot(String dni, Integer idUsuario);

    boolean existsByUsernameAndIdUsuarioNot(String username, Integer idUsuario);

    @Query("SELECT u FROM Usuario u WHERE (:activo IS NULL OR u.activo = :activo) AND (:idRol IS NULL OR u.rol.idRol = :idRol)")
    Page<Usuario> findFiltered(@Param("activo") Boolean activo, @Param("idRol") Integer idRol, Pageable pageable);

    @Modifying
    @Query("UPDATE Usuario u SET u.ultimoAcceso = :ahora WHERE u.idUsuario = :idUsuario")
    void actualizarUltimoAcceso(@Param("idUsuario") Integer idUsuario, @Param("ahora") LocalDateTime ahora);

    @Query("SELECT u FROM Usuario u WHERE u.rol.nombreRol = 'TECNICO_CAMPO' AND u.activo = true ORDER BY u.apellidos")
    List<Usuario> findTecnicosCampoActivos();
}
```

- [ ] **Step 2: Agregar método listarTecnicos() en UsuarioService**

Abrir `src/main/java/pe/edu/emch/sgi/service/UsuarioService.java`.

Agregar este método **después** de `listarRoles()` y **antes** de `crearUsuario()`:

```java
@Transactional(readOnly = true)
public List<UsuarioResponse> listarTecnicos() {
    return usuarioRepository.findTecnicosCampoActivos()
        .stream().map(this::toUsuarioResponse).toList();
}
```

- [ ] **Step 3: Agregar endpoint en UsuarioController**

Abrir `src/main/java/pe/edu/emch/sgi/controller/UsuarioController.java`.

Agregar este método **después** de `listarRoles()` (línea ~56):

```java
@GetMapping("/tecnicos")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','TECNICO_CAMPO')")
@Operation(summary = "Listar técnicos de campo activos")
public ResponseEntity<ApiResponse<List<UsuarioResponse>>> listarTecnicos() {
    return ResponseEntity.ok(ApiResponse.ok("OK", usuarioService.listarTecnicos()));
}
```

Nota: el `@PreAuthorize` a nivel de método sobreescribe el `@PreAuthorize("hasRole('ADMINISTRADOR')")` de la clase para este endpoint.

- [ ] **Step 4: Verificar compilación**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\backend"
mvn compile -q
```

Esperado: sin errores. Si hay error de compilación, revisar que `List` esté importado en `UsuarioRepository.java`.

- [ ] **Step 5: Commit**

```
git add src/main/java/pe/edu/emch/sgi/repository/UsuarioRepository.java
git add src/main/java/pe/edu/emch/sgi/service/UsuarioService.java
git add src/main/java/pe/edu/emch/sgi/controller/UsuarioController.java
git commit -m "feat(usuarios): add GET /api/usuarios/tecnicos endpoint for ADMIN and TECNICO_CAMPO"
```

---

## Task 2: Frontend — authService.ts + ticketService.ts

**Files:**
- Modify: `frontend/src/services/authService.ts`
- Create: `frontend/src/services/ticketService.ts`

- [ ] **Step 1: Actualizar authService.ts**

Reemplazar el contenido completo de `frontend/src/services/authService.ts` con:

```typescript
import { API_BASE } from '../lib/api';

const TOKEN_KEY = 'sgi_token';
const USER_KEY  = 'sgi_user';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  idUsuario: number;
  username: string;
  rol: string;
  idArea: number;
}

export interface CurrentUser {
  idUsuario: number;
  username: string;
  rol: string;   // 'ADMINISTRADOR' | 'TECNICO_CAMPO' | 'SUPERVISOR'
  idArea: number;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error('Credenciales inválidas');
  }
  const body = await res.json();
  const data: LoginResponse = body.data;
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify({
    idUsuario: data.idUsuario,
    username:  data.username,
    rol:       data.rol,
    idArea:    data.idArea,
  }));
  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as CurrentUser) : null;
}
```

- [ ] **Step 2: Crear ticketService.ts**

Crear el archivo `frontend/src/services/ticketService.ts` con el siguiente contenido:

```typescript
import { fetchWithAuth } from '../lib/api';

// ── Tipos (mirrors de los DTOs del backend) ───────────────────────────────────

export interface TicketResponse {
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
  fechaApertura: string;
  fechaRespuesta: string | null;
  fechaResolucion: string | null;
  fechaCierre: string | null;
  fueraDeSla: boolean | null;
  pdfActaPath: string | null;
}

export interface HistorialTicketResponse {
  idHistTicket: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  fechaCambio: string;
  idUsuario: number;
  nombresUsuario: string;
  apellidosUsuario: string;
}

export interface TicketCreateRequest {
  idEquipo: number;
  idTecnico: number;
  idTipoIncidente: number;
  titulo: string;
  descripcion: string;
  prioridad?: string;
}

export interface TipoIncidenteResponse {
  idTipoIncidente: number;
  nombreTipo: string;
  tiempoRespuestaMin: number;
  tiempoResolucionMin: number;
  descripcion: string;
}

/** Subconjunto de UsuarioResponse que necesitamos para el select de técnicos */
export interface TecnicoResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  nombreRol: string;
  activo: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).data as T;
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return (await res.json()).data as T;
}

async function patchJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'PATCH', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return (await res.json()).data as T;
}

// ── API ───────────────────────────────────────────────────────────────────────

/**
 * Lista tickets de una columna del Kanban.
 * @param estado    'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO'
 * @param filtros   { prioridad?, idTecnico? }
 * @param pagina    0-based page number
 * @param tamanio   items per page (default 10)
 */
export function listarTicketsPorEstado(
  estado: string,
  filtros: { prioridad?: string; idTecnico?: number } = {},
  pagina = 0,
  tamanio = 10,
): Promise<PagedResponse<TicketResponse>> {
  const params = new URLSearchParams({
    estado,
    page: String(pagina),
    size: String(tamanio),
    sort: 'fechaApertura,desc',
  });
  if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
  if (filtros.idTecnico) params.append('idTecnico', String(filtros.idTecnico));
  return getJson<PagedResponse<TicketResponse>>(`/api/tickets?${params}`);
}

export const obtenerTicket = (id: number): Promise<TicketResponse> =>
  getJson<TicketResponse>(`/api/tickets/${id}`);

export const crearTicket = (data: TicketCreateRequest): Promise<TicketResponse> =>
  postJson<TicketResponse>('/api/tickets', data);

export const cambiarEstado = (id: number, estado: string): Promise<TicketResponse> =>
  patchJson<TicketResponse>(`/api/tickets/${id}/estado`, { estado });

export const listarHistorial = (id: number): Promise<HistorialTicketResponse[]> =>
  getJson<HistorialTicketResponse[]>(`/api/tickets/${id}/historial`);

/** Lista usuarios activos con rol TECNICO_CAMPO. Accesible a ADMIN y TECNICO_CAMPO. */
export const listarTecnicos = (): Promise<TecnicoResponse[]> =>
  getJson<TecnicoResponse[]>('/api/usuarios/tecnicos');

export const listarTiposIncidente = (): Promise<TipoIncidenteResponse[]> =>
  getJson<TipoIncidenteResponse[]>('/api/catalogos/tipos-incidente');
```

- [ ] **Step 3: Verificar TypeScript**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
git add src/services/authService.ts src/services/ticketService.ts
git commit -m "feat(tickets): add ticketService and authService getCurrentUser"
```

---

## Task 3: Frontend — Incidentes.tsx (Kanban board)

**Files:**
- Modify: `frontend/src/app/components/Incidentes.tsx` (reemplazar placeholder completo)

- [ ] **Step 1: Reemplazar Incidentes.tsx**

Escribir el archivo completo `frontend/src/app/components/Incidentes.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Plus, AlertCircle, Clock, CheckCircle2, XCircle, ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as ticketSvc from '../../services/ticketService';
import type { TicketResponse, TecnicoResponse } from '../../services/ticketService';

// ── Constantes ────────────────────────────────────────────────────────────────

const ESTADOS = ['ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'] as const;
type EstadoTicket = typeof ESTADOS[number];

const COL_CONFIG: Record<EstadoTicket, {
  label: string;
  headerClass: string;
  borderClass: string;
  Icon: LucideIcon;
}> = {
  ABIERTO:    { label: 'Abierto',    headerClass: 'bg-amber-50 border-b border-amber-200',  borderClass: 'border-2 border-amber-400',  Icon: AlertCircle  },
  EN_PROCESO: { label: 'En Proceso', headerClass: 'bg-blue-50 border-b border-blue-200',    borderClass: 'border-2 border-blue-400',   Icon: Clock        },
  RESUELTO:   { label: 'Resuelto',   headerClass: 'bg-green-50 border-b border-green-200',  borderClass: 'border-2 border-green-400',  Icon: CheckCircle2 },
  CERRADO:    { label: 'Cerrado',    headerClass: 'bg-gray-50 border-b border-gray-200',    borderClass: 'border-2 border-gray-300',   Icon: XCircle      },
};

const PRIORIDAD_CLASS: Record<string, string> = {
  BAJA:    'bg-gray-100 text-gray-600 border-gray-300',
  MEDIA:   'bg-blue-100 text-blue-700 border-blue-300',
  ALTA:    'bg-orange-100 text-orange-700 border-orange-300',
  CRITICA: 'bg-red-100 text-red-700 border-red-300',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function tiempoRelativo(fechaIso: string): string {
  const mins = Math.floor((Date.now() - new Date(fechaIso).getTime()) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hs = Math.floor(mins / 60);
  if (hs < 24) return `hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  return `hace ${dias} día${dias !== 1 ? 's' : ''}`;
}

// ── Tipos internos ────────────────────────────────────────────────────────────

interface ColState {
  tickets: TicketResponse[];
  pagina: number;
  totalElements: number;
  cargandoMas: boolean;
}

function colInicial(): ColState {
  return { tickets: [], pagina: 0, totalElements: 0, cargandoMas: false };
}

type ColsMap = Record<EstadoTicket, ColState>;

// ── Componente ────────────────────────────────────────────────────────────────

export function Incidentes() {
  const navigate = useNavigate();

  const [cols, setCols] = useState<ColsMap>({
    ABIERTO: colInicial(), EN_PROCESO: colInicial(),
    RESUELTO: colInicial(), CERRADO: colInicial(),
  });
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [tecnicos, setTecnicos]               = useState<TecnicoResponse[]>([]);
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroTecnico, setFiltroTecnico]     = useState('');

  // Cargar lista de técnicos para el filtro (una sola vez)
  useEffect(() => {
    ticketSvc.listarTecnicos().then(setTecnicos).catch(() => {});
  }, []);

  // Recargar todas las columnas cuando cambien los filtros
  useEffect(() => {
    const filtros = {
      prioridad: filtroPrioridad || undefined,
      idTecnico: filtroTecnico ? Number(filtroTecnico) : undefined,
    };
    setCargandoInicial(true);
    setError(null);
    Promise.all(ESTADOS.map(e => ticketSvc.listarTicketsPorEstado(e, filtros, 0)))
      .then(resultados => {
        const nuevasCols = {} as ColsMap;
        ESTADOS.forEach((e, i) => {
          nuevasCols[e] = {
            tickets: resultados[i].content,
            pagina: 0,
            totalElements: resultados[i].totalElements,
            cargandoMas: false,
          };
        });
        setCols(nuevasCols);
      })
      .catch(() => setError('Error al cargar los tickets. Intente nuevamente.'))
      .finally(() => setCargandoInicial(false));
  }, [filtroPrioridad, filtroTecnico]);

  function verMas(estado: EstadoTicket) {
    const col = cols[estado];
    const siguientePagina = col.pagina + 1;
    const filtros = {
      prioridad: filtroPrioridad || undefined,
      idTecnico: filtroTecnico ? Number(filtroTecnico) : undefined,
    };
    setCols(prev => ({ ...prev, [estado]: { ...prev[estado], cargandoMas: true } }));
    ticketSvc.listarTicketsPorEstado(estado, filtros, siguientePagina)
      .then(resp => {
        setCols(prev => ({
          ...prev,
          [estado]: {
            tickets: [...prev[estado].tickets, ...resp.content],
            pagina: siguientePagina,
            totalElements: resp.totalElements,
            cargandoMas: false,
          },
        }));
      })
      .catch(() => {
        setCols(prev => ({ ...prev, [estado]: { ...prev[estado], cargandoMas: false } }));
      });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-1"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            Mesa de Ayuda — Incidentes
          </h2>
          <p className="text-[#5C6064]">Gestión de tickets e incidentes técnicos</p>
        </div>
        <Button
          className="gap-2 bg-[#D91E18] hover:bg-[#B81614] text-white"
          onClick={() => navigate('/incidentes/nuevo')}
        >
          <Plus className="w-4 h-4" />
          Nuevo Ticket
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
            <SelectTrigger className="w-[200px] border-[#4A5D23]/30 h-10">
              <SelectValue placeholder="Todas las prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las prioridades</SelectItem>
              <SelectItem value="CRITICA">Crítica</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="BAJA">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroTecnico} onValueChange={setFiltroTecnico}>
            <SelectTrigger className="w-[230px] border-[#4A5D23]/30 h-10">
              <SelectValue placeholder="Todos los técnicos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los técnicos</SelectItem>
              {tecnicos.map(t => (
                <SelectItem key={t.idUsuario} value={String(t.idUsuario)}>
                  {t.nombres} {t.apellidos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban */}
      {cargandoInicial ? (
        <div className="flex items-center justify-center h-64 text-[#5C6064]">
          Cargando tickets...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {ESTADOS.map(estado => {
            const cfg = COL_CONFIG[estado];
            const { Icon } = cfg;
            const col = cols[estado];
            const hayMas = col.tickets.length < col.totalElements;
            return (
              <div key={estado} className={`rounded-xl overflow-hidden flex flex-col ${cfg.borderClass}`}>
                {/* Cabecera de columna */}
                <div className={`px-4 py-3 flex items-center justify-between ${cfg.headerClass}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-sm uppercase tracking-wide">
                      {cfg.label}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">{col.totalElements}</Badge>
                </div>

                {/* Tarjetas */}
                <div className="overflow-y-auto max-h-[600px] p-3 space-y-3 bg-white">
                  {col.tickets.length === 0 ? (
                    <p className="text-center text-[#5C6064] text-sm py-10">Sin tickets</p>
                  ) : (
                    col.tickets.map((ticket, idx) => (
                      <motion.div
                        key={ticket.idTicket}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-white border border-[#E8E8E3] rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-[#4A5D23]/40 transition-all"
                        onClick={() => navigate(`/incidentes/${ticket.idTicket}`)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-xs text-[#5C6064] truncate">
                            {ticket.numeroTicket}
                          </span>
                          <Badge variant="outline"
                                 className={`text-xs shrink-0 ${PRIORIDAD_CLASS[ticket.prioridad] ?? ''}`}>
                            {ticket.prioridad}
                          </Badge>
                        </div>
                        <p className="text-[#2C3E1F] text-sm font-medium leading-snug mb-2 line-clamp-2">
                          {ticket.titulo}
                        </p>
                        <div className="space-y-0.5 text-xs text-[#5C6064]">
                          <div className="flex items-center gap-1">
                            <span>💻</span>
                            <span className="font-mono">{ticket.codigoEjercito}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span>{ticket.nombresTecnico} {ticket.apellidosTecnico}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🕐</span>
                            <span>{tiempoRelativo(ticket.fechaApertura)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}

                  {hayMas && (
                    <Button
                      variant="ghost" size="sm"
                      className="w-full text-[#5C6064] hover:text-[#2C3E1F]"
                      disabled={col.cargandoMas}
                      onClick={() => verMas(estado)}
                    >
                      <ChevronDown className="w-4 h-4 mr-1" />
                      {col.cargandoMas ? 'Cargando...' : 'Ver más'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```
git add src/app/components/Incidentes.tsx
git commit -m "feat(incidentes): implement Kanban board with 4 columns and lazy loading"
```

---

## Task 4: Frontend — IncidenteNuevo.tsx (formulario de creación)

**Files:**
- Modify: `frontend/src/app/components/IncidenteNuevo.tsx` (reemplazar placeholder completo)

- [ ] **Step 1: Reemplazar IncidenteNuevo.tsx**

```tsx
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
  const esTecnico   = currentUser?.rol === 'TECNICO_CAMPO';

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
        prioridad,
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
```

- [ ] **Step 2: Verificar TypeScript**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```
git add src/app/components/IncidenteNuevo.tsx
git commit -m "feat(incidentes): implement IncidenteNuevo form with catalog selects"
```

---

## Task 5: Frontend — IncidenteDetalle.tsx (página de detalle)

**Files:**
- Create: `frontend/src/app/components/IncidenteDetalle.tsx`

- [ ] **Step 1: Crear IncidenteDetalle.tsx**

```tsx
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, AlertCircle, Clock, CheckCircle2, XCircle,
  ChevronRight, Download, FileText, type LucideIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import * as ticketSvc from '../../services/ticketService';
import type { TicketResponse, HistorialTicketResponse } from '../../services/ticketService';
import { getCurrentUser } from '../../services/authService';
import { API_BASE } from '../../lib/api';

// ── Configuración ─────────────────────────────────────────────────────────────

const ESTADO_CFG: Record<string, {
  label: string;
  badgeClass: string;
  Icon: LucideIcon;
}> = {
  ABIERTO:    { label: 'Abierto',    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',  Icon: AlertCircle  },
  EN_PROCESO: { label: 'En Proceso', badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',     Icon: Clock        },
  RESUELTO:   { label: 'Resuelto',   badgeClass: 'bg-green-100 text-green-700 border-green-300',  Icon: CheckCircle2 },
  CERRADO:    { label: 'Cerrado',    badgeClass: 'bg-gray-100 text-gray-600 border-gray-300',     Icon: XCircle      },
};

const PRIORIDAD_CLASS: Record<string, string> = {
  BAJA:    'bg-gray-100 text-gray-600 border-gray-300',
  MEDIA:   'bg-blue-100 text-blue-700 border-blue-300',
  ALTA:    'bg-orange-100 text-orange-700 border-orange-300',
  CRITICA: 'bg-red-100 text-red-700 border-red-300',
};

/** El siguiente estado en la máquina de estados de tickets */
const SIGUIENTE: Record<string, string> = {
  ABIERTO:    'EN_PROCESO',
  EN_PROCESO: 'RESUELTO',
  RESUELTO:   'CERRADO',
};

const LABEL_SIGUIENTE: Record<string, string> = {
  ABIERTO:    'Pasar a EN PROCESO',
  EN_PROCESO: 'Marcar como RESUELTO',
  RESUELTO:   'Cerrar Ticket',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fechaHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-[#5C6064] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[#2C3E1F] font-semibold text-sm">{value || '—'}</p>
    </div>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export function IncidenteDetalle() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const currentUser = getCurrentUser();
  const puedeAvanzar =
    currentUser?.rol === 'ADMINISTRADOR' || currentUser?.rol === 'TECNICO_CAMPO';

  const [ticket,   setTicket]   = useState<TicketResponse | null>(null);
  const [historial, setHistorial] = useState<HistorialTicketResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorEstado,     setErrorEstado]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const idNum = Number(id);
    setCargando(true);
    setError(null);
    Promise.all([
      ticketSvc.obtenerTicket(idNum),
      ticketSvc.listarHistorial(idNum),
    ])
      .then(([t, h]) => { setTicket(t); setHistorial(h); })
      .catch(err => {
        const msg = err instanceof Error ? err.message : '';
        setError(msg.includes('404') ? 'Ticket no encontrado.' : 'Error al cargar el ticket.');
      })
      .finally(() => setCargando(false));
  }, [id]);

  async function handleAvanzarEstado() {
    if (!ticket) return;
    const siguiente = SIGUIENTE[ticket.estado];
    if (!siguiente) return;
    setCambiandoEstado(true);
    setErrorEstado(null);
    try {
      const actualizado = await ticketSvc.cambiarEstado(ticket.idTicket, siguiente);
      setTicket(actualizado);
      const h = await ticketSvc.listarHistorial(ticket.idTicket);
      setHistorial(h);
    } catch (err) {
      setErrorEstado(err instanceof Error ? err.message : 'Error al cambiar el estado.');
    } finally {
      setCambiandoEstado(false);
    }
  }

  // ── Render: loading / error ───────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64 text-[#5C6064]">
        Cargando ticket...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" className="gap-2"
                onClick={() => navigate('/incidentes')}>
          <ArrowLeft className="w-4 h-4" /> Volver a Incidentes
        </Button>
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const estadoCfg    = ESTADO_CFG[ticket.estado] ?? ESTADO_CFG['ABIERTO'];
  const { Icon: EstadoIcon } = estadoCfg;
  const siguienteEstado      = SIGUIENTE[ticket.estado];

  // ── Render: detalle ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb + título */}
      <div className="flex items-start gap-4 flex-wrap">
        <Button
          variant="outline" size="icon"
          className="border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white shrink-0"
          onClick={() => navigate('/incidentes')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[#2C3E1F] uppercase tracking-wider mb-0.5 font-mono"
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            {ticket.numeroTicket}
          </h2>
          <p className="text-[#5C6064] text-sm truncate">{ticket.titulo}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`gap-1 text-xs ${estadoCfg.badgeClass}`}>
            <EstadoIcon className="w-3 h-3" />
            {estadoCfg.label}
          </Badge>
          <Badge variant="outline" className={`text-xs ${PRIORIDAD_CLASS[ticket.prioridad] ?? ''}`}>
            {ticket.prioridad}
          </Badge>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Columna principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Datos */}
          <Card className="border-l-4 border-l-[#D91E18]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                         style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                <FileText className="w-4 h-4 text-[#D91E18]" />
                Información del Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Equipo"          value={ticket.codigoEjercito} />
              <InfoField label="Tipo"            value={ticket.nombreTipoIncidente} />
              <InfoField label="Técnico"         value={`${ticket.nombresTecnico} ${ticket.apellidosTecnico}`} />
              <InfoField label="Fecha apertura"  value={fechaHora(ticket.fechaApertura)} />
              {ticket.fechaRespuesta  && <InfoField label="Fecha respuesta"  value={fechaHora(ticket.fechaRespuesta)} />}
              {ticket.fechaResolucion && <InfoField label="Fecha resolución" value={fechaHora(ticket.fechaResolucion)} />}
              {ticket.fechaCierre     && <InfoField label="Fecha cierre"     value={fechaHora(ticket.fechaCierre)} />}
              {ticket.fueraDeSla !== null && (
                <div>
                  <p className="text-xs text-[#5C6064] uppercase tracking-wide mb-1">SLA</p>
                  <p className={`text-sm font-semibold ${ticket.fueraDeSla ? 'text-red-600' : 'text-green-600'}`}>
                    {ticket.fueraDeSla ? '❌ Fuera de SLA' : '✅ Dentro de SLA'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descripción */}
          {ticket.descripcion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                           style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                  <FileText className="w-4 h-4 text-[#4A5D23]" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#2C3E1F] text-sm whitespace-pre-wrap leading-relaxed">
                  {ticket.descripcion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Historial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wide"
                         style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                <Clock className="w-4 h-4 text-[#4A5D23]" />
                Historial de Cambios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {historial.length === 0 ? (
                <p className="text-[#5C6064] text-sm">Sin cambios registrados.</p>
              ) : (
                historial.map((h, idx) => (
                  <div key={h.idHistTicket}>
                    {idx > 0 && <Separator className="my-3" />}
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#4A5D23] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {h.estadoAnterior ? (
                            <>
                              <Badge variant="outline" className="text-xs">{h.estadoAnterior}</Badge>
                              <ChevronRight className="w-3 h-3 text-[#5C6064]" />
                            </>
                          ) : (
                            <span className="text-xs text-[#5C6064]">Ticket creado →</span>
                          )}
                          <Badge variant="outline" className="text-xs">{h.estadoNuevo}</Badge>
                        </div>
                        <p className="text-xs text-[#5C6064]">
                          {fechaHora(h.fechaCambio)} · {h.nombresUsuario} {h.apellidosUsuario}
                        </p>
                        {h.comentario && (
                          <p className="text-sm text-[#2C3E1F] mt-1">{h.comentario}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna acciones (1/3) */}
        <div className="space-y-4">
          {puedeAvanzar && siguienteEstado && (
            <Card>
              <CardHeader>
                <CardTitle className="uppercase tracking-wide"
                           style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {errorEstado && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errorEstado}</span>
                  </div>
                )}
                <Button
                  className="w-full gap-2 bg-[#4A5D23] hover:bg-[#3A4A1C] text-white"
                  disabled={cambiandoEstado}
                  onClick={handleAvanzarEstado}
                >
                  <ChevronRight className="w-4 h-4" />
                  {cambiandoEstado ? 'Actualizando...' : LABEL_SIGUIENTE[ticket.estado]}
                </Button>
              </CardContent>
            </Card>
          )}

          {ticket.pdfActaPath && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-[#4A5D23] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white"
                  onClick={() => {
                    const url = ticket.pdfActaPath!.startsWith('http')
                      ? ticket.pdfActaPath!
                      : `${API_BASE}${ticket.pdfActaPath}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Descargar Acta PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```
git add src/app/components/IncidenteDetalle.tsx
git commit -m "feat(incidentes): implement IncidenteDetalle page with historial and state advance"
```

---

## Task 6: Frontend — App.tsx + build final

**Files:**
- Modify: `frontend/src/app/App.tsx`

- [ ] **Step 1: Agregar import y ruta en App.tsx**

En `frontend/src/app/App.tsx`, agregar el import:

```tsx
import { IncidenteDetalle } from './components/IncidenteDetalle';
```

(Junto a los otros imports de componentes, por ejemplo después de `import { IncidenteNuevo } ...`)

Luego agregar la ruta **antes** de `<Route path="/incidentes/nuevo" ...>` (para que rutas más específicas no sean capturadas por `:id`):

```tsx
<Route path="/incidentes/:id" element={<IncidenteDetalle />} />
```

El bloque de rutas de incidentes debe quedar:

```tsx
<Route path="/incidentes" element={<Incidentes />} />
<Route path="/incidentes/nuevo" element={<IncidenteNuevo />} />
<Route path="/incidentes/:id" element={<IncidenteDetalle />} />
```

- [ ] **Step 2: Verificar TypeScript**

```
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Build de producción**

```
npm run build
```

Esperado: `✓ built in X.XXs` sin errores. Si hay warnings de TypeScript no fatales, son aceptables; errores de compilación no.

- [ ] **Step 4: Commit final**

```
git add src/app/App.tsx
git commit -m "feat(incidentes): add /incidentes/:id route — tickets module frontend complete"
```

---

## Verificación end-to-end (manual)

1. **Kanban**: navegar a `/incidentes` → se ven 4 columnas con tickets reales del backend. Probar filtro de prioridad y técnico.
2. **Ver más**: si hay >10 tickets en una columna, el botón "Ver más" carga la siguiente página.
3. **Crear ticket**: botón "Nuevo Ticket" → `/incidentes/nuevo` → llenar formulario → guardar → redirige a `/incidentes/:id`.
4. **Detalle**: hacer click en una tarjeta del Kanban → se carga la información y el historial.
5. **Avanzar estado** (como ADMINISTRADOR o TECNICO_CAMPO): el botón aparece. Hacer click → estado cambia, historial se actualiza.
6. **PDF**: si el ticket tiene `pdfActaPath`, aparece botón de descarga.
7. **TECNICO_CAMPO**: al crear un ticket, el campo Técnico está pre-llenado y deshabilitado.
