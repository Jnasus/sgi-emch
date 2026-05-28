---
id: incidentes
title: Incidentes
sidebar_position: 3
---

# Gestión de Incidentes (Tickets)

El módulo de Incidentes gestiona los tickets de soporte técnico del DTIC. Cada ticket documenta un problema reportado, el equipo afectado, el técnico asignado y el seguimiento hasta su resolución.

## Listado de tickets

La pantalla principal muestra todos los tickets con filtros por:

- **Estado**: ABIERTO, EN_PROCESO, RESUELTO, CERRADO
- **Prioridad**: BAJA, MEDIA, ALTA, CRITICA
- **Técnico asignado**

El badge en el menú lateral indica el número de tickets actualmente en estado **ABIERTO**.

## Ciclo de vida de un ticket

```
ABIERTO → EN_PROCESO → RESUELTO → CERRADO
```

| Estado | Descripción |
|---|---|
| `ABIERTO` | Ticket registrado, pendiente de atención |
| `EN_PROCESO` | Técnico trabajando en la solución |
| `RESUELTO` | Solución aplicada, pendiente de confirmación |
| `CERRADO` | Confirmado y cerrado definitivamente |

Cada cambio de estado queda registrado en el historial con fecha, usuario responsable y observación.

## Crear nuevo ticket

Botón **Nuevo Incidente** (ADMINISTRADOR y TECNICO). Campos:

| Campo | Descripción |
|---|---|
| **Equipo** | Selección por código de ejército |
| **Tipo de incidente** | Categoría que define los tiempos SLA |
| **Título** | Descripción breve del problema |
| **Descripción** | Detalle completo del incidente |
| **Prioridad** | BAJA / MEDIA / ALTA / CRITICA |
| **Técnico asignado** | Usuario con rol TECNICO activo |

Al crear el ticket, el sistema genera automáticamente un número correlativo con formato `TKT-YYYYMM-NNNN` y envía una notificación al técnico asignado.

## Detalle del ticket

Al hacer clic en un ticket se accede a su vista detallada:

- **Datos del ticket**: número, estado, prioridad, tipo de incidente
- **Equipo afectado**: código de ejército (clic para ver info del equipo), área, responsable
- **SLA en tiempo real**: tiempo transcurrido, tiempo restante, indicador de vencimiento
- **Historial de cambios**: línea de tiempo de todos los cambios de estado
- **Botón cambiar estado**: abre formulario para avanzar o retroceder el estado

### Información del equipo

Al hacer clic en el código de ejército del ticket se abre un modal con los datos del equipo: tipo, modelo, área, responsable, número de serie, dirección IP y estado actual. También incluye un enlace a la ficha completa del equipo.

## SLA (Acuerdo de Nivel de Servicio)

Cada tipo de incidente tiene tiempos SLA configurados:

| Tipo | Tiempo respuesta | Tiempo resolución |
|---|---|---|
| Falla de Hardware | 30 min | 8 h |
| Falla de Software | 20 min | 4 h |
| Problema de Red | 15 min | 2 h |
| Falla de Impresora | 60 min | 8 h |
| Mantenimiento Preventivo | 2 h | 16 h |
| Incidente de Seguridad | 10 min | 3 h |

El sistema monitorea automáticamente cada 15 minutos los tickets abiertos y genera notificaciones cuando el SLA vence.
