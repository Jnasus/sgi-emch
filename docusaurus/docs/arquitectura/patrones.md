---
id: patrones
title: Patrones de diseño
sidebar_position: 6
---

# Patrones de diseño utilizados

## Backend (Spring Boot)

### 1. Arquitectura en capas (Layered Architecture)

El backend se organiza en capas con dependencias unidireccionales descendentes:

```
Controller → Service → Repository → Entity
```

Ninguna capa inferior conoce a la superior. Los Controllers nunca acceden directamente a los Repositories.

### 2. Repository Pattern

Implementado mediante Spring Data JPA. Cada entidad tiene su propio repositorio con una interfaz que extiende `JpaRepository`. Las consultas personalizadas se definen con `@Query` y JPQL.

```java
// Ejemplo: EquipoRepository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {
    @Query("SELECT e FROM Equipo e WHERE (:estado IS NULL OR e.estado = :estado) ...")
    Page<Equipo> findFiltered(String estado, Integer idArea, Integer idTipo, Pageable pageable);
}
```

### 3. DTO Pattern (Data Transfer Object)

Las entidades JPA **nunca** se exponen directamente en la API. Se usan DTOs como records Java:
- `*Request`: datos de entrada (POST/PUT) — validan y transportan datos del cliente al servicio.
- `*Response`: datos de salida (GET) — seleccionan y transforman campos de la entidad para el cliente.

Esto desacopla el modelo de BD del contrato público de la API.

### 4. Service Layer Pattern

La lógica de negocio vive exclusivamente en los `@Service`. Los controladores solo orquestan: deserializan el request, llaman al servicio, serializan la response. Reglas como "no puede haber dos equipos con el mismo código de ejército" están en el servicio, no en el controlador ni en el repositorio.

### 5. Filter Chain (Cadena de responsabilidad)

Spring Security implementa una cadena de filtros. En SGI-EMCH se añaden dos filtros custom:

```
Request → JwtFilter → AuditSessionInterceptor → DispatcherServlet → Controller
```

- **JwtFilter**: valida el token Bearer, carga el `SecurityContext`.
- **AuditSessionInterceptor**: establece las variables de sesión MySQL (`SET @id_usuario_activo = ?`) que los triggers de auditoría utilizan.

### 6. Observer / Publisher (Notificaciones)

`NotificadorService` actúa como publicador: cuando ocurre un evento (ticket asignado, SLA vencido, stock crítico), determina los destinatarios y crea los registros en `notificacion`. Los componentes que generan eventos (TicketService, NotificacionScheduler) no conocen la lógica de entrega — solo llaman a `NotificadorService`.

```
TicketService.crearTicket()  ──→  NotificadorService.notificarTicketAsignado()  ──→  NotificacionService.crear()
NotificacionScheduler        ──→  NotificadorService.notificarSlaVencido()      ──→  NotificacionService.crear()
NotificacionScheduler        ──→  NotificadorService.notificarStockCritico()    ──→  NotificacionService.crear()
```

### 7. Facade (CargaMasivaService)

`CargaMasivaService` oculta la complejidad de tres subsistemas bajo una interfaz simple:
1. **Apache POI** — lectura de celdas Excel y generación de plantilla con dropdowns.
2. **Validación** — comprobación fila por fila de existencia de catálogos y unicidad.
3. **Persistencia** — creación de equipos y especificaciones técnicas en transacción.

El controlador solo conoce `validar(MultipartFile)` y `confirmar(ConfirmacionRequest)`.

### 8. Cache-Aside (Caffeine)

Los datos de catálogo se leen con `@Cacheable`: si la entrada existe en caché se devuelve sin tocar la BD; si no existe, se consulta la BD y el resultado se almacena en caché. Las operaciones de escritura usan `@CacheEvict` para invalidar la entrada afectada.

```java
@Cacheable("areas")
public List<Area> listarAreas() { ... }

@CacheEvict(value = "areas", allEntries = true)
public Area crearArea(AreaRequest request) { ... }
```

### 9. Scheduled Tasks

`NotificacionScheduler` usa `@Scheduled(fixedDelay = 300_000)` (cada 5 minutos) para detectar tickets con SLA vencido y tipos de equipo por debajo del umbral de stock, y generar notificaciones automáticas. Se usa `fixedDelay` (no `fixedRate`) para evitar ejecuciones solapadas si la tarea tarda más de 5 minutos.

---

## Frontend (React + TypeScript)

### 10. Component-Based Architecture

La UI se construye como un árbol de componentes React reutilizables. Los componentes de shadcn/ui (`Button`, `Dialog`, `Table`, `Badge`…) son la capa base; los componentes de página los componen para formar pantallas completas.

### 11. SPA con enrutamiento del lado del cliente

React Router gestiona la navegación sin recargar la página. La configuración de rutas centralizada en `App.tsx` actúa como mapa de la aplicación:

```tsx
<Route path="/inventario" element={<Inventario />} />
<Route path="/inventario/:id" element={<InventarioDetalle />} />
<Route path="/inventario/carga-masiva" element={<CargaMasiva />} />
```

Nginx sirve siempre `index.html` para cualquier ruta (`try_files $uri /index.html`), delegando el routing al cliente.

### 12. Service Abstraction Layer (Facade del cliente)

Cada dominio tiene un módulo de servicio TypeScript (`inventarioService.ts`, `ticketService.ts`…) que encapsula las URLs de la API, los tipos de request/response y el manejo de errores HTTP. Los componentes de página nunca hacen `fetch` directamente — siempre pasan por el servicio.

### 13. Adapter / Wrapper (fetchWithAuth)

`api.ts` exporta `fetchWithAuth`, un wrapper sobre `fetch` nativo que:
1. Inyecta el header `Authorization: Bearer {token}` automáticamente.
2. Detecta respuestas 401 y dispara el evento custom `sgi:unauthorized`.
3. No establece `Content-Type` cuando el body es `FormData` (necesario para la carga masiva).

Los servicios usan `fetchWithAuth` en lugar de `fetch`; el cambio de comportamiento HTTP está centralizado en un solo lugar.

### 14. Custom Events (Logout global)

El logout originado por un 401 del servidor se propaga mediante un `CustomEvent` del DOM:

```ts
// api.ts — cuando el servidor devuelve 401
window.dispatchEvent(new Event('sgi:unauthorized'));

// App.tsx — escucha global
window.addEventListener('sgi:unauthorized', handleLogout);
```

Esto desacopla `fetchWithAuth` (infraestructura) de `App.tsx` (estado de sesión): ninguno depende del otro directamente.

### 15. Container / Presentation

Las páginas (containers) gestionan estado y llaman a servicios; los componentes UI (presentation) solo renderizan props. Por ejemplo, `Inventario.tsx` llama a `inventarioService.listarEquipos()`, gestiona el estado de carga/error/datos, y pasa los datos a componentes `Table`, `Badge`, `Button` que no conocen la API.
