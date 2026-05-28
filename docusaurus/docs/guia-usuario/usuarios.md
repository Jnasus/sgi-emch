---
id: usuarios
title: Usuarios
sidebar_position: 6
---

# Gestión de Usuarios

El módulo de Usuarios permite al ADMINISTRADOR gestionar las cuentas de acceso al sistema. Solo accesible para el rol **ADMINISTRADOR**.

## Listado de usuarios

Muestra todos los usuarios del sistema con paginación. Se puede buscar por nombre, username o área. Columnas:

- Nombre completo
- Username
- DNI
- Rol (con badge de color)
- Área
- Estado (Activo / Inactivo)
- Último acceso

### Panel "En línea ahora"

En la parte superior del módulo, el administrador ve un panel que muestra los usuarios que han tenido actividad en los últimos **30 minutos**. Cada usuario aparece como un chip verde con su username y cargo. El dato se actualiza en cada request autenticado del usuario.

## Crear usuario

Botón **Nuevo Usuario**. Campos requeridos:

| Campo | Descripción |
|---|---|
| Nombres | Nombre(s) del usuario |
| Apellidos | Apellido(s) del usuario |
| DNI | 8 dígitos, único en el sistema |
| Username | Identificador de acceso, único |
| Email | Correo institucional (opcional) |
| Contraseña | Mínimo 6 caracteres |
| Rol | ADMINISTRADOR / TECNICO / SUPERVISOR |
| Área | Dependencia institucional |

## Editar usuario

Desde el ícono de lápiz en la tabla. Permite modificar todos los datos excepto la contraseña (que tiene su propio formulario).

## Resetear contraseña

Desde el ícono de llave en la tabla. Permite asignar una nueva contraseña al usuario sin necesidad de conocer la anterior.

## Activar / Desactivar usuario

El botón de toggle en la tabla cambia el estado del usuario. Un usuario inactivo no puede iniciar sesión aunque sus credenciales sean correctas.

## Roles y permisos

| Rol | Inventario | Tickets | Reportes | Usuarios | Catálogos |
|---|---|---|---|---|---|
| **ADMINISTRADOR** | Leer/Escribir | Leer/Escribir | ✅ | ✅ | ✅ |
| **TECNICO** | Leer/Escribir | Leer/Escribir | ❌ | ❌ | Solo lectura |
| **SUPERVISOR** | Solo lectura | Solo lectura | ❌ | ❌ | Solo lectura |

## Usuario inicial

Al inicializar el sistema por primera vez, se crea automáticamente el siguiente usuario administrador:

- **Username**: `admin`
- **Contraseña**: `Admin123!`
- **Área**: DTIC

:::warning
Cambia la contraseña del usuario `admin` inmediatamente después del primer acceso en producción.
:::
