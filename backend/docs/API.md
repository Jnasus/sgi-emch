# SGI EMCH — Documentación del Backend

**Sistema de Gestión de Inventario — Ejército del Perú (CFB)**

---

## Tabla de Contenido

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Configuración y Ejecución](#configuración-y-ejecución)
4. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
5. [Autenticación](#autenticación)
6. [Formato de Respuesta](#formato-de-respuesta)
7. [Códigos de Error](#códigos-de-error)
8. [Roles y Permisos](#roles-y-permisos)
9. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Usuarios](#usuarios)
   - [Equipos](#equipos)
   - [Tickets](#tickets)
   - [Catálogos](#catálogos)
   - [Dashboard](#dashboard)
   - [Notificaciones](#notificaciones)
10. [Paginación](#paginación)
11. [Swagger UI](#swagger-ui)

---

## Descripción General

API REST del Sistema de Gestión de Inventario para el Centro de Formación y Bienestar (CFB) del Ejército del Perú. Gestiona el ciclo de vida completo del inventario de equipos tecnológicos: registro, asignación, mantenimiento, incidencias y alertas de stock.

| Entorno | Base URL |
|---|---|
| Producción | `https://api.escuelamilitar.edu.pe` |
| Local (Maven) | `http://localhost:8080` |

- **Prefijo de rutas:** `/api`
- **Formato:** JSON

---

## Stack Tecnológico

| Componente | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 3.5.14 |
| Spring Security | 6.x (JWT stateless) |
| Hibernate / JPA | 6.6 |
| MySQL | 8.0 |
| Maven | 3.x |
| SpringDoc OpenAPI | 2.x |

---

## Configuración y Ejecución

### Variables de entorno requeridas

Crea un archivo `.env` en la raíz del módulo `backend/` (está en `.gitignore`):

```properties
DB_USERNAME=root
DB_PASSWORD=tu_password_mysql
JWT_SECRET=clave-secreta-minimo-256-bits-en-base64
```

### Ejecutar

```bash
cd backend
mvn spring-boot:run
```

El servidor levanta en `http://localhost:8080`.

### Requisitos previos

- MySQL 8 corriendo en `localhost:3306` con la base de datos `db_sgi_emch` creada desde `db_sgi_emch.sql`.
- Java 21+ instalado.

---

## Arquitectura del Proyecto

```
src/main/java/pe/edu/emch/sgi/
├── config/          # SecurityConfig, SwaggerConfig, AuditInterceptorConfig
├── controller/      # REST controllers (un archivo por módulo)
├── dto/             # Request y Response DTOs organizados por módulo
│   ├── auth/
│   ├── common/      # ApiResponse, PagedResponse
│   ├── catalogo/
│   ├── dashboard/
│   ├── equipo/
│   ├── notificacion/
│   ├── ticket/
│   └── usuario/
├── entity/          # Entidades JPA (tablas normales + vistas de solo lectura)
├── exception/       # Excepciones personalizadas + GlobalExceptionHandler
├── repository/      # Spring Data JPA repositories
├── security/        # JwtUtil, JwtAuthFilter, UserDetailsServiceImpl, AuditSessionInterceptor
└── service/         # Lógica de negocio
```

---

## Autenticación

El sistema usa **JWT Bearer Token** (stateless). Todos los endpoints excepto `/api/auth/**` y Swagger requieren autenticación.

### Flujo

```
POST /api/auth/login  →  { accessToken, refreshToken }
                              ↓
Authorization: Bearer <accessToken>  →  Cualquier endpoint protegido
                              ↓
Token expirado (1h)  →  POST /api/auth/refresh  →  Nuevo accessToken
```

### Incluir el token en cada request

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Tiempos de expiración

| Token | Duración |
|---|---|
| Access Token | 1 hora (3 600 000 ms) |
| Refresh Token | 24 horas (86 400 000 ms) |

---

## Formato de Respuesta

Todas las respuestas siguen la misma envoltura `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "OK",
  "data": { }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Descripción del error",
  "data": null
}
```

**Paginada (`PagedResponse<T>`):**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "content": [ ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 150,
    "totalPages": 8,
    "last": false
  }
}
```

---

## Códigos de Error

| HTTP | Situación |
|---|---|
| `400 Bad Request` | Validación fallida o regla de negocio violada |
| `401 Unauthorized` | Sin token o credenciales inválidas |
| `403 Forbidden` | Token válido pero sin permisos suficientes |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Recurso duplicado (código, DNI, serie, etc.) |
| `500 Internal Server Error` | Error inesperado del servidor |

---

## Roles y Permisos

| Rol | Descripción |
|---|---|
| `ADMINISTRADOR` | Acceso total — CRUD en todas las entidades |
| `TECNICO_CAMPO` | Puede crear equipos, tickets y cambiar estados |
| *(cualquier usuario autenticado)* | Lectura de equipos, tickets, catálogos; gestión de sus propias notificaciones |

---

## Endpoints

---

### Auth

**Base:** `/api/auth`  
**Acceso:** Público (no requiere token)

---

#### `POST /api/auth/login`

Inicia sesión y retorna tokens JWT.

**Body:**
```json
{
  "username": "admin01",
  "password": "Admin2025#"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": 3600000,
    "idUsuario": 1,
    "username": "admin01",
    "rol": "ADMINISTRADOR",
    "idArea": 2
  }
}
```

**Errores:** `401` credenciales inválidas.

---

#### `POST /api/auth/refresh`

Renueva el access token usando el refresh token.

**Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response 200:** igual a `/login`.  
**Errores:** `401` refresh token inválido o expirado.

---

#### `POST /api/auth/logout`

Cierra la sesión (acción del cliente; invalida la sesión a nivel informativo).

**Response 200:**
```json
{ "success": true, "message": "Sesión cerrada correctamente", "data": null }
```

---

### Usuarios

**Base:** `/api/usuarios`  
**Acceso:** Solo `ADMINISTRADOR`

---

#### `GET /api/usuarios`

Lista usuarios con paginación. Filtros opcionales por query string.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `activo` | `boolean` | Filtrar por activo/inactivo |
| `idRol` | `integer` | Filtrar por rol |
| `page` | `integer` | Número de página (0-based) |
| `size` | `integer` | Tamaño de página (default 20) |
| `sort` | `string` | Campo de ordenamiento (default `apellidos`) |

**Response 200:** `PagedResponse<UsuarioResponse>`

---

#### `GET /api/usuarios/roles`

Lista todos los roles disponibles.

**Response 200:**
```json
{
  "data": [
    { "idRol": 1, "nombreRol": "ADMINISTRADOR" },
    { "idRol": 2, "nombreRol": "TECNICO_CAMPO" }
  ]
}
```

---

#### `GET /api/usuarios/{id}`

Obtiene un usuario por ID.

**Response 200:** `UsuarioResponse`  
**Errores:** `404` si no existe.

---

#### `POST /api/usuarios`

Crea un nuevo usuario.

**Body:**
```json
{
  "dni": "12345678",
  "nombres": "Carlos",
  "apellidos": "Pérez López",
  "username": "cperez01",
  "password": "Pass2025#",
  "idRol": 2,
  "idArea": 3,
  "grado": "Subteniente",
  "telefono": "987654321"
}
```

**Response 201:** `UsuarioResponse`  
**Errores:** `409` DNI o username ya registrado, `400` validación.

---

#### `PUT /api/usuarios/{id}`

Actualiza datos del usuario (sin cambiar contraseña).

**Body:** mismo esquema que `POST` sin `password`.

**Response 200:** `UsuarioResponse`

---

#### `PATCH /api/usuarios/{id}/estado`

Activa o desactiva un usuario.

**Body:**
```json
{ "activo": false }
```

**Response 200:** `UsuarioResponse`

---

#### `PUT /api/usuarios/{id}/password`

Resetea la contraseña del usuario.

**Body:**
```json
{ "nuevaPassword": "NuevoPass2025#" }
```

**Response 200:** `{ "data": null }`

---

### Equipos

**Base:** `/api/equipos`  
**Acceso:** Lectura: cualquier usuario autenticado. Escritura: `ADMINISTRADOR` o `TECNICO_CAMPO` según endpoint.

---

#### `GET /api/equipos`

Lista equipos paginados.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `estado` | `string` | `EN_BODEGA`, `ASIGNADO`, `EN_REPARACION`, `PRESTADO`, `DADO_DE_BAJA` |
| `idArea` | `integer` | Filtrar por área |
| `idTipo` | `integer` | Filtrar por tipo de equipo |
| `page`, `size`, `sort` | — | Paginación (default sort: `codigoEjercito`) |

**Response 200:** `PagedResponse<EquipoResponse>`

---

#### `GET /api/equipos/{id}`

Obtiene un equipo con sus especificaciones técnicas (si existen).

**Response 200:** `EquipoResponse` (incluye campo `especificaciones` anidado si existe).  
**Errores:** `404`

---

#### `POST /api/equipos` — Rol: `ADMINISTRADOR`

Registra un nuevo equipo.

**Body:**
```json
{
  "codigoEjercito": "EQ-001",
  "idTipo": 1,
  "idModelo": 3,
  "idArea": 2,
  "idSo": 1,
  "numeroSerie": "SN-XYZ-123456",
  "nombreResponsable": "Sgto. Juan Torres",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "ipAddress": "192.168.1.50",
  "tipoRed": "ETHERNET",
  "fechaAdquisicion": "2023-06-15",
  "observaciones": "Equipo de escritorio principal"
}
```

**Valores válidos `tipoRed`:** `ETHERNET`, `WIFI`, `N/A`

**Response 201:** `EquipoResponse`  
**Errores:** `409` código ejército o serie duplicados.

---

#### `PUT /api/equipos/{id}` — Rol: `ADMINISTRADOR`

Actualiza datos del equipo.

**Body:** mismo que `POST`.

**Response 200:** `EquipoResponse`

---

#### `PATCH /api/equipos/{id}/estado` — Rol: `ADMINISTRADOR` o `TECNICO_CAMPO`

Cambia el estado del equipo y registra historial automáticamente.

**Body:**
```json
{
  "estadoNuevo": "EN_REPARACION",
  "motivo": "Falla en disco duro"
}
```

**Valores válidos `estadoNuevo`:** `EN_BODEGA`, `ASIGNADO`, `EN_REPARACION`, `PRESTADO`, `DADO_DE_BAJA`

**Response 200:** `EquipoResponse` con `estado` actualizado.  
**Errores:** `404`

---

#### `PUT /api/equipos/{id}/especificaciones` — Rol: `ADMINISTRADOR` o `TECNICO_CAMPO`

Crea o actualiza las especificaciones técnicas del equipo (upsert).

**Body:**
```json
{
  "procesador": "Intel Core i7-12700",
  "nucleos": 12,
  "hilos": 20,
  "ramModulos": 2,
  "ramTotalGb": 16,
  "ramVelocidadMhz": 3200,
  "ramMarca": "Kingston",
  "discoModelo": "Samsung 870 EVO",
  "discoInterface": "SATA",
  "discoCapacidadGb": 500.00,
  "discoUsadoGb": 120.50,
  "discoLibreGb": 379.50,
  "gpuMarca": "NVIDIA",
  "gpuModelo": "RTX 3060",
  "gpuVramGb": 12.00,
  "monitorMarca": "LG",
  "monitorModelo": "27UK850",
  "redModelo": "Intel I225-V"
}
```

**Response 200:** `EspecificacionTecnicaResponse`

---

#### `GET /api/equipos/{id}/historial`

Obtiene el historial de cambios de estado del equipo.

**Response 200:**
```json
{
  "data": [
    {
      "idHistorial": 5,
      "estadoAnterior": "EN_BODEGA",
      "estadoNuevo": "ASIGNADO",
      "motivo": "Asignado a nuevo integrante",
      "fechaCambio": "2025-03-10T14:30:00",
      "nombreUsuario": "Admin Sistema"
    }
  ]
}
```

---

### Tickets

**Base:** `/api/tickets`  
**Acceso:** Lectura: cualquier autenticado. Escritura/cambio de estado: `ADMINISTRADOR` o `TECNICO_CAMPO`.

---

#### `GET /api/tickets`

Lista tickets paginados.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `estado` | `string` | `ABIERTO`, `EN_PROCESO`, `RESUELTO`, `CERRADO` |
| `prioridad` | `string` | `BAJA`, `MEDIA`, `ALTA`, `CRITICA` |
| `idEquipo` | `integer` | Filtrar por equipo |
| `idTecnico` | `integer` | Filtrar por técnico asignado |
| `page`, `size`, `sort` | — | Paginación (default sort: `fechaApertura`) |

**Response 200:** `PagedResponse<TicketResponse>`

---

#### `GET /api/tickets/{id}`

Obtiene un ticket por ID.

**Response 200:** `TicketResponse`  
**Errores:** `404`

---

#### `POST /api/tickets` — Rol: `ADMINISTRADOR` o `TECNICO_CAMPO`

Crea un nuevo ticket de incidencia. El número de ticket se genera automáticamente con formato `TKT-YYYYMM-NNNN`.

**Body:**
```json
{
  "idEquipo": 5,
  "idTecnico": 3,
  "idTipoIncidente": 2,
  "titulo": "PC no enciende al presionar el botón de encendido",
  "descripcion": "El equipo no responde al encendido. Luces de indicador apagadas.",
  "prioridad": "ALTA"
}
```

**Valores válidos `prioridad`:** `BAJA`, `MEDIA`, `ALTA`, `CRITICA` (default: `MEDIA`)

**Response 201:** `TicketResponse` con `estado: "ABIERTO"` y `numeroTicket` asignado.

---

#### `PATCH /api/tickets/{id}/estado` — Rol: `ADMINISTRADOR` o `TECNICO_CAMPO`

Cambia el estado del ticket y registra historial.

**Body:**
```json
{
  "estado": "EN_PROCESO",
  "comentario": "Se inició diagnóstico del equipo"
}
```

**Transiciones válidas `estado`:** `ABIERTO` → `EN_PROCESO` → `RESUELTO` → `CERRADO`

**Response 200:** `TicketResponse` con estado actualizado.  
**Errores:** `404`, `400` transición de estado inválida.

---

#### `GET /api/tickets/{id}/historial`

Lista el historial de cambios de estado del ticket.

**Response 200:**
```json
{
  "data": [
    {
      "idHistTicket": 1,
      "estadoAnterior": "ABIERTO",
      "estadoNuevo": "EN_PROCESO",
      "comentario": "Se inició diagnóstico",
      "fechaCambio": "2025-04-12T09:15:00",
      "nombreUsuario": "Tec. Pedro Quispe"
    }
  ]
}
```

---

### Catálogos

**Base:** `/api/catalogos`  
**Acceso:** Lectura: cualquier autenticado. Escritura: solo `ADMINISTRADOR`.

---

#### `GET /api/catalogos/areas`

Lista todas las áreas activas.

```json
{ "data": [{ "idArea": 1, "codigoArea": "A-001", "nombreArea": "Batallón de Comunicaciones" }] }
```

---

#### `GET /api/catalogos/tipos-equipo`

Lista todos los tipos de equipo.

```json
{ "data": [{ "idTipo": 1, "nombreTipo": "Computadora de escritorio", "umbralStockPct": 70 }] }
```

---

#### `POST /api/catalogos/tipos-equipo` — Rol: `ADMINISTRADOR`

Crea un tipo de equipo.

```json
{ "nombreTipo": "Laptop" }
```

#### `PUT /api/catalogos/tipos-equipo/{idTipo}` — Rol: `ADMINISTRADOR`

Actualiza un tipo de equipo.

---

#### `GET /api/catalogos/marcas`

Lista todas las marcas.

#### `POST /api/catalogos/marcas` — Rol: `ADMINISTRADOR`

```json
{ "nombreMarca": "Lenovo" }
```

#### `PUT /api/catalogos/marcas/{idMarca}` — Rol: `ADMINISTRADOR`

---

#### `GET /api/catalogos/modelos?marcaId={id}`

Lista modelos. Filtrable por marca.

#### `POST /api/catalogos/modelos` — Rol: `ADMINISTRADOR`

```json
{ "nombreModelo": "ThinkPad E14", "idMarca": 2, "idTipo": 1 }
```

#### `PUT /api/catalogos/modelos/{idModelo}` — Rol: `ADMINISTRADOR`

---

#### `GET /api/catalogos/sistemas-operativos`

Lista sistemas operativos registrados.

---

#### `GET /api/catalogos/tipos-incidente`

Lista tipos de incidente con tiempos SLA configurados.

```json
{
  "data": [
    { "idTipoIncidente": 1, "nombreTipo": "Falla de hardware", "tiempoResolucionMin": 480 }
  ]
}
```

---

#### `PUT /api/catalogos/stock/{idTipo}` — Rol: `ADMINISTRADOR`

Configura el umbral de stock crítico para un tipo de equipo.

```json
{ "umbralPct": 70 }
```

**Response 200:** `ConfigStockResponse`

---

#### `PUT /api/catalogos/sla/{idTipo}` — Rol: `ADMINISTRADOR`

Configura el tiempo SLA de un tipo de incidente.

```json
{ "tiempoResolucionMin": 240 }
```

**Response 200:** `TipoIncidenteResponse`

---

### Dashboard

**Base:** `/api/dashboard`  
**Acceso:** Solo `ADMINISTRADOR`

> Los datos provienen de vistas MySQL calculadas en tiempo real.

---

#### `GET /api/dashboard/resumen`

Resumen general del inventario agrupado por tipo de equipo.

**Response 200:**
```json
{
  "data": [
    {
      "nombreTipo": "Computadora de escritorio",
      "total": 45,
      "asignados": 30,
      "enBodega": 10,
      "enReparacion": 3,
      "dadosDeBaja": 2,
      "stockOperativo": 43,
      "umbralStockPct": 70,
      "pctOperativo": 95.6,
      "equiposMayores5Anios": 8
    }
  ]
}
```

---

#### `GET /api/dashboard/inventario`

Listado completo del inventario con especificaciones técnicas.  
Soporta paginación: `?page=0&size=20`.

**Response 200:** `PagedResponse<InventarioCompletoResponse>`

Cada ítem incluye: código ejército, tipo, marca, modelo, área, S.O., estado, fecha de adquisición, antigüedad en años, especificaciones técnicas (CPU, RAM, disco, GPU, monitor), porcentaje de uso de disco.

---

#### `GET /api/dashboard/stock-critico`

Tipos de equipo cuyo porcentaje operativo está por debajo del umbral configurado.

**Response 200:**
```json
{
  "data": [
    {
      "idTipo": 1,
      "nombreTipo": "Computadora de escritorio",
      "totalEquipos": 45,
      "stockOperativo": 30,
      "umbralPct": 70,
      "pctActual": 66.7,
      "enAlerta": true
    }
  ]
}
```

---

#### `GET /api/dashboard/tickets-activos`

Tickets en estado `ABIERTO` o `EN_PROCESO` con información de SLA en tiempo real.

**Response 200:**
```json
{
  "data": [
    {
      "idTicket": 12,
      "numeroTicket": "TKT-202504-0012",
      "codigoEjercito": "EQ-005",
      "nombreArea": "Batallón de Comunicaciones",
      "tecnico": "Pedro Quispe Mamani",
      "tipoIncidente": "Falla de hardware",
      "titulo": "PC no enciende",
      "estado": "EN_PROCESO",
      "prioridad": "ALTA",
      "fechaApertura": "2025-04-12T08:00:00",
      "slaMinutos": 480,
      "minutosTranscurridos": 210,
      "minutosRestantesSla": 270,
      "slaVencido": false,
      "fueraDeSla": false
    }
  ]
}
```

---

### Notificaciones

**Base:** `/api/notificaciones`  
**Acceso:** Cualquier usuario autenticado. Cada usuario solo accede a sus propias notificaciones.

> El `id_usuario` se extrae automáticamente del JWT — no se envía en el body.

---

#### `GET /api/notificaciones`

Lista notificaciones del usuario autenticado. Orden: más recientes primero.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `leida` | `boolean` | Filtrar por leídas (`true`) o no leídas (`false`) |
| `page`, `size` | — | Paginación (default size 20) |

**Response 200:** `PagedResponse<NotificacionResponse>`

```json
{
  "data": {
    "content": [
      {
        "idNotif": 8,
        "idUsuario": 1,
        "tipoNotif": "STOCK_CRITICO",
        "titulo": "Alerta de stock crítico",
        "mensaje": "El tipo 'Laptop' está por debajo del umbral configurado.",
        "leida": false,
        "urlAccion": "/dashboard",
        "fechaCreacion": "2025-04-15T07:30:00"
      }
    ]
  }
}
```

**Tipos de notificación:** `STOCK_CRITICO`, `SLA_VENCIDO`, `TICKET_ASIGNADO`, `INFO`

---

#### `PATCH /api/notificaciones/{id}/leer`

Marca una notificación como leída.

**Response 200:** `NotificacionResponse` con `leida: true`.  
**Errores:** `404` si no existe o no pertenece al usuario.

---

#### `PATCH /api/notificaciones/leer-todas`

Marca todas las notificaciones no leídas del usuario como leídas.

**Response 200:**
```json
{ "success": true, "message": "Notificaciones marcadas como leídas", "data": null }
```

---

#### `DELETE /api/notificaciones/{id}`

Elimina una notificación del usuario autenticado.

**Response 200:**
```json
{ "success": true, "message": "Notificación eliminada", "data": null }
```

**Errores:** `404` si no existe o no pertenece al usuario.

---

## Paginación

Todos los endpoints de listado soportan los siguientes query params estándar de Spring Data:

| Parámetro | Descripción | Ejemplo |
|---|---|---|
| `page` | Número de página (0-based) | `?page=1` |
| `size` | Elementos por página | `?size=10` |
| `sort` | Campo y dirección | `?sort=fechaApertura,desc` |

**Ejemplo:**
```
GET /api/equipos?estado=ASIGNADO&page=0&size=10&sort=codigoEjercito,asc
```

---

## Swagger UI

| Entorno | URL |
|---|---|
| Producción | `https://api.escuelamilitar.edu.pe/swagger-ui.html` |
| Local | `http://localhost:8080/swagger-ui.html` |

El esquema OpenAPI en JSON:

| Entorno | URL |
|---|---|
| Producción | `https://api.escuelamilitar.edu.pe/api-docs` |
| Local | `http://localhost:8080/api-docs` |

> Para probar endpoints protegidos en Swagger, usa **Authorize** e ingresa:  
> `Bearer eyJhbGci...` (el accessToken obtenido del login)

> **Nota HTTPS:** el backend corre detrás de Nginx Proxy Manager que termina SSL.
> `server.forward-headers-strategy=FRAMEWORK` está configurado para que Spring Boot
> respete `X-Forwarded-Proto` y Swagger genere URLs `https://` correctamente.

---

## Tests

El proyecto cuenta con **140 tests unitarios** distribuidos en:

| Módulo | Service Tests | Controller Tests |
|---|---|---|
| Auth | 4 | — |
| Usuarios | 14 | 7 |
| Equipos | 13 | 7 |
| Tickets | 14 | 7 |
| Catálogos | 14 | 7 |
| Dashboard | 4 | 6 |
| Notificaciones | 9 | 6 |
| Utilidades | 4 | — |

```bash
mvn test
```
