---
id: diseño-logico
title: Diseño lógico
sidebar_position: 2
---

# Diseño lógico de la base de datos

El diseño lógico traduce el modelo conceptual a un esquema relacional con tablas, atributos, claves primarias y foráneas, sin especificar tipos de datos físicos ni detalles del motor de base de datos.

## Notación

- **PK** — Clave primaria
- **FK** — Clave foránea (referencia indicada con →)
- **UQ** — Valor único
- *Cursiva* — Atributo opcional (puede ser nulo)

## Tablas del sistema

### ROL
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_rol** | Entero | PK, autogenerado |
| nombre_rol | Texto corto | NOT NULL, UQ |
| *descripcion* | Texto | — |

### AREA
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_area** | Entero | PK, autogenerado |
| codigo_area | Texto corto | NOT NULL, UQ |
| nombre_area | Texto corto | NOT NULL |
| *descripcion* | Texto | — |
| anio_vigencia | Año | NOT NULL |
| activo | Booleano | NOT NULL |
| created_at | Fecha-hora | NOT NULL |

### USUARIO_SISTEMA
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_usuario** | Entero | PK, autogenerado |
| id_rol | Entero | FK → ROL(id_rol), NOT NULL |
| id_area | Entero | FK → AREA(id_area), NOT NULL |
| nombres | Texto corto | NOT NULL |
| apellidos | Texto corto | NOT NULL |
| dni | Texto fijo 8 chars | NOT NULL, UQ |
| username | Texto corto | NOT NULL, UQ |
| password_hash | Texto | NOT NULL |
| *email* | Texto | — |
| activo | Booleano | NOT NULL |
| *ultimo_acceso* | Fecha-hora | — |
| created_at | Fecha-hora | NOT NULL |

### TIPO_EQUIPO
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_tipo** | Entero | PK, autogenerado |
| nombre_tipo | Texto corto | NOT NULL, UQ |
| *descripcion* | Texto | — |

### MARCA
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_marca** | Entero | PK, autogenerado |
| nombre_marca | Texto corto | NOT NULL, UQ |

### SISTEMA_OPERATIVO
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_so** | Entero | PK, autogenerado |
| nombre_so | Texto corto | NOT NULL |
| version_so | Texto corto | NOT NULL |
| — | — | UQ(nombre_so, version_so) |

### MODELO_EQUIPO
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_modelo** | Entero | PK, autogenerado |
| id_marca | Entero | FK → MARCA(id_marca), NOT NULL |
| id_tipo | Entero | FK → TIPO_EQUIPO(id_tipo), NOT NULL |
| nombre_modelo | Texto corto | NOT NULL |

### EQUIPO
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_equipo** | Entero | PK, autogenerado |
| codigo_ejercito | Texto corto | NOT NULL, UQ |
| id_tipo | Entero | FK → TIPO_EQUIPO(id_tipo), NOT NULL |
| id_modelo | Entero | FK → MODELO_EQUIPO(id_modelo), NOT NULL |
| id_area | Entero | FK → AREA(id_area), NOT NULL |
| id_so | Entero | FK → SISTEMA_OPERATIVO(id_so), NOT NULL |
| numero_serie | Texto | NOT NULL, UQ |
| nombre_responsable | Texto | NOT NULL |
| *mac_address* | Texto fijo | UQ |
| *ip_address* | Texto | — |
| tipo_red | Enumerado | NOT NULL: ETHERNET, WIFI, N/A |
| estado | Enumerado | NOT NULL: EN_BODEGA, ASIGNADO, EN_REPARACION, PRESTADO, DADO_DE_BAJA |
| *fecha_adquisicion* | Fecha | — |
| fecha_registro | Fecha | NOT NULL |
| *fecha_baja* | Fecha | — |
| *observaciones* | Texto largo | — |

