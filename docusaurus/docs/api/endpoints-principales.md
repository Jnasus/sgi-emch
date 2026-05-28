---
id: endpoints-principales
title: Endpoints principales
sidebar_position: 2
---

# Endpoints principales por módulo

## Autenticación — `/api/auth`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión, obtiene access + refresh token | ❌ |
| `POST` | `/api/auth/refresh` | Renovar access token con refresh token | ❌ |
| `POST` | `/api/auth/logout` | Cerrar sesión (invalida sesión en cliente) | ✅ |

---

## Equipos — `/api/equipos`

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/api/equipos` | Listar equipos paginado (`?estado=&idArea=&idTipo=`) | Todos |
| `GET` | `/api/equipos/{id}` | Obtener equipo con especificaciones técnicas | Todos |
| `POST` | `/api/equipos` | Registrar nuevo equipo | ADMIN, TECNICO |
| `PUT` | `/api/equipos/{id}` | Actualizar datos del equipo | ADMIN, TECNICO |
| `PATCH` | `/api/equipos/{id}/estado` | Cambiar estado y registrar en historial | ADMIN, TECNICO |
| `PUT` | `/api/equipos/{id}/especificaciones` | Crear o actualizar especificaciones técnicas | ADMIN, TECNICO |
| `GET` | `/api/equipos/{id}/historial` | Listar historial de estados del equipo | Todos |

### Carga masiva — `/api/equipos/carga-masiva`

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/api/equipos/carga-masiva/plantilla` | Descargar plantilla Excel con catálogos | Todos |
| `POST` | `/api/equipos/carga-masiva/validar` | Validar archivo Excel antes de importar | ADMIN, TECNICO |
| `POST` | `/api/equipos/carga-masiva/confirmar` | Confirmar importación masiva | ADMIN, TECNICO |

---

## Tickets — `/api/tickets`

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/api/tickets` | Listar tickets paginado (`?estado=&prioridad=&idEquipo=&idTecnico=`) | Todos |
| `GET` | `/api/tickets/{id}` | Obtener ticket por ID | Todos |
| `POST` | `/api/tickets` | Crear ticket | ADMIN, TECNICO |
| `PATCH` | `/api/tickets/{id}/estado` | Cambiar estado del ticket | ADMIN, TECNICO |
| `GET` | `/api/tickets/{id}/historial` | Listar historial de cambios de estado | Todos |

---

## Reportes — `/api/reportes`

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/api/reportes/inventario/excel` | Exportar inventario a Excel (`?estado=&idArea=`) | ADMIN |
| `GET` | `/api/reportes/inventario/pdf` | Exportar inventario a PDF (`?estado=&idArea=`) | ADMIN |
| `POST` | `/api/reportes/seleccion/excel` | Exportar selección de equipos a Excel (`{"ids":[1,2,3]}`) | ADMIN |
| `POST` | `/api/reportes/seleccion/pdf` | Exportar selección de equipos a PDF | ADMIN |
| `GET` | `/api/reportes/equipos-antiguos/excel` | Equipos con más de N años en Excel (`?anios=5`) | ADMIN |
| `GET` | `/api/reportes/equipos-antiguos/pdf` | Equipos con más de N años en PDF | ADMIN |

---

## Notificaciones — `/api/notificaciones`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/notificaciones` | Listar notificaciones del usuario autenticado (`?leida=`) | ✅ |
| `PATCH` | `/api/notificaciones/{id}/leer` | Marcar notificación como leída | ✅ |
| `PATCH` | `/api/notificaciones/leer-todas` | Marcar todas como leídas | ✅ |
| `DELETE` | `/api/notificaciones/{id}` | Eliminar notificación | ✅ |

---

## Usuarios — `/api/usuarios`

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/api/usuarios` | Listar usuarios paginado (`?activo=&idRol=`) | ADMIN |
| `GET` | `/api/usuarios/{id}` | Obtener usuario por ID | ADMIN |
| `GET` | `/api/usuarios/roles` | Listar roles disponibles | ADMIN |
| `GET` | `/api/usuarios/tecnicos` | Listar técnicos de campo activos | ADMIN, TECNICO |
| `GET` | `/api/usuarios/activos?ventanaMin=30` | Usuarios con actividad reciente | ADMIN |
| `POST` | `/api/usuarios` | Crear usuario | ADMIN |
| `PUT` | `/api/usuarios/{id}` | Actualizar datos del usuario | ADMIN |
| `PATCH` | `/api/usuarios/{id}/estado` | Activar o desactivar usuario | ADMIN |
| `PUT` | `/api/usuarios/{id}/password` | Resetear contraseña | ADMIN |

---

## Catálogos — `/api/catalogos`

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/api/catalogos/areas` | Listar áreas activas | Todos |
| `GET` | `/api/catalogos/areas/todas` | Listar todas las áreas (incluye inactivas) | Todos |
| `POST` | `/api/catalogos/areas` | Crear área | ADMIN |
| `PUT` | `/api/catalogos/areas/{idArea}` | Actualizar área | ADMIN |
| `GET` | `/api/catalogos/tipos-equipo` | Listar tipos de equipo | Todos |
| `POST` | `/api/catalogos/tipos-equipo` | Crear tipo de equipo | ADMIN |
| `PUT` | `/api/catalogos/tipos-equipo/{idTipo}` | Actualizar tipo de equipo | ADMIN |
| `GET` | `/api/catalogos/marcas` | Listar marcas | Todos |
| `POST` | `/api/catalogos/marcas` | Crear marca | ADMIN |
| `PUT` | `/api/catalogos/marcas/{idMarca}` | Actualizar marca | ADMIN |
| `GET` | `/api/catalogos/modelos` | Listar modelos (`?marcaId=`) | Todos |
| `POST` | `/api/catalogos/modelos` | Crear modelo | ADMIN |
| `PUT` | `/api/catalogos/modelos/{idModelo}` | Actualizar modelo | ADMIN |
| `GET` | `/api/catalogos/sistemas-operativos` | Listar sistemas operativos | Todos |
| `POST` | `/api/catalogos/sistemas-operativos` | Crear sistema operativo | ADMIN |
| `PUT` | `/api/catalogos/sistemas-operativos/{idSo}` | Actualizar sistema operativo | ADMIN |
| `GET` | `/api/catalogos/tipos-incidente` | Listar tipos de incidente con SLAs | Todos |
| `PUT` | `/api/catalogos/sla/{idTipo}` | Configurar tiempos SLA | ADMIN |
| `PUT` | `/api/catalogos/stock/{idTipo}` | Configurar umbral de stock crítico | ADMIN |

---

## Dashboard — `/api/dashboard`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/dashboard/resumen` | Resumen general del inventario y tickets | ✅ |
