# Notificaciones Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exponer endpoints REST para que cada usuario autenticado consulte, marque como leída y elimine sus propias notificaciones.

**Architecture:** Las notificaciones son creadas por el sistema (triggers/lógica de negocio), nunca por el frontend. El módulo solo expone operaciones de lectura y actualización. Cada endpoint extrae el ID del usuario autenticado desde el atributo de request `idUsuarioActivo` (establecido por `AuditSessionInterceptor`) para garantizar que cada usuario solo accede a sus propias notificaciones.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring Data JPA, Spring Security (JWT), JUnit 5 + Mockito + MockMvc, Maven, MySQL 8

---

## File Map

| File | Action |
|---|---|
| `src/main/java/pe/edu/emch/sgi/entity/Notificacion.java` | Create |
| `src/main/java/pe/edu/emch/sgi/repository/NotificacionRepository.java` | Create |
| `src/main/java/pe/edu/emch/sgi/dto/notificacion/NotificacionResponse.java` | Create |
| `src/main/java/pe/edu/emch/sgi/service/NotificacionService.java` | Create |
| `src/test/java/pe/edu/emch/sgi/service/NotificacionServiceTest.java` | Create |
| `src/main/java/pe/edu/emch/sgi/controller/NotificacionController.java` | Create |
| `src/test/java/pe/edu/emch/sgi/controller/NotificacionControllerTest.java` | Create |

---

### Task 1: Entity y Repository

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/entity/Notificacion.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/NotificacionRepository.java`

**Context:**
- Base package: `pe.edu.emch.sgi`
- Lombok pattern: `@Getter @Setter @NoArgsConstructor` en líneas separadas (nunca `@Data`)
- `ddl-auto=validate` — los tipos Java deben coincidir exactamente con MySQL 8:
  - `TINYINT(1)` → `Boolean`
  - `TEXT` → `String` con `columnDefinition = "TEXT"`
  - ENUM → `String` (sin `@Enumerated`)
  - `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` nunca escrito por la app → `LocalDateTime` con `insertable=false, updatable=false`
- `notificacion.fecha_creacion` tiene `DEFAULT CURRENT_TIMESTAMP` y nunca es escrito por la app → `insertable=false, updatable=false`
- FK a `Usuario` → `FetchType.EAGER` (se necesita siempre para verificar ownership)
- La entidad `Usuario` ya existe en `pe.edu.emch.sgi.entity.Usuario`

- [ ] **Step 1: Crear `Notificacion.java`**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion")
@Getter
@Setter
@NoArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notif")
    private Integer idNotif;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "tipo_notif", nullable = false)
    private String tipoNotif;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "mensaje", columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "leida", nullable = false)
    private Boolean leida;

    @Column(name = "url_accion", length = 500)
    private String urlAccion;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}
```

- [ ] **Step 2: Crear `NotificacionRepository.java`**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    @Query("""
            SELECT n FROM Notificacion n
            WHERE n.usuario.idUsuario = :idUsuario
              AND (:leida IS NULL OR n.leida = :leida)
            """)
    Page<Notificacion> findByUsuarioFiltered(
            @Param("idUsuario") Integer idUsuario,
            @Param("leida") Boolean leida,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.idUsuario = :idUsuario AND n.leida = false")
    int marcarTodasLeidasByUsuario(@Param("idUsuario") Integer idUsuario);
}
```

- [ ] **Step 3: Compilar**

```
mvn compile -q
```

Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```
git add src/main/java/pe/edu/emch/sgi/entity/Notificacion.java
git add src/main/java/pe/edu/emch/sgi/repository/NotificacionRepository.java
git commit -m "feat(notificaciones): add Notificacion entity and repository"
```

---

### Task 2: DTO

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/dto/notificacion/NotificacionResponse.java`

**Context:**
- No existe el package `dto/notificacion` — crearlo al crear el archivo
- Response DTOs usan solo `@Data`, sin anotaciones de validación
- No hay request DTO: las notificaciones son creadas por el sistema, no por el usuario

