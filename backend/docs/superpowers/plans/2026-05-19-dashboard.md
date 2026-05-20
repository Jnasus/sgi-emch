# Dashboard Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exponer 4 endpoints GET de solo lectura que devuelven datos de las vistas MySQL del dashboard: resumen por tipo, inventario completo paginado, stock crítico y tickets activos.

**Architecture:** Cada vista MySQL se mapea a una entidad JPA `@Immutable` (sin setters). El servicio convierte entidades a DTOs con mapeo manual. El controlador requiere rol ADMINISTRADOR en todos los endpoints.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring Data JPA, Spring Security (JWT), JUnit 5 + Mockito + MockMvc, Maven, MySQL 8

---

## File Map

| File | Action |
|---|---|
| `src/main/java/pe/edu/emch/sgi/entity/DashboardResumen.java` | Create |
| `src/main/java/pe/edu/emch/sgi/entity/InventarioCompleto.java` | Create |
| `src/main/java/pe/edu/emch/sgi/entity/StockCritico.java` | Create |
| `src/main/java/pe/edu/emch/sgi/entity/TicketsActivos.java` | Create |
| `src/main/java/pe/edu/emch/sgi/repository/DashboardResumenRepository.java` | Create |
| `src/main/java/pe/edu/emch/sgi/repository/InventarioCompletoRepository.java` | Create |
| `src/main/java/pe/edu/emch/sgi/repository/StockCriticoRepository.java` | Create |
| `src/main/java/pe/edu/emch/sgi/repository/TicketsActivosRepository.java` | Create |
| `src/main/java/pe/edu/emch/sgi/dto/dashboard/DashboardResumenResponse.java` | Create |
| `src/main/java/pe/edu/emch/sgi/dto/dashboard/InventarioCompletoResponse.java` | Create |
| `src/main/java/pe/edu/emch/sgi/dto/dashboard/StockCriticoResponse.java` | Create |
| `src/main/java/pe/edu/emch/sgi/dto/dashboard/TicketsActivosResponse.java` | Create |
| `src/main/java/pe/edu/emch/sgi/service/DashboardService.java` | Create |
| `src/test/java/pe/edu/emch/sgi/service/DashboardServiceTest.java` | Create |
| `src/main/java/pe/edu/emch/sgi/controller/DashboardController.java` | Create |
| `src/test/java/pe/edu/emch/sgi/controller/DashboardControllerTest.java` | Create |

---

### Task 1: View entities + repositories

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/entity/DashboardResumen.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/InventarioCompleto.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/StockCritico.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/TicketsActivos.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/DashboardResumenRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/InventarioCompletoRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/StockCriticoRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/TicketsActivosRepository.java`

**Context:**
- `ddl-auto=validate` — Hibernate validates Java types against MySQL column types
- MySQL type mappings: `TINYINT(1)` → `Boolean`, plain `TINYINT` → `Integer` (add `columnDefinition = "TINYINT"`), `SMALLINT` → `Integer` (add `columnDefinition = "SMALLINT"`), `DECIMAL` → `BigDecimal`, `DATE` → `LocalDate`, `TIMESTAMP` → `LocalDateTime`
- Entity pattern para vistas: `@Getter @NoArgsConstructor` (sin `@Setter` porque son inmutables), más `@org.hibernate.annotations.Immutable`
- Las vistas no tienen secuencias de autoincremento, entonces NO usar `@GeneratedValue`
- `v_dashboard_resumen` no tiene PK numérico → usar `nombre_tipo` (String) como `@Id`

- [ ] **Step 1: Crear `DashboardResumen.java`**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

@Entity
@Immutable
@Table(name = "v_dashboard_resumen")
@Getter
@NoArgsConstructor
public class DashboardResumen {

    @Id
    @Column(name = "nombre_tipo")
    private String nombreTipo;

    @Column(name = "total")
    private Integer total;

    @Column(name = "asignados")
    private Integer asignados;

    @Column(name = "en_bodega")
    private Integer enBodega;

    @Column(name = "en_reparacion")
    private Integer enReparacion;

    @Column(name = "dados_de_baja")
    private Integer dadosDeBaja;

    @Column(name = "stock_operativo")
    private Integer stockOperativo;

    @Column(name = "umbral_stock_pct", columnDefinition = "TINYINT")
    private Integer umbralStockPct;

    @Column(name = "pct_operativo")
    private BigDecimal pctOperativo;

    @Column(name = "equipos_mayores_5_anios")
    private Integer equiposMayores5Anios;
}
```

