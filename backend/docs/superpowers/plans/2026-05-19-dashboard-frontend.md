# Dashboard Frontend Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar el Dashboard del frontend React con los 4 endpoints REST del backend. Incluye integración real de login/JWT para que los API calls autenticados funcionen.

**Architecture:** Capa de servicio delgada (`src/lib/api.ts` + `src/services/`) que usa `fetch` nativo con token JWT de localStorage. El `Dashboard.tsx` reemplaza datos mock con `useEffect` + `Promise.all`. El `Login.tsx` llama al backend real y propaga errores.

**Tech Stack:** React 18, TypeScript, Vite, fetch nativo (sin axios), localStorage para JWT, Recharts (ya instalado)

**Backend base URL:** `http://localhost:8080`

**Backend API contracts:**
- `POST /api/auth/login` body `{username, password}` → `{success, data: {accessToken, refreshToken, tokenType, expiresIn, idUsuario, username, rol, idArea}}`
- `GET /api/dashboard/resumen` → `{success, data: [{nombreTipo, total, asignados, enBodega, enReparacion, dadosDeBaja, stockOperativo, umbralStockPct, pctOperativo, equiposMayores5Anios}]}`
- `GET /api/dashboard/stock-critico` → `{success, data: [{idTipo, nombreTipo, totalEquipos, stockOperativo, umbralPct, pctActual, enAlerta}]}`
- `GET /api/dashboard/tickets-activos` → `{success, data: [{idTicket, numeroTicket, codigoEjercito, nombreArea, tecnico, tipoIncidente, titulo, estado, prioridad, fechaApertura, slaMinutos, minutosTranscurridos, minutosRestantesSla, slaVencido, fueraDeSla}]}`

---

## File Map

| File | Action |
|---|---|
| `src/lib/api.ts` | Create |
| `src/services/authService.ts` | Create |
| `src/services/dashboardService.ts` | Create |
| `src/app/App.tsx` | Modify |
| `src/app/components/Login.tsx` | Modify |
| `src/app/components/Dashboard.tsx` | Modify |

**Frontend root:** `C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend`

---

### Task 1: API client + Auth service + App/Login integration

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/services/authService.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/app/components/Login.tsx`

**Context:**
- `src/lib/` y `src/services/` no existen — crearlos al crear los archivos
- El backend devuelve `ApiResponse<T>` con estructura `{ success: boolean, message: string, data: T }`
- El JWT se guarda en `localStorage` con key `'sgi_token'`
- `App.tsx` actualmente tiene `handleLogin` síncrono falso — convertirlo a async real
- `Login.tsx` actualmente tiene `onLogin: (username, password) => void` — cambiar a `Promise<void>` para soportar async + errores

- [ ] **Step 1: Crear `src/lib/api.ts`**

```typescript
export const API_BASE = 'http://localhost:8080';

export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('sgi_token');
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
```

- [ ] **Step 2: Crear `src/services/authService.ts`**

```typescript
import { API_BASE } from '../lib/api';

const TOKEN_KEY = 'sgi_token';

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
  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}