- [ ] **Step 1: Crear `NotificacionResponse.java`**

```java
package pe.edu.emch.sgi.dto.notificacion;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificacionResponse {
    private Integer idNotif;
    private Integer idUsuario;
    private String tipoNotif;
    private String titulo;
    private String mensaje;
    private Boolean leida;
    private String urlAccion;
    private LocalDateTime fechaCreacion;
}
```

- [ ] **Step 2: Compilar**

```
mvn compile -q
```

Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```
git add src/main/java/pe/edu/emch/sgi/dto/notificacion/
git commit -m "feat(notificaciones): add NotificacionResponse DTO"
```

---

### Task 3: NotificacionService + NotificacionServiceTest

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/service/NotificacionService.java`
- Create: `src/test/java/pe/edu/emch/sgi/service/NotificacionServiceTest.java`

**Context:**
- Patrón de test de servicio: `@ExtendWith(MockitoExtension.class)`, usar `isNull()` en `when()` para parámetros opcionales nulos
- El servicio recibe `idUsuario` como parámetro (extraído del request attribute en el controller)
- Verificación de ownership: si la notificación existe pero pertenece a otro usuario, lanzar `ResourceNotFoundException` con el mismo mensaje que "no encontrada" (no revelar que existe)
- `marcarTodasLeidas` usa `@Modifying` query en el repositorio, no necesita cargar entidades
- Imports: `pe.edu.emch.sgi.dto.common.PagedResponse`, `pe.edu.emch.sgi.exception.ResourceNotFoundException`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/test/java/pe/edu/emch/sgi/service/NotificacionServiceTest.java`:

```java
package pe.edu.emch.sgi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import pe.edu.emch.sgi.dto.notificacion.NotificacionResponse;
import pe.edu.emch.sgi.entity.Notificacion;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.NotificacionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock NotificacionRepository notificacionRepository;

    @InjectMocks NotificacionService notificacionService;

    private Usuario usuario;
    private Notificacion notificacion;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setIdUsuario(1);
        usuario.setNombres("Admin");
        usuario.setApellidos("Sistema");

        notificacion = new Notificacion();
        notificacion.setIdNotif(10);
        notificacion.setUsuario(usuario);
        notificacion.setTipoNotif("INFO");
        notificacion.setTitulo("Aviso de prueba");
        notificacion.setMensaje("Mensaje de prueba");
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(LocalDateTime.of(2026, 1, 15, 9, 0));
    }

    @Test
    void listarNotificaciones_sinFiltro_retornaPagedResponse() {
        Page<Notificacion> page = new PageImpl<>(List.of(notificacion));
        when(notificacionRepository.findByUsuarioFiltered(eq(1), isNull(), any()))
                .thenReturn(page);

        var result = notificacionService.listarNotificaciones(1, null, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitulo()).isEqualTo("Aviso de prueba");
        assertThat(result.getContent().get(0).getLeida()).isFalse();
    }

    @Test
    void listarNotificaciones_conFiltroLeida_filtra() {
        notificacion.setLeida(true);
        Page<Notificacion> page = new PageImpl<>(List.of(notificacion));
        when(notificacionRepository.findByUsuarioFiltered(eq(1), eq(true), any()))
                .thenReturn(page);

        var result = notificacionService.listarNotificaciones(1, true, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getLeida()).isTrue();
    }

    @Test
    void marcarLeida_exitoso_setLeidaTrue() {
        when(notificacionRepository.findById(10)).thenReturn(Optional.of(notificacion));
        when(notificacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        NotificacionResponse result = notificacionService.marcarLeida(10, 1);

        assertThat(result.getLeida()).isTrue();
        assertThat(result.getTitulo()).isEqualTo("Aviso de prueba");
    }

    @Test
    void marcarLeida_noEncontrada_lanzaExcepcion() {
        when(notificacionRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> notificacionService.marcarLeida(99, 1))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void marcarLeida_perteneceAOtroUsuario_lanzaExcepcion() {
        when(notificacionRepository.findById(10)).thenReturn(Optional.of(notificacion));
        assertThatThrownBy(() -> notificacionService.marcarLeida(10, 99))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void marcarTodasLeidas_delegaAlRepository() {
        when(notificacionRepository.marcarTodasLeidasByUsuario(1)).thenReturn(3);

        notificacionService.marcarTodasLeidas(1);

        verify(notificacionRepository).marcarTodasLeidasByUsuario(1);
    }

    @Test
    void eliminarNotificacion_exitoso_borraEntidad() {
        when(notificacionRepository.findById(10)).thenReturn(Optional.of(notificacion));
        doNothing().when(notificacionRepository).delete(notificacion);

        notificacionService.eliminarNotificacion(10, 1);

        verify(notificacionRepository).delete(notificacion);
    }

    @Test
    void eliminarNotificacion_noEncontrada_lanzaExcepcion() {
        when(notificacionRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> notificacionService.eliminarNotificacion(99, 1))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void eliminarNotificacion_perteneceAOtroUsuario_lanzaExcepcion() {
        when(notificacionRepository.findById(10)).thenReturn(Optional.of(notificacion));
        assertThatThrownBy(() -> notificacionService.eliminarNotificacion(10, 99))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
```

