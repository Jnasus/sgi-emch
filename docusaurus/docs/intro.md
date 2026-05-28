---
id: intro
title: Introducción
sidebar_position: 1
slug: /
---

# Sistema de Gestión de Inventario — EMCH CFB

El **SGI** es la plataforma web oficial del **Departamento de Tecnologías de la Información (DTIC)** de la Escuela Militar de Chorrillos Francisco Bolognesi. Centraliza el control del inventario de equipos informáticos institucionales y la gestión de incidencias técnicas.

## Propósito

El sistema resuelve tres necesidades críticas del DTIC:

1. **Control de inventario** — Registro completo del ciclo de vida de los equipos: código de ejército, tipo, marca, modelo, sistema operativo, área responsable, ubicación y estado operativo.
2. **Gestión de incidentes** — Tickets de soporte con SLAs configurables por tipo de incidente, asignación a técnicos y trazabilidad completa del historial de cambios.
3. **Notificaciones automatizadas** — Alertas en tiempo real cuando se asigna un ticket, cuando un SLA vence, o cuando el stock de algún tipo de equipo cae por debajo del umbral crítico.

## Módulos

| Módulo | Descripción |
|---|---|
| **Dashboard** | Resumen ejecutivo: stock operativo por tipo, tickets abiertos, equipos en estado crítico y métricas SLA |
| **Inventario** | CRUD de equipos, especificaciones técnicas, historial de estados y carga masiva por Excel |
| **Incidentes** | Tickets con ciclo `ABIERTO → EN_PROCESO → RESUELTO → CERRADO`, SLA en tiempo real e historial de cambios |
| **Reportes** | Exportación a Excel (.xlsx) y PDF filtrable por estado y área; reporte de equipos con más de N años |
| **Notificaciones** | Centro de alertas personales: tickets asignados, SLAs vencidos, stock crítico |
| **Usuarios** | Gestión de cuentas con roles ADMINISTRADOR, TECNICO y SUPERVISOR |
| **Configuración** | Tablas maestras: áreas, tipos de equipo, marcas, modelos, sistemas operativos, SLAs y umbrales de stock |

## Roles

| Rol | Capacidades |
|---|---|
| **ADMINISTRADOR** | Acceso total: usuarios, catálogos, configuración de SLAs, umbrales de stock y reportes |
| **TECNICO** | Crear y actualizar tickets e inventario, ver notificaciones propias |
| **SUPERVISOR** | Consulta y supervisión general; sin permisos de escritura en catálogos ni usuarios |

## Tecnología

- **Backend**: Spring Boot 3 · Java 21 · MySQL 8 · JWT
- **Frontend**: React 18 · TypeScript · Vite · shadcn/ui
- **Infraestructura**: Docker · Nginx Proxy Manager
