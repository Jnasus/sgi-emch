---
id: ci-cd
title: CI/CD con GitHub Actions
sidebar_position: 6
---

# CI/CD con GitHub Actions

El repositorio incluye un pipeline en `.github/workflows/ci-cd.yml` que verifica el código en cada PR y despliega automáticamente al servidor cuando se mergea a `main`.

## Flujo

```
push / PR → main
        │
        ▼
    ┌──────────────────────────────┐
    │  Job: ci                     │
    │  1. Tests Maven (backend)    │
    │  2. Build Vite (frontend)    │
    └────────────┬─────────────────┘
                 │ solo si push a main
                 ▼
    ┌──────────────────────────────┐
    │  Job: deploy                 │
    │  SSH → git pull              │
    │       → docker compose up    │
    └──────────────────────────────┘
```

- Los PRs solo ejecutan `ci`. El merge no despliega si `ci` falla.
- El job `deploy` corre únicamente en `push` directo a `main` (no en PRs).

## Job `ci`

| Paso | Qué hace |
|---|---|
| `actions/setup-java@v4` | Instala Java 21 (Temurin) con caché de Maven |
| `./mvnw test` | Ejecuta los tests del backend desde `./backend` |
| `actions/setup-node@v4` | Instala Node 20 con caché de npm |
| `npm ci && npm run build` | Instala dependencias y construye el frontend desde `./frontend` |

## Job `deploy`

Usa `appleboy/ssh-action` para conectarse al servidor y ejecutar:

```bash
cd $SSH_PATH
git pull
docker compose up --build -d
```

Docker reconstruye solo los contenedores cuya imagen cambió. Los volúmenes de base de datos y PDFs **no se tocan**.

## Secrets requeridos

Configúralos en **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|---|---|
| `SSH_HOST` | IP o dominio del servidor |
| `SSH_USER` | Usuario SSH (ej. `ubuntu`) |
| `SSH_KEY` | Llave privada SSH (contenido completo del `.pem` o `id_rsa`) |
| `SSH_PATH` | Ruta absoluta del proyecto en el servidor (ej. `/home/ubuntu/sgi-emch`) |

:::tip
Genera un par de llaves dedicado para el pipeline:
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy
# Agrega ~/.ssh/github_deploy.pub al servidor en ~/.ssh/authorized_keys
# El contenido de ~/.ssh/github_deploy va en el secret SSH_KEY
```
:::

## Diagnóstico rápido

**El job `ci` falla en los tests del backend:**
```bash
# Reproduce localmente
cd backend && ./mvnw test
```

**El job `ci` falla en el build del frontend:**
```bash
cd frontend && npm ci && npm run build
```

**El job `deploy` falla por SSH:**
- Verifica que `SSH_KEY` tenga la llave privada completa (incluye `-----BEGIN...` y `-----END...`).
- Verifica que la llave pública esté en `~/.ssh/authorized_keys` del servidor.
- Confirma que `SSH_USER` tenga permisos sobre `SSH_PATH`.

**El deploy exitoso pero la app no actualizó:**
```bash
# En el servidor
docker compose ps        # revisa que todos los servicios estén healthy
docker compose logs -f   # busca errores en el arranque
```
