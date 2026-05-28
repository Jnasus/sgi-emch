---
id: configuracion
title: Configuración
sidebar_position: 7
---

# Configuración (Catálogos)

El módulo de Configuración gestiona las tablas maestras del sistema. Solo disponible para **ADMINISTRADOR**.

## Áreas

Las áreas representan las dependencias o departamentos de la institución. Cada equipo y usuario pertenece a un área.

**Campos**: Código de área, nombre, descripción, año de vigencia, estado (activo/inactivo).

**Operaciones**: Crear, editar. No se eliminan áreas para preservar la integridad de los datos históricos.

El sistema inicia con el área `DTIC` (Departamento de Tecnologías de la Información) creada automáticamente.

## Tipos de equipo

Clasifican los equipos por categoría (Laptop, Desktop, Servidor, Impresora, Switch, etc.). Cada tipo tiene un umbral de stock crítico configurable.

**Campos**: Nombre del tipo, descripción.

## Marcas

Fabricantes de los equipos (HP, Dell, Lenovo, Brother, etc.).

**Campos**: Nombre de la marca.

## Modelos

Modelos específicos vinculados a una marca (Dell Latitude 5520, HP EliteBook 840, etc.).

**Campos**: Nombre del modelo, marca asociada.

## Sistemas operativos

SOs instalados en los equipos (Windows 10, Windows 11, Ubuntu 22.04, etc.).

**Campos**: Nombre del sistema operativo.

## Configuración de SLA por tipo de incidente

Permite ajustar los tiempos de respuesta y resolución para cada tipo de incidente. El sistema inicializa con los siguientes valores:

| Tipo de incidente | Tiempo respuesta | Tiempo resolución |
|---|---|---|
| Falla de Hardware | 30 min | 8 h (480 min) |
| Falla de Software | 20 min | 4 h (240 min) |
| Problema de Red | 15 min | 2 h (120 min) |
| Falla de Impresora | 60 min | 8 h (480 min) |
| Mantenimiento Preventivo | 120 min | 16 h (960 min) |
| Incidente de Seguridad | 10 min | 3 h (180 min) |

## Configuración de stock crítico por tipo de equipo

Define el umbral mínimo de porcentaje operativo para cada tipo de equipo. Si el porcentaje de equipos operativos cae por debajo del umbral, el sistema genera alertas de **STOCK_CRITICO**.

**Ejemplo**: Si hay 10 Laptops y el umbral es 80%, el sistema alertará cuando haya menos de 8 laptops operativas.

:::tip
Accede a esta configuración desde el menú **Configuración → Tipos de equipo** y ajusta el umbral según las necesidades operativas del DTIC.
:::
