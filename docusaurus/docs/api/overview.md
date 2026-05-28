---
id: overview
title: Visión general de la API
sidebar_position: 1
---

# API REST — Visión general

El backend expone una API REST completa documentada con **Swagger UI** (springdoc-openapi v2).

## Acceso a Swagger UI

| Entorno | URL |
|---|---|
| **Local (desarrollo directo)** | `http://localhost:8080/swagger-ui.html` |
| **Docker (backend expuesto temporalmente)** | `http://localhost:8080/swagger-ui.html` tras agregar `ports: ["8080:8080"]` al servicio `backend` |
| **Producción** | Requiere configurar un Proxy Host en NPM apuntando a `sgi-full-backend:8080` |

La definición OpenAPI en formato JSON está disponible en `/api-docs`.

## Autenticación

Todas las rutas (excepto las públicas) requieren un **JWT Bearer token**.

### Rutas públicas (sin token)

```
POST /api/auth/login
POST /api/auth/refresh
GET  /swagger-ui/**
GET  /api-docs/**
GET  /actuator/health
```

### Obtener un token

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

**Respuesta:**

```json
{
  "status": "OK",
  "message": "Login exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600000,
    "idUsuario": 1,
    "username": "admin",
    "rol": "ADMINISTRADOR",
    "idArea": 1
  }
}
```

### Usar el token

Incluye el header `Authorization` en todas las requests protegidas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Renovar el token (refresh)

El access token expira en **1 hora**. Usa el refresh token (válido 24 horas) para obtener uno nuevo:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

## Formato de respuesta estándar

Todas las respuestas siguen la estructura:

```json
{
  "status": "OK",
  "message": "Mensaje descriptivo",
  "data": { ... }
}
```

### Respuestas paginadas

Los endpoints de listado devuelven:

```json
{
  "status": "OK",
  "message": "OK",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 85,
    "totalPages": 5
  }
}
```

## Códigos de respuesta HTTP

| Código | Significado |
|---|---|
| `200 OK` | Operación exitosa |
| `201 Created` | Recurso creado correctamente |
| `400 Bad Request` | Error de validación en el request |
| `401 Unauthorized` | Token ausente, inválido o expirado |
| `403 Forbidden` | Token válido pero sin permisos para la operación |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Recurso duplicado (DNI, username, código de ejército) |
| `500 Internal Server Error` | Error inesperado en el servidor |

## Paginación y ordenamiento

Los endpoints paginados aceptan los parámetros estándar de Spring:

```
GET /api/equipos?page=0&size=20&sort=codigoEjercito,asc
```

| Parámetro | Default | Descripción |
|---|---|---|
| `page` | `0` | Número de página (base 0) |
| `size` | `20` | Registros por página |
| `sort` | varía por endpoint | Campo y dirección de ordenamiento |
