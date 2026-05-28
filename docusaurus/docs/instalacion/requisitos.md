---
id: requisitos
title: Requisitos previos
sidebar_position: 1
---

# Requisitos previos

## Software necesario

| Herramienta | Versión mínima | Notas |
|---|---|---|
| **Docker** | 24.x | Motor de contenedores |
| **Docker Compose** | v2.20 | Incluido en Docker Desktop |
| **Git** | 2.x | Para clonar el repositorio |

No se necesita Java, Node.js ni MySQL instalados localmente — todo corre dentro de los contenedores.

## Red Docker externa

El stack usa una red externa llamada `proxy_network` para comunicarse con **Nginx Proxy Manager**. Debe existir antes de levantar el stack:

```bash
docker network create proxy_network
```

Si ya tienes Nginx Proxy Manager corriendo en esa red, omite este paso.

## Variables de entorno

El backend requiere un archivo `.env` en `backend/`. Usa el ejemplo incluido:

```bash
cp backend/.env.example backend/.env
```

Luego edita `backend/.env` con los valores reales:

```dotenv
# Credenciales de MySQL (deben coincidir con lo que Docker levanta)
DB_USERNAME=root
DB_PASSWORD=tu_password_seguro

# Secreto JWT — mínimo 32 caracteres, cambia en producción
JWT_SECRET=cambia-esto-por-un-secreto-de-al-menos-32-caracteres
```

:::warning Seguridad
Nunca subas el archivo `.env` real al repositorio. El `.gitignore` ya lo excluye. Usa contraseñas fuertes y un JWT_SECRET aleatorio en producción.
:::

## Puertos utilizados

El stack **no expone puertos directamente** al host. Todo el acceso externo pasa por Nginx Proxy Manager. Internamente:

| Servicio | Puerto interno | Red |
|---|---|---|
| MySQL | 3306 | `sgi_internal` |
| Backend (Spring Boot) | 8080 | `sgi_internal`, `sgi_app` |
| Frontend (Nginx) | 80 | `sgi_app`, `proxy_network` |
| Docs (Nginx) | 80 | `proxy_network` |
