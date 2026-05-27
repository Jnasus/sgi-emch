# Notification Triggers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the three missing notification triggers so that the `notificacion` table actually gets populated when real events occur.

**Architecture:** A new `NotificadorService` acts as the single point of truth for creating notifications, with built-in deduplication (does not insert if an identical record already exists). `TicketService` calls it synchronously after saving a ticket. A new `NotificacionScheduler` component runs two `@Scheduled` jobs — one every 15 minutes for SLA violations, one every day at 08:00 for critical stock alerts.

**Tech Stack:** Spring Boot 3, Spring Scheduling (`@EnableScheduling`, `@Scheduled`), Spring Data JPA, Lombok, JUnit 5 + Mockito.

---

## File Map

| Action | Path |
|--------|------|
| **Create** | `backend/src/main/java/pe/edu/emch/sgi/service/NotificadorService.java` |
| **Create** | `backend/src/main/java/pe/edu/emch/sgi/scheduler/NotificacionScheduler.java` |
| **Create** | `backend/src/test/java/pe/edu/emch/sgi/service/NotificadorServiceTest.java` |
| **Create** | `backend/src/test/java/pe/edu/emch/sgi/scheduler/NotificacionSchedulerTest.java` |
| **Modify** | `backend/src/main/java/pe/edu/emch/sgi/SgiEmchApplication.java` |
| **Modify** | `backend/src/main/java/pe/edu/emch/sgi/service/TicketService.java` |
| **Modify** | `backend/src/main/java/pe/edu/emch/sgi/repository/NotificacionRepository.java` |
| **Modify** | `backend/src/main/java/pe/edu/emch/sgi/repository/TicketRepository.java` |
| **Modify** | `backend/src/main/java/pe/edu/emch/sgi/repository/UsuarioRepository.java` |
| **Modify** | `backend/src/test/java/pe/edu/emch/sgi/service/TicketServiceTest.java` |

---

## Task 1: NotificadorService — foundation for notification creation

**Files:**
- Create: `backend/src/main/java/pe/edu/emch/sgi/service/NotificadorService.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/NotificacionRepository.java`
- Create: `backend/src/test/java/pe/edu/emch/sgi/service/NotificadorServiceTest.java`

- [ ] **Step 1: Add deduplication query to NotificacionRepository**

Open `backend/src/main/java/pe/edu/emch/sgi/repository/NotificacionRepository.java` and add the following method at the end of the interface (before the closing `}`):

```java
boolean existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
        Integer idUsuario, String tipoNotif, String urlAccion);
```

The full file should now look like:

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

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.idUsuario = :idUsuario AND n.leida = false")
    int marcarTodasLeidasByUsuario(@Param("idUsuario") Integer idUsuario);

    boolean existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
            Integer idUsuario, String tipoNotif, String urlAccion);
}
```

- [ ] **Step 2: Write failing test for NotificadorService**

Create `backend/src/test/java/pe/edu/emch/sgi/service/NotificadorServiceTest.java`:

```java
package pe.edu.emch.sgi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.emch.sgi.entity.Notificacion;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.NotificacionRepository;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificadorServiceTest {

    @Mock NotificacionRepository notificacionRepository;
    @InjectMocks NotificadorService notificadorService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setIdUsuario(1);
        usuario.setNombres("Juan");
        usuario.setApellidos("Perez");
    }

    @Test
    void crearSiNoExiste_cuandoNoExiste_guardaNotificacion() {
        when(notificacionRepository.existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
                1, "TICKET_ASIGNADO", "/incidentes/10")).thenReturn(false);
        when(notificacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificadorService.crearSiNoExiste(
                usuario, "TICKET_ASIGNADO", "Nuevo ticket", "Mensaje", "/incidentes/10");

        verify(notificacionRepository).save(argThat(n ->
                "TICKET_ASIGNADO".equals(n.getTipoNotif()) &&
                Boolean.FALSE.equals(n.getLeida()) &&
                "/incidentes/10".equals(n.getUrlAccion())
        ));
    }

    @Test
    void crearSiNoExiste_cuandoYaExiste_noGuarda() {
        when(notificacionRepository.existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
                1, "SLA_VENCIDO", "/incidentes/10")).thenReturn(true);

        notificadorService.crearSiNoExiste(
                usuario, "SLA_VENCIDO", "SLA vencido", "Mensaje", "/incidentes/10");

        verify(notificacionRepository, never()).save(any());
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

