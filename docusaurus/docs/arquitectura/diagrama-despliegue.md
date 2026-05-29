---
id: diagrama-despliegue
title: Diagrama de despliegue
sidebar_position: 4
---

# Diagrama de despliegue

El sistema se despliega íntegramente en un servidor Linux usando **Docker Compose**. Cada servicio corre en su propio contenedor y se comunica a través de redes Docker internas.

## Stack principal (`docker-compose.yml`)

```mermaid
graph TB
    subgraph Internet["Internet / Red Institucional"]
        U(["👤 Usuario"])
    end

    subgraph Servidor["Servidor Linux"]
        NPM["Nginx Proxy Manager\nexterno · proxy_network\nTerminación TLS · Certificados SSL"]

        subgraph proxy_network["proxy_network"]
            FE["frontend\nNginx · puerto 80\nSirve SPA + proxea /api/*"]
            DOCS["docs\nNginx · puerto 80\nDocusaurus estático"]
            GF["grafana†\npuerto 3000"]
        end

        subgraph sgi_app["sgi_app (red interna)"]
            BE["backend\nSpring Boot · puerto 8080\nAPI REST"]
        end

        subgraph sgi_internal["sgi_internal (red privada)"]
            DB[("MySQL 8.0\npuerto 3306\nVolumen: full_mysql_data")]
            BK["backup\nAlpine + mysqldump\nCron: 02:00 diario"]
        end
    end

    U -->|"HTTPS · sgi.escuelamilitar.edu.pe"| NPM
    U -->|"HTTPS · sgi-docs.escuelamilitar.edu.pe"| NPM
    NPM --> FE
    NPM --> DOCS
    NPM --> GF
    FE -->|"/api/* HTTP interno"| BE
    BE -->|"JDBC · HikariCP"| DB
    BK -->|"mysqldump"| DB
```

## Stack de monitoreo (`docker-compose.monitoring.yml`)

Stack opcional desplegado por separado.

```mermaid
graph LR
    subgraph monitoring_network["monitoring_network"]
        PT["promtail\nLee Docker socket"]
        LOKI["loki\npuerto 3100\nVolumen: loki_data"]
        PROM["prometheus\npuerto 9090\nVolumen: prometheus_data\nRetención: 15 días"]
        GF2["grafana\npuerto 3000\nsgi-grafana.escuelamilitar.edu.pe"]
    end

    CONTENEDORES(["Contenedores\nsgi-full-*"])
    BE_PROM["backend\n/actuator/prometheus"]

    CONTENEDORES -->|"logs stdout/stderr"| PT
    PT -->|"push HTTP"| LOKI
    BE_PROM -->|"scrape cada 15 s\nvia sgi_internal"| PROM
    PROM --> GF2
    LOKI --> GF2
    GF2 -->|"proxy_network · HTTPS"| NPM_EXT["Nginx Proxy Manager"]
```

## Nodos de despliegue

| Nodo | Tipo | Artefactos desplegados |
|---|---|---|
| Servidor Linux | VM / Bare Metal | Todos los contenedores Docker |
| Contenedor `frontend` | Docker (Nginx) | Build de React/Vite compilado a archivos estáticos |
| Contenedor `backend` | Docker (JRE 21) | JAR de Spring Boot |
| Contenedor `docs` | Docker (Nginx) | Build de Docusaurus compilado a archivos estáticos |
| Contenedor `db` | Docker (MySQL 8.0) | Datos en volumen persistente `full_mysql_data` |
| Contenedor `backup` | Docker (Alpine) | Script `backup.sh` ejecutado por crond |
| Contenedor `prometheus` | Docker | Binario Prometheus + datos en `prometheus_data` |
| Contenedor `loki` | Docker | Binario Loki + datos en `loki_data` |
| Contenedor `promtail` | Docker | Binario Promtail + acceso al socket Docker |
| Contenedor `grafana` | Docker | Grafana + dashboards provisioned + datos en `grafana_data` |

## Puertos y acceso externo

Solo Nginx Proxy Manager expone puertos al exterior (80 y 443). Todos los demás servicios son internos.

| URL pública | Servicio destino |
|---|---|
| `https://sgi.escuelamilitar.edu.pe` | frontend (SPA React) |
| `https://sgi-docs.escuelamilitar.edu.pe` | docs (Docusaurus) |
| `https://sgi-grafana.escuelamilitar.edu.pe` | grafana (monitoreo) |

## Healthchecks

| Contenedor | Healthcheck |
|---|---|
| `db` | `mysqladmin ping` cada 10 s — 10 reintentos |
| `backend` | `wget /actuator/health` cada 15 s — 8 reintentos |
| `frontend` | Depende de `backend: healthy` |