- [ ] **Step 2: Crear `StockCritico.java`**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

@Entity
@Immutable
@Table(name = "v_stock_critico")
@Getter
@NoArgsConstructor
public class StockCritico {

    @Id
    @Column(name = "id_tipo")
    private Integer idTipo;

    @Column(name = "nombre_tipo")
    private String nombreTipo;

    @Column(name = "total_equipos")
    private Integer totalEquipos;

    @Column(name = "stock_operativo")
    private Integer stockOperativo;

    @Column(name = "umbral_pct", columnDefinition = "TINYINT")
    private Integer umbralPct;

    @Column(name = "pct_actual")
    private BigDecimal pctActual;

    @Column(name = "en_alerta")
    private Boolean enAlerta;
}
```

- [ ] **Step 3: Crear `TicketsActivos.java`**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "v_tickets_activos")
@Getter
@NoArgsConstructor
public class TicketsActivos {

    @Id
    @Column(name = "id_ticket")
    private Integer idTicket;

    @Column(name = "numero_ticket")
    private String numeroTicket;

    @Column(name = "codigo_ejercito")
    private String codigoEjercito;

    @Column(name = "nombre_area")
    private String nombreArea;

    @Column(name = "tecnico")
    private String tecnico;

    @Column(name = "tipo_incidente")
    private String tipoIncidente;

    @Column(name = "titulo")
    private String titulo;

    @Column(name = "estado")
    private String estado;

    @Column(name = "prioridad")
    private String prioridad;

    @Column(name = "fecha_apertura")
    private LocalDateTime fechaApertura;

    @Column(name = "sla_minutos", columnDefinition = "SMALLINT")
    private Integer slaMinutos;

    @Column(name = "minutos_transcurridos")
    private Integer minutosTranscurridos;

    @Column(name = "minutos_restantes_sla")
    private Integer minutosRestantesSla;

    @Column(name = "sla_vencido")
    private Boolean slaVencido;

    @Column(name = "fuera_de_sla")
    private Boolean fueraDeSla;
}
```

- [ ] **Step 4: Crear `InventarioCompleto.java`**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Immutable
@Table(name = "v_inventario_completo")
@Getter
@NoArgsConstructor
public class InventarioCompleto {

    @Id
    @Column(name = "id_equipo")
    private Integer idEquipo;

    @Column(name = "codigo_ejercito")
    private String codigoEjercito;

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "marca")
    private String marca;

    @Column(name = "modelo")
    private String modelo;

    @Column(name = "codigo_area")
    private String codigoArea;

    @Column(name = "area")
    private String area;

    @Column(name = "nombre_so")
    private String nombreSo;

    @Column(name = "version_so")
    private String versionSo;

    @Column(name = "numero_serie")
    private String numeroSerie;

    @Column(name = "nombre_responsable")
    private String nombreResponsable;

    @Column(name = "mac_address")
    private String macAddress;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "tipo_red")
    private String tipoRed;

    @Column(name = "estado")
    private String estado;

    @Column(name = "fecha_adquisicion")
    private LocalDate fechaAdquisicion;

    @Column(name = "anios_antiguedad")
    private Integer aniosAntiguedad;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Column(name = "fecha_baja")
    private LocalDate fechaBaja;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "procesador")
    private String procesador;

    @Column(name = "nucleos", columnDefinition = "TINYINT")
    private Integer nucleos;

    @Column(name = "hilos", columnDefinition = "TINYINT")
    private Integer hilos;

    @Column(name = "ram_total_gb", columnDefinition = "SMALLINT")
    private Integer ramTotalGb;

    @Column(name = "ram_marca")
    private String ramMarca;

    @Column(name = "ram_velocidad_mhz", columnDefinition = "SMALLINT")
    private Integer ramVelocidadMhz;

    @Column(name = "disco_capacidad_gb")
    private BigDecimal discoCapacidadGb;

    @Column(name = "disco_usado_gb")
    private BigDecimal discoUsadoGb;

    @Column(name = "disco_libre_gb")
    private BigDecimal discoLibreGb;

    @Column(name = "disco_uso_pct")
    private BigDecimal discoUsoPct;

    @Column(name = "gpu_marca")
    private String gpuMarca;

    @Column(name = "gpu_modelo")
    private String gpuModelo;

    @Column(name = "monitor_marca")
    private String monitorMarca;

    @Column(name = "monitor_modelo")
    private String monitorModelo;
}
```

- [ ] **Step 5: Crear los 4 repositorios**

`src/main/java/pe/edu/emch/sgi/repository/DashboardResumenRepository.java`:
```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.DashboardResumen;

