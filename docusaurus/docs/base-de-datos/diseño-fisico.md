---
id: diseño-fisico
title: Diseño físico
sidebar_position: 3
---

# Diseño físico de la base de datos

Especificación exacta del esquema MySQL: tipos de datos, ENUMs, índices, constraints nombrados, triggers, vistas y procedimientos almacenados.

## Motor y charset

```sql
-- Todas las tablas usan:
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci
```

## Definición de tablas

### `rol`
```sql
CREATE TABLE IF NOT EXISTS `rol` (
  `id_rol`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre_rol`  VARCHAR(50)  NOT NULL,
  `descripcion` VARCHAR(255),
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_rol_nombre` (`nombre_rol`)
) ENGINE=InnoDB;
```

### `area`
```sql
CREATE TABLE IF NOT EXISTS `area` (
  `id_area`       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo_area`   VARCHAR(20)  NOT NULL,
  `nombre_area`   VARCHAR(100) NOT NULL,
  `descripcion`   VARCHAR(255),
  `anio_vigencia` YEAR         NOT NULL,
  `activo`        BOOLEAN      NOT NULL DEFAULT TRUE,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_area`),
  UNIQUE KEY `uq_area_codigo` (`codigo_area`)
) ENGINE=InnoDB;
```

### `usuario_sistema`
```sql
CREATE TABLE IF NOT EXISTS `usuario_sistema` (
  `id_usuario`    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_rol`        INT UNSIGNED NOT NULL,
  `id_area`       INT UNSIGNED NOT NULL,
  `nombres`       VARCHAR(100) NOT NULL,
  `apellidos`     VARCHAR(100) NOT NULL,
  `dni`           CHAR(8)      NOT NULL,
  `username`      VARCHAR(50)  NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email`         VARCHAR(150),
  `activo`        BOOLEAN      NOT NULL DEFAULT TRUE,
  `ultimo_acceso` DATETIME,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_dni`      (`dni`),
  UNIQUE KEY `uq_usuario_username` (`username`),
  CONSTRAINT `fk_usuario_rol`
    FOREIGN KEY (`id_rol`)  REFERENCES `rol`  (`id_rol`),
  CONSTRAINT `fk_usuario_area`
    FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`)
) ENGINE=InnoDB;
```

### `audit_log`
```sql
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id_log`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_usuario`  INT UNSIGNED,
  `tabla`       VARCHAR(50)  NOT NULL,
  `operacion`   ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `descripcion` TEXT,
  `ip_cliente`  VARCHAR(45),
  `fecha`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  CONSTRAINT `fk_audit_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario_sistema` (`id_usuario`)
    ON DELETE SET NULL
) ENGINE=InnoDB;
```

