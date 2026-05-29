---
id: cache
title: Caché en memoria (Caffeine)
sidebar_position: 5
---

# Caché en memoria con Caffeine

El backend implementa caché en memoria usando **Caffeine**, un motor de caché de alto rendimiento para Java. Esto reduce la carga sobre la base de datos para datos de catálogo que cambian con poca frecuencia.

## ¿Qué se cachea?

La caché se aplica sobre los datos de catálogo del `CatalogoService`. Estos datos se leen frecuentemente (en formularios de creación/edición de equipos e incidentes) pero rara vez cambian.

| Nombre de caché | Datos almacenados | Se invalida cuando |
|---|---|---|
| `areas` | Lista de áreas del sistema | Se crea, edita o elimina un área |
| `tipos-equipo` | Tipos de equipos disponibles | Se crea, edita o elimina un tipo |
| `marcas` | Marcas registradas | Se crea, edita o elimina una marca |
| `modelos` | Modelos de equipos | Se crea, edita o elimina un modelo |
| `sistemas-operativos` | Sistemas operativos disponibles | Se crea, edita o elimina un SO |
| `tipos-incidente` | Tipos de incidentes | Se crea, edita o elimina un tipo |

## Configuración

La caché está configurada en `application.properties`:

```properties
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=3600s
```

| Parámetro | Valor | Descripción |
|---|---|---|
| `maximumSize` | 1 000 entradas | Límite máximo de entradas por caché |
| `expireAfterWrite` | 3 600 s (1 hora) | TTL: las entradas expiran 1 hora después de ser escritas |

## Cómo funciona

### Lectura con `@Cacheable`

```java
@Cacheable("areas")
public List<Area> listarAreas() {
    return areaRepository.findAll();   // Solo se ejecuta si la caché está vacía
}
```

La primera llamada consulta la BD y almacena el resultado en caché. Las llamadas siguientes devuelven el valor cacheado sin tocar la BD, hasta que el TTL expire o la caché sea invalidada.

### Invalidación con `@CacheEvict`

```java
@CacheEvict(value = "areas", allEntries = true)
public Area crearArea(AreaRequest request) {
    return areaRepository.save(...);
}
```

Cada vez que se crea, actualiza o elimina una entrada en catálogo, la caché correspondiente se vacía completamente. La siguiente lectura vuelve a la BD y recarga los datos frescos.

## Monitoreo de la caché

Si el stack de monitoreo está activo, Grafana muestra el **hit rate** y los **misses por minuto** de cada caché en el panel "Caché Caffeine" del dashboard SGI-EMCH Backend.

Las métricas expuestas por el backend son:

```
cache_gets_total{cache="areas", result="hit"}
cache_gets_total{cache="areas", result="miss"}
cache_puts_total{cache="areas"}
cache_evictions_total{cache="areas"}
```

Un hit rate cercano al 100% indica que el catálogo se lee con frecuencia y los datos cambian poco — comportamiento esperado. Un hit rate bajo puede indicar que el TTL es demasiado corto o que los datos cambian con más frecuencia de lo normal.

## Consideraciones de despliegue

- La caché es **en memoria y local**: vive dentro del proceso de Spring Boot. Si el contenedor del backend se reinicia, la caché se vacía y las primeras lecturas irán a la BD hasta rellenarse.
- En entornos con **múltiples instancias del backend**, cada instancia tiene su propia caché independiente. Esto es aceptable para datos de catálogo con TTL de 1 hora (la inconsistencia máxima entre instancias es de 1 hora en el peor caso).
- No se requiere infraestructura adicional (sin Redis, sin Memcached). Caffeine es una dependencia Java que se incluye en el JAR.
