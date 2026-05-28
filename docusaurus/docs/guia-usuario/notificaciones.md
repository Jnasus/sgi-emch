---
id: notificaciones
title: Notificaciones
sidebar_position: 5
---

# Notificaciones

El sistema genera notificaciones automáticas para alertar a los usuarios sobre eventos relevantes. Cada usuario solo ve sus propias notificaciones.

## Tipos de notificaciones

### TICKET_ASIGNADO

Se genera automáticamente cuando se crea un nuevo ticket y se asigna a un técnico. El técnico recibe una notificación con el número de ticket y su título.

**¿Cuándo?** Al momento de crear el ticket.  
**¿Quién la recibe?** El técnico asignado.

### SLA_VENCIDO

Se genera cuando el tiempo de resolución SLA de un ticket activo se supera. El sistema verifica los tickets abiertos cada 15 minutos.

**¿Cuándo?** Cada 15 minutos (cron: `0 */15 * * * *`).  
**¿Quién la recibe?** El técnico asignado al ticket.

### STOCK_CRITICO

Se genera cuando algún tipo de equipo tiene un porcentaje operativo por debajo del umbral configurado en catálogos.

**¿Cuándo?** Todos los días a las 08:00 AM (cron: `0 0 8 * * *`).  
**¿Quién la recibe?** Usuarios con rol ADMINISTRADOR y SUPERVISOR.

## Centro de notificaciones

Accesible desde el ícono de campana en el menú lateral (`/notificaciones`). El badge rojo indica el número de notificaciones no leídas.

### Acciones disponibles

| Acción | Descripción |
|---|---|
| **Marcar como leída** | Marca una notificación individual como leída |
| **Marcar todas como leídas** | Marca todas las notificaciones del usuario como leídas |
| **Eliminar** | Elimina permanentemente una notificación |

### Filtros

Se puede filtrar la lista por estado:
- **Todas**
- **No leídas**
- **Leídas**

## Deduplicación

El sistema evita generar notificaciones duplicadas. Si ya existe una notificación del mismo tipo para el mismo usuario y el mismo recurso (ticket o tipo de equipo), no se genera una nueva.

Esto aplica especialmente al SLA y stock crítico: el técnico no recibirá múltiples notificaciones por el mismo ticket vencido en cada ciclo de 15 minutos.