- [ ] **Step 2: Ejecutar tests para confirmar que fallan**

```
mvn test -pl . -Dtest=NotificacionServiceTest -q
```

Expected: FAIL — `NotificacionService` no existe aún

- [ ] **Step 3: Crear `NotificacionService.java`**

```java
package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.notificacion.NotificacionResponse;
import pe.edu.emch.sgi.entity.Notificacion;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.NotificacionRepository;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    @Transactional(readOnly = true)
    public PagedResponse<NotificacionResponse> listarNotificaciones(
            Integer idUsuario, Boolean leida, Pageable pageable) {
        Page<NotificacionResponse> page = notificacionRepository
                .findByUsuarioFiltered(idUsuario, leida, pageable)
                .map(this::toResponse);
        return new PagedResponse<>(page);
    }

    @Transactional
    public NotificacionResponse marcarLeida(Integer idNotif, Integer idUsuario) {
        Notificacion n = findOwnedOrThrow(idNotif, idUsuario);
        n.setLeida(true);
        return toResponse(notificacionRepository.save(n));
    }

    @Transactional
    public void marcarTodasLeidas(Integer idUsuario) {
        notificacionRepository.marcarTodasLeidasByUsuario(idUsuario);
    }

    @Transactional
    public void eliminarNotificacion(Integer idNotif, Integer idUsuario) {
        Notificacion n = findOwnedOrThrow(idNotif, idUsuario);
        notificacionRepository.delete(n);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Notificacion findOwnedOrThrow(Integer idNotif, Integer idUsuario) {
        Notificacion n = notificacionRepository.findById(idNotif)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada: " + idNotif));
        if (!n.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new ResourceNotFoundException("Notificación no encontrada: " + idNotif);
        }
        return n;
    }

    private NotificacionResponse toResponse(Notificacion n) {
        NotificacionResponse r = new NotificacionResponse();
        r.setIdNotif(n.getIdNotif());
        r.setIdUsuario(n.getUsuario().getIdUsuario());
        r.setTipoNotif(n.getTipoNotif());
        r.setTitulo(n.getTitulo());
        r.setMensaje(n.getMensaje());
        r.setLeida(n.getLeida());
        r.setUrlAccion(n.getUrlAccion());
        r.setFechaCreacion(n.getFechaCreacion());
        return r;
    }
}
```

- [ ] **Step 4: Ejecutar tests para confirmar que pasan**

```
mvn test -pl . -Dtest=NotificacionServiceTest -q
```

Expected: BUILD SUCCESS, 9 tests passing

- [ ] **Step 5: Commit**

