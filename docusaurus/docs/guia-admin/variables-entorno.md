---
id: variables-entorno
title: Variables de entorno
sidebar_position: 1
---

# Variables de entorno

El backend lee su configuración del archivo `backend/.env`. Este archivo nunca debe subirse al repositorio (está en `.gitignore`).

## Variables requeridas

| Variable | Ejemplo | Descripción |
|---|---|---|
| `DB_USERNAME` | `root` | Usuario de MySQL. Debe coincidir con `MYSQL_ROOT_USER` si lo cambias en el compose |
| `DB_PASSWORD` | `S3cur3P@ss!` | Contraseña de MySQL. La misma que `MYSQL_ROOT_PASSWORD` en el compose |
| `JWT_SECRET` | `m1-s3cr3t0-de-al-menos-32-car4cteres` | Clave para firmar tokens JWT. Mínimo 32 caracteres. **Cambia este valor en producción** |

## Variables opcionales (con defaults en application.properties)

| Variable | Default | Descripción |
|---|---|---|
| `MAIL_HOST` | `smtp.gmail.com` | Servidor SMTP para envío de correos |
| `spring.jpa.show-sql` | `false` | Mostrar SQL generado en los logs (solo para desarrollo) |
| `spring.datasource.hikari.maximum-pool-size` | `10` | Máximo de conexiones simultáneas a MySQL |

## Variables del docker-compose.yml

Estas se configuran directamente en el `docker-compose.yml` o en un `.env` en la raíz del proyecto:

| Variable | Default | Descripción |
|---|---|---|
| `DB_PASSWORD` | `root` | Contraseña de MySQL para el contenedor `db` y el servicio `backup`. Debe coincidir con `backend/.env` |

## Plantilla completa

```dotenv
# backend/.env

# ── Base de Datos ─────────────────────────────────────────────
DB_USERNAME=root
DB_PASSWORD=cambia_este_password

# ── JWT ───────────────────────────────────────────────────────
# Genera un secreto seguro: openssl rand -base64 48
JWT_SECRET=cambia-esto-por-un-secreto-de-al-menos-32-caracteres

# ── Mail (opcional) ───────────────────────────────────────────
# MAIL_HOST=smtp.gmail.com
```

## Buenas prácticas

- Genera el `JWT_SECRET` con un comando como `openssl rand -base64 48` o un gestor de contraseñas.
- Usa contraseñas distintas para cada entorno (desarrollo, producción).
- En producción, considera usar Docker Secrets o un servicio de vault en lugar de archivos `.env`.
- Rota el `JWT_SECRET` si sospechas que fue comprometido; todos los usuarios activos tendrán que volver a iniciar sesión.

:::warning
Si cambias el `JWT_SECRET` con el sistema en producción, todos los tokens emitidos hasta ese momento se invalidarán inmediatamente.
:::
