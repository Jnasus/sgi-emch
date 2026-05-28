---
id: reportes
title: Reportes
sidebar_position: 4
---

# Reportes

El módulo de Reportes permite exportar información del inventario en formatos Excel y PDF. Solo disponible para roles **ADMINISTRADOR**.

## Tipos de reporte

### Inventario completo

Exporta todos los equipos registrados. Se puede filtrar antes de exportar:

- **Por estado**: Operativo, En reparación, En bodega, Dado de baja
- **Por área**: cualquier dependencia institucional

| Formato | Endpoint |
|---|---|
| Excel (.xlsx) | `GET /api/reportes/inventario/excel?estado=&idArea=` |
| PDF | `GET /api/reportes/inventario/pdf?estado=&idArea=` |

### Selección manual

Exporta un subconjunto de equipos seleccionados manualmente desde la interfaz. Permite elegir equipos individuales de la tabla y exportar solo esos.

| Formato | Endpoint |
|---|---|
| Excel (.xlsx) | `POST /api/reportes/seleccion/excel` |
| PDF | `POST /api/reportes/seleccion/pdf` |

### Equipos con más de N años

Exporta los equipos cuya fecha de adquisición supera un número de años configurable (por defecto 5 años). Útil para planificación de renovación de equipos.

| Formato | Endpoint |
|---|---|
| Excel (.xlsx) | `GET /api/reportes/equipos-antiguos/excel?anios=5` |
| PDF | `GET /api/reportes/equipos-antiguos/pdf?anios=5` |

## Cómo generar un reporte

1. Ir al módulo **Reportes** en el menú lateral.
2. Seleccionar el tipo de reporte deseado.
3. Aplicar filtros si corresponde.
4. Hacer clic en **Exportar Excel** o **Exportar PDF**.
5. El archivo se descarga automáticamente con nombre que incluye la fecha: `inventario-equipos-2026-05-28.xlsx`.

## Contenido de los reportes

Los reportes de inventario incluyen por cada equipo:

- Código de ejército
- Número de serie
- Tipo de equipo
- Marca y modelo
- Sistema operativo
- Área responsable
- Estado
- Fecha de adquisición
- Dirección IP

:::info
Los reportes reflejan el estado actual de la base de datos en el momento de la exportación. No son reportes históricos.
:::
