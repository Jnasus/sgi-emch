# Foundation + Security (Auth) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la base del backend SGI-EMCH: paquete correcto, dependencias completas, capa de seguridad JWT funcional y endpoint `/api/auth` operativo.

**Architecture:** Spring Boot 3.5.x con arquitectura por capas (controller → service → repository → entity). La seguridad usa un `OncePerRequestFilter` que valida JWT antes de cada request. Las variables de sesión MySQL para audit se establecen en un `HandlerInterceptor` vía `JdbcTemplate`.

**Tech Stack:** Java 21, Spring Boot 3.5.x, Spring Security, jjwt 0.12.6, SpringDoc OpenAPI 3 (springdoc-openapi-starter-webmvc-ui 2.8.8), Hibernate/JPA, MySQL 8, Lombok, JUnit 5 + Mockito.

---

## Mapa de archivos

### Modificar
- `pom.xml` — agregar 7 dependencias faltantes
- `src/main/resources/application.properties` — configuración completa
- `src/test/java/pe/edu/emch/gestion/GestionApplicationTests.java` → eliminar y reemplazar

### Eliminar
- `src/main/java/pe/edu/emch/gestion/GestionApplication.java`

### Crear
```
src/main/java/pe/edu/emch/sgi/
├── SgiEmchApplication.java
├── config/
│   ├── JwtConfig.java
│   ├── SecurityConfig.java
│   ├── SwaggerConfig.java
│   └── AuditInterceptorConfig.java
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthFilter.java
│   ├── UserDetailsServiceImpl.java
│   └── AuditSessionInterceptor.java
├── entity/
│   ├── Rol.java
│   ├── Area.java
│   └── Usuario.java
├── repository/
│   ├── RolRepository.java
│   ├── AreaRepository.java
│   └── UsuarioRepository.java
├── dto/
│   ├── common/
│   │   ├── ApiResponse.java
│   │   └── PagedResponse.java
│   └── auth/
│       ├── LoginRequest.java
│       ├── LoginResponse.java
│       └── RefreshTokenRequest.java
├── exception/
│   ├── ResourceNotFoundException.java
│   ├── BusinessRuleException.java
│   ├── DuplicateResourceException.java
│   ├── UnauthorizedException.java
│   └── GlobalExceptionHandler.java
├── service/
│   └── AuthService.java
└── controller/
    └── AuthController.java

src/test/java/pe/edu/emch/sgi/
├── SgiEmchApplicationTests.java
├── security/
│   └── JwtUtilTest.java
└── service/
    └── AuthServiceTest.java
```

---

## Task 1: pom.xml — Agregar dependencias faltantes

**Files:**
- Modify: `pom.xml`

- [ ] **Step 1: Agregar las 7 dependencias que faltan al bloque `<dependencies>` de `pom.xml`**

Agregar justo antes del cierre `</dependencies>`:

```xml
<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Spring Mail -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- JWT — jjwt 0.12.6 -->
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

<!-- SpringDoc OpenAPI 3 / Swagger UI -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.8</version>
</dependency>

<!-- Apache POI — Excel (necesario para módulos posteriores) -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.3.0</version>
</dependency>

<!-- OpenPDF — PDF (necesario para módulos posteriores) -->
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>2.0.3</version>
</dependency>
```

También cambiar el `<artifactId>` de `gestion` a `sgi-emch` y agregar nombre/descripción:

```xml
<artifactId>sgi-emch</artifactId>
<name>SGI EMCH CFB</name>
<description>Sistema de Gestión de Inventario — DTIC EMCH</description>
```

- [ ] **Step 2: Verificar que el proyecto compila**

```
cd backend
mvnw.cmd dependency:resolve -q
```

Resultado esperado: BUILD SUCCESS (sin errores de dependencias).

- [ ] **Step 3: Commit**

```
git add pom.xml
git commit -m "build: add JWT, SpringDoc, POI, OpenPDF, Mail and validation dependencies"
```

---

## Task 2: Renombrar paquete y clase principal

**Files:**
- Delete: `src/main/java/pe/edu/emch/gestion/GestionApplication.java`
- Create: `src/main/java/pe/edu/emch/sgi/SgiEmchApplication.java`
- Delete: `src/test/java/pe/edu/emch/gestion/GestionApplicationTests.java`
- Create: `src/test/java/pe/edu/emch/sgi/SgiEmchApplicationTests.java`

- [ ] **Step 1: Crear el nuevo directorio de paquete y la clase principal**

Crear `src/main/java/pe/edu/emch/sgi/SgiEmchApplication.java`:

```java
package pe.edu.emch.sgi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SgiEmchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SgiEmchApplication.class, args);
    }
}
```

- [ ] **Step 2: Eliminar la clase antigua**

Eliminar el archivo:
```
src/main/java/pe/edu/emch/gestion/GestionApplication.java
```
Y el directorio vacío resultante `pe/edu/emch/gestion/`.

- [ ] **Step 3: Crear el test de arranque mínimo**

Crear `src/test/java/pe/edu/emch/sgi/SgiEmchApplicationTests.java`:

```java
package pe.edu.emch.sgi;

import org.junit.jupiter.api.Test;

class SgiEmchApplicationTests {

    @Test
    void mainClassCargaCorrectamente() {
        // Smoke test: verifica que la clase main existe y es instanciable
        new SgiEmchApplication();
    }
}
```

- [ ] **Step 4: Eliminar el test antiguo**

Eliminar el archivo:
```
src/test/java/pe/edu/emch/gestion/GestionApplicationTests.java
```

- [ ] **Step 5: Verificar compilación**

```
mvnw.cmd compile test-compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Step 6: Commit**

```
git add src/
git commit -m "refactor: rename package to pe.edu.emch.sgi and main class to SgiEmchApplication"
```

---

## Task 3: application.properties — Configuración completa

**Files:**
- Modify: `src/main/resources/application.properties`

- [ ] **Step 1: Reemplazar el contenido completo de `application.properties`**

```properties
spring.application.name=sgi-emch

# ── Servidor ──────────────────────────────────────────────────────────────────
server.port=8080
server.servlet.context-path=/

# ── Base de Datos ──────────────────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/db_sgi_emch?useSSL=false&serverTimezone=America/Lima&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=CAMBIAR_EN_PRODUCCION
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.connection-timeout=20000

# ── JPA / Hibernate ────────────────────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql=false
spring.jpa.open-in-view=false

# ── JWT ────────────────────────────────────────────────────────────────────────
jwt.secret=c2dpLWVtY2gtc2VjcmV0LWtleS1taW5pbXVtLTI1Ni1iaXRzLXJlcXVpcmVkLWNoYW5nZS1pbi1wcm9k
jwt.expiration-ms=3600000
jwt.refresh-expiration-ms=86400000

# ── Spring Mail / SMTP ────────────────────────────────────────────────────────
spring.mail.host=smtp.gmail.com
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

# ── Subida de archivos ─────────────────────────────────────────────────────────
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# ── Almacenamiento de actas PDF ───────────────────────────────────────────────
app.storage.pdf-path=./storage/actas
```

> **Nota sobre jwt.secret:** El valor por defecto es una cadena Base64. En producción reemplazar por una clave aleatoria de mínimo 256 bits. El valor actual es `sgi-emch-secret-key-minimum-256-bits-required-change-in-prod` en Base64.

- [ ] **Step 2: Commit**

```
git add src/main/resources/application.properties
git commit -m "config: set full application.properties with JWT, DB, Swagger and mail config"
```

---

## Task 4: DTOs comunes — ApiResponse y PagedResponse

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/dto/common/ApiResponse.java`
- Create: `src/main/java/pe/edu/emch/sgi/dto/common/PagedResponse.java`
- Test: `src/test/java/pe/edu/emch/sgi/dto/common/ApiResponseTest.java`

- [ ] **Step 1: Escribir el test primero**

Crear `src/test/java/pe/edu/emch/sgi/dto/common/ApiResponseTest.java`:

```java
package pe.edu.emch.sgi.dto.common;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ApiResponseTest {

    @Test
    void of_creaRespuestaExitosa() {
        ApiResponse<String> resp = ApiResponse.ok("Operación exitosa", "dato");
        assertThat(resp.isSuccess()).isTrue();
        assertThat(resp.getMessage()).isEqualTo("Operación exitosa");
        assertThat(resp.getData()).isEqualTo("dato");
    }

    @Test
    void error_creaRespuestaFallida() {
        ApiResponse<Void> resp = ApiResponse.error("Algo salió mal");
        assertThat(resp.isSuccess()).isFalse();
        assertThat(resp.getMessage()).isEqualTo("Algo salió mal");
        assertThat(resp.getData()).isNull();
    }

    @Test
    void ok_sinData_creaRespuestaExitosa() {
        ApiResponse<Void> resp = ApiResponse.ok("Creado");
        assertThat(resp.isSuccess()).isTrue();
        assertThat(resp.getData()).isNull();
    }
}
```