public interface DashboardResumenRepository extends JpaRepository<DashboardResumen, String> {
}
```

`src/main/java/pe/edu/emch/sgi/repository/StockCriticoRepository.java`:
```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.StockCritico;

public interface StockCriticoRepository extends JpaRepository<StockCritico, Integer> {
}
```

`src/main/java/pe/edu/emch/sgi/repository/TicketsActivosRepository.java`:
```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.TicketsActivos;

public interface TicketsActivosRepository extends JpaRepository<TicketsActivos, Integer> {
}
```

`src/main/java/pe/edu/emch/sgi/repository/InventarioCompletoRepository.java`:
```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.InventarioCompleto;

public interface InventarioCompletoRepository extends JpaRepository<InventarioCompleto, Integer> {
    Page<InventarioCompleto> findAll(Pageable pageable);
}
```

- [ ] **Step 6: Compilar**

```
mvn compile -q
```

Expected: BUILD SUCCESS. If Hibernate validate fails at startup (not at compile time), compilation still succeeds here.

- [ ] **Step 7: Commit**

```
git add src/main/java/pe/edu/emch/sgi/entity/DashboardResumen.java
git add src/main/java/pe/edu/emch/sgi/entity/InventarioCompleto.java
git add src/main/java/pe/edu/emch/sgi/entity/StockCritico.java
git add src/main/java/pe/edu/emch/sgi/entity/TicketsActivos.java
git add src/main/java/pe/edu/emch/sgi/repository/DashboardResumenRepository.java
git add src/main/java/pe/edu/emch/sgi/repository/InventarioCompletoRepository.java
git add src/main/java/pe/edu/emch/sgi/repository/StockCriticoRepository.java
git add src/main/java/pe/edu/emch/sgi/repository/TicketsActivosRepository.java
git commit -m "feat(dashboard): add view entities and repositories"
```

---

### Task 2: DTOs

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/dto/dashboard/DashboardResumenResponse.java`
- Create: `src/main/java/pe/edu/emch/sgi/dto/dashboard/InventarioCompletoResponse.java`
- Create: `src/main/java/pe/edu/emch/sgi/dto/dashboard/StockCriticoResponse.java`
- Create: `src/main/java/pe/edu/emch/sgi/dto/dashboard/TicketsActivosResponse.java`

**Context:**
- Package `dto/dashboard` no existe — crearlo al crear el primer archivo
- Response DTOs usan solo `@Data`, sin validaciones
- Los campos son copia exacta de los campos de las entidades (mismos tipos)

- [ ] **Step 1: Crear `DashboardResumenResponse.java`**

```java
package pe.edu.emch.sgi.dto.dashboard;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DashboardResumenResponse {
    private String nombreTipo;
    private Integer total;
    private Integer asignados;
    private Integer enBodega;
    private Integer enReparacion;
    private Integer dadosDeBaja;
    private Integer stockOperativo;
    private Integer umbralStockPct;
    private BigDecimal pctOperativo;
    private Integer equiposMayores5Anios;
}
```

- [ ] **Step 2: Crear `StockCriticoResponse.java`**

```java
package pe.edu.emch.sgi.dto.dashboard;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockCriticoResponse {
    private Integer idTipo;
    private String nombreTipo;
    private Integer totalEquipos;
    private Integer stockOperativo;
    private Integer umbralPct;
    private BigDecimal pctActual;
    private Boolean enAlerta;
}
```

- [ ] **Step 3: Crear `TicketsActivosResponse.java`**

