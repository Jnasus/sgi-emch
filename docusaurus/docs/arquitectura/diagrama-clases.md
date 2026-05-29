---
id: diagrama-clases
title: Diagrama de clases
sidebar_position: 7
---

# Diagrama de clases

Muestra las entidades JPA del backend (mapeos objeto-relacional) con sus atributos y relaciones. El diagrama se divide por módulo para mayor legibilidad.

## Módulo de Usuarios y Roles

```mermaid
classDiagram
    class Rol {
        +Integer idRol
        +String nombreRol
        +String descripcion
    }
    class Area {
        +Integer idArea
        +String codigoArea
        +String nombreArea
        +String descripcion
        +Integer anioVigencia
        +Boolean activo
        +LocalDateTime createdAt
    }
    class Usuario {
        +Integer idUsuario
        +String nombres
        +String apellidos
        +String dni
        +String username
        +String passwordHash
        +String email
        +Boolean activo
        +LocalDateTime ultimoAcceso
        +LocalDateTime createdAt
    }

    Usuario "N" --> "1" Rol : tiene
    Usuario "N" --> "1" Area : pertenece a
```

## Módulo de Inventario

```mermaid
classDiagram
    class TipoEquipo {
        +Integer idTipo
        +String nombreTipo
        +String descripcion
    }
    class Marca {
        +Integer idMarca
        +String nombreMarca
    }
    class ModeloEquipo {
        +Integer idModelo
        +String nombreModelo
    }
    class SistemaOperativo {
        +Integer idSo
        +String nombreSo
        +String versionSo
    }
    class Equipo {
        +Integer idEquipo
        +String codigoEjercito
        +String numeroSerie
        +String nombreResponsable
        +String macAddress
        +String ipAddress
        +String tipoRed
        +String estado
        +LocalDate fechaAdquisicion
        +LocalDate fechaRegistro
        +LocalDate fechaBaja
        +String observaciones
    }
    class EspecificacionTecnica {
        +Integer idEspec
        +String procesador
        +Short nucleos
        +Short hilos
        +Short ramModulos
        +Short ramTotalGb
        +Short ramVelocidadMhz
        +String ramMarca
        +String discoModelo
        +String discoInterface
        +BigDecimal discoCapacidadGb
        +BigDecimal discoUsadoGb
        +BigDecimal discoLibreGb
        +String gpuMarca
        +String gpuModelo
        +BigDecimal gpuVramGb
        +String monitorMarca
        +String monitorModelo
        +String redModelo
    }
    class HistorialEstado {
        +Integer idHistorial
        +String estadoAnterior
        +String estadoNuevo
        +String motivo
        +LocalDateTime fechaCambio
    }
    class ConfigStock {
        +Integer idConfig
        +Short umbralPct
        +LocalDateTime fechaModificacion
    }

    ModeloEquipo "N" --> "1" Marca : de marca
    ModeloEquipo "N" --> "1" TipoEquipo : para tipo
    Equipo "N" --> "1" TipoEquipo : es de tipo
    Equipo "N" --> "1" ModeloEquipo : tiene modelo
    Equipo "N" --> "1" Area : asignado a
    Equipo "N" --> "1" SistemaOperativo : usa SO
    EspecificacionTecnica "1" --> "1" Equipo : describe a
    HistorialEstado "N" --> "1" Equipo : registra cambio de
    HistorialEstado "N" --> "1" Usuario : ejecutado por
    ConfigStock "N" --> "1" TipoEquipo : configura umbral de
    ConfigStock "N" --> "1" Usuario : configurado por
```

## Módulo de Tickets / Incidentes

```mermaid
classDiagram
    class TipoIncidente {
        +Integer idTipoIncidente
        +String nombreTipo
        +Short tiempoRespuestaMin
        +Short tiempoResolucionMin
        +String descripcion
    }
    class Ticket {
        +Integer idTicket
        +String numeroTicket
        +String titulo
        +String descripcion
        +String estado
        +String prioridad
        +LocalDateTime fechaApertura
        +LocalDateTime fechaRespuesta
        +LocalDateTime fechaResolucion
        +LocalDateTime fechaCierre
        +Boolean fueraDeSla
        +String pdfActaPath
    }
    class HistorialTicket {
        +Integer idHistTicket
        +String estadoAnterior
        +String estadoNuevo
        +String comentario
        +LocalDateTime fechaCambio
    }

    Ticket "N" --> "1" Equipo : referencia equipo
    Ticket "N" --> "1" Usuario : asignado a técnico
    Ticket "N" --> "1" TipoIncidente : es de tipo
    HistorialTicket "N" --> "1" Ticket : pertenece a
    HistorialTicket "N" --> "1" Usuario : realizado por
```

## Módulo de Notificaciones

```mermaid
classDiagram
    class Notificacion {
        +Integer idNotif
        +String tipoNotif
        +String titulo
        +String mensaje
        +Boolean leida
        +String urlAccion
        +LocalDateTime fechaCreacion
    }

    Notificacion "N" --> "1" Usuario : dirigida a
```

## Enumeraciones

| Clase | Campo | Valores posibles |
|---|---|---|
| `Equipo` | `estado` | `EN_BODEGA`, `ASIGNADO`, `EN_REPARACION`, `PRESTADO`, `DADO_DE_BAJA` |
| `Equipo` | `tipoRed` | `ETHERNET`, `WIFI`, `N/A` |
| `Ticket` | `estado` | `ABIERTO`, `EN_PROCESO`, `RESUELTO`, `CERRADO` |
| `Ticket` | `prioridad` | `BAJA`, `MEDIA`, `ALTA`, `CRITICA` |
| `HistorialEstado` | `estadoAnterior` / `estadoNuevo` | Mismo que `Equipo.estado` |
| `HistorialTicket` | `estadoAnterior` / `estadoNuevo` | Mismo que `Ticket.estado` |
| `Notificacion` | `tipoNotif` | `STOCK_CRITICO`, `SLA_VENCIDO`, `TICKET_ASIGNADO`, `INFO` |

## Vistas SQL (entidades de solo lectura)

| Vista | Descripción |
|---|---|
| `v_dashboard_resumen` | Agrega totales de equipos por tipo y estado para el dashboard |
| `v_inventario_completo` | Join desnormalizado equipo + modelo + marca + área + SO + especificaciones |
| `v_stock_critico` | Tipos de equipo por debajo del umbral configurado en `config_stock` |
| `v_tickets_activos` | Tickets abiertos/en proceso con cálculo de minutos SLA restantes |
