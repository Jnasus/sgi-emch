---
id: despliegue
title: Despliegue
sidebar_position: 2
---

# Despliegue con Docker Compose

## Primera instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jnasus/sgi-emch.git
cd sgi-emch
```

### 2. Crear el archivo de variables de entorno

```bash
cp backend/.env.example backend/.env
# Edita backend/.env con las credenciales reales
```

### 3. Crear la red externa (si no existe)

```bash
docker network create proxy_network
```

### 4. Construir e iniciar el stack

```bash
docker compose up --build -d
```

Docker construirá las imágenes del backend, frontend y documentación, e iniciará todos los servicios. La base de datos se inicializa automáticamente con el script `db_sgi_emch.sql` la **primera vez** que el volumen `full_mysql_data` está vacío.

### 5. Verificar que todo esté corriendo

```bash
docker compose ps
```

Todos los servicios deben aparecer como `healthy` o `running`.

## Actualizaciones

Cuando hay cambios en el código:

```bash
git pull
docker compose up --build -d
```

Docker reconstruye solo los contenedores cuya imagen cambió. El volumen de base de datos **no se toca** — los datos persisten.

## Reinicio sin reconstruir

```bash
docker compose restart
```

## Detener el stack

```bash
# Detiene los contenedores pero conserva volúmenes y datos
docker compose down

# Detiene Y elimina volúmenes (BORRA TODOS LOS DATOS)
docker compose down -v
```

:::danger
`docker compose down -v` elimina irreversiblemente los datos de la base de datos y los PDFs almacenados. Úsalo solo en entornos de desarrollo o cuando quieras empezar desde cero.
:::

## Verificar logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo el backend
docker compose logs -f backend

# Solo la base de datos
docker compose logs -f db
```

## Healthchecks configurados

| Servicio | Condición de salud |
|---|---|
| `db` | `mysqladmin ping` cada 10 s, 10 reintentos |
| `backend` | `wget /actuator/health` cada 15 s, 8 reintentos |
| `frontend` | Depende de `backend: healthy` |
| `docs` | Sin healthcheck (Nginx estático) |

El backend no arranca hasta que la base de datos esté lista, y el frontend no arranca hasta que el backend responda.