```java
package pe.edu.emch.sgi.dto.dashboard;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketsActivosResponse {
    private Integer idTicket;
    private String numeroTicket;
    private String codigoEjercito;
    private String nombreArea;
    private String tecnico;
    private String tipoIncidente;
    private String titulo;
    private String estado;
    private String prioridad;
    private LocalDateTime fechaApertura;
    private Integer slaMinutos;
    private Integer minutosTranscurridos;
    private Integer minutosRestantesSla;
    private Boolean slaVencido;
    private Boolean fueraDeSla;
}
```

- [ ] **Step 4: Crear `InventarioCompletoResponse.java`**

```java
package pe.edu.emch.sgi.dto.dashboard;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InventarioCompletoResponse {
    private Integer idEquipo;
    private String codigoEjercito;
    private String tipo;
    private String marca;
    private String modelo;
    private String codigoArea;
    private String area;
    private String nombreSo;
    private String versionSo;
    private String numeroSerie;
    private String nombreResponsable;
    private String macAddress;
    private String ipAddress;
    private String tipoRed;
    private String estado;
    private LocalDate fechaAdquisicion;
    private Integer aniosAntiguedad;
    private LocalDate fechaRegistro;
    private LocalDate fechaBaja;
    private String observaciones;
    private String procesador;
    private Integer nucleos;
    private Integer hilos;
    private Integer ramTotalGb;
    private String ramMarca;
    private Integer ramVelocidadMhz;
    private BigDecimal discoCapacidadGb;
    private BigDecimal discoUsadoGb;
    private BigDecimal discoLibreGb;
    private BigDecimal discoUsoPct;
    private String gpuMarca;
    private String gpuModelo;
    private String monitorMarca;
    private String monitorModelo;
}
```

- [ ] **Step 5: Compilar**

```
mvn compile -q
```

Expected: BUILD SUCCESS

- [ ] **Step 6: Commit**

```
git add src/main/java/pe/edu/emch/sgi/dto/dashboard/
git commit -m "feat(dashboard): add dashboard response DTOs"
```

---

