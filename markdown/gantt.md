# Cronograma de Actividades -- Diagrama de Gantt
## SGI-EMCH: Sistema Web de Gestion de Inventario de Equipos Informaticos

**Proyecto:** SGI-EMCH -- DTIC, Escuela Militar de Chorrillos "Coronel Francisco Bolognesi"
**Metodologia:** Scrum (Sprint 0 + 6 Sprints de desarrollo)
**Periodo:** 30/03/2026 -- 16/07/2026
**Deadline academico:** 16 de julio de 2026

---

## Diagrama de Gantt

![Cronograma SGI-EMCH -- Gantt Sprint 0 al Sprint 6](gantt_cronograma.png)

<!--
Fuente Mermaid del diagrama.
Regenerar con: mmdc -i gantt_temp.mmd -o gantt_cronograma.png -w 1200 -H 500 --backgroundColor white

gantt
    title Cronograma SGI-EMCH - Deadline 16 julio 2026
    dateFormat YYYY-MM-DD

    section Fase 0 - Inicio
    Kick-off y arquitectura :done, s0, 2026-03-30, 2026-04-05

    section Sprint 1 - Seguridad
    Usuarios y autenticacion JWT :done, s1, 2026-04-06, 2026-04-19

    section Sprint 2 - Inventario
    Equipos y carga masiva Excel :done, s2, 2026-04-20, 2026-05-10

    section Sprint 3 - Incidentes
    Tickets y control de SLA :done, s3, 2026-05-11, 2026-05-31

    section Sprint 4 - Reportes
    Dashboard y exportaciones :done, s4, 2026-06-01, 2026-06-14

    section Sprint 5 - Integracion
    Notificaciones y monitoreo :done, s5, 2026-06-15, 2026-06-28

    section Sprint 6 - Cierre
    UAT y modulo de bajas :active, s6a, 2026-06-29, 2026-07-09
    Entrega final y firma de acta :crit, s6b, 2026-07-09, 2026-07-16
-->

---

## Detalle de Fases y Sprints

### Fase 0 -- Kick-off y Planificacion

| Campo | Valor |
|---|---|
| **Periodo** | 30/03/2026 -- 05/04/2026 |
| **Duracion** | 7 dias |
| **Responsable** | Todos |
| **Estado** | [OK] Completado |

**Actividades:**

- Reunion de kick-off con el Sponsor (TCO2 EP MORALES PEREZ Edgar Oscar)
- Levantamiento de informacion con el personal del DTIC-EMCH
- Definicion del alcance y elaboracion del Project Charter
- Configuracion del entorno de desarrollo (Git, Docker, Java 21, Node 22)
- Disenio inicial de la arquitectura (Spring Boot + React + MySQL + Docker Compose)
- Disenio conceptual y logico de la base de datos
- Elaboracion del Product Backlog inicial (22 historias de usuario)
- Elaboracion de prototipos de interfaz de usuario (wireframes)

---

### Sprint 1 -- Modulo Usuarios y Seguridad

| Campo | Valor |
|---|---|
| **Periodo** | 06/04/2026 -- 19/04/2026 |
| **Duracion** | 14 dias |
| **Responsable** | Chavarria / Andia / Orozco |
| **Estado** | [OK] Completado |
| **Story points** | 25 completados / 25 planificados |

**Objetivo:** Implementar el sistema de autenticacion JWT con control de acceso basado en roles (RBAC).

**Entregables:**

- Endpoints `/api/auth/login` y `/api/auth/refresh` funcionales
- `JwtFilter` + `AuditSessionInterceptor` integrados en Spring Security 6
- CRUD completo de usuarios con roles y areas (`/api/usuarios`)
- CRUD de catalogos: roles (`/api/roles`), areas (`/api/areas`)
- Frontend: `Login.tsx` con gestion de tokens en localStorage
- Frontend: `ProtectedRoute.tsx` con redireccion por rol

**Historias de usuario completadas:** US-01, US-02, US-03, US-04