### `tipo_equipo`
```sql
CREATE TABLE IF NOT EXISTS `tipo_equipo` (
  `id_tipo`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre_tipo` VARCHAR(50)  NOT NULL,
  `descripcion` VARCHAR(255),
  PRIMARY KEY (`id_tipo`),
  UNIQUE KEY `uq_tipo_nombre` (`nombre_tipo`)
) ENGINE=InnoDB;
```

### `marca`
```sql
CREATE TABLE IF NOT EXISTS `marca` (
  `id_marca`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre_marca` VARCHAR(80)  NOT NULL,
  PRIMARY KEY (`id_marca`),
  UNIQUE KEY `uq_marca_nombre` (`nombre_marca`)
) ENGINE=InnoDB;
```

### `sistema_operativo`
```sql
CREATE TABLE IF NOT EXISTS `sistema_operativo` (
  `id_so`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre_so`  VARCHAR(80)  NOT NULL,
  `version_so` VARCHAR(50)  NOT NULL,
  PRIMARY KEY (`id_so`),
  UNIQUE KEY `uq_so_nombre_version` (`nombre_so`, `version_so`)
) ENGINE=InnoDB;
```

### `modelo_equipo`
```sql
CREATE TABLE IF NOT EXISTS `modelo_equipo` (
  `id_modelo`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_marca`      INT UNSIGNED NOT NULL,
  `id_tipo`       INT UNSIGNED NOT NULL,
  `nombre_modelo` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_modelo`),
  CONSTRAINT `fk_modelo_marca`
    FOREIGN KEY (`id_marca`) REFERENCES `marca`       (`id_marca`),
  CONSTRAINT `fk_modelo_tipo`
    FOREIGN KEY (`id_tipo`)  REFERENCES `tipo_equipo` (`id_tipo`)
) ENGINE=InnoDB;
```

### `equipo`
```sql
CREATE TABLE IF NOT EXISTS `equipo` (
  `id_equipo`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo_ejercito`    VARCHAR(20)  NOT NULL,
  `id_tipo`            INT UNSIGNED NOT NULL,
  `id_modelo`          INT UNSIGNED NOT NULL,
  `id_area`            INT UNSIGNED NOT NULL,
  `id_so`              INT UNSIGNED NOT NULL,
  `numero_serie`       VARCHAR(80)  NOT NULL,
  `nombre_responsable` VARCHAR(150) NOT NULL,
  `mac_address`        VARCHAR(17),
  `ip_address`         VARCHAR(45),
  `tipo_red`           ENUM('ETHERNET','WIFI','N/A') NOT NULL,
  `estado`             ENUM('EN_BODEGA','ASIGNADO','EN_REPARACION',
                            'PRESTADO','DADO_DE_BAJA') NOT NULL,
  `fecha_adquisicion`  DATE,
  `fecha_registro`     DATE         NOT NULL,
  `fecha_baja`         DATE,
  `observaciones`      TEXT,
  PRIMARY KEY (`id_equipo`),
  UNIQUE KEY `uq_equipo_codigo` (`codigo_ejercito`),
  UNIQUE KEY `uq_equipo_serie`  (`numero_serie`),
  UNIQUE KEY `uq_equipo_mac`    (`mac_address`),
  CONSTRAINT `fk_equipo_tipo`
    FOREIGN KEY (`id_tipo`)   REFERENCES `tipo_equipo`      (`id_tipo`),
  CONSTRAINT `fk_equipo_modelo`
    FOREIGN KEY (`id_modelo`) REFERENCES `modelo_equipo`    (`id_modelo`),
  CONSTRAINT `fk_equipo_area`
    FOREIGN KEY (`id_area`)   REFERENCES `area`             (`id_area`),
  CONSTRAINT `fk_equipo_so`
    FOREIGN KEY (`id_so`)     REFERENCES `sistema_operativo` (`id_so`)
) ENGINE=InnoDB;
```

### `especificacion_tecnica`
```sql
CREATE TABLE IF NOT EXISTS `especificacion_tecnica` (
  `id_espec`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `id_equipo`          INT UNSIGNED  NOT NULL,
  `procesador`         VARCHAR(150),
  `nucleos`            TINYINT UNSIGNED,
  `hilos`              TINYINT UNSIGNED,
  `ram_modulos`        TINYINT UNSIGNED,
  `ram_total_gb`       SMALLINT UNSIGNED,
  `ram_velocidad_mhz`  SMALLINT UNSIGNED,
  `ram_marca`          VARCHAR(50),
  `disco_modelo`       VARCHAR(100),
  `disco_interface`    VARCHAR(20),
  `disco_capacidad_gb` DECIMAL(8,2),
  `disco_usado_gb`     DECIMAL(8,2),
  `disco_libre_gb`     DECIMAL(8,2),
  `gpu_marca`          VARCHAR(50),
  `gpu_modelo`         VARCHAR(100),
  `gpu_vram_gb`        DECIMAL(4,2),
  `monitor_marca`      VARCHAR(50),
  `monitor_modelo`     VARCHAR(80),
  `red_modelo`         VARCHAR(100),
  PRIMARY KEY (`id_espec`),
  UNIQUE KEY `uq_espec_equipo` (`id_equipo`),
  CONSTRAINT `fk_espec_equipo`
    FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id_equipo`)
    ON DELETE CASCADE
) ENGINE=InnoDB;
```

### `historial_estado`
```sql
CREATE TABLE IF NOT EXISTS `historial_estado` (
  `id_historial`   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_equipo`      INT UNSIGNED NOT NULL,
  `id_usuario`     INT UNSIGNED NOT NULL,
  `estado_anterior` ENUM('EN_BODEGA','ASIGNADO','EN_REPARACION',
                         'PRESTADO','DADO_DE_BAJA') NOT NULL,
  `estado_nuevo`   ENUM('EN_BODEGA','ASIGNADO','EN_REPARACION',
                         'PRESTADO','DADO_DE_BAJA') NOT NULL,
  `motivo`         VARCHAR(255),
  `fecha_cambio`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  CONSTRAINT `fk_hestado_equipo`
    FOREIGN KEY (`id_equipo`)  REFERENCES `equipo`          (`id_equipo`),
  CONSTRAINT `fk_hestado_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario_sistema` (`id_usuario`)
) ENGINE=InnoDB;
```

### `tipo_incidente`
```sql
CREATE TABLE IF NOT EXISTS `tipo_incidente` (
  `id_tipo_incidente`    INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `nombre_tipo`          VARCHAR(50)      NOT NULL,
  `tiempo_respuesta_min` SMALLINT UNSIGNED NOT NULL,
  `tiempo_resolucion_min` SMALLINT UNSIGNED NOT NULL,
  `descripcion`          VARCHAR(255),
  PRIMARY KEY (`id_tipo_incidente`),
  UNIQUE KEY `uq_tipo_incidente_nombre` (`nombre_tipo`)
) ENGINE=InnoDB;
```

### `ticket`
```sql
CREATE TABLE IF NOT EXISTS `ticket` (
  `id_ticket`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero_ticket`     VARCHAR(20)  NOT NULL,
  `id_equipo`         INT UNSIGNED NOT NULL,
  `id_tecnico`        INT UNSIGNED NOT NULL,
  `id_tipo_incidente` INT UNSIGNED NOT NULL,
  `titulo`            VARCHAR(200) NOT NULL,
  `descripcion`       TEXT,
  `estado`            ENUM('ABIERTO','EN_PROCESO','RESUELTO','CERRADO')
                        NOT NULL DEFAULT 'ABIERTO',
  `prioridad`         ENUM('BAJA','MEDIA','ALTA','CRITICA')
                        NOT NULL DEFAULT 'MEDIA',
  `fecha_apertura`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_respuesta`   DATETIME,
  `fecha_resolucion`  DATETIME,
  `fecha_cierre`      DATETIME,
  `fuera_de_sla`      BOOLEAN      NOT NULL DEFAULT FALSE,
  `pdf_acta_path`     VARCHAR(500),
  PRIMARY KEY (`id_ticket`),
  UNIQUE KEY `uq_ticket_numero` (`numero_ticket`),
  CONSTRAINT `fk_ticket_equipo`
    FOREIGN KEY (`id_equipo`)         REFERENCES `equipo`          (`id_equipo`),
  CONSTRAINT `fk_ticket_tecnico`
    FOREIGN KEY (`id_tecnico`)        REFERENCES `usuario_sistema` (`id_usuario`),
  CONSTRAINT `fk_ticket_tipo_inc`
    FOREIGN KEY (`id_tipo_incidente`) REFERENCES `tipo_incidente`  (`id_tipo_incidente`)
) ENGINE=InnoDB;
```

### `historial_ticket`
```sql
CREATE TABLE IF NOT EXISTS `historial_ticket` (
  `id_hist_ticket` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_ticket`      INT UNSIGNED NOT NULL,
  `id_usuario`     INT UNSIGNED NOT NULL,
  `estado_anterior` ENUM('ABIERTO','EN_PROCESO','RESUELTO','CERRADO') NOT NULL,
  `estado_nuevo`   ENUM('ABIERTO','EN_PROCESO','RESUELTO','CERRADO')  NOT NULL,
  `comentario`     TEXT,
  `fecha_cambio`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_hist_ticket`),
  CONSTRAINT `fk_hticket_ticket`
    FOREIGN KEY (`id_ticket`)  REFERENCES `ticket`          (`id_ticket`),
  CONSTRAINT `fk_hticket_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario_sistema` (`id_usuario`)
) ENGINE=InnoDB;
```

### `notificacion`
```sql
CREATE TABLE IF NOT EXISTS `notificacion` (
  `id_notif`       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_usuario`     INT UNSIGNED NOT NULL,
  `tipo_notif`     ENUM('STOCK_CRITICO','SLA_VENCIDO','TICKET_ASIGNADO','INFO')
                     NOT NULL,
  `titulo`         VARCHAR(200) NOT NULL,
  `mensaje`        TEXT,
  `leida`          BOOLEAN      NOT NULL DEFAULT FALSE,
  `url_accion`     VARCHAR(500),
  `fecha_creacion` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notif`),
  CONSTRAINT `fk_notif_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario_sistema` (`id_usuario`)
) ENGINE=InnoDB;
```

### `config_stock`
```sql
CREATE TABLE IF NOT EXISTS `config_stock` (
  `id_config`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `id_tipo`            INT UNSIGNED     NOT NULL,
  `umbral_pct`         TINYINT UNSIGNED NOT NULL,
  `id_usuario_config`  INT UNSIGNED     NOT NULL,
  `fecha_modificacion` DATETIME         NOT NULL
                         DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_config`),
  CONSTRAINT `fk_config_tipo`
    FOREIGN KEY (`id_tipo`)           REFERENCES `tipo_equipo`     (`id_tipo`),
  CONSTRAINT `fk_config_usuario`
    FOREIGN KEY (`id_usuario_config`) REFERENCES `usuario_sistema` (`id_usuario`)
) ENGINE=InnoDB;
```

## Vistas SQL

| Vista | Descripción |
|---|---|
| `v_inventario_completo` | Join desnormalizado equipo + modelo + marca + área + SO + especificaciones. Usada por reportes y búsquedas avanzadas. |
| `v_dashboard_resumen` | Agrega totales por tipo de equipo (total, asignados, en bodega, en reparación, dados de baja, porcentaje operativo). Usada por `/api/dashboard`. |
| `v_stock_critico` | Tipos de equipo donde `pct_actual < umbral_pct` de `config_stock`. Usada por el scheduler de notificaciones de stock. |
| `v_tickets_activos` | Tickets en estado `ABIERTO` o `EN_PROCESO` con cálculo en tiempo real de `minutos_transcurridos`, `minutos_restantes_sla` y `sla_vencido`. Usada por el scheduler de notificaciones de SLA. |

## Procedimiento almacenado

### `sp_generar_numero_ticket`

Genera números de ticket con formato `TKT-YYYYMM-NNNN` (correlativo por mes). Ejemplo: `TKT-202605-0001`.

```sql
-- Uso desde la aplicación:
CALL sp_generar_numero_ticket(@numero);
-- @numero contendrá el código generado, ej: 'TKT-202605-0042'
```

## Triggers de auditoría

| Trigger | Tabla | Evento | Acción |
|---|---|---|---|
| `trg_audit_usuario_update` | `usuario_sistema` | AFTER UPDATE | Inserta fila en `audit_log` con el usuario activo y la IP |
| `trg_audit_equipo_delete` | `equipo` | AFTER DELETE | Inserta fila en `audit_log` registrando la baja del equipo |

Los triggers leen las variables de sesión establecidas por el `AuditSessionInterceptor` del backend en cada request:

| Variable MySQL | Valor | Establecida por |
|---|---|---|
| `@id_usuario_activo` | `id_usuario` del JWT | `AuditSessionInterceptor` |
| `@ip_cliente` | IP del cliente HTTP | `AuditSessionInterceptor` |
