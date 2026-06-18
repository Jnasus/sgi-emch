---
id: monitoreo
title: Monitoreo (Prometheus + Grafana)
sidebar_position: 4
---

# Monitoreo con Prometheus, Loki y Grafana

El stack de monitoreo es **opcional** y se despliega por separado del stack principal mediante `docker-compose.monitoring.yml`. Una vez activo, expone métricas del backend en tiempo real a través de Grafana.

## Arquitectura del stack de monitoreo

```
Servidor Linux (host)
    │  /proc, /sys, /rootfs  ← node-exporter lee métricas del host
    │
    ├── Docker daemon
    │       │  socket + /var/lib/docker  ← cAdvisor lee métricas por contenedor
    │       │
    │       └── sgi-full-backend:8080
    │               │  /actuator/prometheus  ← métricas JVM / HTTP / HikariCP
    │               ▼
    │           Prometheus  ← raspa los 3 targets cada 15 s; retención 15 días
    │               │
    │               ▼
    │           Grafana  ← dashboards de infraestructura y aplicación
    │               │
    │               ├── datasource: Prometheus
    │               └── datasource: Loki ← logs de contenedores
    │                         ▲
    │                      Promtail  ← recolecta logs de Docker
```

### Componentes

| Contenedor | Imagen | Puerto interno | Rol |
|---|---|---|---|
| `sgi-full-prometheus` | `prom/prometheus:latest` | 9090 | Scraping y almacenamiento de métricas |
| `sgi-full-node-exporter` | `prom/node-exporter:latest` | 9100 | Métricas del host: CPU, RAM, disco, red |
| `sgi-full-cadvisor` | `gcr.io/cadvisor/cadvisor:latest` | 8080 | Métricas por contenedor Docker |
| `sgi-full-loki` | `grafana/loki:2.9.10` | 3100 | Almacenamiento de logs |
| `sgi-full-promtail` | `grafana/promtail:3.0.0` | — | Recolección de logs desde Docker |
| `sgi-full-grafana` | `grafana/grafana:11.5.2` | 3000 | Dashboard de visualización |

### Qué mide cada componente

| Fuente | Ejemplos de métricas |
|---|---|
| **node-exporter** (host) | `node_cpu_seconds_total`, `node_memory_MemAvailable_bytes`, `node_filesystem_avail_bytes`, `node_network_receive_bytes_total` |
| **cAdvisor** (contenedores) | `container_cpu_usage_seconds_total`, `container_memory_usage_bytes`, `container_fs_reads_bytes_total` |
| **backend** (JVM / app) | `jvm_memory_used_bytes`, `http_server_requests_seconds`, `hikaricp_connections_active`, `cache_gets_total` |

:::note Versiones fijadas
- **Loki 2.9.10**: Loki 3.x rompe la compatibilidad con `boltdb-shipper` + schema v11.
- **Promtail 3.0.0**: Promtail 2.9.x usa Docker client API 1.42 (hardcodeado en el SDK de Go); los servidores modernos requieren mínimo API 1.44. Solo Promtail 3.x es compatible.
- **Grafana 11.5.2**: Grafana 12 tiene un bug en el provisioning de datasources con UIDs fijos que causa crash loop al iniciar.
:::

## Redes

El stack de monitoreo usa dos redes externas que deben existir antes de desplegarlo:

| Red | Propósito |
|---|---|
| `sgi_internal` | Permite a Prometheus alcanzar el backend para raspar `/actuator/prometheus` |
| `proxy_network` | Expone Grafana a través de Nginx Proxy Manager con HTTPS |

Ambas redes se crean automáticamente al levantar el stack principal con `docker compose up`.

## Despliegue

### Prerrequisitos

1. El stack principal debe estar corriendo (`docker compose up -d`).
2. Las redes `sgi_internal` y `proxy_network` deben existir.
3. La imagen del backend debe incluir la dependencia `micrometer-registry-prometheus` y tener `/actuator/prometheus` en rutas permitidas.

### Levantar el stack de monitoreo

```bash
# Desde la raíz del repositorio
docker compose -f docker-compose.monitoring.yml up -d
```

Esto crea y arranca Prometheus, Loki, Promtail y Grafana.

### Verificar que todos los servicios están corriendo

```bash
docker compose -f docker-compose.monitoring.yml ps
```

