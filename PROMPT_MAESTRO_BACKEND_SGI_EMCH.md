# PROMPT MAESTRO — Backend SGI EMCH "CFB"
# Sistema Web de Gestión de Inventario de Equipos Informáticos
# Grupo 03 | DTIC — Escuela Militar de Chorrillos "Coronel Francisco Bolognesi"

---

## ROL Y CONTEXTO

Eres un desarrollador backend Java senior especializado en Spring Boot y arquitecturas REST.
Vas a construir el backend completo del **Sistema Web de Gestión de Inventario de Equipos
Informáticos (SGI)** para el Departamento DTIC de la EMCH "CFB".

Este sistema reemplaza la gestión manual en Excel por una plataforma web interna con 5 módulos:
Usuarios y Seguridad, Inventario de Activos TI, Mesa de Ayuda / Incidentes, Reportes y Dashboard,
y Notificaciones Automáticas.

---

## STACK TECNOLÓGICO — NO NEGOCIABLE

| Componente        | Tecnología                                      |
|-------------------|-------------------------------------------------|
| Lenguaje          | Java 21 (LTS)                                   |
| Framework         | Spring Boot 3.5.x                               |
| Build tool        | Maven                                           |
| Base de datos      | MySQL 8.x — esquema `db_sgi_emch` YA EXISTENTE  |
| ORM               | Hibernate / JPA                                 |
| Seguridad         | Spring Security + JWT (jjwt)                    |
| Documentación API | SpringDoc OpenAPI 3 (Swagger UI)                |
| Exportación Excel | Apache POI                                      |
| Generación PDF    | OpenPDF (fork de iText 2)                       |
| Email             | Spring Mail (JavaMail API)                      |
| Utilidades        | Lombok                                          |

---

## RESTRICCIONES CRÍTICAS

1. **NUNCA usar** `spring.jpa.hibernate.ddl-auto=create` ni `update`.
   Usar siempre `validate` en desarrollo y `none` en producción.
   La base de datos `db_sgi_emch` ya existe con toda su estructura.

2. **La BD tiene lógica propia que el backend DEBE respetar y NO duplicar:**
   - **Triggers:** audit automático en `equipo` y `usuario_sistema`, historial de estados
     de equipo (`trg_equipo_estado_update`), SLA check al resolver ticket
     (`trg_ticket_sla_check`), fecha de baja automática (`trg_equipo_baja`),
     historial de ticket (`trg_ticket_historial`), creación automática de
     `especificacion_tecnica` al insertar equipo (`trg_equipo_after_insert`).
   - **Stored Procedures:** llamar a `sp_generar_numero_ticket` para obtener el
     número de ticket en formato `TKT-YYYYMM-NNNN`. Llamar a
     `sp_verificar_stock_critico(id_tipo)` tras toda operación que cambie el
     estado de un equipo.
   - **Vistas:** usar `v_inventario_completo`, `v_dashboard_resumen`,
     `v_stock_critico` y `v_tickets_activos` para consultas de reportes y
     dashboard. Mapearlas como entidades `@Immutable` + `@Subselect` o como
     `@Entity` apuntando a la vista.

3. **Los triggers de audit usan variables de sesión MySQL.** Al inicio de cada
   request autenticado, el backend DEBE ejecutar:
   ```sql
   SET @id_usuario_activo = :idUsuario;
   SET @ip_cliente = :ipCliente;
   ```
   Implementar esto como un `HandlerInterceptor` de Spring MVC que se ejecute
   antes de cada controlador.

4. **Contraseñas con BCrypt** — factor de coste mínimo 10. Nunca en texto plano.

5. **JWT** — los tokens deben incluir en el payload: `id_usuario`, `username`,
   `rol` y `id_area`. Expiración configurable via `application.properties`.
   Implementar refresh token.

6. **RBAC estricto** — aplicar `@PreAuthorize` tanto en los controladores como
   en la capa de servicio. Los 5 roles son:
   `ADMINISTRADOR`, `JEFE_DTIC`, `SUBJEFE_DTIC`, `TECNICO_CAMPO`, `DIRECTIVO`.

7. **Audit Trail inviolable** — ningún endpoint debe permitir modificar o
   eliminar registros de `audit_log`. Solo GET.

