# SGI EMCH — Infraestructura y Despliegue

Guía de referencia para operadores y desarrolladores del servidor `backup-dev1`.

---

## Tabla de Contenido

1. [Arquitectura general](#arquitectura-general)
2. [Stacks Docker](#stacks-docker)
   - [Stack backend-only (producción actual)](#stack-backend-only-producción-actual)
   - [Stack full-stack (alternativo)](#stack-full-stack-alternativo)
3. [HTTPS y Nginx Proxy Manager](#https-y-nginx-proxy-manager)
4. [CORS](#cors)
5. [Sistema de Backups](#sistema-de-backups)
6. [Seguridad del servidor](#seguridad-del-servidor)
7. [Acceso Docker para desarrolladores](#acceso-docker-para-desarrolladores)

---

## Arquitectura general

```
Internet
   │ HTTPS
   ▼
Nginx Proxy Manager (NPM)
   ├── api.escuelamilitar.edu.pe  →  sgi-emch-backend:8080  (backend-only stack)
   └── sgi.escuelamilitar.edu.pe  →  sgi-full-frontend:80   (full-stack)
                                          │ /api/* (proxy interno)
                                          └──► sgi-full-backend:8080
```

NPM termina SSL y reenvía las peticiones como HTTP interno.
El backend recibe el header `X-Forwarded-Proto: https` de NPM.

---

## Stacks Docker

El proyecto tiene **dos** configuraciones Docker independientes. No deben correr simultáneamente (comparten la base de datos del negocio).

### Stack backend-only (producción actual)

**Archivo:** `backend/docker-compose.yml`  
**Uso:** Despliegue del API en servidor. El frontend se gestiona por separado.

```
backend/docker-compose.yml
├── sgi-emch-db        (MySQL 8.0, red interna sgi_internal)
├── sgi-emch-backend   (Spring Boot, redes sgi_internal + proxy_network)
└── sgi-emch-backup    (Alpine + mysqldump, red sgi_internal)
```

**Levantar:**
```bash
cd backend
docker compose up -d
```

**Red `proxy_network`:** red externa pre-existente de NPM. El backend es alcanzable por NPM como `sgi-emch-backend:8080`.

---

### Stack full-stack (alternativo)

**Archivo:** `docker-compose.yml` (raíz del monorepo)  
**Uso:** Despliegue completo frontend + backend en un solo servidor.

```
docker-compose.yml (raíz)
├── sgi-full-db        (MySQL 8.0, red sgi_internal)
├── sgi-full-backend   (Spring Boot, redes sgi_internal + sgi_app)
├── sgi-full-frontend  (Nginx, redes sgi_app + proxy_network, puerto host 82)
└── sgi-full-backup    (Alpine + mysqldump, red sgi_internal)
```

En este stack, el frontend hace de proxy inverso: las llamadas `/api/*` del navegador van a Nginx, que las reenvía internamente a `sgi-full-backend:8080`. El navegador ve todo como mismo origen (`https://sgi.escuelamilitar.edu.pe`), por lo que CORS en Spring Boot no interviene.

**Levantar:**
```bash
cd /ruta/monorepo
docker compose up -d
```

**Variables de entorno del frontend:**
El build de Docker usa `VITE_API_BASE: ""` (vacío = URLs relativas).
El archivo `frontend/.env.production` tiene la URL para builds manuales sin Docker.

---

## HTTPS y Nginx Proxy Manager

NPM actúa como único punto de entrada HTTPS. Configuración relevante en Spring Boot:

```properties
# application.properties
server.forward-headers-strategy=FRAMEWORK
```

Esto hace que Spring Boot lea `X-Forwarded-Proto` y `X-Forwarded-Host` enviados por NPM, necesario para que:
- Swagger genere URLs `https://` en lugar de `http://`
- Los redirects internos usen el esquema correcto

Sin esta propiedad, Swagger genera `http://api.escuelamilitar.edu.pe/...` y el navegador bloquea las llamadas como **mixed content** (la página HTTPS intenta cargar un recurso HTTP).

---

## CORS

Configurado en `SecurityConfig.java`:

```java
config.setAllowedOrigins(List.of(
    "http://localhost:5173",           // Vite dev server local
    "https://sgi.escuelamilitar.edu.pe" // Frontend producción
));
config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
config.setAllowedHeaders(List.of("*"));
config.setAllowCredentials(true);
```

| Escenario | Comportamiento |
|---|---|
| Dev (Vite `localhost:5173` → backend `localhost:8080`) | Cross-origin → CORS activo, origen permitido ✓ |
| Full-stack Docker (browser → Nginx → backend interno) | Same-origin → CORS no interviene |
| Backend-only + frontend `sgi.escuelamilitar.edu.pe` | Cross-origin → origen permitido ✓ |

---

## Sistema de Backups

### Componentes

| Archivo | Descripción |
|---|---|
| `backup/Dockerfile` | Imagen Alpine con `mysql-client` |
| `backup/backup.sh` | Script principal de dump + rotación |
| `backup/crontab` | Horario de ejecución |

### Funcionamiento

1. `crond` ejecuta `/backup.sh` según el horario en `crontab`
2. El script carga variables de entorno desde `/etc/env_backup` (escrito al arrancar el contenedor, porque `crond` no hereda vars de Docker)
3. Ejecuta `mysqldump --single-transaction --routines --triggers` y comprime con gzip
4. Guarda en `/backups/backup_YYYY-MM-DD_HH-MM.sql.gz`
5. Elimina backups con más de `MAX_BACKUPS` días (default: 7)

### Archivos resultantes

Los `.sql.gz` se persisten en `backend/backups/` del servidor host (volumen bind-mount), accesibles directamente sin entrar al contenedor.

### Horario actual

```
0 2 * * *   →  todos los días a las 02:00 AM
```

### Cambiar el horario sin rebuild

```bash
# Editar el crontab (el cambio se aplica en el próximo ciclo):
nano backend/backup/crontab

# Reiniciar solo el servicio de backup:
docker compose restart backup
```

### Forzar un backup manual

```bash
docker exec sgi-emch-backup /backup.sh
```

### Restaurar un backup

```bash
# Copiar el archivo al servidor y ejecutar:
gunzip -c backup_2026-05-22_02-00.sql.gz | \
  mysql -h 127.0.0.1 -P 3307 -u root -p db_sgi_emch
# (ajustar puerto si la DB tiene puerto expuesto; en producción solo red interna)
```

---

## Seguridad del servidor

### Nginx — bloqueo de rutas sensibles

El frontend Nginx (`frontend/nginx.conf`) bloquea con `404` las rutas que los scanners buscan habitualmente, en lugar de devolver `index.html`:

```nginx
location ~* ^/(\.env|\.git|Dockerfile|docker-compose|aws|\.htaccess|\.DS_Store|wp-admin|wp-login|xmlrpc|config\.php|\.well-known/security) {
    return 404;
}
location ~ /\. {
    return 404;
}
```

Sin esta configuración, el SPA fallback devolvía `200 + index.html` para cualquier ruta inexistente, lo que no filtraba datos pero generaba falsos positivos en auditorías de seguridad.

### Docker data root

El data root de Docker está en `/home/docker-data` (configurado en `/etc/docker/daemon.json`). Es gestionado internamente por `dockerd` como `root:root` — **no cambiar ownership de esta carpeta**.

Permisos del directorio raíz:
```
drwxr-x---  root  docker   /home/docker-data
```
El grupo `docker` tiene `r-x` para que sus miembros puedan entrar y listar. Las internals las gestiona Docker.

---

## Acceso Docker para desarrolladores

El usuario `devman01` (grupo `devops`) tiene acceso al daemon de Docker sin `sudo` gracias a pertenecer al grupo `docker`:

```
uid=1001(devman01) gid=1003(devman01) groups=devman01,devops,docker
```

**Para agregar un nuevo desarrollador al grupo `docker`:**

```bash
sudo usermod -aG docker <usuario>
# el usuario debe cerrar sesión y volver a entrar
```

**Nota de seguridad:** pertenecer al grupo `docker` es equivalente en la práctica a tener `sudo`. Solo agregar usuarios de confianza del equipo.

**Verificar acceso:**

```bash
docker ps        # debe funcionar sin sudo
docker compose ps
```
