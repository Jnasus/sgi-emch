---
id: dashboard
title: Dashboard
sidebar_position: 1
---

# Dashboard

El Dashboard es la pantalla de inicio del sistema. Ofrece un resumen ejecutivo del estado del inventario y los incidentes activos en tiempo real.

## Acceso

Al iniciar sesión, el sistema redirige automáticamente a `/dashboard`.

## Secciones del Dashboard

### Tarjetas de resumen

En la parte superior se muestran 4 indicadores clave:

| Indicador | Descripción |
|---|---|
| **Total de equipos** | Número total de equipos registrados en el inventario |
| **Equipos operativos** | Equipos en estado "Operativo" |
| **Tickets abiertos** | Tickets en estado ABIERTO o EN_PROCESO |
| **Stock crítico** | Tipos de equipo cuyo porcentaje operativo está por debajo del umbral configurado |

### Distribución de equipos por tipo

Tabla que muestra cada tipo de equipo (Laptop, Desktop, Impresora, etc.) con:
- Total de equipos registrados
- Cantidad asignados
- En bodega
- En reparación
- Dados de baja
- Stock operativo
- Umbral de stock (%)
- Porcentaje actual
- Alerta si está por debajo del umbral

### Equipos con más de 5 años

Lista de equipos cuya fecha de adquisición supera los 5 años, útil para planificar renovaciones. Incluye código de ejército, tipo, modelo y área.

## Actualización de datos

Los datos del dashboard se cargan al ingresar a la pantalla. Para refrescarlos, recarga la página o navega a otro módulo y vuelve.