8. **Transiciones de estado de equipo** — validar en el service que solo se
   permiten estas transiciones:
   - `EN_BODEGA` → `ASIGNADO`, `PRESTADO`, `EN_REPARACION`
   - `ASIGNADO` → `EN_REPARACION`, `PRESTADO`, `DADO_DE_BAJA`
   - `EN_REPARACION` → `EN_BODEGA`, `ASIGNADO`, `DADO_DE_BAJA`
   - `PRESTADO` → `ASIGNADO`, `EN_BODEGA`, `DADO_DE_BAJA`
   - Cualquier estado → `DADO_DE_BAJA` (requiere campo `motivo` obligatorio)

9. **SLAs por tipo de incidente** — tiempos almacenados en `tipo_incidente`
   (`tiempo_respuesta_min`, `tiempo_resolucion_min`). El backend NO hardcodea
   estos valores; los lee de BD.

10. **Número de ticket** — siempre generado via stored procedure
    `sp_generar_numero_ticket`. Nunca generado en Java.

---

## ESTRUCTURA DE PAQUETES — SEGUIR EXACTAMENTE

```
src/main/java/pe/edu/emch/sgi/
├── SgiEmchApplication.java
│
├── config/
│   ├── SecurityConfig.java          # Spring Security + JWT filter chain
│   ├── SwaggerConfig.java           # OpenAPI 3 con autenticación Bearer
│   ├── JwtConfig.java               # Propiedades JWT desde application.properties
│   └── AuditInterceptorConfig.java  # Registro del HandlerInterceptor de sesión
│
├── security/
│   ├── JwtUtil.java                 # Generación, validación y parsing de tokens
│   ├── JwtAuthFilter.java           # OncePerRequestFilter para validar JWT
│   ├── UserDetailsServiceImpl.java  # Carga usuario desde BD por username
│   └── AuditSessionInterceptor.java # SET @id_usuario_activo y @ip_cliente
│
├── controller/
│   ├── AuthController.java          # POST /api/auth/login, /refresh, /logout
│   ├── UsuarioController.java       # CRUD usuarios (solo ADMINISTRADOR crea)
│   ├── EquipoController.java        # CRUD equipos + cambio de estado + carga masiva
│   ├── TicketController.java        # CRUD tickets + cambio de estado + cierre PDF
│   ├── ReporteController.java       # Exportación Excel/PDF
│   ├── DashboardController.java     # Consulta de vistas para dashboard
│   ├── NotificacionController.java  # Listar y marcar como leídas
│   ├── AuditLogController.java      # Solo GET, solo ADMINISTRADOR y JEFE_DTIC
│   └── CatalogoController.java      # Areas, tipos, marcas, modelos, SO (parametrizables)
│
├── service/
│   ├── AuthService.java
│   ├── UsuarioService.java
│   ├── EquipoService.java           # Incluye llamada a sp_verificar_stock_critico
│   ├── TicketService.java           # Incluye llamada a sp_generar_numero_ticket
│   ├── PdfService.java              # Generación de acta PDF con OpenPDF
│   ├── ExcelService.java            # Exportación y carga masiva con Apache POI
│   ├── NotificacionService.java
│   ├── EmailService.java            # Envío SMTP vía Spring Mail
│   └── DashboardService.java
│
├── repository/
│   ├── UsuarioRepository.java
│   ├── RolRepository.java
│   ├── AreaRepository.java
│   ├── EquipoRepository.java
│   ├── EspecificacionTecnicaRepository.java
│   ├── HistorialEstadoRepository.java
│   ├── TipoEquipoRepository.java
│   ├── MarcaRepository.java
│   ├── ModeloEquipoRepository.java
│   ├── SistemaOperativoRepository.java
│   ├── ConfigStockRepository.java
│   ├── TicketRepository.java
│   ├── HistorialTicketRepository.java
│   ├── TipoIncidenteRepository.java
│   ├── NotificacionRepository.java
│   ├── AuditLogRepository.java
│   └── view/                        # Repositorios para las vistas (solo lectura)
│       ├── VInventarioCompletoRepository.java
│       ├── VDashboardResumenRepository.java
│       ├── VStockCriticoRepository.java
│       └── VTicketsActivosRepository.java
│
├── entity/
│   ├── Usuario.java                 # Tabla: usuario_sistema
│   ├── Rol.java
│   ├── Area.java
│   ├── Equipo.java
│   ├── EspecificacionTecnica.java
│   ├── HistorialEstado.java
│   ├── TipoEquipo.java
│   ├── Marca.java
│   ├── ModeloEquipo.java
│   ├── SistemaOperativo.java
│   ├── ConfigStock.java
│   ├── Ticket.java
│   ├── HistorialTicket.java
│   ├── TipoIncidente.java
│   ├── Notificacion.java
│   ├── AuditLog.java
│   └── view/                        # Entidades @Immutable para las vistas
│       ├── VInventarioCompleto.java
│       ├── VDashboardResumen.java
│       ├── VStockCritico.java
│       └── VTicketsActivos.java
│
├── dto/
│   ├── auth/
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java       # Incluye accessToken y refreshToken
│   │   └── RefreshTokenRequest.java
│   ├── usuario/
│   │   ├── UsuarioCreateRequest.java
│   │   ├── UsuarioUpdateRequest.java
│   │   └── UsuarioResponse.java
│   ├── equipo/
│   │   ├── EquipoCreateRequest.java
│   │   ├── EquipoUpdateRequest.java
│   │   ├── EquipoCambioEstadoRequest.java  # Incluye campo motivo
│   │   └── EquipoResponse.java
│   ├── ticket/
│   │   ├── TicketCreateRequest.java
│   │   ├── TicketUpdateRequest.java
│   │   ├── TicketCambioEstadoRequest.java
│   │   └── TicketResponse.java
│   ├── notificacion/
│   │   └── NotificacionResponse.java
│   └── common/
│       ├── PagedResponse.java       # Wrapper genérico para respuestas paginadas
│       └── ApiResponse.java         # Wrapper estándar: { success, message, data }
│
└── exception/
    ├── GlobalExceptionHandler.java  # @RestControllerAdvice
    ├── ResourceNotFoundException.java
    ├── BusinessRuleException.java   # Para violaciones de reglas de negocio (ej: transición inválida)
    ├── DuplicateResourceException.java
    └── UnauthorizedException.java
```

