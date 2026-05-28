---
id: backups
title: Backups automáticos
sidebar_position: 2
---

# Backups automáticos

El contenedor `backup` ejecuta volcados automáticos de la base de datos MySQL usando `mysqldump`.

## Programación

```
Todos los días a las 02:00 AM (hora del servidor)
Cron: 0 2 * * *
```

## Retención

Se conservan los **últimos 7 backups**. Al generar el octavo, el más antiguo se elimina automáticamente.

## Ubicación de los archivos

Los backups se guardan en `backend/backups/` en el host (volumen montado en el contenedor):

```
backend/backups/
├── backup_2026-05-21_02-00.sql.gz
├── backup_2026-05-22_02-00.sql.gz
├── ...
└── backup_2026-05-27_02-00.sql.gz
```

Cada archivo está comprimido con gzip. El nombre incluye la fecha y hora de generación.

## Contenido del backup

El volcado incluye:
- Todas las tablas con datos
- Procedimientos almacenados (`--routines`)
- Triggers (`--triggers`)
- Transacción consistente (`--single-transaction`) — sin bloquear la BD durante el volcado

## Restaurar un backup

Para restaurar la base de datos desde un backup:

```bash
# 1. Identificar el backup a restaurar
ls backend/backups/

# 2. Restaurar (reemplaza todos los datos actuales)
gunzip < backend/backups/backup_2026-05-27_02-00.sql.gz | \
  docker exec -i sgi-full-db mysql -uroot -p<password> db_sgi_emch
```

:::danger
La restauración sobreescribe todos los datos actuales de la base de datos. Asegúrate de tener un backup reciente antes de restaurar.
:::

## Verificar el log de backups

```bash
docker exec sgi-full-backup cat /var/log/backup.log
```

## Cambiar la frecuencia

Edita el archivo `backend/backup/crontab`:

```cron
# Ejemplos:
0 2 * * *     → todos los días a las 02:00 AM (actual)
0 */6 * * *   → cada 6 horas
0 2 * * 0     → solo los domingos a las 02:00 AM
```

Luego reinicia el contenedor:

```bash
docker compose restart backup
```

El script `backup.sh` puede editarse sin reiniciar el contenedor; los cambios aplican en el siguiente ciclo.

## Importante: los backups NO se restauran automáticamente

Al hacer `docker compose down` y `docker compose up`, los datos persisten en el volumen `full_mysql_data`. Los backups son un mecanismo de **recuperación ante desastres**, no de restauración automática.

El script de inicialización (`db_sgi_emch.sql`) solo se ejecuta cuando el volumen de datos está **completamente vacío** (primera instalación o después de `docker compose down -v`).
