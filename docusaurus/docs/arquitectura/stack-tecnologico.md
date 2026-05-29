---
id: stack-tecnologico
title: Stack tecnológico
sidebar_position: 1
---

# Stack tecnológico

## Backend

| Tecnología | Versión | Rol |
|---|---|---|
| **Java** | 21 | Lenguaje principal |
| **Spring Boot** | 3.x | Framework web y de inyección de dependencias |
| **Spring Security** | 6.x | Autenticación JWT, control de acceso por rol |
| **Spring Data JPA** | 3.x | ORM sobre Hibernate |
| **MySQL Connector/J** | 8.x | Driver JDBC |
| **HikariCP** | (incluido) | Pool de conexiones; máx. 10 conexiones |
| **Caffeine** | 3.x | Caché en memoria para datos de catálogo (TTL 1 h, máx. 1 000 entradas) |
| **Micrometer + Prometheus** | (incluido en Spring Boot 3) | Exportación de métricas en `/actuator/prometheus` |
| **Apache POI** | 5.x | Generación de archivos Excel (.xlsx) para reportes y carga masiva |
| **OpenPDF / iText** | — | Generación de reportes en PDF |
| **springdoc-openapi** | 2.x | Documentación Swagger UI en `/swagger-ui.html` |
| **Lombok** | — | Reducción de boilerplate (getters, constructores, logs) |

### Seguridad

- Autenticación con **JWT**: access token (1 hora) + refresh token (24 horas).
- Cada request autenticado actualiza `ultimo_acceso` del usuario en la BD.
- Las variables de sesión MySQL (`@id_usuario_activo`, `@ip_cliente`) se establecen por request para los triggers de auditoría.
- Rutas públicas: `/api/auth/**`, `/swagger-ui/**`, `/api-docs/**`, `/actuator/health`, `/actuator/prometheus`.

## Frontend

| Tecnología | Versión | Rol |
|---|---|---|
| **React** | 18 | Librería de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Vite** | 6.x | Bundler y servidor de desarrollo |
| **React Router** | 7.x | Enrutamiento SPA |
| **shadcn/ui** | — | Componentes UI (Button, Dialog, Table, Badge, Card, etc.) |
| **Tailwind CSS** | 3.x | Utilidades CSS con JIT |
| **Framer Motion** | — | Animaciones de componentes |
| **Lucide React** | — | Iconografía |
| **Axios / Fetch** | — | Comunicación con la API (fetch nativo con wrapper) |

### Paleta de colores institucional

| Variable | Hex | Uso |
|---|---|---|
| Verde oscuro | `#2C3E1F` | Sidebar, textos principales |
| Verde medio | `#4A5D23` | Botones primarios, headers de tabla |
| Rojo acento | `#D91E18` | Alertas, borde del sidebar, badges de error |
| Gris claro | `#F5F5F0` | Fondo de página |

## Base de datos

- **MySQL 8.0** con charset `utf8mb4` y collation `utf8mb4_unicode_ci`.
- Esquema definido en `db_sgi_emch.sql` (raíz del repositorio); se ejecuta automáticamente al inicializar el volumen.
- Vistas SQL: `v_tickets_activos`, `v_inventario_completo`, `v_stock_critico`, `v_dashboard_resumen`.
- Triggers de auditoría: `trg_audit_usuario_update`, `trg_audit_equipo_delete`.
- Procedimiento almacenado: `sp_generar_numero_ticket` — genera números correlativos `TKT-YYYYMM-NNNN`.

## Infraestructura

### Stack principal (`docker-compose.yml`)

| Componente | Imagen Docker | Rol |
|---|---|---|
| **MySQL** | `mysql:8.0` | Base de datos |
| **Spring Boot** | Dockerfile multi-stage | API REST |
| **Frontend** | Dockerfile multi-stage (Node + Nginx) | SPA servida por Nginx |
| **Docs** | Dockerfile multi-stage (Node + Nginx) | Documentación Docusaurus |
| **Backup** | Alpine + mysqldump + crond | Backups automáticos diarios |
| **Nginx Proxy Manager** | Externo (red `proxy_network`) | Reverse proxy con HTTPS termination |

### Stack de monitoreo (`docker-compose.monitoring.yml`)

| Componente | Imagen Docker | Rol |
|---|---|---|
| **Prometheus** | `prom/prometheus:latest` | Scraping y almacenamiento de métricas (retención 15 días) |
| **Loki** | `grafana/loki:2.9.10` | Almacenamiento de logs de contenedores |
| **Promtail** | `grafana/promtail:3.0.0` | Recolección de logs desde el socket de Docker |
| **Grafana** | `grafana/grafana:11.5.2` | Visualización de dashboards y logs |

El stack de monitoreo es opcional y se despliega por separado. Ver [Guía de monitoreo](../guia-admin/monitoreo) para instrucciones.