---

## ENDPOINTS REST — REFERENCIA COMPLETA

### Autenticación — `/api/auth`
| Método | Endpoint        | Roles          | Descripción                    |
|--------|-----------------|----------------|--------------------------------|
| POST   | `/login`        | Público        | Login, retorna JWT             |
| POST   | `/refresh`      | Público        | Renueva access token           |
| POST   | `/logout`       | Autenticado    | Invalida sesión                |

### Usuarios — `/api/usuarios`
| Método | Endpoint        | Roles permitidos              | Descripción                         |
|--------|-----------------|-------------------------------|-------------------------------------|
| GET    | `/`             | ADMINISTRADOR                 | Listar todos (paginado)             |
| POST   | `/`             | ADMINISTRADOR                 | Crear usuario (único que puede)     |
| GET    | `/{id}`         | ADMINISTRADOR                 | Obtener por ID                      |
| PUT    | `/{id}`         | ADMINISTRADOR                 | Editar usuario                      |
| PATCH  | `/{id}/baja`    | ADMINISTRADOR                 | Baja lógica                         |

### Equipos — `/api/equipos`
| Método | Endpoint                    | Roles permitidos                              | Descripción                        |
|--------|-----------------------------|-----------------------------------------------|------------------------------------|
| GET    | `/`                         | Todos menos DIRECTIVO                         | Listar (paginado, filtrable)        |
| POST   | `/`                         | TECNICO_CAMPO, SUBJEFE_DTIC, ADMINISTRADOR    | Registrar equipo                   |
| GET    | `/{id}`                     | Todos menos DIRECTIVO                         | Detalle con especificación técnica |
| PUT    | `/{id}`                     | TECNICO_CAMPO, SUBJEFE_DTIC, ADMINISTRADOR    | Editar equipo                      |
| PATCH  | `/{id}/estado`              | TECNICO_CAMPO, JEFE_DTIC, ADMINISTRADOR       | Cambiar estado (con validación)    |
| POST   | `/carga-masiva`             | ADMINISTRADOR                                 | Upload CSV/XLSX                    |
| GET    | `/{id}/historial`           | Todos menos DIRECTIVO                         | Historial de estados               |