```
cd backend
mvn test -Dtest=NotificadorServiceTest -q 2>&1 | tail -20
```

Expected: FAIL — `NotificadorService` does not exist yet.

- [ ] **Step 4: Implement NotificadorService**

Create `backend/src/main/java/pe/edu/emch/sgi/service/NotificadorService.java`:

```java
package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.entity.Notificacion;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.NotificacionRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificadorService {

    private final NotificacionRepository notificacionRepository;

    /**
     * Crea una notificación solo si no existe ya una con el mismo usuario + tipo + urlAccion.
     * Usa REQUIRES_NEW para que un fallo aquí no revierta la transacción del llamador.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void crearSiNoExiste(Usuario usuario, String tipoNotif,
                                String titulo, String mensaje, String urlAccion) {
        if (notificacionRepository.existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
                usuario.getIdUsuario(), tipoNotif, urlAccion)) {
            log.debug("Notificación duplicada ignorada — usuario={} tipo={} url={}",
                      usuario.getIdUsuario(), tipoNotif, urlAccion);
            return;
        }
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTipoNotif(tipoNotif);
        n.setTitulo(titulo);
        n.setMensaje(mensaje);
        n.setLeida(false);
        n.setUrlAccion(urlAccion);
        notificacionRepository.save(n);
        log.info("Notificación creada — usuario={} tipo={}", usuario.getIdUsuario(), tipoNotif);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

```
mvn test -Dtest=NotificadorServiceTest -q 2>&1 | tail -10
```

Expected: `BUILD SUCCESS`, 2 tests passed.

- [ ] **Step 6: Compile the project**

```
mvn compile -q
```

Expected: no errors.

- [ ] **Step 7: Commit**

```
git add backend/src/main/java/pe/edu/emch/sgi/service/NotificadorService.java \
        backend/src/main/java/pe/edu/emch/sgi/repository/NotificacionRepository.java \
        backend/src/test/java/pe/edu/emch/sgi/service/NotificadorServiceTest.java
git commit -m "feat(notificaciones): add NotificadorService with deduplication"
```

---

## Task 2: TICKET_ASIGNADO — notify the assigned technician on ticket creation

**Files:**
- Modify: `backend/src/main/java/pe/edu/emch/sgi/service/TicketService.java`
- Modify: `backend/src/test/java/pe/edu/emch/sgi/service/TicketServiceTest.java`

- [ ] **Step 1: Write the failing test**

Open `backend/src/test/java/pe/edu/emch/sgi/service/TicketServiceTest.java`.

Add the mock field after the existing `@Mock TipoIncidenteRepository tipoIncidenteRepository;`:

```java
@Mock NotificadorService notificadorService;
```

The full list of mocks and InjectMocks at the top of the class should be:

```java
@Mock TicketRepository ticketRepository;
@Mock HistorialTicketRepository historialTicketRepository;
@Mock EquipoRepository equipoRepository;
@Mock UsuarioRepository usuarioRepository;
@Mock TipoIncidenteRepository tipoIncidenteRepository;
@Mock NotificadorService notificadorService;

@InjectMocks TicketService ticketService;
```

Then add this new test at the end of the class (before the final `}`), after the `buildCreateRequest()` helper:

```java
@Test
void crearTicket_invocaNotificadorConDatosCorrectos() {
    TicketCreateRequest req = buildCreateRequest();

    when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
    when(usuarioRepository.findById(2)).thenReturn(Optional.of(tecnico));
    when(tipoIncidenteRepository.findById(1)).thenReturn(Optional.of(tipoIncidente));
    when(ticketRepository.findMaxNumeroTicketByAniomes(any())).thenReturn(Optional.empty());
    when(ticketRepository.save(any())).thenAnswer(inv -> {
        Ticket t = inv.getArgument(0);
        t.setIdTicket(10);
        return t;
    });

    ticketService.crearTicket(req);

    verify(notificadorService).crearSiNoExiste(
            eq(tecnico),
            eq("TICKET_ASIGNADO"),
            org.mockito.ArgumentMatchers.contains("TKT-"),
            org.mockito.ArgumentMatchers.contains("TKT-"),
            eq("/incidentes/10")
    );
}