```
git add src/main/java/pe/edu/emch/sgi/service/NotificacionService.java
git add src/test/java/pe/edu/emch/sgi/service/NotificacionServiceTest.java
git commit -m "feat(notificaciones): add NotificacionService with 9 unit tests"
```

---

### Task 4: NotificacionController + NotificacionControllerTest

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/controller/NotificacionController.java`
- Create: `src/test/java/pe/edu/emch/sgi/controller/NotificacionControllerTest.java`

**Context:**
- Patrón de test de controller: `@WebMvcTest(NotificacionController.class)` + `@Import(SecurityConfig.class)` + `@MockBean` para `JwtUtil`, `UserDetailsServiceImpl`, `JwtAuthFilter`, `AuditSessionInterceptor`
- `@BeforeEach` debe stub el filtro JWT con doAnswer passthrough y `auditSessionInterceptor.preHandle` retornando true
- `.with(csrf())` requerido en PATCH y DELETE
- El controller inyecta `HttpServletRequest` y llama `httpRequest.getAttribute("idUsuarioActivo")` — en el test esto devuelve `null` (el interceptor está mockeado), así que el mock del service debe usar `isNull()` o `any()` para ese parámetro
- **Endpoints y autorización** — todos solo requieren autenticación (cualquier rol):
  - `GET /api/notificaciones` → `?leida=` opcional → 200
  - `PATCH /api/notificaciones/{id}/leer` → 200
  - `PATCH /api/notificaciones/leer-todas` → 200
  - `DELETE /api/notificaciones/{id}` → 200
- No hay `@PreAuthorize` en ningún endpoint (todos los usuarios autenticados pueden gestionar sus propias notificaciones)
- Infraestructura de seguridad existente:
  - `pe.edu.emch.sgi.config.SecurityConfig`
  - `pe.edu.emch.sgi.security.JwtUtil`
  - `pe.edu.emch.sgi.security.UserDetailsServiceImpl`
  - `pe.edu.emch.sgi.security.JwtAuthFilter`
  - `pe.edu.emch.sgi.security.AuditSessionInterceptor`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/test/java/pe/edu/emch/sgi/controller/NotificacionControllerTest.java`:

```java
package pe.edu.emch.sgi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.emch.sgi.config.SecurityConfig;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.notificacion.NotificacionResponse;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.service.NotificacionService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificacionController.class)
@Import(SecurityConfig.class)
class NotificacionControllerTest {

    @MockBean NotificacionService notificacionService;
    @MockBean JwtUtil jwtUtil;
    @MockBean UserDetailsServiceImpl userDetailsService;
    @MockBean JwtAuthFilter jwtAuthFilter;
    @MockBean AuditSessionInterceptor auditSessionInterceptor;

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @BeforeEach
    void setUpFilter() throws Exception {
        doAnswer(invocation -> {
            HttpServletRequest req = invocation.getArgument(0);
            HttpServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());

        when(auditSessionInterceptor.preHandle(any(), any(), any())).thenReturn(true);
    }

    @Test
    @WithMockUser
    void listarNotificaciones_autenticado_retorna200() throws Exception {
        NotificacionResponse resp = new NotificacionResponse();
        resp.setIdNotif(1);
        resp.setTitulo("Aviso");
        resp.setLeida(false);
        PagedResponse<NotificacionResponse> paged = new PagedResponse<>(new PageImpl<>(List.of(resp)));
        when(notificacionService.listarNotificaciones(isNull(), isNull(), any())).thenReturn(paged);

        mockMvc.perform(get("/api/notificaciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].titulo").value("Aviso"));
    }

    @Test
    void listarNotificaciones_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/notificaciones"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void marcarLeida_retorna200() throws Exception {
        NotificacionResponse resp = new NotificacionResponse();
        resp.setIdNotif(1);
        resp.setLeida(true);
        when(notificacionService.marcarLeida(eq(1), isNull())).thenReturn(resp);

        mockMvc.perform(patch("/api/notificaciones/1/leer").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.leida").value(true));
    }

    @Test
    @WithMockUser
    void marcarTodasLeidas_retorna200() throws Exception {
        doNothing().when(notificacionService).marcarTodasLeidas(isNull());

        mockMvc.perform(patch("/api/notificaciones/leer-todas").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void eliminarNotificacion_retorna200() throws Exception {
        doNothing().when(notificacionService).eliminarNotificacion(eq(1), isNull());

        mockMvc.perform(delete("/api/notificaciones/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void eliminarNotificacion_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(delete("/api/notificaciones/1").with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}
```