Todos deben aparecer como `running` o `healthy`.

### Verificar que Prometheus puede raspar el backend

```bash
# Comprueba el endpoint de métricas del backend directamente
docker exec sgi-full-prometheus wget -qO- http://sgi-full-backend:8080/actuator/prometheus | head -20
```

Si devuelve líneas con métricas (`# HELP`, `# TYPE`), el scraping está funcionando.

También puedes abrir la UI de Prometheus en el servidor (si tienes acceso por túnel o red interna):
```
http://<servidor>:9090/targets
```

El target `sgi-backend` debe aparecer como **UP**.

### Actualizar el stack de monitoreo

```bash
git pull
docker compose -f docker-compose.monitoring.yml up -d
```

### Detener el stack de monitoreo

```bash
# Detiene sin eliminar datos
docker compose -f docker-compose.monitoring.yml down

# Detiene Y elimina todos los datos históricos (métricas, logs)
docker compose -f docker-compose.monitoring.yml down -v
```

## Acceder a Grafana

Grafana está disponible en:

```
https://sgi-grafana.escuelamilitar.edu.pe
```

Las credenciales por defecto son:

| Campo | Valor por defecto |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin` |

:::danger Cambia la contraseña por defecto
En el primer acceso, Grafana pedirá cambiar la contraseña. Usa una contraseña segura y guárdala en un gestor de contraseñas. Si necesitas restablecerla, usa las variables de entorno `GRAFANA_USER` y `GRAFANA_PASSWORD` en el archivo `.env`.
:::

## Dashboards precargados

Al arrancar, Grafana carga automáticamente **tres dashboards** desde `monitoring/grafana/provisioning/dashboards/`:

| Archivo | UID | Título | Fuente de datos |
|---|---|---|---|
| `sgi-backend.json` | `sgi-emch-backend-v1` | SGI-EMCH Backend | Prometheus + Loki |
| `node-exporter.json` | `sgi-node-exporter` | SGI-EMCH — Servidor (node-exporter) | Prometheus |
| `cadvisor.json` | `sgi-cadvisor` | SGI-EMCH — Contenedores (cAdvisor) | Prometheus |

### Dashboard: SGI-EMCH — Servidor (node-exporter)

Métricas del host Linux. Fila superior con 6 stats (CPU %, RAM usada, RAM disponible, disco /, uptime, load avg 1m); luego gráficas de series temporales para CPU, RAM, red I/O, disco I/O, load average y un bargauge con uso por partición.

### Dashboard: SGI-EMCH — Contenedores (cAdvisor)

Métricas por contenedor Docker. Variables de template `$host` y `$container` para filtrar. Paneles de CPU usage, memory RSS, memory cache, tráfico de red entrada/salida, y tabla de info de contenedores con uptime en días.

### Dashboard: SGI-EMCH Backend

Al arrancar, Grafana carga automáticamente el dashboard **"SGI-EMCH Backend"** (UID `sgi-emch-backend-v1`) con los siguientes paneles:

### Sección: JVM & Sistema

| Panel | Métrica |
|---|---|
| Heap usado (%) | `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100` |
| Threads activos | `jvm_threads_live_threads` |
| GC pausas/min | `rate(jvm_gc_pause_seconds_count[1m]) * 60` |
| GC tiempo total/min | `rate(jvm_gc_pause_seconds_sum[1m]) * 60` |

### Sección: HTTP — Tráfico y Errores

| Panel | Métrica |
|---|---|
| Requests por minuto | `sum(rate(http_server_requests_seconds_count[1m])) * 60` |
| Tasa de error (%) | `(errores) / (total) * 100` |

### Sección: Latencia HTTP

| Panel | Métrica |
|---|---|
| P50 latencia | `histogram_quantile(0.50, ...)` |
| P95 latencia | `histogram_quantile(0.95, ...)` |
| P99 latencia | `histogram_quantile(0.99, ...)` |

### Sección: Base de Datos (HikariCP)

| Panel | Métrica |
|---|---|
| Conexiones activas | `hikaricp_connections_active` |
| Conexiones pendientes | `hikaricp_connections_pending` |
| Tiempo de adquisición P99 | `histogram_quantile(0.99, hikaricp_connection_acquired_nanos_bucket) / 1e6` |

### Sección: Caché Caffeine

| Panel | Métrica |
|---|---|
| Hit rate por caché (%) | `rate(cache_gets_total{result="hit"}[5m]) / (hits + misses) * 100` |
| Misses por minuto | `rate(cache_gets_total{result="miss"}[1m]) * 60` |

### Sección: Logs en vivo

Panel de logs de Loki con filtro `{container="sgi-full-backend"}` — muestra los últimos registros del backend en tiempo real.

## Provisionamiento automático

Los datasources y el dashboard se configuran automáticamente al arrancar Grafana mediante archivos YAML en `monitoring/grafana/provisioning/`:

```
monitoring/
├── prometheus/
│   └── prometheus.yml          # Configuración de scraping (job sgi-backend)
├── loki/
│   └── loki-config.yaml        # Configuración de almacenamiento de logs
├── promtail/
│   └── promtail-config.yaml    # Recolección de logs de contenedores sgi-full-*
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── datasources.yaml    # Prometheus (UID: prometheus-sgi) y Loki (UID: loki-sgi)
        └── dashboards/
            ├── dashboards.yaml     # Proveedor de tipo "file" apuntando a esta carpeta
            ├── sgi-backend.json    # Dashboard: métricas JVM / HTTP / HikariCP / Caché
            ├── node-exporter.json  # Dashboard: métricas del host (CPU, RAM, disco, red)
            └── cadvisor.json       # Dashboard: métricas por contenedor Docker