@Test
void crearTicket_fallaNotificacion_noAfectaCreacionTicket() {
    TicketCreateRequest req = buildCreateRequest();

    when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
    when(usuarioRepository.findById(2)).thenReturn(Optional.of(tecnico));
    when(tipoIncidenteRepository.findById(1)).thenReturn(Optional.of(tipoIncidente));
    when(ticketRepository.findMaxNumeroTicketByAniomes(any())).thenReturn(Optional.empty());
    when(ticketRepository.save(any())).thenAnswer(inv -> {
        Ticket t = inv.getArgument(0);
        t.setIdTicket(10);
        return t;
    });
    doThrow(new RuntimeException("DB error"))
            .when(notificadorService).crearSiNoExiste(any(), any(), any(), any(), any());

    // Ticket creation must succeed even if the notification fails
    org.assertj.core.api.Assertions.assertThatNoException()
            .isThrownBy(() -> ticketService.crearTicket(req));
}
```

- [ ] **Step 2: Run tests to verify they fail**

```
mvn test -Dtest=TicketServiceTest -q 2>&1 | tail -20
```

Expected: tests `crearTicket_invocaNotificadorConDatosCorrectos` and `crearTicket_fallaNotificacion_noAfectaCreacionTicket` FAIL (NotificadorService not injected into TicketService yet).

- [ ] **Step 3: Update TicketService to inject NotificadorService and call it**

Open `backend/src/main/java/pe/edu/emch/sgi/service/TicketService.java`.

1. Add `@Slf4j` annotation above `@Service`:
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {
```

2. Add the import and field. The imports to add:
```java
import lombok.extern.slf4j.Slf4j;
import pe.edu.emch.sgi.service.NotificadorService;
```

3. Add the field after `private final TipoIncidenteRepository tipoIncidenteRepository;`:
```java
private final NotificadorService notificadorService;
```

4. Replace the return statement in `crearTicket` (currently `return toTicketResponse(ticketRepository.save(ticket));`) with:
```java
Ticket saved = ticketRepository.save(ticket);
try {
    notificadorService.crearSiNoExiste(
            tecnico,
            "TICKET_ASIGNADO",
            "Nuevo ticket asignado: " + saved.getNumeroTicket(),
            "Se te ha asignado el ticket " + saved.getNumeroTicket() + ": " + saved.getTitulo(),
            "/incidentes/" + saved.getIdTicket()
    );
} catch (Exception e) {
    log.warn("No se pudo crear notificación TICKET_ASIGNADO para {}: {}",
             saved.getNumeroTicket(), e.getMessage());
}
return toTicketResponse(saved);
```

- [ ] **Step 4: Run all TicketService tests to verify they pass**

```
mvn test -Dtest=TicketServiceTest -q 2>&1 | tail -10
```

Expected: `BUILD SUCCESS`, all tests pass (the original tests still pass because the `notificadorService` mock silently does nothing by default).

- [ ] **Step 5: Compile**

```
mvn compile -q
```

- [ ] **Step 6: Commit**

```
git add backend/src/main/java/pe/edu/emch/sgi/service/TicketService.java \
        backend/src/test/java/pe/edu/emch/sgi/service/TicketServiceTest.java
git commit -m "feat(notificaciones): trigger TICKET_ASIGNADO on ticket creation"
```

---

## Task 3: @EnableScheduling + SLA_VENCIDO scheduled job

**Files:**
- Modify: `backend/src/main/java/pe/edu/emch/sgi/SgiEmchApplication.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/TicketRepository.java`
- Create: `backend/src/main/java/pe/edu/emch/sgi/scheduler/NotificacionScheduler.java`
- Create: `backend/src/test/java/pe/edu/emch/sgi/scheduler/NotificacionSchedulerTest.java`