### Task 3: DashboardService + DashboardServiceTest

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/service/DashboardService.java`
- Create: `src/test/java/pe/edu/emch/sgi/service/DashboardServiceTest.java`

**Context:**
- Patrón de test: `@ExtendWith(MockitoExtension.class)`, `@InjectMocks DashboardService`
- El servicio no extrae `idUsuarioActivo` — todos los métodos son sin parámetros (o solo Pageable)
- `listarResumen()` y `listarStockCritico()` y `listarTicketsActivos()` retornan `List<...Response>`
- `listarInventario(Pageable)` retorna `PagedResponse<InventarioCompletoResponse>`
- Mapeo manual en métodos privados `toResumenResponse`, `toInventarioResponse`, `toStockCriticoResponse`, `toTicketsActivosResponse`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/test/java/pe/edu/emch/sgi/service/DashboardServiceTest.java`:

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
import pe.edu.emch.sgi.dto.dashboard.DashboardResumenResponse;
import pe.edu.emch.sgi.dto.dashboard.InventarioCompletoResponse;
import pe.edu.emch.sgi.dto.dashboard.StockCriticoResponse;
import pe.edu.emch.sgi.dto.dashboard.TicketsActivosResponse;
import pe.edu.emch.sgi.entity.DashboardResumen;
import pe.edu.emch.sgi.entity.InventarioCompleto;
import pe.edu.emch.sgi.entity.StockCritico;
import pe.edu.emch.sgi.entity.TicketsActivos;
import pe.edu.emch.sgi.repository.DashboardResumenRepository;
import pe.edu.emch.sgi.repository.InventarioCompletoRepository;
import pe.edu.emch.sgi.repository.StockCriticoRepository;
import pe.edu.emch.sgi.repository.TicketsActivosRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock DashboardResumenRepository dashboardResumenRepository;
    @Mock InventarioCompletoRepository inventarioCompletoRepository;
    @Mock StockCriticoRepository stockCriticoRepository;
    @Mock TicketsActivosRepository ticketsActivosRepository;

    @InjectMocks DashboardService dashboardService;

    private DashboardResumen resumen;
    private InventarioCompleto inventario;
    private StockCritico stockCritico;
    private TicketsActivos ticketsActivos;

    @BeforeEach
    void setUp() throws Exception {
        resumen = buildResumen();
        inventario = buildInventario();
        stockCritico = buildStockCritico();
        ticketsActivos = buildTicketsActivos();
    }

    @Test
    void listarResumen_retornaLista() {
        when(dashboardResumenRepository.findAll()).thenReturn(List.of(resumen));

        List<DashboardResumenResponse> result = dashboardService.listarResumen();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreTipo()).isEqualTo("LAPTOP");
        assertThat(result.get(0).getTotal()).isEqualTo(10);
    }

    @Test
    void listarInventario_retornaPaged() {
        Page<InventarioCompleto> page = new PageImpl<>(List.of(inventario));
        when(inventarioCompletoRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        var result = dashboardService.listarInventario(PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCodigoEjercito()).isEqualTo("EQ-001");
    }

    @Test
    void listarStockCritico_retornaLista() {
        when(stockCriticoRepository.findAll()).thenReturn(List.of(stockCritico));

        List<StockCriticoResponse> result = dashboardService.listarStockCritico();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreTipo()).isEqualTo("LAPTOP");
        assertThat(result.get(0).getEnAlerta()).isTrue();
    }

    @Test
    void listarTicketsActivos_retornaLista() {
        when(ticketsActivosRepository.findAll()).thenReturn(List.of(ticketsActivos));

        List<TicketsActivosResponse> result = dashboardService.listarTicketsActivos();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNumeroTicket()).isEqualTo("TKT-202601-0001");
        assertThat(result.get(0).getSlaVencido()).isFalse();
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private DashboardResumen buildResumen() throws Exception {
        DashboardResumen r = new DashboardResumen();
        setField(r, "nombreTipo", "LAPTOP");
        setField(r, "total", 10);
        setField(r, "asignados", 5);
        setField(r, "enBodega", 3);
        setField(r, "enReparacion", 1);
        setField(r, "dadosDeBaja", 1);
        setField(r, "stockOperativo", 9);
        setField(r, "umbralStockPct", 80);
        setField(r, "pctOperativo", new BigDecimal("90.0"));
        setField(r, "equiposMayores5Anios", 2);
        return r;
    }

    private InventarioCompleto buildInventario() throws Exception {
        InventarioCompleto i = new InventarioCompleto();
        setField(i, "idEquipo", 1);
        setField(i, "codigoEjercito", "EQ-001");
        setField(i, "tipo", "LAPTOP");
        setField(i, "marca", "Dell");
        setField(i, "modelo", "Latitude 5420");
        setField(i, "estado", "ASIGNADO");
        return i;
    }

    private StockCritico buildStockCritico() throws Exception {
        StockCritico s = new StockCritico();
        setField(s, "idTipo", 1);
        setField(s, "nombreTipo", "LAPTOP");
        setField(s, "totalEquipos", 10);
        setField(s, "stockOperativo", 7);
        setField(s, "umbralPct", 80);
        setField(s, "pctActual", new BigDecimal("70.0"));
        setField(s, "enAlerta", true);
        return s;
    }

    private TicketsActivos buildTicketsActivos() throws Exception {
        TicketsActivos t = new TicketsActivos();
        setField(t, "idTicket", 1);
        setField(t, "numeroTicket", "TKT-202601-0001");
        setField(t, "codigoEjercito", "EQ-001");
        setField(t, "estado", "ABIERTO");
        setField(t, "prioridad", "ALTA");
        setField(t, "fechaApertura", LocalDateTime.of(2026, 1, 15, 9, 0));
        setField(t, "slaMinutos", 480);
        setField(t, "minutosTranscurridos", 120);
        setField(t, "minutosRestantesSla", 360);
        setField(t, "slaVencido", false);
        setField(t, "fueraDeSla", false);
        return t;
    }

    private void setField(Object obj, String fieldName, Object value) throws Exception {
        var field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}
