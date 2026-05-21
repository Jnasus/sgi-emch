#!/bin/sh
set -eo pipefail

# crond no hereda las variables de entorno del contenedor Docker.
# El entrypoint del servicio las escribe en /etc/env_backup al arrancar.
set -a
. /etc/env_backup
set +a

TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
BACKUP_FILE="/backups/backup_${TIMESTAMP}.sql.gz"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup de ${MYSQL_DB}..."

mysqldump \
  -h "${MYSQL_HOST}" \
  -u "${MYSQL_USER}" \
  -p"${MYSQL_PASS}" \
  --single-transaction \
  --routines \
  --triggers \
  "${MYSQL_DB}" | gzip > "${BACKUP_FILE}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Guardado: $(basename ${BACKUP_FILE}) ($(du -sh ${BACKUP_FILE} | cut -f1))"

# Eliminar backups más viejos que MAX_BACKUPS días (por defecto 7)
find /backups -name "backup_*.sql.gz" -mtime +"${MAX_BACKUPS:-7}" -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Limpieza completada. Backups actuales:"
ls -lh /backups/