- [ ] **Step 2: Verificar que el test falla (clase no existe aún)**

```
mvnw.cmd test -Dtest=ApiResponseTest -q 2>&1 | tail -5
```

Resultado esperado: error de compilación — `ApiResponse` no existe.

- [ ] **Step 3: Crear `ApiResponse.java`**

```java
package pe.edu.emch.sgi.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;

    private ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> ok(String message) {
        return new ApiResponse<>(true, message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
```

- [ ] **Step 4: Crear `PagedResponse.java`**

```java
package pe.edu.emch.sgi.dto.common;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
public class PagedResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;

    public PagedResponse(Page<T> page) {
        this.content = page.getContent();
        this.page = page.getNumber();
        this.size = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
    }
}
```

- [ ] **Step 5: Ejecutar el test**

```
mvnw.cmd test -Dtest=ApiResponseTest -q
```

Resultado esperado: `Tests run: 3, Failures: 0, Errors: 0`.

- [ ] **Step 6: Commit**

```
git add src/
git commit -m "feat: add ApiResponse and PagedResponse generic DTOs"
```

---

## Task 5: Excepciones + GlobalExceptionHandler

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/exception/ResourceNotFoundException.java`
- Create: `src/main/java/pe/edu/emch/sgi/exception/BusinessRuleException.java`
- Create: `src/main/java/pe/edu/emch/sgi/exception/DuplicateResourceException.java`
- Create: `src/main/java/pe/edu/emch/sgi/exception/UnauthorizedException.java`
- Create: `src/main/java/pe/edu/emch/sgi/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/pe/edu/emch/sgi/exception/GlobalExceptionHandlerTest.java`

- [ ] **Step 1: Escribir el test del handler**

Crear `src/test/java/pe/edu/emch/sgi/exception/GlobalExceptionHandlerTest.java`:

```java
package pe.edu.emch.sgi.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pe.edu.emch.sgi.dto.common.ApiResponse;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleResourceNotFound_retorna404() {
        ResponseEntity<ApiResponse<Void>> resp =
            handler.handleResourceNotFound(new ResourceNotFoundException("Equipo no encontrado"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isFalse();
        assertThat(resp.getBody().getMessage()).isEqualTo("Equipo no encontrado");
    }

    @Test
    void handleBusinessRule_retorna400() {
        ResponseEntity<ApiResponse<Void>> resp =
            handler.handleBusinessRule(new BusinessRuleException("Transición inválida"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isFalse();
    }

    @Test
    void handleDuplicate_retorna409() {
        ResponseEntity<ApiResponse<Void>> resp =
            handler.handleDuplicate(new DuplicateResourceException("DNI ya existe"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isFalse();
    }

    @Test
    void handleUnauthorized_retorna403() {
        ResponseEntity<ApiResponse<Void>> resp =
            handler.handleUnauthorized(new UnauthorizedException("Sin permisos"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isFalse();
    }
}
```

- [ ] **Step 2: Verificar que el test no compila aún**

```
mvnw.cmd test-compile -q 2>&1 | tail -5
```

Resultado esperado: errores de compilación.

- [ ] **Step 3: Crear las 4 excepciones**

`src/main/java/pe/edu/emch/sgi/exception/ResourceNotFoundException.java`:
```java
package pe.edu.emch.sgi.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

`src/main/java/pe/edu/emch/sgi/exception/BusinessRuleException.java`:
```java
package pe.edu.emch.sgi.exception;

public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
```

`src/main/java/pe/edu/emch/sgi/exception/DuplicateResourceException.java`:
```java
package pe.edu.emch.sgi.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
```

`src/main/java/pe/edu/emch/sgi/exception/UnauthorizedException.java`:
```java
package pe.edu.emch.sgi.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

- [ ] **Step 4: Crear `GlobalExceptionHandler.java`**

```java
package pe.edu.emch.sgi.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pe.edu.emch.sgi.dto.common.ApiResponse;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessRule(BusinessRuleException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("No tiene permisos para realizar esta operación"));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error("Usuario o contraseña incorrectos"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errores = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(errores));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Error inesperado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Error interno del servidor"));
    }
}
```

- [ ] **Step 5: Ejecutar el test**

```
mvnw.cmd test -Dtest=GlobalExceptionHandlerTest -q
```

Resultado esperado: `Tests run: 4, Failures: 0, Errors: 0`.

- [ ] **Step 6: Commit**

```
git add src/
git commit -m "feat: add custom exceptions and GlobalExceptionHandler"
```

---

## Task 6: Entidades JPA — Rol, Area, Usuario

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/entity/Rol.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/Area.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/Usuario.java`

> No hay tests de unidad directos para entidades. Se validan indirectamente a través de los tests de `AuthService` (Task 13).

- [ ] **Step 1: Crear `Rol.java`**

Mapea exactamente a la tabla `rol` con columnas `id_rol`, `nombre_rol`, `descripcion`.

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rol")
@Getter
@Setter
@NoArgsConstructor
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "nombre_rol", nullable = false, unique = true, length = 50)
    private String nombreRol;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}
```

- [ ] **Step 2: Crear `Area.java`**

Mapea exactamente a la tabla `area` con columnas `id_area`, `codigo_area`, `nombre_area`, `descripcion`, `anio_vigencia`, `activo`, `created_at`.

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "area")
@Getter
@Setter
@NoArgsConstructor
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area")
    private Integer idArea;

    @Column(name = "codigo_area", nullable = false, unique = true, length = 20)
    private String codigoArea;

    @Column(name = "nombre_area", nullable = false, length = 100)
    private String nombreArea;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "anio_vigencia", nullable = false)
    private Short anioVigencia;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 3: Crear `Usuario.java`**

Mapea exactamente a la tabla `usuario_sistema`. Nota: la columna de contraseña se llama `password_hash` en BD.

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_sistema")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_area", nullable = false)
    private Area area;

    @Column(name = "nombres", nullable = false, length = 100)
    private String nombres;

    @Column(name = "apellidos", nullable = false, length = 100)
    private String apellidos;

    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

- [ ] **Step 4: Compilar para verificar que las entidades son correctas**

```
mvnw.cmd compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```
git add src/
git commit -m "feat: add JPA entities Rol, Area and Usuario mapped to existing DB tables"
```

---

## Task 7: Repositorios Spring Data JPA

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/repository/RolRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/AreaRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/UsuarioRepository.java`

- [ ] **Step 1: Crear `RolRepository.java`**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Rol;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByNombreRol(String nombreRol);
}
```

- [ ] **Step 2: Crear `AreaRepository.java`**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Area;

import java.util.List;

public interface AreaRepository extends JpaRepository<Area, Integer> {
    List<Area> findByActivoTrue();
}
```

- [ ] **Step 3: Crear `UsuarioRepository.java`**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import pe.edu.emch.sgi.entity.Usuario;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByUsernameAndActivoTrue(String username);

    boolean existsByDni(String dni);

    boolean existsByUsername(String username);

    @Modifying
    @Query("UPDATE Usuario u SET u.ultimoAcceso = :ahora WHERE u.idUsuario = :idUsuario")
    void actualizarUltimoAcceso(Integer idUsuario, LocalDateTime ahora);
}
```

- [ ] **Step 4: Compilar**

```
mvnw.cmd compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```
git add src/
git commit -m "feat: add JPA repositories for Rol, Area and Usuario"
```

---

## Task 8: JwtConfig + JwtUtil

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/config/JwtConfig.java`
- Create: `src/main/java/pe/edu/emch/sgi/security/JwtUtil.java`
- Test: `src/test/java/pe/edu/emch/sgi/security/JwtUtilTest.java`

- [ ] **Step 1: Escribir el test de JwtUtil**

Crear `src/test/java/pe/edu/emch/sgi/security/JwtUtilTest.java`:

```java
package pe.edu.emch.sgi.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pe.edu.emch.sgi.config.JwtConfig;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.Rol;
import pe.edu.emch.sgi.entity.Usuario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        JwtConfig config = new JwtConfig();
        // Clave de 64 chars = 512 bits, suficiente para HS256
        config.setSecret("test-secret-key-minimo-256-bits-para-hs256-algoritmo-seguro-1234");
        config.setExpirationMs(3600000L);
        config.setRefreshExpirationMs(86400000L);
        jwtUtil = new JwtUtil(config);

        Rol rol = new Rol();
        rol.setIdRol(1);
        rol.setNombreRol("ADMINISTRADOR");

        Area area = new Area();
        area.setIdArea(2);
        area.setNombreArea("DTIC");

        usuario = new Usuario();
        usuario.setIdUsuario(10);
        usuario.setUsername("jperez");
        usuario.setRol(rol);
        usuario.setArea(area);
    }

    @Test
    void generateAccessToken_retornaTokenNoNulo() {
        String token = jwtUtil.generateAccessToken(usuario);
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // Header.Payload.Signature
    }

    @Test
    void extractUsername_devuelveUsernameCorrectamente() {
        String token = jwtUtil.generateAccessToken(usuario);
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("jperez");
    }

    @Test
    void extractClaims_contieneIdUsuarioRolIdArea() {
        String token = jwtUtil.generateAccessToken(usuario);
        var claims = jwtUtil.parseClaims(token);
        assertThat(claims.get("id_usuario", Integer.class)).isEqualTo(10);
        assertThat(claims.get("rol", String.class)).isEqualTo("ADMINISTRADOR");
        assertThat(claims.get("id_area", Integer.class)).isEqualTo(2);
    }

    @Test
    void isTokenValid_tokenValido_retornaTrue() {
        String token = jwtUtil.generateAccessToken(usuario);
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_tokenInvalido_retornaFalse() {
        assertThat(jwtUtil.isTokenValid("token.invalido.firma")).isFalse();
    }

    @Test
    void generateRefreshToken_extractUsername_correcto() {
        String refresh = jwtUtil.generateRefreshToken("jperez");
        assertThat(jwtUtil.extractUsername(refresh)).isEqualTo("jperez");
    }
}
```

- [ ] **Step 2: Verificar que el test falla (clase no existe)**

```
mvnw.cmd test-compile -q 2>&1 | tail -5
```

Resultado esperado: error de compilación — `JwtUtil` no existe.

- [ ] **Step 3: Crear `JwtConfig.java`**

```java
package pe.edu.emch.sgi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtConfig {
    private String secret;
    private long expirationMs;
    private long refreshExpirationMs;
}
```

- [ ] **Step 4: Crear `JwtUtil.java`**

Usa la API de jjwt 0.12.6 (`Jwts.parser().verifyWith(...).build()`).

```java
package pe.edu.emch.sgi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import pe.edu.emch.sgi.config.JwtConfig;
import pe.edu.emch.sgi.entity.Usuario;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtUtil(JwtConfig config) {
        this.key = Keys.hmacShaKeyFor(config.getSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = config.getExpirationMs();
        this.refreshExpirationMs = config.getRefreshExpirationMs();
    }

    public String generateAccessToken(Usuario usuario) {
        return Jwts.builder()
            .subject(usuario.getUsername())
            .claim("id_usuario", usuario.getIdUsuario())
            .claim("rol", usuario.getRol().getNombreRol())
            .claim("id_area", usuario.getArea().getIdArea())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(key)
            .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
            .signWith(key)
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

- [ ] **Step 5: Ejecutar el test**

```
mvnw.cmd test -Dtest=JwtUtilTest -q
```

Resultado esperado: `Tests run: 6, Failures: 0, Errors: 0`.

- [ ] **Step 6: Commit**

```
git add src/
git commit -m "feat: add JwtConfig and JwtUtil with token generation and validation"
```

---

## Task 9: JwtAuthFilter + UserDetailsServiceImpl

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/security/JwtAuthFilter.java`
- Create: `src/main/java/pe/edu/emch/sgi/security/UserDetailsServiceImpl.java`

- [ ] **Step 1: Crear `UserDetailsServiceImpl.java`**

Carga el usuario desde BD por `username`, devuelve un `UserDetails` de Spring Security con el rol en formato `ROLE_<nombre_rol>` para compatibilidad con `hasRole()`.

```java
package pe.edu.emch.sgi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.UsuarioRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsernameAndActivoTrue(username)
            .orElseThrow(() -> new UsernameNotFoundException(
                "Usuario no encontrado o inactivo: " + username));

        return new User(
            usuario.getUsername(),
            usuario.getPasswordHash(),
            List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombreRol()))
        );
    }
}
```

- [ ] **Step 2: Crear `JwtAuthFilter.java`**

Valida el JWT en cada request. Si es válido, establece la autenticación en el `SecurityContext` y almacena `id_usuario` como atributo del request para el `AuditSessionInterceptor`.

```java
package pe.edu.emch.sgi.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            chain.doFilter(request, response);
            return;
        }

        String username = jwtUtil.extractUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            // Exponer id_usuario para AuditSessionInterceptor
            Claims claims = jwtUtil.parseClaims(token);
            request.setAttribute("idUsuarioActivo", claims.get("id_usuario", Integer.class));
        }

        chain.doFilter(request, response);
    }
}
```

- [ ] **Step 3: Compilar**

```
mvnw.cmd compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```
git add src/
git commit -m "feat: add JwtAuthFilter and UserDetailsServiceImpl"
```

---

## Task 10: AuditSessionInterceptor

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/security/AuditSessionInterceptor.java`

- [ ] **Step 1: Crear `AuditSessionInterceptor.java`**

Ejecuta `SET @id_usuario_activo` y `SET @ip_cliente` antes de cada request autenticado, para que los triggers de audit de MySQL los lean correctamente.

```java
package pe.edu.emch.sgi.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditSessionInterceptor implements HandlerInterceptor {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        Integer idUsuario = (Integer) request.getAttribute("idUsuarioActivo");
        String ip = resolverIpCliente(request);

        try {
            jdbcTemplate.update("SET @id_usuario_activo = ?", idUsuario);
            jdbcTemplate.update("SET @ip_cliente = ?", ip);
        } catch (Exception ex) {
            log.warn("No se pudieron establecer variables de sesión MySQL: {}", ex.getMessage());
        }

        return true;
    }

    private String resolverIpCliente(HttpServletRequest request) {
        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isBlank()) {
            return xForwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
```

- [ ] **Step 2: Compilar**

```
mvnw.cmd compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```
git add src/
git commit -m "feat: add AuditSessionInterceptor to set MySQL session audit variables"
```

---

## Task 11: SecurityConfig + SwaggerConfig + AuditInterceptorConfig

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/config/SecurityConfig.java`
- Create: `src/main/java/pe/edu/emch/sgi/config/SwaggerConfig.java`
- Create: `src/main/java/pe/edu/emch/sgi/config/AuditInterceptorConfig.java`

- [ ] **Step 1: Crear `SecurityConfig.java`**

```java
package pe.edu.emch.sgi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/dashboard/resumen").authenticated()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

- [ ] **Step 2: Crear `SwaggerConfig.java`**

```java
package pe.edu.emch.sgi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("SGI EMCH CFB — API")
                .description("Sistema de Gestión de Inventario — DTIC Escuela Militar de Chorrillos")
                .version("1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
            .components(new Components()
                .addSecuritySchemes(SCHEME_NAME, new SecurityScheme()
                    .name(SCHEME_NAME)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
```

- [ ] **Step 3: Crear `AuditInterceptorConfig.java`**

```java
package pe.edu.emch.sgi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;

@Configuration
@RequiredArgsConstructor
public class AuditInterceptorConfig implements WebMvcConfigurer {

    private final AuditSessionInterceptor auditSessionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auditSessionInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/auth/**");
    }
}
```

- [ ] **Step 4: Compilar**

```
mvnw.cmd compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```
git add src/
git commit -m "feat: add SecurityConfig (JWT stateless), SwaggerConfig and AuditInterceptorConfig"
```

---

## Task 12: DTOs de autenticación

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/dto/auth/LoginRequest.java`
- Create: `src/main/java/pe/edu/emch/sgi/dto/auth/LoginResponse.java`
- Create: `src/main/java/pe/edu/emch/sgi/dto/auth/RefreshTokenRequest.java`

- [ ] **Step 1: Crear `LoginRequest.java`**

```java
package pe.edu.emch.sgi.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El username es obligatorio")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
```

- [ ] **Step 2: Crear `LoginResponse.java`**

```java
package pe.edu.emch.sgi.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private Integer idUsuario;
    private String username;
    private String rol;
    private Integer idArea;
}
```

- [ ] **Step 3: Crear `RefreshTokenRequest.java`**

```java
package pe.edu.emch.sgi.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {

    @NotBlank(message = "El refresh token es obligatorio")
    private String refreshToken;
}
```

- [ ] **Step 4: Compilar**

```
mvnw.cmd compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```
git add src/
git commit -m "feat: add auth DTOs: LoginRequest, LoginResponse, RefreshTokenRequest"
```

---

## Task 13: AuthService

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/service/AuthService.java`
- Test: `src/test/java/pe/edu/emch/sgi/service/AuthServiceTest.java`

- [ ] **Step 1: Escribir el test de AuthService**

Crear `src/test/java/pe/edu/emch/sgi/service/AuthServiceTest.java`:

```java
package pe.edu.emch.sgi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import pe.edu.emch.sgi.config.JwtConfig;
import pe.edu.emch.sgi.dto.auth.LoginRequest;
import pe.edu.emch.sgi.dto.auth.LoginResponse;
import pe.edu.emch.sgi.dto.auth.RefreshTokenRequest;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.Rol;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.UnauthorizedException;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.security.JwtUtil;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private JwtConfig jwtConfig;

    @InjectMocks
    private AuthService authService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        Rol rol = new Rol();
        rol.setIdRol(1);
        rol.setNombreRol("TECNICO_CAMPO");

        Area area = new Area();
        area.setIdArea(3);
        area.setNombreArea("DTIC");

        usuario = new Usuario();
        usuario.setIdUsuario(5);
        usuario.setUsername("jperez");
        usuario.setPasswordHash("$2a$10$hash");
        usuario.setActivo(true);
        usuario.setRol(rol);
        usuario.setArea(area);
    }

    @Test
    void login_credencialesValidas_retornaLoginResponse() {
        LoginRequest request = new LoginRequest();
        request.setUsername("jperez");
        request.setPassword("pass123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(usuarioRepository.findByUsernameAndActivoTrue("jperez"))
            .thenReturn(Optional.of(usuario));
        when(jwtUtil.generateAccessToken(usuario)).thenReturn("access.token.jwt");
        when(jwtUtil.generateRefreshToken("jperez")).thenReturn("refresh.token.jwt");
        when(jwtConfig.getExpirationMs()).thenReturn(3600000L);

        LoginResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access.token.jwt");
        assertThat(response.getRefreshToken()).isEqualTo("refresh.token.jwt");
        assertThat(response.getUsername()).isEqualTo("jperez");
        assertThat(response.getRol()).isEqualTo("TECNICO_CAMPO");
        assertThat(response.getIdUsuario()).isEqualTo(5);
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        verify(usuarioRepository).actualizarUltimoAcceso(eq(5), any());
    }

    @Test
    void login_credencialesInvalidas_lanzaExcepcion() {
        LoginRequest request = new LoginRequest();
        request.setUsername("jperez");
        request.setPassword("wrongpass");

        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void refresh_tokenValido_retornaNewAccessToken() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("valid.refresh.token");

        when(jwtUtil.isTokenValid("valid.refresh.token")).thenReturn(true);
        when(jwtUtil.extractUsername("valid.refresh.token")).thenReturn("jperez");
        when(usuarioRepository.findByUsernameAndActivoTrue("jperez"))
            .thenReturn(Optional.of(usuario));
        when(jwtUtil.generateAccessToken(usuario)).thenReturn("new.access.token");
        when(jwtUtil.generateRefreshToken("jperez")).thenReturn("new.refresh.token");
        when(jwtConfig.getExpirationMs()).thenReturn(3600000L);

        LoginResponse response = authService.refresh(request);

        assertThat(response.getAccessToken()).isEqualTo("new.access.token");
        assertThat(response.getRefreshToken()).isEqualTo("new.refresh.token");
    }

    @Test
    void refresh_tokenInvalido_lanzaUnauthorizedException() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("bad.token");

        when(jwtUtil.isTokenValid("bad.token")).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh(request))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessageContaining("Refresh token inválido");
    }
}
```

- [ ] **Step 2: Verificar que el test no compila aún**

```
mvnw.cmd test-compile -q 2>&1 | tail -5
```

Resultado esperado: error de compilación — `AuthService` no existe.

- [ ] **Step 3: Crear `AuthService.java`**

```java
package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.config.JwtConfig;
import pe.edu.emch.sgi.dto.auth.LoginRequest;
import pe.edu.emch.sgi.dto.auth.LoginResponse;
import pe.edu.emch.sgi.dto.auth.RefreshTokenRequest;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.exception.UnauthorizedException;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.security.JwtUtil;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final JwtConfig jwtConfig;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsernameAndActivoTrue(request.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String accessToken = jwtUtil.generateAccessToken(usuario);
        String refreshToken = jwtUtil.generateRefreshToken(usuario.getUsername());

        usuarioRepository.actualizarUltimoAcceso(usuario.getIdUsuario(), LocalDateTime.now());

        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtConfig.getExpirationMs() / 1000)
            .idUsuario(usuario.getIdUsuario())
            .username(usuario.getUsername())
            .rol(usuario.getRol().getNombreRol())
            .idArea(usuario.getArea().getIdArea())
            .build();
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new UnauthorizedException("Refresh token inválido o expirado");
        }

        String username = jwtUtil.extractUsername(refreshToken);
        Usuario usuario = usuarioRepository.findByUsernameAndActivoTrue(username)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado o inactivo"));

        String newAccessToken = jwtUtil.generateAccessToken(usuario);
        String newRefreshToken = jwtUtil.generateRefreshToken(username);

        return LoginResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtConfig.getExpirationMs() / 1000)
            .idUsuario(usuario.getIdUsuario())
            .username(usuario.getUsername())
            .rol(usuario.getRol().getNombreRol())
            .idArea(usuario.getArea().getIdArea())
            .build();
    }
}
```

- [ ] **Step 4: Ejecutar el test**

```
mvnw.cmd test -Dtest=AuthServiceTest -q
```

Resultado esperado: `Tests run: 4, Failures: 0, Errors: 0`.

- [ ] **Step 5: Commit**

```
git add src/
git commit -m "feat: add AuthService with login and refresh token logic"
```

---

## Task 14: AuthController

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/controller/AuthController.java`

- [ ] **Step 1: Crear `AuthController.java`**

```java
package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.emch.sgi.dto.auth.LoginRequest;
import pe.edu.emch.sgi.dto.auth.LoginResponse;
import pe.edu.emch.sgi.dto.auth.RefreshTokenRequest;
import pe.edu.emch.sgi.dto.common.ApiResponse;
import pe.edu.emch.sgi.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Login, refresh y logout")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener tokens JWT")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login exitoso"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    })
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token usando el refresh token")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token renovado"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Refresh token inválido o expirado")
    })
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok("Token renovado", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión (invalida sesión en cliente)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout exitoso")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // El JWT es stateless; el cliente debe eliminar el token.
        // En fases futuras se puede implementar un blacklist de tokens.
        return ResponseEntity.ok(ApiResponse.ok("Sesión cerrada correctamente"));
    }
}
```

- [ ] **Step 2: Compilar todo el proyecto**

```
mvnw.cmd compile -q
```

Resultado esperado: BUILD SUCCESS.

- [ ] **Step 3: Ejecutar todos los tests**

```
mvnw.cmd test -q
```

Resultado esperado: todos los tests pasan. Si falla `SgiEmchApplicationTests` por intentar conectar a BD, es esperado — se necesita la BD real para el `@SpringBootTest` completo.

- [ ] **Step 4: Commit**

```
git add src/
git commit -m "feat: add AuthController with /login, /refresh and /logout endpoints"
```

---

## Task 15: Verificación final de compilación

**Files:** ninguno nuevo

- [ ] **Step 1: Compilar el proyecto completo**

```
mvnw.cmd compile -q
```

Resultado esperado: BUILD SUCCESS sin warnings críticos.

- [ ] **Step 2: Ejecutar solo los tests unitarios (sin @SpringBootTest)**

```
mvnw.cmd test -Dtest="ApiResponseTest,GlobalExceptionHandlerTest,JwtUtilTest,AuthServiceTest,SgiEmchApplicationTests" -q
```

Resultado esperado: `Tests run: 14+, Failures: 0, Errors: 0`.

- [ ] **Step 3: Verificar la estructura de paquetes generada**

```
find src/main/java/pe/edu/emch/sgi -name "*.java" | sort
```

Resultado esperado: 25+ archivos distribuidos en `config/`, `controller/`, `dto/`, `entity/`, `exception/`, `repository/`, `security/`, `service/`.

- [ ] **Step 4: Commit final del módulo**

```
git add .
git commit -m "feat: complete Foundation + Security module — Auth endpoint ready"
```

---

## Resumen del módulo

Al completar este plan tendrás:

| Componente | Estado |
|-----------|--------|
| Paquete `pe.edu.emch.sgi` con clase principal | ✓ |
| Todas las dependencias Maven configuradas | ✓ |
| `application.properties` completo | ✓ |
| `ApiResponse<T>` + `PagedResponse<T>` | ✓ |
| 4 excepciones + `GlobalExceptionHandler` | ✓ |
| Entidades `Rol`, `Area`, `Usuario` (mapeadas exactamente a BD) | ✓ |
| 3 repositorios Spring Data JPA | ✓ |
| `JwtConfig` + `JwtUtil` (jjwt 0.12.6) | ✓ |
| `JwtAuthFilter` + `UserDetailsServiceImpl` | ✓ |
| `AuditSessionInterceptor` (SET @id_usuario_activo) | ✓ |
| `SecurityConfig` (stateless JWT, RBAC habilitado) | ✓ |
| `SwaggerConfig` (Bearer JWT en Swagger UI) | ✓ |
| `POST /api/auth/login` | ✓ |
| `POST /api/auth/refresh` | ✓ |
| `POST /api/auth/logout` | ✓ |

**Siguiente módulo recomendado:** `Catálogos` — endpoints de solo lectura para Áreas, Tipos de Equipo, Marcas, Modelos, SO y Tipos de Incidente. Son simples y el módulo de Equipos los necesita como prerequisito.