---

### Sprint 2 -- Modulo Inventario de Equipos

| Campo | Valor |
|---|---|
| **Periodo** | 20/04/2026 -- 10/05/2026 |
| **Duracion** | 21 dias |
| **Responsable** | Chavarria / Orozco / Pariona / Andia |
| **Estado** | [OK] Completado |
| **Story points** | 30 completados / 30 planificados |

**Objetivo:** Implementar la gestion completa del ciclo de vida de equipos TI con especificaciones tecnicas y carga masiva.

**Entregables:**

- CRUD de equipos (`/api/equipos`): GET con filtros, POST, PUT, DELETE logico
- Endpoint `PATCH /api/equipos/{id}/estado` con registro automatico en `historial_estado`
- Endpoint `PUT /api/equipos/{id}/especificaciones` para ficha tecnica completa
- Modulo de carga masiva Excel: 4 endpoints (plantilla, validar, confirmar, errores)
- Vista SQL `v_inventario_completo` con datos consolidados
- Cache Caffeine para catalogos (TTL 1 h, max 1000 entradas)
- Frontend: `Inventario.tsx`, `RegistroEquipo.tsx`, `EspecificacionesTecnicas.tsx`

**Historias de usuario completadas:** US-05, US-06, US-07, US-08

---

### Sprint 3 -- Modulo Incidentes y Tickets

| Campo | Valor |
|---|---|
| **Periodo** | 11/05/2026 -- 31/05/2026 |
| **Duracion** | 21 dias |
| **Responsable** | Chavarria / Orozco / Pariona / Andia |
| **Estado** | [OK] Completado |
| **Story points** | 28 completados / 28 planificados |

**Objetivo:** Implementar la mesa de ayuda con tickets formales, control de SLAs y generacion de actas PDF al cierre.

**Entregables:**

- CRUD de tickets (`/api/tickets`): apertura, cambio de estado, historial
- Numeracion automatica con procedimiento almacenado `sp_generar_numero_ticket` (TKT-YYYYMM-NNNN)
- Vista SQL `v_tickets_activos` con calculo de SLA en tiempo real (minutos transcurridos vs limite)
- Generacion de acta PDF con OpenPDF al cerrar un ticket (`/api/tickets/{id}/pdf`)
- CRUD de tipos de incidente con configuracion de SLA por tipo
- Frontend: `Incidentes.tsx`, `DetalleTicket.tsx`, `HistorialTicket.tsx`

**Historias de usuario completadas:** US-09, US-10, US-11

---

### Sprint 4 -- Modulo Reportes y Dashboard

| Campo | Valor |
|---|---|
| **Periodo** | 01/06/2026 -- 14/06/2026 |
| **Duracion** | 14 dias |
| **Responsable** | Chavarria / Orozco / Pariona / Andia |
| **Estado** | [OK] Completado |
| **Story points** | 22 completados / 22 planificados |

**Objetivo:** Implementar inteligencia de negocio con dashboard de KPIs en tiempo real y reportes exportables.

**Entregables:**

- Endpoint `/api/dashboard/resumen` con vista SQL `v_dashboard_resumen`
- 6 endpoints de reportes con exportacion a Excel (.xlsx con Apache POI) y PDF (.pdf con OpenPDF)
- Reportes disponibles: inventario completo, por area, por tipo, equipos antiguos, tickets activos, resumen de SLAs
- Frontend: `Dashboard.tsx` con tarjetas de KPIs y tabla de distribucion por tipo
- Frontend: `Reportes.tsx` con filtros y descarga directa
- Graficos con Recharts para distribucion de equipos por estado

**Historias de usuario completadas:** US-12, US-13, US-14

---

### Sprint 5 -- Notificaciones, Monitoreo e Integracion

| Campo | Valor |
|---|---|
| **Periodo** | 15/06/2026 -- 28/06/2026 |
| **Duracion** | 14 dias |
| **Responsable** | Todos |
| **Estado** | [OK] Completado |
| **Story points** | 20 completados / 20 planificados |