### ESPECIFICACION_TECNICA
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_espec** | Entero | PK, autogenerado |
| id_equipo | Entero | FK → EQUIPO(id_equipo), NOT NULL, UQ |
| *procesador* | Texto corto | — |
| *nucleos* | Entero pequeño | — |
| *hilos* | Entero pequeño | — |
| *ram_modulos* | Entero pequeño | — |
| *ram_total_gb* | Entero | — |
| *ram_velocidad_mhz* | Entero | — |
| *ram_marca* | Texto corto | — |
| *disco_modelo* | Texto corto | — |
| *disco_interface* | Texto corto | — |
| *disco_capacidad_gb* | Decimal | — |
| *disco_usado_gb* | Decimal | — |
| *disco_libre_gb* | Decimal | — |
| *gpu_marca* | Texto corto | — |
| *gpu_modelo* | Texto corto | — |
| *gpu_vram_gb* | Decimal | — |
| *monitor_marca* | Texto corto | — |
| *monitor_modelo* | Texto corto | — |
| *red_modelo* | Texto corto | — |

### HISTORIAL_ESTADO
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_historial** | Entero | PK, autogenerado |
| id_equipo | Entero | FK → EQUIPO(id_equipo), NOT NULL |
| id_usuario | Entero | FK → USUARIO_SISTEMA(id_usuario), NOT NULL |
| estado_anterior | Enumerado | NOT NULL: estados de equipo |
| estado_nuevo | Enumerado | NOT NULL: estados de equipo |
| *motivo* | Texto | — |
| fecha_cambio | Fecha-hora | DEFAULT: fecha-hora actual |

### TIPO_INCIDENTE
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_tipo_incidente** | Entero | PK, autogenerado |
| nombre_tipo | Texto corto | NOT NULL, UQ |
| tiempo_respuesta_min | Entero | NOT NULL |
| tiempo_resolucion_min | Entero | NOT NULL |
| *descripcion* | Texto | — |

### TICKET
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_ticket** | Entero | PK, autogenerado |
| numero_ticket | Texto corto | NOT NULL, UQ |
| id_equipo | Entero | FK → EQUIPO(id_equipo), NOT NULL |
| id_tecnico | Entero | FK → USUARIO_SISTEMA(id_usuario), NOT NULL |
| id_tipo_incidente | Entero | FK → TIPO_INCIDENTE(id_tipo_incidente), NOT NULL |
| titulo | Texto | NOT NULL |
| *descripcion* | Texto largo | — |
| estado | Enumerado | NOT NULL: ABIERTO, EN_PROCESO, RESUELTO, CERRADO |
| prioridad | Enumerado | NOT NULL: BAJA, MEDIA, ALTA, CRITICA |
| fecha_apertura | Fecha-hora | NOT NULL |
| *fecha_respuesta* | Fecha-hora | — |
| *fecha_resolucion* | Fecha-hora | — |
| *fecha_cierre* | Fecha-hora | — |
| fuera_de_sla | Booleano | NOT NULL, DEFAULT: falso |
| *pdf_acta_path* | Texto | — |

### HISTORIAL_TICKET
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_hist_ticket** | Entero | PK, autogenerado |
| id_ticket | Entero | FK → TICKET(id_ticket), NOT NULL |
| id_usuario | Entero | FK → USUARIO_SISTEMA(id_usuario), NOT NULL |
| estado_anterior | Enumerado | NOT NULL: estados de ticket |
| estado_nuevo | Enumerado | NOT NULL: estados de ticket |
| *comentario* | Texto largo | — |
| fecha_cambio | Fecha-hora | DEFAULT: fecha-hora actual |

### NOTIFICACION
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_notif** | Entero | PK, autogenerado |
| id_usuario | Entero | FK → USUARIO_SISTEMA(id_usuario), NOT NULL |
| tipo_notif | Enumerado | NOT NULL: STOCK_CRITICO, SLA_VENCIDO, TICKET_ASIGNADO, INFO |
| titulo | Texto | NOT NULL |
| *mensaje* | Texto largo | — |
| leida | Booleano | NOT NULL, DEFAULT: falso |
| *url_accion* | Texto | — |
| fecha_creacion | Fecha-hora | DEFAULT: fecha-hora actual |