- [ ] **Step 2: Ejecutar tests para confirmar que fallan**

```
mvn test -pl . -Dtest=NotificacionControllerTest -q
```

Expected: FAIL — `NotificacionController` no existe aún

- [ ] **Step 3: Crear `NotificacionController.java`**

```java
package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.emch.sgi.dto.common.ApiResponse;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.notificacion.NotificacionResponse;
import pe.edu.emch.sgi.service.NotificacionService;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Gestión de notificaciones del usuario autenticado")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    @Operation(summary = "Listar notificaciones del usuario autenticado, filtrable por ?leida=")
    public ResponseEntity<ApiResponse<PagedResponse<NotificacionResponse>>> listarNotificaciones(
            @RequestParam(required = false) Boolean leida,
            @PageableDefault(size = 20, sort = "fechaCreacion") Pageable pageable,
            HttpServletRequest httpRequest) {
        Integer idUsuario = (Integer) httpRequest.getAttribute("idUsuarioActivo");
        return ResponseEntity.ok(ApiResponse.ok("OK",
                notificacionService.listarNotificaciones(idUsuario, leida, pageable)));
    }

    @PatchMapping("/{id}/leer")
    @Operation(summary = "Marcar una notificación como leída")
    public ResponseEntity<ApiResponse<NotificacionResponse>> marcarLeida(
            @PathVariable Integer id, HttpServletRequest httpRequest) {
        Integer idUsuario = (Integer) httpRequest.getAttribute("idUsuarioActivo");
        return ResponseEntity.ok(ApiResponse.ok("Notificación marcada como leída",
                notificacionService.marcarLeida(id, idUsuario)));
    }

    @PatchMapping("/leer-todas")
    @Operation(summary = "Marcar todas las notificaciones del usuario como leídas")
    public ResponseEntity<ApiResponse<Void>> marcarTodasLeidas(HttpServletRequest httpRequest) {
        Integer idUsuario = (Integer) httpRequest.getAttribute("idUsuarioActivo");
        notificacionService.marcarTodasLeidas(idUsuario);
        return ResponseEntity.ok(ApiResponse.ok("Notificaciones marcadas como leídas"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una notificación")
    public ResponseEntity<ApiResponse<Void>> eliminarNotificacion(
            @PathVariable Integer id, HttpServletRequest httpRequest) {
        Integer idUsuario = (Integer) httpRequest.getAttribute("idUsuarioActivo");
        notificacionService.eliminarNotificacion(id, idUsuario);
        return ResponseEntity.ok(ApiResponse.ok("Notificación eliminada"));
    }
}
```

- [ ] **Step 4: Ejecutar todos los tests**

```
mvn test -pl . -Dtest=NotificacionControllerTest,NotificacionServiceTest -q
```

Expected: BUILD SUCCESS, 15 tests passing (6 controller + 9 service)

- [ ] **Step 5: Ejecutar el suite completo**

```
mvn test -q
```

Expected: BUILD SUCCESS, todos los tests existentes siguen pasando

- [ ] **Step 6: Commit**

```
git add src/main/java/pe/edu/emch/sgi/controller/NotificacionController.java
git add src/test/java/pe/edu/emch/sgi/controller/NotificacionControllerTest.java
git commit -m "feat(notificaciones): add NotificacionController with 6 controller tests"
```