**Objetivo:** Automatizar alertas criticas, implementar el stack de monitoreo y publicar la documentacion tecnica.

**Entregables:**

- `NotificadorService` con scheduler `@Scheduled` cada 5 minutos: revisa SLA vencidos y stock critico
- CRUD de notificaciones (`/api/notificaciones`) con deduplicacion automatica
- Stack de monitoreo: Prometheus + Grafana 11.5.2 + Loki + Promtail (docker-compose.monitoring.yml)
- Dashboard Grafana con 17 paneles pre-provisionados (JVM, HTTP, HikariCP, Caffeine, sistema)
- Backup automatico diario con `mysqldump` + gzip, retencion 7 dias (contenedor Alpine + crond)
- Documentacion Docusaurus publicada en https://sgi-docs.escuelamilitar.edu.pe
- Frontend: `NotificacionPanel.tsx` con badge de conteo en tiempo real

**Historias de usuario completadas:** US-15, US-16, US-17, US-18, US-19, US-20

---

### Sprint 6 -- Cierre, UAT y Despliegue Final

| Campo | Valor |
|---|---|
| **Periodo** | 29/06/2026 -- 16/07/2026 |
| **Duracion** | 18 dias |
| **Responsable** | Todos |
| **Estado** | [En curso] En progreso |
| **Story points planificados** | 9 |

**Objetivo:** Validar el sistema con usuarios reales, corregir defectos detectados en UAT, completar el modulo de bajas/transferencias formales y entregar el proyecto.

**Actividades en curso:**

- Pruebas de aceptacion de usuario (UAT) con personal del DTIC-EMCH (29/06 -- 09/07)
- Implementacion del flujo formal de UI para bajas y transferencias: formulario dedicado, acta PDF, aprobacion Jefe DTIC (RFC-2026-003)
- Correccion de defectos detectados en UAT
- Revision y actualizacion final de la documentacion Docusaurus
- Entrega del Informe Academico N°3
- Firma del acta de aceptacion por el Sponsor (meta: 16/07/2026)

**Historias de usuario:** US-21, US-22

---

## Resumen de Hitos

| Hito | Fecha | Estado |
|---|---|---|
| Kick-off del proyecto | 05/04/2026 | [OK] Completado |
| Entrega Sprint 1 (Usuarios y Seguridad) | 19/04/2026 | [OK] Completado |
| Entrega Sprint 2 (Inventario) | 10/05/2026 | [OK] Completado |
| Entrega Sprint 3 (Incidentes) | 31/05/2026 | [OK] Completado |
| Entrega Sprint 4 (Reportes/Dashboard) | 14/06/2026 | [OK] Completado |
| Entrega Sprint 5 (Notificaciones/Integracion) | 28/06/2026 | [OK] Completado |
| Inicio UAT con personal DTIC | 29/06/2026 | [En curso] En progreso |
| Entrega Informe Academico N°3 | Junio/Julio 2026 | [En curso] En progreso |
| Entrega final y firma de acta de aceptacion | 16/07/2026 | [Pendiente] |

---

## Resumen de Burndown

| Sprint | Story Points planificados | Story Points completados | Acumulado pendiente |
|---|---|---|---|
| Sprint 0 | 10 | 10 | 0 |
| Sprint 1 | 25 | 25 | 0 |
| Sprint 2 | 30 | 30 | 0 |
| Sprint 3 | 28 | 28 | 0 |
| Sprint 4 | 22 | 22 | 0 |
| Sprint 5 | 20 | 20 | 0 |
| Sprint 6 | 9 | (en curso) | -- |
| **TOTAL** | **144** | **135** | **9** |

---

*SGI-EMCH -- DTIC, Escuela Militar de Chorrillos "Coronel Francisco Bolognesi"*
*Grupo 03 -- Integrador II, Universidad Tecnologica del Peru*
*Version: 1.0 | Ultima actualizacion: 10/06/2026*