```

- [ ] **Step 2: Ejecutar tests para confirmar que fallan**

```
mvn test -pl . -Dtest=DashboardServiceTest -q
```

Expected: FAIL — `DashboardService` no existe aún

- [ ] **Step 3: Crear `DashboardService.java`**

```java
package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.dashboard.DashboardResumenResponse;
import pe.edu.emch.sgi.dto.dashboard.InventarioCompletoResponse;
import pe.edu.emch.sgi.dto.dashboard.StockCriticoResponse;
import pe.edu.emch.sgi.dto.dashboard.TicketsActivosResponse;
import pe.edu.emch.sgi.entity.DashboardResumen;
import pe.edu.emch.sgi.entity.InventarioCompleto;
import pe.edu.emch.sgi.entity.StockCritico;
import pe.edu.emch.sgi.entity.TicketsActivos;
import pe.edu.emch.sgi.repository.DashboardResumenRepository;
import pe.edu.emch.sgi.repository.InventarioCompletoRepository;
import pe.edu.emch.sgi.repository.StockCriticoRepository;
import pe.edu.emch.sgi.repository.TicketsActivosRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardResumenRepository dashboardResumenRepository;
    private final InventarioCompletoRepository inventarioCompletoRepository;
    private final StockCriticoRepository stockCriticoRepository;
    private final TicketsActivosRepository ticketsActivosRepository;

    @Transactional(readOnly = true)
    public List<DashboardResumenResponse> listarResumen() {
        return dashboardResumenRepository.findAll().stream()
                .map(this::toResumenResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<InventarioCompletoResponse> listarInventario(Pageable pageable) {
        return new PagedResponse<>(inventarioCompletoRepository.findAll(pageable)
                .map(this::toInventarioResponse));
    }

    @Transactional(readOnly = true)
    public List<StockCriticoResponse> listarStockCritico() {
        return stockCriticoRepository.findAll().stream()
                .map(this::toStockCriticoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketsActivosResponse> listarTicketsActivos() {
        return ticketsActivosRepository.findAll().stream()
                .map(this::toTicketsActivosResponse)
                .toList();
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private DashboardResumenResponse toResumenResponse(DashboardResumen e) {
        DashboardResumenResponse r = new DashboardResumenResponse();
        r.setNombreTipo(e.getNombreTipo());
        r.setTotal(e.getTotal());
        r.setAsignados(e.getAsignados());
        r.setEnBodega(e.getEnBodega());
        r.setEnReparacion(e.getEnReparacion());
        r.setDadosDeBaja(e.getDadosDeBaja());
        r.setStockOperativo(e.getStockOperativo());
        r.setUmbralStockPct(e.getUmbralStockPct());
        r.setPctOperativo(e.getPctOperativo());
        r.setEquiposMayores5Anios(e.getEquiposMayores5Anios());
        return r;
    }

    private StockCriticoResponse toStockCriticoResponse(StockCritico e) {
        StockCriticoResponse r = new StockCriticoResponse();
        r.setIdTipo(e.getIdTipo());
        r.setNombreTipo(e.getNombreTipo());
        r.setTotalEquipos(e.getTotalEquipos());
        r.setStockOperativo(e.getStockOperativo());
        r.setUmbralPct(e.getUmbralPct());
        r.setPctActual(e.getPctActual());
        r.setEnAlerta(e.getEnAlerta());
        return r;
    }

    private TicketsActivosResponse toTicketsActivosResponse(TicketsActivos e) {
        TicketsActivosResponse r = new TicketsActivosResponse();
        r.setIdTicket(e.getIdTicket());
        r.setNumeroTicket(e.getNumeroTicket());
        r.setCodigoEjercito(e.getCodigoEjercito());
        r.setNombreArea(e.getNombreArea());
        r.setTecnico(e.getTecnico());
        r.setTipoIncidente(e.getTipoIncidente());
        r.setTitulo(e.getTitulo());
        r.setEstado(e.getEstado());
        r.setPrioridad(e.getPrioridad());
        r.setFechaApertura(e.getFechaApertura());
        r.setSlaMinutos(e.getSlaMinutos());
        r.setMinutosTranscurridos(e.getMinutosTranscurridos());
        r.setMinutosRestantesSla(e.getMinutosRestantesSla());
        r.setSlaVencido(e.getSlaVencido());
        r.setFueraDeSla(e.getFueraDeSla());
        return r;
    }

    private InventarioCompletoResponse toInventarioResponse(InventarioCompleto e) {
        InventarioCompletoResponse r = new InventarioCompletoResponse();
        r.setIdEquipo(e.getIdEquipo());
        r.setCodigoEjercito(e.getCodigoEjercito());
        r.setTipo(e.getTipo());
        r.setMarca(e.getMarca());
        r.setModelo(e.getModelo());
        r.setCodigoArea(e.getCodigoArea());
        r.setArea(e.getArea());
        r.setNombreSo(e.getNombreSo());
        r.setVersionSo(e.getVersionSo());
        r.setNumeroSerie(e.getNumeroSerie());
        r.setNombreResponsable(e.getNombreResponsable());
        r.setMacAddress(e.getMacAddress());
        r.setIpAddress(e.getIpAddress());
        r.setTipoRed(e.getTipoRed());
        r.setEstado(e.getEstado());
        r.setFechaAdquisicion(e.getFechaAdquisicion());
        r.setAniosAntiguedad(e.getAniosAntiguedad());
        r.setFechaRegistro(e.getFechaRegistro());
        r.setFechaBaja(e.getFechaBaja());
        r.setObservaciones(e.getObservaciones());
        r.setProcesador(e.getProcesador());
        r.setNucleos(e.getNucleos());
        r.setHilos(e.getHilos());
        r.setRamTotalGb(e.getRamTotalGb());
        r.setRamMarca(e.getRamMarca());
        r.setRamVelocidadMhz(e.getRamVelocidadMhz());
        r.setDiscoCapacidadGb(e.getDiscoCapacidadGb());
        r.setDiscoUsadoGb(e.getDiscoUsadoGb());
        r.setDiscoLibreGb(e.getDiscoLibreGb());
        r.setDiscoUsoPct(e.getDiscoUsoPct());
        r.setGpuMarca(e.getGpuMarca());
        r.setGpuModelo(e.getGpuModelo());
        r.setMonitorMarca(e.getMonitorMarca());
        r.setMonitorModelo(e.getMonitorModelo());
        return r;
    }
}
```

- [ ] **Step 4: Ejecutar tests para confirmar que pasan**

```
mvn test -pl . -Dtest=DashboardServiceTest -q
```

Expected: BUILD SUCCESS, 4 tests passing.

- [ ] **Step 5: Commit**

```
git add src/main/java/pe/edu/emch/sgi/service/DashboardService.java
git add src/test/java/pe/edu/emch/sgi/service/DashboardServiceTest.java
git commit -m "feat(dashboard): add DashboardService with 4 unit tests"
```

---

### Task 4: DashboardController + DashboardControllerTest

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/controller/DashboardController.java`
- Create: `src/test/java/pe/edu/emch/sgi/controller/DashboardControllerTest.java`

**Context:**
- Patrón: `@WebMvcTest(DashboardController.class)` + `@Import(SecurityConfig.class)` + `@MockBean` para JwtUtil, UserDetailsServiceImpl, JwtAuthFilter, AuditSessionInterceptor
- `@BeforeEach` stub JWT filter passthrough + `auditSessionInterceptor.preHandle` retorna true
- Todos los endpoints requieren `hasRole('ADMINISTRADOR')` — probar 200 con admin, 401 sin autenticación, 403 con usuario sin rol ADMINISTRADOR
- No hay `.with(csrf())` en GET requests
- El servicio no recibe `idUsuario` — los mocks no usan `isNull()`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/test/java/pe/edu/emch/sgi/controller/DashboardControllerTest.java`:

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
import pe.edu.emch.sgi.dto.dashboard.DashboardResumenResponse;
import pe.edu.emch.sgi.dto.dashboard.InventarioCompletoResponse;
import pe.edu.emch.sgi.dto.dashboard.StockCriticoResponse;
import pe.edu.emch.sgi.dto.dashboard.TicketsActivosResponse;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.service.DashboardService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import(SecurityConfig.class)
class DashboardControllerTest {

    @MockBean DashboardService dashboardService;
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
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarResumen_admin_retorna200() throws Exception {
        DashboardResumenResponse resp = new DashboardResumenResponse();
        resp.setNombreTipo("LAPTOP");
        resp.setTotal(10);
        when(dashboardService.listarResumen()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/dashboard/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].nombreTipo").value("LAPTOP"));
    }

    @Test
    void listarResumen_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/dashboard/resumen"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void listarResumen_sinAdmin_retorna403() throws Exception {
        mockMvc.perform(get("/api/dashboard/resumen"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarInventario_admin_retorna200() throws Exception {
        InventarioCompletoResponse resp = new InventarioCompletoResponse();
        resp.setIdEquipo(1);
        resp.setCodigoEjercito("EQ-001");
        PagedResponse<InventarioCompletoResponse> paged =
                new PagedResponse<>(new PageImpl<>(List.of(resp)));
        when(dashboardService.listarInventario(any())).thenReturn(paged);

        mockMvc.perform(get("/api/dashboard/inventario"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].codigoEjercito").value("EQ-001"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarStockCritico_admin_retorna200() throws Exception {
        StockCriticoResponse resp = new StockCriticoResponse();
        resp.setNombreTipo("LAPTOP");
        resp.setEnAlerta(true);
        when(dashboardService.listarStockCritico()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/dashboard/stock-critico"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].enAlerta").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarTicketsActivos_admin_retorna200() throws Exception {
        TicketsActivosResponse resp = new TicketsActivosResponse();
        resp.setNumeroTicket("TKT-202601-0001");
        resp.setEstado("ABIERTO");
        when(dashboardService.listarTicketsActivos()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/dashboard/tickets-activos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].numeroTicket").value("TKT-202601-0001"));
    }
}
```

- [ ] **Step 2: Ejecutar tests para confirmar que fallan**

```
mvn test -pl . -Dtest=DashboardControllerTest -q
```

Expected: FAIL — `DashboardController` no existe aún

- [ ] **Step 3: Crear `DashboardController.java`**

```java
package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.emch.sgi.dto.common.ApiResponse;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.dashboard.DashboardResumenResponse;
import pe.edu.emch.sgi.dto.dashboard.InventarioCompletoResponse;
import pe.edu.emch.sgi.dto.dashboard.StockCriticoResponse;
import pe.edu.emch.sgi.dto.dashboard.TicketsActivosResponse;
import pe.edu.emch.sgi.service.DashboardService;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
@Tag(name = "Dashboard", description = "Vistas agregadas del sistema para administradores")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    @Operation(summary = "Resumen de equipos por tipo")
    public ResponseEntity<ApiResponse<List<DashboardResumenResponse>>> listarResumen() {
        return ResponseEntity.ok(ApiResponse.ok("OK", dashboardService.listarResumen()));
    }

    @GetMapping("/inventario")
    @Operation(summary = "Inventario completo paginado")
    public ResponseEntity<ApiResponse<PagedResponse<InventarioCompletoResponse>>> listarInventario(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("OK", dashboardService.listarInventario(pageable)));
    }

    @GetMapping("/stock-critico")
    @Operation(summary = "Tipos de equipo en alerta de stock crítico")
    public ResponseEntity<ApiResponse<List<StockCriticoResponse>>> listarStockCritico() {
        return ResponseEntity.ok(ApiResponse.ok("OK", dashboardService.listarStockCritico()));
    }

    @GetMapping("/tickets-activos")
    @Operation(summary = "Tickets activos (ABIERTO y EN_PROCESO) con SLA")
    public ResponseEntity<ApiResponse<List<TicketsActivosResponse>>> listarTicketsActivos() {
        return ResponseEntity.ok(ApiResponse.ok("OK", dashboardService.listarTicketsActivos()));
    }
}
```

- [ ] **Step 4: Ejecutar controller + service tests**

```
mvn test -pl . -Dtest=DashboardControllerTest,DashboardServiceTest -q
```

Expected: BUILD SUCCESS, 10 tests passing (6 controller + 4 service).

- [ ] **Step 5: Ejecutar el suite completo**

```
mvn test -q
```

Expected: BUILD SUCCESS, 140 tests passing (130 existentes + 10 nuevos).

- [ ] **Step 6: Commit**

```
git add src/main/java/pe/edu/emch/sgi/controller/DashboardController.java
git add src/test/java/pe/edu/emch/sgi/controller/DashboardControllerTest.java
git commit -m "feat(dashboard): add DashboardController with 6 controller tests"
```

---

## Verificación end-to-end

1. `mvn test -q` → 140 tests, 0 failures
2. `mvn compile -q` → BUILD SUCCESS
3. Confirmar que los 4 view entities están correctamente nombrados contra las vistas MySQL:
   - `v_dashboard_resumen` → `DashboardResumen`
   - `v_inventario_completo` → `InventarioCompleto`
   - `v_stock_critico` → `StockCritico`
   - `v_tickets_activos` → `TicketsActivos`
4. Verificar que los endpoints responden correctamente en Swagger UI (`/swagger-ui.html`) cuando se conecta a la BD real