- [ ] **Step 1: Enable scheduling in the main application class**

Replace `SgiEmchApplication.java` entirely:

```java
package pe.edu.emch.sgi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SgiEmchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SgiEmchApplication.class, args);
    }
}
```

- [ ] **Step 2: Add findByEstadoIn query to TicketRepository**

Open `backend/src/main/java/pe/edu/emch/sgi/repository/TicketRepository.java` and add the following import and method:

Import to add at the top:
```java
import java.util.List;
```

Method to add inside the interface:
```java
@Query("SELECT t FROM Ticket t WHERE t.estado IN :estados")
List<Ticket> findByEstadoIn(@Param("estados") List<String> estados);
```

The full file should look like:

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.Ticket;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    @Query("SELECT MAX(t.numeroTicket) FROM Ticket t WHERE t.numeroTicket LIKE CONCAT('TKT-', :aniomes, '-%')")
    Optional<String> findMaxNumeroTicketByAniomes(@Param("aniomes") String aniomes);

    @Query("""
            SELECT t FROM Ticket t
            WHERE (:estado IS NULL OR t.estado = :estado)
              AND (:prioridad IS NULL OR t.prioridad = :prioridad)
              AND (:idEquipo IS NULL OR t.equipo.idEquipo = :idEquipo)
              AND (:idTecnico IS NULL OR t.tecnico.idUsuario = :idTecnico)
            """)
    Page<Ticket> findFiltered(
            @Param("estado") String estado,
            @Param("prioridad") String prioridad,
            @Param("idEquipo") Integer idEquipo,
            @Param("idTecnico") Integer idTecnico,
            Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.estado IN :estados")
    List<Ticket> findByEstadoIn(@Param("estados") List<String> estados);
}
```

- [ ] **Step 3: Write the failing test for the SLA scheduler**

Create `backend/src/test/java/pe/edu/emch/sgi/scheduler/NotificacionSchedulerTest.java`:

```java
package pe.edu.emch.sgi.scheduler;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.repository.StockCriticoRepository;
import pe.edu.emch.sgi.repository.TicketRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.service.NotificadorService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionSchedulerTest {

    @Mock TicketRepository ticketRepository;
    @Mock StockCriticoRepository stockCriticoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock NotificadorService notificadorService;

    @InjectMocks NotificacionScheduler scheduler;

    private Usuario tecnico;
    private TipoIncidente tipoIncidente;

    @BeforeEach
    void setUp() {
        tecnico = new Usuario();
        tecnico.setIdUsuario(2);
        tecnico.setNombres("Juan");
        tecnico.setApellidos("Perez");

        tipoIncidente = new TipoIncidente();
        tipoIncidente.setIdTipoIncidente(1);
        tipoIncidente.setNombreTipo("Hardware");
        tipoIncidente.setTiempoResolucionMin((short) 120);
    }

    private Ticket buildTicket(int idTicket, String estado, int minutosAtras) {
        Ticket t = new Ticket();
        t.setIdTicket(idTicket);
        t.setNumeroTicket("TKT-202601-000" + idTicket);
        t.setTitulo("PC no enciende");
        t.setEstado(estado);
        t.setFechaApertura(LocalDateTime.now().minusMinutes(minutosAtras));
        t.setTipoIncidente(tipoIncidente);
        t.setTecnico(tecnico);
        return t;
    }

    // ── SLA tests ─────────────────────────────────────────────────────────────

    @Test
    void checkSlaVencidos_ticketSlaVencido_notificaTecnico() {
        // Ticket abierto hace 200 min, SLA es 120 min → vencido
        Ticket vencido = buildTicket(1, "ABIERTO", 200);
        when(ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO")))
                .thenReturn(List.of(vencido));

        scheduler.checkSlaVencidos();

        verify(notificadorService).crearSiNoExiste(
                eq(tecnico),
                eq("SLA_VENCIDO"),
                contains("TKT-202601-0001"),
                contains("TKT-202601-0001"),
                eq("/incidentes/1")
        );
    }

    @Test
    void checkSlaVencidos_ticketDentroSla_noNotifica() {
        // Ticket abierto hace 30 min, SLA es 120 min → dentro de SLA
        Ticket dentroSla = buildTicket(2, "ABIERTO", 30);
        when(ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO")))
                .thenReturn(List.of(dentroSla));

        scheduler.checkSlaVencidos();

        verify(notificadorService, never()).crearSiNoExiste(any(), any(), any(), any(), any());
    }

    @Test
    void checkSlaVencidos_sinTicketsActivos_noNotifica() {
        when(ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO")))
                .thenReturn(List.of());

        scheduler.checkSlaVencidos();

        verify(notificadorService, never()).crearSiNoExiste(any(), any(), any(), any(), any());
    }

    @Test
    void checkSlaVencidos_ticketEnProcesVencido_notificaTecnico() {
        // Un ticket EN_PROCESO también debe ser chequeado
        Ticket vencido = buildTicket(3, "EN_PROCESO", 500);
        when(ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO")))
                .thenReturn(List.of(vencido));

        scheduler.checkSlaVencidos();

        verify(notificadorService).crearSiNoExiste(
                eq(tecnico), eq("SLA_VENCIDO"), any(), any(), eq("/incidentes/3"));
    }
}
```

- [ ] **Step 4: Run test to verify it fails**

```
mvn test -Dtest=NotificacionSchedulerTest -q 2>&1 | tail -20
```

Expected: FAIL — `NotificacionScheduler` does not exist.

- [ ] **Step 5: Create NotificacionScheduler with checkSlaVencidos**

Create `backend/src/main/java/pe/edu/emch/sgi/scheduler/NotificacionScheduler.java`:

```java
package pe.edu.emch.sgi.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pe.edu.emch.sgi.entity.Ticket;
import pe.edu.emch.sgi.repository.StockCriticoRepository;
import pe.edu.emch.sgi.repository.TicketRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.service.NotificadorService;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificacionScheduler {

    private final TicketRepository ticketRepository;
    private final StockCriticoRepository stockCriticoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificadorService notificadorService;

    /**
     * Cada 15 minutos: busca tickets ABIERTO/EN_PROCESO cuyo tiempo de resolución
     * según SLA ya fue superado y notifica al técnico asignado.
     * La deduplicación en NotificadorService garantiza que solo se envía una vez por ticket.
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void checkSlaVencidos() {
        log.info("Scheduler SLA: iniciando verificación...");
        LocalDateTime ahora = LocalDateTime.now();
        List<Ticket> activos = ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO"));
        int count = 0;
        for (Ticket t : activos) {
            LocalDateTime limite = t.getFechaApertura()
                    .plusMinutes(t.getTipoIncidente().getTiempoResolucionMin());
            if (limite.isBefore(ahora)) {
                notificadorService.crearSiNoExiste(
                        t.getTecnico(),
                        "SLA_VENCIDO",
                        "SLA vencido: " + t.getNumeroTicket(),
                        "El ticket " + t.getNumeroTicket() + " (" + t.getTitulo() + ")" +
                                " superó su tiempo de resolución de " +
                                t.getTipoIncidente().getTiempoResolucionMin() + " min.",
                        "/incidentes/" + t.getIdTicket()
                );
                count++;
            }
        }
        log.info("Scheduler SLA: {} ticket(s) con SLA vencido detectado(s).", count);
    }

    // checkStockCritico will be added in Task 4
}
```

- [ ] **Step 6: Run tests to verify they pass**

```
mvn test -Dtest=NotificacionSchedulerTest -q 2>&1 | tail -10
```

Expected: `BUILD SUCCESS`, 4 tests passed (the stock tests haven't been added yet).

- [ ] **Step 7: Compile**

```
mvn compile -q
```

- [ ] **Step 8: Commit**

```
git add backend/src/main/java/pe/edu/emch/sgi/SgiEmchApplication.java \
        backend/src/main/java/pe/edu/emch/sgi/repository/TicketRepository.java \
        backend/src/main/java/pe/edu/emch/sgi/scheduler/NotificacionScheduler.java \
        backend/src/test/java/pe/edu/emch/sgi/scheduler/NotificacionSchedulerTest.java
git commit -m "feat(notificaciones): add SLA_VENCIDO scheduled job every 15 min"
```

---

## Task 4: STOCK_CRITICO scheduled job

**Files:**
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/UsuarioRepository.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/scheduler/NotificacionScheduler.java`
- Modify: `backend/src/test/java/pe/edu/emch/sgi/scheduler/NotificacionSchedulerTest.java`

- [ ] **Step 1: Add user lookup by role to UsuarioRepository**

Open `backend/src/main/java/pe/edu/emch/sgi/repository/UsuarioRepository.java` and add this method at the end of the interface:

```java
@Query("SELECT u FROM Usuario u WHERE u.rol.nombreRol IN :roles AND u.activo = true")
List<Usuario> findByRolNombreRolInAndActivoTrue(@Param("roles") List<String> roles);
```

The full file should now look like:

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByUsernameAndActivoTrue(String username);

    boolean existsByDni(String dni);

    boolean existsByUsername(String username);

    boolean existsByDniAndIdUsuarioNot(String dni, Integer idUsuario);

    boolean existsByUsernameAndIdUsuarioNot(String username, Integer idUsuario);

    @Query("SELECT u FROM Usuario u WHERE (:activo IS NULL OR u.activo = :activo) AND (:idRol IS NULL OR u.rol.idRol = :idRol)")
    Page<Usuario> findFiltered(@Param("activo") Boolean activo, @Param("idRol") Integer idRol, Pageable pageable);

    @Modifying
    @Query("UPDATE Usuario u SET u.ultimoAcceso = :ahora WHERE u.idUsuario = :idUsuario")
    void actualizarUltimoAcceso(@Param("idUsuario") Integer idUsuario, @Param("ahora") LocalDateTime ahora);

    @Query("SELECT u FROM Usuario u WHERE u.rol.nombreRol = 'TECNICO' AND u.activo = true ORDER BY u.apellidos")
    List<Usuario> findTecnicosCampoActivos();

    @Query("SELECT u FROM Usuario u WHERE u.rol.nombreRol IN :roles AND u.activo = true")
    List<Usuario> findByRolNombreRolInAndActivoTrue(@Param("roles") List<String> roles);
}
```

- [ ] **Step 2: Write the failing tests for checkStockCritico**

Open `backend/src/test/java/pe/edu/emch/sgi/scheduler/NotificacionSchedulerTest.java` and add the following imports at the top of the file:

```java
import java.math.BigDecimal;
import static org.mockito.Mockito.mock;
```

Then add these test methods at the end of the class (before the final `}`):

```java
// ── Stock crítico tests ───────────────────────────────────────────────────

@Test
void checkStockCritico_sinAlertas_noNotificaNiConsultaUsuarios() {
    when(stockCriticoRepository.findAll()).thenReturn(List.of());

    scheduler.checkStockCritico();

    verify(notificadorService, never()).crearSiNoExiste(any(), any(), any(), any(), any());
    verifyNoInteractions(usuarioRepository);
}

@Test
void checkStockCritico_conAlerta_notificaAdminsYSupervisores() {
    StockCritico alerta = mock(StockCritico.class);
    when(alerta.getEnAlerta()).thenReturn(true);
    when(alerta.getIdTipo()).thenReturn(1);
    when(alerta.getNombreTipo()).thenReturn("Laptop");
    when(alerta.getStockOperativo()).thenReturn(2);
    when(alerta.getTotalEquipos()).thenReturn(10);
    when(alerta.getPctActual()).thenReturn(new BigDecimal("20.00"));
    when(alerta.getUmbralPct()).thenReturn(30);

    Usuario admin = new Usuario();
    admin.setIdUsuario(1);
    admin.setNombres("Admin");
    admin.setApellidos("Sistema");

    when(stockCriticoRepository.findAll()).thenReturn(List.of(alerta));
    when(usuarioRepository.findByRolNombreRolInAndActivoTrue(List.of("ADMINISTRADOR", "SUPERVISOR")))
            .thenReturn(List.of(admin));

    scheduler.checkStockCritico();

    verify(notificadorService).crearSiNoExiste(
            eq(admin),
            eq("STOCK_CRITICO"),
            contains("Laptop"),
            contains("Laptop"),
            eq("/inventario?tipo=1")
    );
}

@Test
void checkStockCritico_sinDestinatarios_noNotifica() {
    StockCritico alerta = mock(StockCritico.class);
    when(alerta.getEnAlerta()).thenReturn(true);
    when(alerta.getIdTipo()).thenReturn(2);
    when(alerta.getNombreTipo()).thenReturn("Desktop");
    when(alerta.getStockOperativo()).thenReturn(1);
    when(alerta.getTotalEquipos()).thenReturn(5);
    when(alerta.getPctActual()).thenReturn(new BigDecimal("20.00"));
    when(alerta.getUmbralPct()).thenReturn(30);

    when(stockCriticoRepository.findAll()).thenReturn(List.of(alerta));
    when(usuarioRepository.findByRolNombreRolInAndActivoTrue(any())).thenReturn(List.of());

    scheduler.checkStockCritico();

    verify(notificadorService, never()).crearSiNoExiste(any(), any(), any(), any(), any());
}
```

- [ ] **Step 3: Run tests to verify new ones fail**

```
mvn test -Dtest=NotificacionSchedulerTest -q 2>&1 | tail -20
```

Expected: The three new stock tests FAIL (method not yet implemented).

- [ ] **Step 4: Add checkStockCritico to NotificacionScheduler**

Open `backend/src/main/java/pe/edu/emch/sgi/scheduler/NotificacionScheduler.java`.

Add the following import at the top of the file:

```java
import pe.edu.emch.sgi.entity.StockCritico;
import pe.edu.emch.sgi.entity.Usuario;
```

Then replace the `// checkStockCritico will be added in Task 4` comment with this method:

```java
/**
 * Todos los días a las 08:00 AM: detecta tipos de equipo en alerta de stock crítico
 * y notifica a todos los usuarios con rol ADMINISTRADOR o SUPERVISOR.
 * La deduplicación en NotificadorService garantiza que solo se envía una vez por tipo.
 */
@Scheduled(cron = "0 0 8 * * *")
public void checkStockCritico() {
    log.info("Scheduler Stock: iniciando verificación...");
    List<StockCritico> alertas = stockCriticoRepository.findAll().stream()
            .filter(StockCritico::getEnAlerta)
            .toList();

    if (alertas.isEmpty()) {
        log.info("Scheduler Stock: sin alertas de stock crítico.");
        return;
    }

    List<Usuario> destinatarios = usuarioRepository
            .findByRolNombreRolInAndActivoTrue(List.of("ADMINISTRADOR", "SUPERVISOR"));

    if (destinatarios.isEmpty()) {
        log.warn("Scheduler Stock: hay alertas pero no hay administradores/supervisores activos.");
        return;
    }

    int count = 0;
    for (StockCritico sc : alertas) {
        String urlAccion = "/inventario?tipo=" + sc.getIdTipo();
        String titulo    = "Stock crítico: " + sc.getNombreTipo();
        String mensaje   = sc.getNombreTipo() + " tiene solo " + sc.getStockOperativo() +
                " de " + sc.getTotalEquipos() + " equipos operativos" +
                " (" + sc.getPctActual() + "% — umbral mínimo " + sc.getUmbralPct() + "%).";
        for (Usuario u : destinatarios) {
            notificadorService.crearSiNoExiste(u, "STOCK_CRITICO", titulo, mensaje, urlAccion);
            count++;
        }
    }
    log.info("Scheduler Stock: {} notificación(es) de stock crítico procesadas.", count);
}
```

The full final file should look like:

```java
package pe.edu.emch.sgi.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pe.edu.emch.sgi.entity.StockCritico;
import pe.edu.emch.sgi.entity.Ticket;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.StockCriticoRepository;
import pe.edu.emch.sgi.repository.TicketRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.service.NotificadorService;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificacionScheduler {

    private final TicketRepository ticketRepository;
    private final StockCriticoRepository stockCriticoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificadorService notificadorService;

    @Scheduled(cron = "0 */15 * * * *")
    public void checkSlaVencidos() {
        log.info("Scheduler SLA: iniciando verificación...");
        LocalDateTime ahora = LocalDateTime.now();
        List<Ticket> activos = ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO"));
        int count = 0;
        for (Ticket t : activos) {
            LocalDateTime limite = t.getFechaApertura()
                    .plusMinutes(t.getTipoIncidente().getTiempoResolucionMin());
            if (limite.isBefore(ahora)) {
                notificadorService.crearSiNoExiste(
                        t.getTecnico(),
                        "SLA_VENCIDO",
                        "SLA vencido: " + t.getNumeroTicket(),
                        "El ticket " + t.getNumeroTicket() + " (" + t.getTitulo() + ")" +
                                " superó su tiempo de resolución de " +
                                t.getTipoIncidente().getTiempoResolucionMin() + " min.",
                        "/incidentes/" + t.getIdTicket()
                );
                count++;
            }
        }
        log.info("Scheduler SLA: {} ticket(s) con SLA vencido detectado(s).", count);
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void checkStockCritico() {
        log.info("Scheduler Stock: iniciando verificación...");
        List<StockCritico> alertas = stockCriticoRepository.findAll().stream()
                .filter(StockCritico::getEnAlerta)
                .toList();

        if (alertas.isEmpty()) {
            log.info("Scheduler Stock: sin alertas de stock crítico.");
            return;
        }

        List<Usuario> destinatarios = usuarioRepository
                .findByRolNombreRolInAndActivoTrue(List.of("ADMINISTRADOR", "SUPERVISOR"));

        if (destinatarios.isEmpty()) {
            log.warn("Scheduler Stock: hay alertas pero no hay administradores/supervisores activos.");
            return;
        }

        int count = 0;
        for (StockCritico sc : alertas) {
            String urlAccion = "/inventario?tipo=" + sc.getIdTipo();
            String titulo    = "Stock crítico: " + sc.getNombreTipo();
            String mensaje   = sc.getNombreTipo() + " tiene solo " + sc.getStockOperativo() +
                    " de " + sc.getTotalEquipos() + " equipos operativos" +
                    " (" + sc.getPctActual() + "% — umbral mínimo " + sc.getUmbralPct() + "%).";
            for (Usuario u : destinatarios) {
                notificadorService.crearSiNoExiste(u, "STOCK_CRITICO", titulo, mensaje, urlAccion);
                count++;
            }
        }
        log.info("Scheduler Stock: {} notificación(es) de stock crítico procesadas.", count);
    }
}
```

- [ ] **Step 5: Run all scheduler tests to verify they pass**

```
mvn test -Dtest=NotificacionSchedulerTest -q 2>&1 | tail -10
```

Expected: `BUILD SUCCESS`, 7 tests passed.

- [ ] **Step 6: Run the full test suite to confirm no regressions**

```
mvn test -q 2>&1 | tail -15
```

Expected: `BUILD SUCCESS`, all existing tests still pass.

- [ ] **Step 7: Final compile**

```
mvn compile -q
```

- [ ] **Step 8: Commit**

```
git add backend/src/main/java/pe/edu/emch/sgi/repository/UsuarioRepository.java \
        backend/src/main/java/pe/edu/emch/sgi/scheduler/NotificacionScheduler.java \
        backend/src/test/java/pe/edu/emch/sgi/scheduler/NotificacionSchedulerTest.java
git commit -m "feat(notificaciones): add STOCK_CRITICO scheduled job daily at 08:00"
```

---

## Summary

After these 4 tasks, the notification system is fully wired:

| Evento | Quién recibe | Cuándo |
|--------|-------------|--------|
| Ticket creado | Técnico asignado | Inmediatamente |
| SLA vencido | Técnico asignado | Cada 15 min (1 vez por ticket) |
| Stock crítico | Admins y Supervisores | Cada día a las 08:00 (1 vez por tipo) |

La deduplicación en `NotificadorService` garantiza que ningún evento genera notificaciones duplicadas aunque el scheduler se ejecute múltiples veces.