```

Los UIDs de datasource fijos (`prometheus-sgi`, `loki-sgi`) son referenciados directamente en el JSON del dashboard, eliminando la necesidad de variables de template.

## Diagnóstico de problemas

### Grafana muestra "No data" en los paneles

1. Verifica que el target en Prometheus esté **UP**:
   ```bash
   docker exec sgi-full-prometheus wget -qO- http://localhost:9090/api/v1/targets | grep health
   ```
2. Asegúrate de que haya transcurrido al menos 1 minuto desde el inicio del backend para que Prometheus tenga datos suficientes.
3. Ajusta el rango de tiempo en Grafana al momento en que el backend inició.

### Promtail no recolecta logs

Verifica los logs de Promtail:
```bash
docker logs sgi-full-promtail --tail 50
```
Debe aparecer `msg="added Docker target"` para cada contenedor `sgi-full-*`.

### Backend devuelve 401 en `/actuator/prometheus`

El endpoint debe estar en la lista de rutas públicas de `SecurityConfig.java`. Verifica:
```bash
docker exec sgi-full-prometheus wget -qS http://sgi-full-backend:8080/actuator/prometheus 2>&1 | grep HTTP
```
Debe mostrar `HTTP/1.1 200`. Si muestra `401`, reconstruye el backend:
```bash
docker compose build backend && docker compose up -d backend
```

### node-exporter no aparece como UP en Prometheus

```bash
# Verifica que el contenedor esté corriendo
docker compose -f docker-compose.monitoring.yml ps node-exporter

# Comprueba que expone métricas
docker exec sgi-full-prometheus wget -qO- http://sgi-full-node-exporter:9100/metrics | head -5
```

Si el contenedor no arranca, verifica que el servidor Linux expone `/proc` y `/sys` (siempre es el caso en Linux nativo; puede fallar en WSL2 sin configuración adicional).

### cAdvisor no reporta métricas de contenedores

```bash
# Verifica que el contenedor esté corriendo
docker compose -f docker-compose.monitoring.yml ps cadvisor

# Comprueba el endpoint de métricas
docker exec sgi-full-prometheus wget -qO- http://sgi-full-cadvisor:8080/metrics | grep container_memory | head -5
```

Si ves errores de permisos en los logs de cAdvisor:
```bash
docker logs sgi-full-cadvisor --tail 20
```
En algunos kernels de Linux es necesario que `/dev/kmsg` exista en el host. Verifica con `ls /dev/kmsg`. Si no existe, elimina la línea `devices: [/dev/kmsg]` del compose y redesplega.

### Grafana no arranca (crash loop)

Si los logs muestran `Datasource provisioning error: data source not found`, el volumen `grafana_data` tiene estado inconsistente. Reinicializa:
```bash
docker compose -f docker-compose.monitoring.yml stop grafana
docker rm sgi-full-grafana
docker volume rm sgi-emch_grafana_data
docker compose -f docker-compose.monitoring.yml up -d grafana
```
