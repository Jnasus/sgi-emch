---
id: nginx-proxy-manager
title: Nginx Proxy Manager
sidebar_position: 3
---

# Configuración de Nginx Proxy Manager

Nginx Proxy Manager (NPM) actúa como punto de entrada único para el tráfico externo. Los contenedores del stack no exponen puertos al host directamente; todo pasa por NPM via la red `proxy_network`.

## Requisitos previos

- NPM ya instalado y corriendo en la misma máquina (o accesible por la red).
- Los contenedores `sgi-full-frontend` y `sgi-full-docs` deben estar en la red `proxy_network` (ya configurado en el `docker-compose.yml`).
- Dominio(s) apuntando a la IP del servidor con registros DNS A configurados.

## Proxy Host para el Frontend (aplicación principal)

Crea un nuevo **Proxy Host** en NPM con:

| Campo | Valor |
|---|---|
| **Domain Names** | `sgi.escuelamilitar.edu.pe` |
| **Scheme** | `http` |
| **Forward Hostname / IP** | `sgi-full-frontend` |
| **Forward Port** | `80` |
| **Cache Assets** | ✅ |
| **Block Common Exploits** | ✅ |

En la pestaña **SSL**:
- Selecciona o solicita un certificado Let's Encrypt
- Activa **Force SSL** y **HTTP/2 Support**

## Proxy Host para la Documentación

| Campo | Valor |
|---|---|
| **Domain Names** | `docs.sgi.escuelamilitar.edu.pe` |
| **Scheme** | `http` |
| **Forward Hostname / IP** | `sgi-full-docs` |
| **Forward Port** | `80` |
| **Cache Assets** | ✅ |
| **Block Common Exploits** | ✅ |

Aplica SSL igual que para el frontend.

## Red externa proxy_network

El stack define esta red como **externa** (`external: true`). Esto significa que NPM y el stack comparten la misma red Docker, lo que permite que NPM resuelva los nombres de contenedor (`sgi-full-frontend`, `sgi-full-docs`) directamente.

Para verificar que los contenedores están en la red:

```bash
docker network inspect proxy_network | grep -A2 "Name"
```

Deberías ver `sgi-full-frontend` y `sgi-full-docs` listados.

## Acceso a Swagger UI en producción

El backend (`sgi-full-backend`) no está conectado a `proxy_network` por diseño de seguridad. Para exponer Swagger UI temporalmente (ej. durante desarrollo en el servidor):

1. Agrega temporalmente el backend a `proxy_network` en el `docker-compose.yml`:

```yaml
backend:
  networks:
    - sgi_internal
    - sgi_app
    - proxy_network   # temporal
```

2. Crea un Proxy Host en NPM apuntando a `sgi-full-backend:8080`.

3. Elimina la configuración cuando termines para mantener el backend inaccesible desde el exterior.

## Solución de problemas

| Problema | Posible causa | Solución |
|---|---|---|
| NPM no encuentra el contenedor | El contenedor no está en `proxy_network` | Verifica con `docker network inspect proxy_network` |
| Error 502 Bad Gateway | El contenedor destino no está corriendo | Verifica con `docker compose ps` |
| Certificado SSL no renueva | Puerto 80 bloqueado por firewall | Abre el puerto 80 en el firewall del servidor |
