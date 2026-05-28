---
id: inventario
title: Inventario
sidebar_position: 2
---

# Inventario de Equipos

El módulo de Inventario permite registrar, consultar, editar y dar seguimiento a todos los equipos informáticos de la institución.

## Listado de equipos

La tabla principal muestra todos los equipos registrados. Se puede filtrar por:

- **Estado**: Operativo, En reparación, En bodega, Dado de baja
- **Área**: Dependencia institucional
- **Tipo de equipo**: Laptop, Desktop, Servidor, Impresora, etc.

La búsqueda aplica paginación de 20 registros por página.

## Ficha del equipo

Al hacer clic en el código de ejército de un equipo se accede a su ficha completa, que incluye:

- **Datos generales**: Código de ejército, número de serie, dirección IP, tipo, marca, modelo, sistema operativo, área responsable, fecha de adquisición
- **Estado actual** con badge de color
- **Especificaciones técnicas** (si están registradas): procesador, RAM, almacenamiento, voltaje, potencia
- **Historial de estados**: tabla cronológica de todos los cambios de estado con fecha, responsable y observación

### Cambiar estado de un equipo

Desde la ficha del equipo, el botón **Cambiar estado** abre un formulario donde se selecciona el nuevo estado y se registra una observación obligatoria. El cambio queda registrado en el historial con el usuario que lo realizó.

Estados disponibles:

| Estado | Descripción |
|---|---|
| `OPERATIVO` | En uso normal |
| `EN_REPARACION` | En mantenimiento correctivo |
| `EN_BODEGA` | Almacenado, no asignado |
| `DADO_DE_BAJA` | Fuera de servicio definitivo |

## Registrar nuevo equipo

Botón **Nuevo Equipo** (visible para ADMINISTRADOR y TECNICO). Campos requeridos:

- Código de ejército (único en el sistema)
- Número de serie
- Tipo de equipo
- Marca
- Modelo
- Área responsable
- Fecha de adquisición
- Estado inicial

## Editar equipo

Desde la ficha del equipo, el botón **Editar** permite modificar los datos generales. No modifica el historial de estados.

## Especificaciones técnicas

Desde la ficha, la sección **Especificaciones Técnicas** permite registrar o actualizar:
- Procesador (tipo y velocidad)
- Memoria RAM (GB)
- Almacenamiento (tipo y capacidad en GB)
- Voltaje de operación (V)
- Potencia nominal (W)

## Carga masiva por Excel

El botón **Carga masiva** en el listado de inventario permite importar múltiples equipos a la vez:

1. **Descargar plantilla** — Descarga un archivo `.xlsx` con las columnas correctas y listas desplegables con los catálogos vigentes (tipos, marcas, modelos, áreas, SOs).
2. **Subir y validar** — El sistema valida cada fila (formato, duplicados, referencias a catálogos) y muestra los errores antes de confirmar.
3. **Confirmar importación** — Si hay filas válidas, se importan masivamente. Las filas con error se muestran para corrección manual.

:::note
La carga masiva es irreversible. Revisa la vista previa de validación antes de confirmar.
:::