### CONFIG_STOCK
| Atributo | Tipo lógico | Restricción |
|---|---|---|
| **id_config** | Entero | PK, autogenerado |
| id_tipo | Entero | FK → TIPO_EQUIPO(id_tipo), NOT NULL |
| umbral_pct | Entero pequeño | NOT NULL |
| id_usuario_config | Entero | FK → USUARIO_SISTEMA(id_usuario), NOT NULL |
| fecha_modificacion | Fecha-hora | DEFAULT: fecha-hora actual |

## Diagrama relacional

```mermaid
erDiagram
    ROL { int id_rol PK; varchar nombre_rol; varchar descripcion }
    AREA { int id_area PK; varchar codigo_area; varchar nombre_area; year anio_vigencia; bool activo }
    USUARIO_SISTEMA { int id_usuario PK; int id_rol FK; int id_area FK; varchar nombres; varchar apellidos; char dni; varchar username; bool activo }
    TIPO_EQUIPO { int id_tipo PK; varchar nombre_tipo }
    MARCA { int id_marca PK; varchar nombre_marca }
    SISTEMA_OPERATIVO { int id_so PK; varchar nombre_so; varchar version_so }
    MODELO_EQUIPO { int id_modelo PK; int id_marca FK; int id_tipo FK; varchar nombre_modelo }
    EQUIPO { int id_equipo PK; varchar codigo_ejercito; int id_tipo FK; int id_modelo FK; int id_area FK; int id_so FK; varchar numero_serie; enum estado; enum tipo_red }
    ESPECIFICACION_TECNICA { int id_espec PK; int id_equipo FK; varchar procesador; int ram_total_gb; decimal disco_capacidad_gb }
    HISTORIAL_ESTADO { int id_historial PK; int id_equipo FK; int id_usuario FK; enum estado_anterior; enum estado_nuevo; datetime fecha_cambio }
    TIPO_INCIDENTE { int id_tipo_incidente PK; varchar nombre_tipo; int tiempo_respuesta_min; int tiempo_resolucion_min }
    TICKET { int id_ticket PK; varchar numero_ticket; int id_equipo FK; int id_tecnico FK; int id_tipo_incidente FK; enum estado; enum prioridad; bool fuera_de_sla }
    HISTORIAL_TICKET { int id_hist_ticket PK; int id_ticket FK; int id_usuario FK; enum estado_anterior; enum estado_nuevo; datetime fecha_cambio }
    NOTIFICACION { int id_notif PK; int id_usuario FK; enum tipo_notif; varchar titulo; bool leida; datetime fecha_creacion }
    CONFIG_STOCK { int id_config PK; int id_tipo FK; int umbral_pct; int id_usuario_config FK }

    ROL ||--o{ USUARIO_SISTEMA : "id_rol"
    AREA ||--o{ USUARIO_SISTEMA : "id_area"
    AREA ||--o{ EQUIPO : "id_area"
    TIPO_EQUIPO ||--o{ MODELO_EQUIPO : "id_tipo"
    TIPO_EQUIPO ||--o{ EQUIPO : "id_tipo"
    TIPO_EQUIPO ||--o{ CONFIG_STOCK : "id_tipo"
    MARCA ||--o{ MODELO_EQUIPO : "id_marca"
    MODELO_EQUIPO ||--o{ EQUIPO : "id_modelo"
    SISTEMA_OPERATIVO ||--o{ EQUIPO : "id_so"
    EQUIPO ||--o| ESPECIFICACION_TECNICA : "id_equipo"
    EQUIPO ||--o{ HISTORIAL_ESTADO : "id_equipo"
    EQUIPO ||--o{ TICKET : "id_equipo"
    USUARIO_SISTEMA ||--o{ HISTORIAL_ESTADO : "id_usuario"
    USUARIO_SISTEMA ||--o{ TICKET : "id_tecnico"
    USUARIO_SISTEMA ||--o{ HISTORIAL_TICKET : "id_usuario"
    USUARIO_SISTEMA ||--o{ NOTIFICACION : "id_usuario"
    USUARIO_SISTEMA ||--o{ CONFIG_STOCK : "id_usuario_config"
    TIPO_INCIDENTE ||--o{ TICKET : "id_tipo_incidente"
    TICKET ||--o{ HISTORIAL_TICKET : "id_ticket"
```