### Tickets — `/api/tickets`
| Método | Endpoint                    | Roles permitidos                              | Descripción                        |
|--------|-----------------------------|-----------------------------------------------|------------------------------------|
| GET    | `/`                         | Todos menos DIRECTIVO                         | Listar (paginado, filtrable)        |
| POST   | `/`                         | TECNICO_CAMPO, ADMINISTRADOR                  | Abrir ticket (llama SP número)     |
| GET    | `/{id}`                     | Todos menos DIRECTIVO                         | Detalle del ticket                 |
| PATCH  | `/{id}/estado`              | TECNICO_CAMPO, SUBJEFE_DTIC, ADMINISTRADOR    | Cambiar estado                     |
| POST   | `/{id}/cerrar`              | TECNICO_CAMPO, SUBJEFE_DTIC                   | Cierra y genera acta PDF           |
| GET    | `/{id}/acta`                | Autenticado                                   | Descarga el acta PDF               |
| GET    | `/{id}/historial`           | Todos menos DIRECTIVO                         | Historial de cambios               |

### Dashboard — `/api/dashboard`
| Método | Endpoint           | Roles permitidos                              | Descripción                             |
|--------|--------------------|-----------------------------------------------|-----------------------------------------|
| GET    | `/resumen`         | Todos                                         | KPIs generales (usa v_dashboard_resumen)|
| GET    | `/stock-critico`   | ADMINISTRADOR, JEFE_DTIC                      | Tipos en alerta (usa v_stock_critico)   |
| GET    | `/tickets-activos` | Todos menos DIRECTIVO                         | Tickets abiertos/en proceso con SLA     |
| GET    | `/inventario`      | Todos menos DIRECTIVO                         | Vista completa (usa v_inventario_completo)|

### Reportes — `/api/reportes`
| Método | Endpoint                         | Roles permitidos                    | Descripción                    |
|--------|----------------------------------|-------------------------------------|--------------------------------|
| GET    | `/inventario/excel`              | JEFE_DTIC, SUBJEFE_DTIC, ADMINISTRADOR | Exportar inventario a XLSX  |
| GET    | `/inventario/pdf`                | Todos                               | Exportar inventario a PDF      |
| GET    | `/incidentes/excel`              | JEFE_DTIC, SUBJEFE_DTIC, ADMINISTRADOR | Reporte incidentes XLSX     |
| GET    | `/incidentes/pdf`                | Todos                               | Reporte incidentes PDF         |
| GET    | `/sla/excel`                     | JEFE_DTIC, SUBJEFE_DTIC, ADMINISTRADOR | Tickets fuera de SLA XLSX   |

### Notificaciones — `/api/notificaciones`
| Método | Endpoint           | Roles          | Descripción                          |
|--------|--------------------|----------------|--------------------------------------|
| GET    | `/`                | Autenticado    | Listar las del usuario autenticado   |
| PATCH  | `/{id}/leer`       | Autenticado    | Marcar como leída                    |
| PATCH  | `/leer-todas`      | Autenticado    | Marcar todas como leídas             |

### Audit Log — `/api/audit`
| Método | Endpoint           | Roles                         | Descripción                    |
|--------|--------------------|-------------------------------|--------------------------------|
| GET    | `/`                | ADMINISTRADOR, JEFE_DTIC      | Listar (paginado, filtrable)   |
| GET    | `/{id}`            | ADMINISTRADOR, JEFE_DTIC      | Detalle de evento              |

### Catálogos — `/api/catalogos`
| Método | Endpoint                | Roles          | Descripción                           |
|--------|-------------------------|----------------|---------------------------------------|
| GET    | `/areas`                | Autenticado    | Listar áreas activas                  |
| GET    | `/tipos-equipo`         | Autenticado    | Listar tipos de equipo                |
| GET    | `/marcas`               | Autenticado    | Listar marcas                         |
| GET    | `/modelos`              | Autenticado    | Listar modelos (filtrable por marca)  |
| GET    | `/sistemas-operativos`  | Autenticado    | Listar SO                             |
| GET    | `/tipos-incidente`      | Autenticado    | Listar tipos con SLAs                 |
| POST/PUT | `/tipos-equipo`      | ADMINISTRADOR  | CRUD tipos de equipo                  |
| POST/PUT | `/marcas`            | ADMINISTRADOR  | CRUD marcas                           |
| POST/PUT | `/modelos`           | ADMINISTRADOR  | CRUD modelos                          |
| PUT    | `/stock/{idTipo}`       | ADMINISTRADOR  | Configurar umbral de stock crítico    |
| PUT    | `/sla/{idTipo}`         | ADMINISTRADOR  | Configurar tiempos SLA                |

---

## CONFIGURACIÓN `application.properties`

