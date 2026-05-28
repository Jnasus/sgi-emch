---
id: estructura-del-proyecto
title: Estructura del proyecto
sidebar_position: 2
---

# Estructura del proyecto

## Árbol de carpetas

```
sgi-emch/
├── backend/                        # Aplicación Spring Boot
│   ├── src/main/java/pe/edu/emch/sgi/
│   │   ├── config/                 # DataSeeder, SecurityConfig, WebConfig
│   │   ├── controller/             # Controladores REST (Auth, Equipo, Ticket, etc.)
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── entity/                 # Entidades JPA (Usuario, Equipo, Ticket, etc.)
│   │   ├── repository/             # Repositorios Spring Data
│   │   ├── scheduler/              # NotificacionScheduler (SLA y stock crítico)
│   │   ├── security/               # JwtFilter, AuditSessionInterceptor
│   │   └── service/                # Lógica de negocio
│   ├── src/main/resources/
│   │   └── application.properties  # Configuración del servidor, BD, JWT, Swagger
│   ├── backup/                     # Scripts del contenedor de backup
│   │   ├── backup.sh               # Script mysqldump + rotación
│   │   └── crontab                 # Programación: todos los días a las 02:00
│   ├── backups/                    # Destino de los .sql.gz generados (en el host)
│   ├── .env                        # Variables secretas (no en git)
│   ├── .env.example                # Plantilla de variables
│   └── Dockerfile                  # Build multi-stage del backend
├── frontend/                       # Aplicación React + Vite
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/         # Páginas y componentes UI
│   │   │   └── App.tsx             # Router principal y estado de autenticación
│   │   ├── lib/
│   │   │   └── api.ts              # fetchWithAuth — wrapper JWT para todas las llamadas
│   │   └── services/               # Servicios por módulo (equipo, ticket, usuario, etc.)
│   └── Dockerfile                  # Build multi-stage del frontend
├── docusaurus/                     # Documentación (este sitio)
│   ├── docs/                       # Archivos Markdown
│   ├── src/css/custom.css          # Estilos institucionales
│   ├── docusaurus.config.js
│   ├── sidebars.js
│   └── Dockerfile
├── db_sgi_emch.sql                 # Script de inicialización de la BD
└── docker-compose.yml              # Orquestación de todos los servicios
```

## Servicios Docker y redes

```
┌─────────────────────────────────────────────────────────────────┐
│                        proxy_network                            │
│  ┌────────────┐    ┌───────────────┐    ┌──────────────────┐   │
│  │  frontend  │    │     docs      │    │  Nginx Proxy Mgr │   │
│  │ (Nginx:80) │    │  (Nginx:80)   │    │  (externo)       │   │
│  └─────┬──────┘    └───────────────┘    └──────────────────┘   │
└────────│────────────────────────────────────────────────────────┘
         │ sgi_app
┌────────│──────────────────────────┐
│        │                          │
│  ┌─────▼──────────┐               │
│  │    backend     │               │
│  │  (Spring:8080) │               │
│  └──────┬─────────┘               │
└─────────│───────────────────────── ┘
          │ sgi_internal
┌─────────│──────────────────────────┐
│  ┌──────▼──────┐  ┌─────────────┐  │
│  │     db      │  │   backup    │  │
│  │ (MySQL:3306)│  │  (crond)    │  │
│  └─────────────┘  └─────────────┘  │
└────────────────────────────────────┘
```

### Redes internas

| Red | Propósito | Servicios |
|---|---|---|
| `sgi_internal` | Comunicación privada backend ↔ BD | `db`, `backend`, `backup` |
| `sgi_app` | Frontend proxea requests al backend | `backend`, `frontend` |
| `proxy_network` | Red externa de Nginx Proxy Manager | `frontend`, `docs` |

### Volúmenes persistentes

| Volumen | Contenido |
|---|---|
| `full_mysql_data` | Datos de MySQL (tablas, índices, vistas) |
| `full_pdf_storage` | Actas PDF generadas por el sistema (`/app/storage/actas`) |

## Flujo de una request

```
Usuario → Nginx Proxy Manager → frontend (Nginx)
                                    ↓ /api/*
                                backend (Spring Boot)
                                    ↓
                              MySQL (via sgi_internal)
```

El frontend de Nginx actúa como proxy inverso: sirve la SPA de React para cualquier ruta, y reenvía las llamadas a `/api/*` al contenedor `backend` dentro de la red `sgi_app`.