```

- [ ] **Step 3: Modificar `src/app/App.tsx`**

Reemplazar TODO el contenido del archivo con:

```typescript
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventario } from './components/Inventario';
import { InventarioDetalle } from './components/InventarioDetalle';
import { InventarioNuevo } from './components/InventarioNuevo';
import { Incidentes } from './components/Incidentes';
import { IncidenteNuevo } from './components/IncidenteNuevo';
import { Reportes } from './components/Reportes';
import { Notificaciones } from './components/Notificaciones';
import { Usuarios } from './components/Usuarios';
import * as authService from '../services/authService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const handleLogin = async (username: string, password: string): Promise<void> => {
    await authService.login(username, password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/inventario/nuevo" element={<InventarioNuevo />} />
          <Route path="/inventario/:id" element={<InventarioDetalle />} />
          <Route path="/incidentes" element={<Incidentes />} />
          <Route path="/incidentes/nuevo" element={<IncidenteNuevo />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracion" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
```

- [ ] **Step 4: Modificar `src/app/components/Login.tsx`**

Cambiar la interfaz `LoginProps` y el `handleSubmit` para soportar login async con errores:

Reemplazar SOLO estas partes (mantener todo el JSX/diseño intacto):

1. Cambiar `LoginProps`:
```typescript
interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}
```

2. Añadir estado `loading` al `useState` inicial:
```typescript
const [loading, setLoading] = useState(false);
```

3. Reemplazar `handleSubmit`:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!username || !password) {
    setError('Por favor complete todos los campos');
    return;
  }
  try {
    setLoading(true);
    setError('');
    await onLogin(username, password);
  } catch {
    setError('Credenciales inválidas. Verifique su usuario y contraseña.');
  } finally {
    setLoading(false);
  }
};
```

4. En el botón submit, añadir `disabled={loading}` y cambiar el texto cuando carga:
```typescript
<Button
  type="submit"
  disabled={loading}
  className="w-full h-11 bg-[#4A5D23] hover:bg-[#3A4D29] text-white uppercase tracking-wider relative overflow-hidden group disabled:opacity-70"
  style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.1em' }}
>
  <span className="relative z-10">{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
  <motion.div
    className="absolute inset-0 bg-[#D91E18]"
    initial={{ x: '-100%' }}
    whileHover={{ x: 0 }}
    transition={{ duration: 0.3 }}
  />
</Button>
```

- [ ] **Step 5: Verificar que TypeScript compila sin errores**

En el directorio del frontend:
```
npx tsc --noEmit
```

Expected: sin errores. Si hay errores de importación de rutas, verificar que los paths `../services/authService` y `../lib/api` son correctos relativos a cada archivo.

- [ ] **Step 6: Commit**

```
git add src/lib/api.ts
git add src/services/authService.ts
git add src/app/App.tsx
git add src/app/components/Login.tsx
git commit -m "feat(auth): integrate real JWT login with backend"
```

---

### Task 2: Dashboard service

**Files:**
- Create: `src/services/dashboardService.ts`

**Context:**
- Usar `fetchWithAuth` de `../lib/api`
- Todos los endpoints requieren el token JWT (rol ADMINISTRADOR)
- Los números decimales `pctOperativo` y `pctActual` llegan como número en el JSON

- [ ] **Step 1: Crear `src/services/dashboardService.ts`**

```typescript
import { fetchWithAuth } from '../lib/api';

export interface DashboardResumen {
  nombreTipo: string;
  total: number;
  asignados: number;
  enBodega: number;
  enReparacion: number;
  dadosDeBaja: number;
  stockOperativo: number;
  umbralStockPct: number;
  pctOperativo: number;
  equiposMayores5Anios: number;
}

export interface StockCritico {
  idTipo: number;
  nombreTipo: string;
  totalEquipos: number;
  stockOperativo: number;
  umbralPct: number;
  pctActual: number;
  enAlerta: boolean;
}

export interface TicketActivo {
  idTicket: number;
  numeroTicket: string;
  codigoEjercito: string;
  nombreArea: string;
  tecnico: string;
  tipoIncidente: string;
  titulo: string;
  estado: string;
  prioridad: string;
  fechaApertura: string;
  slaMinutos: number;
  minutosTranscurridos: number;
  minutosRestantesSla: number;
  slaVencido: boolean;
  fueraDeSla: boolean;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.data as T;
}

export const getResumen = () => getJson<DashboardResumen[]>('/api/dashboard/resumen');
export const getStockCritico = () => getJson<StockCritico[]>('/api/dashboard/stock-critico');
export const getTicketsActivos = () => getJson<TicketActivo[]>('/api/dashboard/tickets-activos');
```

- [ ] **Step 2: Verificar compilación**

```
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```
git add src/services/dashboardService.ts
git commit -m "feat(dashboard): add dashboard service with TypeScript types"
```

---

### Task 3: Dashboard component — datos reales

**Files:**
- Modify: `src/app/components/Dashboard.tsx`

**Context:**

**Mapeo de datos reales a la UI:**

Stats cards (calculados desde resumen + stockCritico + tickets):
- Equipos Totales = `resumen.reduce((s, r) => s + r.total, 0)`
- En Bodega = `resumen.reduce((s, r) => s + r.enBodega, 0)`
- Asignados = `resumen.reduce((s, r) => s + r.asignados, 0)`
- En Reparación = `resumen.reduce((s, r) => s + r.enReparacion, 0)`
- Tickets Activos = `tickets.length`
- Stock Crítico (tipos en alerta) = `stockCritico.filter(s => s.enAlerta).length`

Charts:
1. "Equipos por Tipo" (bar) ← `resumen.map(r => ({ area: r.nombreTipo, cantidad: r.total }))` — dataKey `"area"` y `"cantidad"`
2. "Incidentes por Tipo" (bar horizontal) ← agrupar `tickets` por `tipoIncidente`: `[{ tipo: string, cantidad: number }]`
3. "Estado de Inventario" (pie) ← sumas de resumen: `[{name:'En Bodega', value:sumBodega}, {name:'Asignados', value:sumAsignados}, {name:'En Reparación', value:sumReparacion}, {name:'Dado de Baja', value:sumBaja}]`
4. "Stock Crítico por Tipo" (barra con referencia) ← reemplaza "Tendencia de Incidentes": `stockCritico.map(s => ({ tipo: s.nombreTipo, pctActual: Number(s.pctActual), umbral: s.umbralPct }))`  — 2 barras: `pctActual` (verde/rojo según alerta) y `umbral` (línea de referencia naranja)

Actividad Reciente ← top 5 de `tickets` (los primeros 5):
- action = ticket.estado === 'ABIERTO' ? 'Ticket abierto' : 'En proceso'
- detail = `${ticket.numeroTicket} - ${ticket.titulo || ticket.codigoEjercito}`
- time = `SLA: ${ticket.minutosRestantesSla} min restantes`
- type = ticket.slaVencido ? 'error' : ticket.estado === 'ABIERTO' ? 'warning' : 'info'

Loading state: mientras carga, mostrar un div con texto "Cargando dashboard..." en lugar de los cards y charts.

Error state: si falla, mostrar mensaje de error en rojo.

- [ ] **Step 1: Reemplazar Dashboard.tsx completo**

```typescript
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Warehouse,
  UserCheck,
  Wrench,
  AlertTriangle,
  Activity,
  BarChart3,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import * as dashboardService from '../../services/dashboardService';
import type { DashboardResumen, StockCritico, TicketActivo } from '../../services/dashboardService';

const COLORS = ['#4A5D23', '#7A8F3A', '#D91E18', '#5C6064'];

export function Dashboard() {
  const [resumen, setResumen] = useState<DashboardResumen[]>([]);
  const [stockCritico, setStockCritico] = useState<StockCritico[]>([]);
  const [tickets, setTickets] = useState<TicketActivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [res, sc, tkt] = await Promise.all([
          dashboardService.getResumen(),
          dashboardService.getStockCritico(),
          dashboardService.getTicketsActivos(),
        ]);
        setResumen(res);
        setStockCritico(sc);
        setTickets(tkt);
      } catch {
        setError('No se pudo cargar el dashboard. Verifique la conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#4A5D23] text-lg font-medium uppercase tracking-wider">
          Cargando dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border-l-4 border-[#D91E18] p-4 max-w-md">
          <p className="text-[#D91E18] font-semibold">Error</p>
          <p className="text-sm text-[#D91E18] mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // ── computed stats ──────────────────────────────────────────────────────────
  const totalEquipos = resumen.reduce((s, r) => s + r.total, 0);
  const totalBodega = resumen.reduce((s, r) => s + r.enBodega, 0);
  const totalAsignados = resumen.reduce((s, r) => s + r.asignados, 0);
  const totalReparacion = resumen.reduce((s, r) => s + r.enReparacion, 0);
  const totalBaja = resumen.reduce((s, r) => s + r.dadosDeBaja, 0);
  const tiposEnAlerta = stockCritico.filter((s) => s.enAlerta).length;

  const statsCards = [
    { icon: Package, label: 'Equipos Totales', value: totalEquipos.toLocaleString(), color: '#4A5D23' },
    { icon: Warehouse, label: 'En Bodega', value: totalBodega.toLocaleString(), color: '#5C6064' },
    { icon: UserCheck, label: 'Asignados', value: totalAsignados.toLocaleString(), color: '#7A8F3A' },
    { icon: Wrench, label: 'En Reparación', value: totalReparacion.toLocaleString(), color: '#D91E18' },
    { icon: AlertTriangle, label: 'Tickets Activos', value: tickets.length.toString(), color: '#D91E18' },
    { icon: Activity, label: 'Stock Crítico', value: tiposEnAlerta.toString(), color: tiposEnAlerta > 0 ? '#D91E18' : '#4A5D23' },
  ];

  // ── chart data ──────────────────────────────────────────────────────────────
  const equiposPorTipo = resumen.map((r) => ({ area: r.nombreTipo, cantidad: r.total }));

  const incidentesPorTipo = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      acc[t.tipoIncidente] = (acc[t.tipoIncidente] || 0) + 1;
      return acc;
    }, {})
  ).map(([tipo, cantidad]) => ({ tipo, cantidad }));

  const estadoInventario = [
    { name: 'En Bodega', value: totalBodega },
    { name: 'Asignados', value: totalAsignados },
    { name: 'En Reparación', value: totalReparacion },
    { name: 'Dado de Baja', value: totalBaja },
  ].filter((d) => d.value > 0);

  const stockChart = stockCritico.map((s) => ({
    tipo: s.nombreTipo,
    pctActual: Number(s.pctActual),
    umbral: s.umbralPct,
    enAlerta: s.enAlerta,
  }));

  // ── recent activity from tickets ────────────────────────────────────────────
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: stat.color }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-sm bg-[#F5F5F0]">
                      <Icon className="w-5 h-5" style={{ color: stat.color }} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-sm text-[#5C6064] uppercase tracking-wide mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    {stat.label}
                  </p>
                  <p className="text-[#2C3E1F]" style={{ fontSize: '1.875rem', fontWeight: 700 }}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Type */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-t-4 border-t-[#4A5D23]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#4A5D23]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Equipos por Tipo
                </CardTitle>
              </div>
              <CardDescription>Distribución de equipos por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={equiposPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                  <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#4A5D23" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Incidents by Type */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-t-4 border-t-[#D91E18]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D91E18]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Tickets por Tipo de Incidente
                </CardTitle>
              </div>
              <CardDescription>Categorización de tickets activos</CardDescription>
            </CardHeader>
            <CardContent>
              {incidentesPorTipo.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-[#5C6064]">
                  No hay tickets activos
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentesPorTipo} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="tipo" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#D91E18" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-t-4 border-t-[#5C6064]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#5C6064]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Estado de Inventario
                </CardTitle>
              </div>
              <CardDescription>Distribución actual del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estadoInventario}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estadoInventario.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Crítico por Tipo */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="border-t-4 border-t-[#7A8F3A]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[#7A8F3A]" />
                <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Stock Operativo por Tipo
                </CardTitle>
              </div>
              <CardDescription>% operativo vs umbral mínimo por tipo de equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`]} />
                  <Legend />
                  <Bar
                    dataKey="pctActual"
                    name="% Operativo"
                    radius={[4, 4, 0, 0]}
                    fill="#4A5D23"
                    label={false}
                  />
                  <ReferenceLine y={stockChart[0]?.umbral ?? 80} stroke="#D91E18" strokeDasharray="4 4" label={{ value: 'Umbral', position: 'insideTopRight', fontSize: 11, fill: '#D91E18' }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Tickets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-t-4 border-t-[#4A5D23]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4A5D23]" />
              <CardTitle className="uppercase tracking-wide" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                Tickets Activos Recientes
              </CardTitle>
            </div>
            <CardDescription>Últimos tickets abiertos o en proceso con estado de SLA</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-center text-[#5C6064] py-8">No hay tickets activos</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => {
                  const isUrgent = ticket.slaVencido || ticket.fueraDeSla;
                  const borderColor = isUrgent ? '#D91E18' : ticket.estado === 'ABIERTO' ? '#D91E18' : '#4A5D23';
                  const dotColor = borderColor;
                  return (
                    <div
                      key={ticket.idTicket}
                      className="flex items-start gap-3 p-3 rounded-sm hover:bg-[#F5F5F0] transition-colors border-l-2"
                      style={{ borderLeftColor: borderColor }}
                    >
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: dotColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#2C3E1F]" style={{ fontWeight: 600 }}>
                          {ticket.numeroTicket} — {ticket.tipoIncidente}
                        </p>
                        <p className="text-sm text-[#5C6064]">
                          {ticket.codigoEjercito} · {ticket.nombreArea} · {ticket.tecnico}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded ${ticket.slaVencido ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {ticket.slaVencido ? 'SLA vencido' : `${ticket.minutosRestantesSla} min SLA`}
                        </span>
                        <p className="text-xs text-[#5C6064] mt-1">{ticket.estado}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
npx tsc --noEmit
```

Expected: sin errores de tipo. Si hay error de importación `../../services/dashboardService`, verificar el path relativo — el archivo está en `src/app/components/Dashboard.tsx` y el servicio en `src/services/dashboardService.ts`, entonces el path correcto es `../../services/dashboardService`.

- [ ] **Step 3: Iniciar el servidor de desarrollo y verificar en el navegador**

```
npm run dev
```

Abrir `http://localhost:5173` (o el puerto que muestre Vite).

Verificar:
1. Login muestra "Verificando..." al hacer submit
2. Con credenciales válidas → entra al dashboard
3. El dashboard muestra "Cargando dashboard..." mientras carga
4. Con backend encendido: los datos reales aparecen en cards y charts
5. Sin backend encendido: muestra el mensaje de error

- [ ] **Step 4: Commit**

```
git add src/app/components/Dashboard.tsx
git commit -m "feat(dashboard): connect to backend API endpoints with real data"
```

---

## Verificación end-to-end

1. Backend corriendo en `http://localhost:8080`
2. `npm run dev` en el frontend
3. Login con credenciales reales (usuario ADMINISTRADOR del backend)
4. Dashboard muestra datos reales: totales de equipos, tickets activos, gráficas
5. Si el usuario no tiene rol ADMINISTRADOR, el backend retorna 403 y el dashboard muestra el error
6. Al recargar la página, el usuario sigue autenticado (token en localStorage)
7. Logout limpia el token y redirige al login