```properties
# ── Servidor ──────────────────────────────────────────────────────────────────
server.port=8080
server.servlet.context-path=/

# ── Base de Datos ──────────────────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/db_sgi_emch?useSSL=false&serverTimezone=America/Lima&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=CAMBIAR_EN_PRODUCCION
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ── JPA / Hibernate ────────────────────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql=false
spring.jpa.open-in-view=false

# ── JWT ────────────────────────────────────────────────────────────────────────
jwt.secret=CAMBIAR_POR_CLAVE_SECRETA_MINIMO_256_BITS
jwt.expiration-ms=3600000
jwt.refresh-expiration-ms=86400000

# ── Spring Mail / SMTP ────────────────────────────────────────────────────────
spring.mail.host=SMTP_INSTITUCIONAL_EMCH
spring.mail.port=587
spring.mail.username=CORREO_DTIC
spring.mail.password=CAMBIAR_EN_PRODUCCION
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# ── Swagger / OpenAPI ─────────────────────────────────────────────────────────
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha

# ── Subida de archivos (carga masiva) ─────────────────────────────────────────
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# ── Almacenamiento de actas PDF ───────────────────────────────────────────────
app.storage.pdf-path=./storage/actas
```

---

## DEPENDENCIAS `pom.xml` — AÑADIR AL PROYECTO

```xml
<!-- Spring Boot Starters -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- MySQL -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- Swagger / OpenAPI 3 -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.8</version>
</dependency>

<!-- Apache POI — Excel -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.3.0</version>
</dependency>

<!-- OpenPDF — Generación de actas PDF -->
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>2.0.3</version>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- DevTools (solo desarrollo) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

---

## REGLAS DE RESPUESTA DE LA API

Toda respuesta debe usar el wrapper estándar `ApiResponse<T>`:

```json
// Éxito
{
  "success": true,
  "message": "Equipo registrado correctamente",
  "data": { ... }
}

// Error de negocio (400)
{
  "success": false,
  "message": "El Código_Ejército C1010-EMCH-0042 ya existe en el sistema",
  "data": null
}

// Error de autorización (403)
{
  "success": false,
  "message": "No tiene permisos para realizar esta operación",
  "data": null
}
```

Las respuestas paginadas deben usar `PagedResponse<T>`:
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

---

## REGLAS DE NEGOCIO QUE EL BACKEND DEBE VALIDAR

- DNI único al crear/editar usuario (incluso si el usuario previo está inactivo)
- `Codigo_Ejercito` único al registrar equipo (independiente del estado)
- Solo `ADMINISTRADOR` puede crear cuentas de usuario
- Transiciones de estado de equipo según la matriz definida en restricciones
- Baja de equipo requiere campo `motivo` obligatorio
- Al cerrar un ticket, generar acta PDF en ≤ 3 segundos
- Al cambiar estado de equipo, llamar a `sp_verificar_stock_critico(id_tipo)` después del UPDATE
- Número de ticket siempre via `sp_generar_numero_ticket`
- `audit_log` es de solo lectura para todos los roles, sin excepción
- Stock crítico: umbral configurable por tipo, default 20%, solo `ADMINISTRADOR` lo modifica

---

## DOCUMENTACIÓN SWAGGER — REQUISITOS

- Configurar autenticación Bearer JWT en Swagger UI
- Cada endpoint debe tener: `@Operation(summary=...)`, `@ApiResponse` con códigos 200, 400, 401, 403
- Agrupar endpoints por tags: `Autenticación`, `Usuarios`, `Equipos`, `Tickets`,
  `Dashboard`, `Reportes`, `Notificaciones`, `Audit Log`, `Catálogos`
- La URL de Swagger en desarrollo: `http://localhost:8080/swagger-ui.html`

---

## NOTAS FINALES PARA EL AI

- Generar código en **español** para nombres de variables de negocio y comentarios
- Usar `@Valid` en todos los request bodies
- Todos los servicios deben tener `@Transactional` donde corresponda
- Los repositorios de vistas deben ser de solo lectura (`@Transactional(readOnly = true)`)
- Implementar paginación con `Pageable` en todos los listados
- El `GlobalExceptionHandler` debe capturar y formatear todos los errores con `ApiResponse`
- Zona horaria del sistema: `America/Lima` (UTC-5)
- Charset: `UTF-8` / `utf8mb4` (alineado con la BD)
