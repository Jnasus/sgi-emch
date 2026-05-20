# Módulo Catálogos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar todos los endpoints de `/api/catalogos` — lectura de tablas maestras (áreas, tipos de equipo, marcas, modelos, SOs, tipos de incidente) más CRUD para ADMINISTRADOR y configuración de stock/SLA.

**Architecture:** Seguir el patrón Entity → Repository → DTO → Service → Controller ya establecido en el proyecto. El servicio lanza `DuplicateResourceException` / `ResourceNotFoundException` que el `GlobalExceptionHandler` existente captura. Todo acceso a datos usa JPA repositories. La seguridad JWT y la auditoría de sesión ya están operativas.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring Security (`@PreAuthorize`), JPA/Hibernate, Lombok, SpringDoc OpenAPI 3, JUnit 5 + Mockito + MockMvc.

---

## Contexto crítico del proyecto

- **Base package:** `pe.edu.emch.sgi`
- **Working directory:** `C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\backend`
- **ddl-auto=validate** — los nombres de columna DEBEN coincidir exactamente con el SQL
- Los imports ya existentes que el subagente necesita:
  - `pe.edu.emch.sgi.dto.common.ApiResponse`
  - `pe.edu.emch.sgi.exception.ResourceNotFoundException`
  - `pe.edu.emch.sgi.exception.DuplicateResourceException`
  - `pe.edu.emch.sgi.entity.Area` (existe), `pe.edu.emch.sgi.entity.Usuario` (existe)
  - `pe.edu.emch.sgi.repository.AreaRepository` (existe con `findByActivoTrue()`)
  - `pe.edu.emch.sgi.repository.UsuarioRepository` (existe)
  - `pe.edu.emch.sgi.security.JwtUtil` (existe)
  - `pe.edu.emch.sgi.security.UserDetailsServiceImpl` (existe)
  - `pe.edu.emch.sgi.security.JwtAuthFilter` (existe)
- El test command es: `mvn test -Dtest=NombreTest`
- Para compilar sin tests: `mvn compile -q`

---

## Mapa de archivos

| Archivo | Acción |
|---|---|
| `entity/TipoEquipo.java` | Crear |
| `entity/Marca.java` | Crear |
| `entity/ModeloEquipo.java` | Crear |
| `entity/SistemaOperativo.java` | Crear |
| `entity/TipoIncidente.java` | Crear |
| `entity/ConfigStock.java` | Crear |
| `repository/TipoEquipoRepository.java` | Crear |
| `repository/MarcaRepository.java` | Crear |
| `repository/ModeloEquipoRepository.java` | Crear |
| `repository/SistemaOperativoRepository.java` | Crear |
| `repository/TipoIncidenteRepository.java` | Crear |
| `repository/ConfigStockRepository.java` | Crear |
| `dto/catalogo/AreaResponse.java` | Crear |
| `dto/catalogo/TipoEquipoRequest.java` | Crear |
| `dto/catalogo/TipoEquipoResponse.java` | Crear |
| `dto/catalogo/MarcaRequest.java` | Crear |
| `dto/catalogo/MarcaResponse.java` | Crear |
| `dto/catalogo/ModeloRequest.java` | Crear |
| `dto/catalogo/ModeloResponse.java` | Crear |
| `dto/catalogo/SistemaOperativoResponse.java` | Crear |
| `dto/catalogo/TipoIncidenteResponse.java` | Crear |
| `dto/catalogo/ConfigStockRequest.java` | Crear |
| `dto/catalogo/ConfigStockResponse.java` | Crear |
| `dto/catalogo/SlaConfigRequest.java` | Crear |
| `service/CatalogoService.java` | Crear |
| `controller/CatalogoController.java` | Crear |
| `src/test/java/pe/edu/emch/sgi/service/CatalogoServiceTest.java` | Crear |
| `src/test/java/pe/edu/emch/sgi/controller/CatalogoControllerTest.java` | Crear |

---

## Task 1: Entidades de catálogos

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/entity/TipoEquipo.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/Marca.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/ModeloEquipo.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/SistemaOperativo.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/TipoIncidente.java`
- Create: `src/main/java/pe/edu/emch/sgi/entity/ConfigStock.java`

- [ ] **Step 1: Crear TipoEquipo.java**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipo_equipo")
@Getter @Setter @NoArgsConstructor
public class TipoEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo")
    private Integer idTipo;

    @Column(name = "nombre_tipo", nullable = false, unique = true, length = 50)
    private String nombreTipo;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}
```

- [ ] **Step 2: Crear Marca.java**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "marca")
@Getter @Setter @NoArgsConstructor
public class Marca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_marca")
    private Integer idMarca;

    @Column(name = "nombre_marca", nullable = false, unique = true, length = 80)
    private String nombreMarca;
}
```

- [ ] **Step 3: Crear ModeloEquipo.java**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "modelo_equipo")
@Getter @Setter @NoArgsConstructor
public class ModeloEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modelo")
    private Integer idModelo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_marca", nullable = false)
    private Marca marca;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoEquipo tipo;

    @Column(name = "nombre_modelo", nullable = false, length = 100)
    private String nombreModelo;
}
```

- [ ] **Step 4: Crear SistemaOperativo.java**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sistema_operativo")
@Getter @Setter @NoArgsConstructor
public class SistemaOperativo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_so")
    private Integer idSo;

    @Column(name = "nombre_so", nullable = false, length = 80)
    private String nombreSo;

    @Column(name = "version_so", nullable = false, length = 50)
    private String versionSo;
}
```

- [ ] **Step 5: Crear TipoIncidente.java**

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipo_incidente")
@Getter @Setter @NoArgsConstructor
public class TipoIncidente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_incidente")
    private Integer idTipoIncidente;

    @Column(name = "nombre_tipo", nullable = false, unique = true, length = 50)
    private String nombreTipo;

    @Column(name = "tiempo_respuesta_min", nullable = false)
    private Integer tiempoRespuestaMin;

    @Column(name = "tiempo_resolucion_min", nullable = false)
    private Integer tiempoResolucionMin;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}
```

- [ ] **Step 6: Crear ConfigStock.java**

Nota: `fecha_modificacion` tiene `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` en MySQL — usar `insertable=false, updatable=false` para que MySQL lo gestione automáticamente.

```java
package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "config_stock")
@Getter @Setter @NoArgsConstructor
public class ConfigStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Integer idConfig;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoEquipo tipo;

    @Column(name = "umbral_pct", nullable = false)
    private Short umbralPct;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario_config", nullable = false)
    private Usuario usuarioConfig;

    @Column(name = "fecha_modificacion", insertable = false, updatable = false)
    private LocalDateTime fechaModificacion;
}
```

- [ ] **Step 7: Verificar compilación**

```
mvn compile -q
```

Expected: BUILD SUCCESS sin errores.

- [ ] **Step 8: Commit**

```
git add src/main/java/pe/edu/emch/sgi/entity/TipoEquipo.java src/main/java/pe/edu/emch/sgi/entity/Marca.java src/main/java/pe/edu/emch/sgi/entity/ModeloEquipo.java src/main/java/pe/edu/emch/sgi/entity/SistemaOperativo.java src/main/java/pe/edu/emch/sgi/entity/TipoIncidente.java src/main/java/pe/edu/emch/sgi/entity/ConfigStock.java
git commit -m "feat(catalogos): add catalog entities"
```

---

## Task 2: Repositories y DTOs

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/repository/TipoEquipoRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/MarcaRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/ModeloEquipoRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/SistemaOperativoRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/TipoIncidenteRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/repository/ConfigStockRepository.java`
- Create: `src/main/java/pe/edu/emch/sgi/dto/catalogo/*.java` (11 DTOs)

- [ ] **Step 1: Crear TipoEquipoRepository.java**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.TipoEquipo;

public interface TipoEquipoRepository extends JpaRepository<TipoEquipo, Integer> {
    boolean existsByNombreTipo(String nombreTipo);
    boolean existsByNombreTipoAndIdTipoNot(String nombreTipo, Integer idTipo);
}
```

- [ ] **Step 2: Crear MarcaRepository.java**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Marca;

public interface MarcaRepository extends JpaRepository<Marca, Integer> {
    boolean existsByNombreMarca(String nombreMarca);
    boolean existsByNombreMarcaAndIdMarcaNot(String nombreMarca, Integer idMarca);
}
```

- [ ] **Step 3: Crear ModeloEquipoRepository.java**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.ModeloEquipo;

import java.util.List;

public interface ModeloEquipoRepository extends JpaRepository<ModeloEquipo, Integer> {
    List<ModeloEquipo> findByMarca_IdMarca(Integer idMarca);
    boolean existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModelo(
            Integer idMarca, Integer idTipo, String nombreModelo);
    boolean existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModeloAndIdModeloNot(
            Integer idMarca, Integer idTipo, String nombreModelo, Integer idModelo);
}
```

- [ ] **Step 4: Crear SistemaOperativoRepository.java**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.SistemaOperativo;

public interface SistemaOperativoRepository extends JpaRepository<SistemaOperativo, Integer> {
}
```

- [ ] **Step 5: Crear TipoIncidenteRepository.java**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.TipoIncidente;

public interface TipoIncidenteRepository extends JpaRepository<TipoIncidente, Integer> {
}
```

- [ ] **Step 6: Crear ConfigStockRepository.java**

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.ConfigStock;

import java.util.Optional;

public interface ConfigStockRepository extends JpaRepository<ConfigStock, Integer> {
    Optional<ConfigStock> findByTipo_IdTipo(Integer idTipo);
}
```

- [ ] **Step 7: Crear DTOs en `src/main/java/pe/edu/emch/sgi/dto/catalogo/`**

Crear los 11 archivos siguientes:

**AreaResponse.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class AreaResponse {
    private Integer idArea;
    private String codigoArea;
    private String nombreArea;
    private String descripcion;
    private Integer anioVigencia;
}
```

**TipoEquipoRequest.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TipoEquipoRequest {
    @NotBlank(message = "El nombre del tipo es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
    private String nombreTipo;

    @Size(max = 255)
    private String descripcion;
}
```

**TipoEquipoResponse.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class TipoEquipoResponse {
    private Integer idTipo;
    private String nombreTipo;
    private String descripcion;
}
```

**MarcaRequest.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MarcaRequest {
    @NotBlank(message = "El nombre de la marca es obligatorio")
    @Size(max = 80, message = "El nombre no puede superar 80 caracteres")
    private String nombreMarca;
}
```

**MarcaResponse.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class MarcaResponse {
    private Integer idMarca;
    private String nombreMarca;
}
```

**ModeloRequest.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ModeloRequest {
    @NotNull(message = "La marca es obligatoria")
    private Integer idMarca;

    @NotNull(message = "El tipo de equipo es obligatorio")
    private Integer idTipo;

    @NotBlank(message = "El nombre del modelo es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombreModelo;
}
```

**ModeloResponse.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class ModeloResponse {
    private Integer idModelo;
    private Integer idMarca;
    private String nombreMarca;
    private Integer idTipo;
    private String nombreTipo;
    private String nombreModelo;
}
```

**SistemaOperativoResponse.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class SistemaOperativoResponse {
    private Integer idSo;
    private String nombreSo;
    private String versionSo;
}
```

**TipoIncidenteResponse.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class TipoIncidenteResponse {
    private Integer idTipoIncidente;
    private String nombreTipo;
    private Integer tiempoRespuestaMin;
    private Integer tiempoResolucionMin;
    private String descripcion;
}
```

**ConfigStockRequest.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConfigStockRequest {
    @NotNull(message = "El umbral es obligatorio")
    @Min(value = 1, message = "El umbral mínimo es 1%")
    @Max(value = 100, message = "El umbral máximo es 100%")
    private Short umbralPct;
}
```

**ConfigStockResponse.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConfigStockResponse {
    private Integer idConfig;
    private Integer idTipo;
    private String nombreTipo;
    private Short umbralPct;
    private LocalDateTime fechaModificacion;
}
```

**SlaConfigRequest.java:**
```java
package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SlaConfigRequest {
    @NotNull(message = "El tiempo de respuesta es obligatorio")
    @Min(value = 1, message = "El tiempo mínimo es 1 minuto")
    private Integer tiempoRespuestaMin;

    @NotNull(message = "El tiempo de resolución es obligatorio")
    @Min(value = 1, message = "El tiempo mínimo es 1 minuto")
    private Integer tiempoResolucionMin;
}
```

- [ ] **Step 8: Verificar compilación**

```
mvn compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 9: Commit**

```
git add src/main/java/pe/edu/emch/sgi/repository/TipoEquipoRepository.java src/main/java/pe/edu/emch/sgi/repository/MarcaRepository.java src/main/java/pe/edu/emch/sgi/repository/ModeloEquipoRepository.java src/main/java/pe/edu/emch/sgi/repository/SistemaOperativoRepository.java src/main/java/pe/edu/emch/sgi/repository/TipoIncidenteRepository.java src/main/java/pe/edu/emch/sgi/repository/ConfigStockRepository.java src/main/java/pe/edu/emch/sgi/dto/
git commit -m "feat(catalogos): add repositories and DTOs"
```

---

## Task 3: CatalogoService

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/service/CatalogoService.java`
- Create: `src/test/java/pe/edu/emch/sgi/service/CatalogoServiceTest.java`

- [ ] **Step 1: Escribir el test primero (TDD)**

Crear `src/test/java/pe/edu/emch/sgi/service/CatalogoServiceTest.java`:

```java
package pe.edu.emch.sgi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.emch.sgi.dto.catalogo.*;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.exception.DuplicateResourceException;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogoServiceTest {

    @Mock AreaRepository areaRepository;
    @Mock TipoEquipoRepository tipoEquipoRepository;
    @Mock MarcaRepository marcaRepository;
    @Mock ModeloEquipoRepository modeloEquipoRepository;
    @Mock SistemaOperativoRepository sistemaOperativoRepository;
    @Mock TipoIncidenteRepository tipoIncidenteRepository;
    @Mock ConfigStockRepository configStockRepository;
    @Mock UsuarioRepository usuarioRepository;

    @InjectMocks CatalogoService catalogoService;

    private Area areaActiva;
    private TipoEquipo tipoEquipo;
    private Marca marca;
    private ModeloEquipo modelo;
    private SistemaOperativo so;
    private TipoIncidente tipoIncidente;
    private ConfigStock configStock;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        areaActiva = new Area();
        areaActiva.setIdArea(1);
        areaActiva.setCodigoArea("DTIC");
        areaActiva.setNombreArea("Departamento TIC");
        areaActiva.setAnioVigencia(LocalDate.of(2024, 1, 1));
        areaActiva.setActivo(true);

        tipoEquipo = new TipoEquipo();
        tipoEquipo.setIdTipo(1);
        tipoEquipo.setNombreTipo("Laptop");

        marca = new Marca();
        marca.setIdMarca(1);
        marca.setNombreMarca("Dell");

        modelo = new ModeloEquipo();
        modelo.setIdModelo(1);
        modelo.setMarca(marca);
        modelo.setTipo(tipoEquipo);
        modelo.setNombreModelo("Latitude 5420");

        so = new SistemaOperativo();
        so.setIdSo(1);
        so.setNombreSo("Windows");
        so.setVersionSo("11 Pro");

        tipoIncidente = new TipoIncidente();
        tipoIncidente.setIdTipoIncidente(1);
        tipoIncidente.setNombreTipo("Fallo de hardware");
        tipoIncidente.setTiempoRespuestaMin(60);
        tipoIncidente.setTiempoResolucionMin(480);

        usuario = new Usuario();
        usuario.setIdUsuario(1);

        configStock = new ConfigStock();
        configStock.setIdConfig(1);
        configStock.setTipo(tipoEquipo);
        configStock.setUmbralPct((short) 20);
        configStock.setUsuarioConfig(usuario);
    }

    @Test
    void listarAreas_retornaAreasActivas() {
        when(areaRepository.findByActivoTrue()).thenReturn(List.of(areaActiva));
        List<AreaResponse> result = catalogoService.listarAreas();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCodigoArea()).isEqualTo("DTIC");
        assertThat(result.get(0).getAnioVigencia()).isEqualTo(2024);
    }

    @Test
    void listarTiposEquipo_retornaLista() {
        when(tipoEquipoRepository.findAll()).thenReturn(List.of(tipoEquipo));
        List<TipoEquipoResponse> result = catalogoService.listarTiposEquipo();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreTipo()).isEqualTo("Laptop");
    }

    @Test
    void crearTipoEquipo_exitoso() {
        TipoEquipoRequest req = new TipoEquipoRequest();
        req.setNombreTipo("Servidor");
        when(tipoEquipoRepository.existsByNombreTipo("Servidor")).thenReturn(false);
        when(tipoEquipoRepository.save(any())).thenAnswer(inv -> {
            TipoEquipo t = inv.getArgument(0);
            t.setIdTipo(2);
            return t;
        });
        TipoEquipoResponse result = catalogoService.crearTipoEquipo(req);
        assertThat(result.getNombreTipo()).isEqualTo("Servidor");
        assertThat(result.getIdTipo()).isEqualTo(2);
    }

    @Test
    void crearTipoEquipo_nombreDuplicado_lanzaExcepcion() {
        TipoEquipoRequest req = new TipoEquipoRequest();
        req.setNombreTipo("Laptop");
        when(tipoEquipoRepository.existsByNombreTipo("Laptop")).thenReturn(true);
        assertThatThrownBy(() -> catalogoService.crearTipoEquipo(req))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void actualizarTipoEquipo_noEncontrado_lanzaExcepcion() {
        when(tipoEquipoRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> catalogoService.actualizarTipoEquipo(99, new TipoEquipoRequest()))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void crearMarca_exitosa() {
        MarcaRequest req = new MarcaRequest();
        req.setNombreMarca("HP");
        when(marcaRepository.existsByNombreMarca("HP")).thenReturn(false);
        when(marcaRepository.save(any())).thenAnswer(inv -> {
            Marca m = inv.getArgument(0);
            m.setIdMarca(2);
            return m;
        });
        MarcaResponse result = catalogoService.crearMarca(req);
        assertThat(result.getNombreMarca()).isEqualTo("HP");
    }

    @Test
    void listarModelos_sinFiltro_retornaTodos() {
        when(modeloEquipoRepository.findAll()).thenReturn(List.of(modelo));
        List<ModeloResponse> result = catalogoService.listarModelos(null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreMarca()).isEqualTo("Dell");
    }

    @Test
    void listarModelos_conFiltroMarca_filtraCorrectamente() {
        when(modeloEquipoRepository.findByMarca_IdMarca(1)).thenReturn(List.of(modelo));
        List<ModeloResponse> result = catalogoService.listarModelos(1);
        assertThat(result).hasSize(1);
    }

    @Test
    void crearModelo_marcaNoExiste_lanzaExcepcion() {
        ModeloRequest req = new ModeloRequest();
        req.setIdMarca(99);
        req.setIdTipo(1);
        req.setNombreModelo("Test");
        when(marcaRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> catalogoService.crearModelo(req))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listarSistemasOperativos_retornaLista() {
        when(sistemaOperativoRepository.findAll()).thenReturn(List.of(so));
        List<SistemaOperativoResponse> result = catalogoService.listarSistemasOperativos();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreSo()).isEqualTo("Windows");
        assertThat(result.get(0).getVersionSo()).isEqualTo("11 Pro");
    }

    @Test
    void listarTiposIncidente_retornaConSla() {
        when(tipoIncidenteRepository.findAll()).thenReturn(List.of(tipoIncidente));
        List<TipoIncidenteResponse> result = catalogoService.listarTiposIncidente();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTiempoResolucionMin()).isEqualTo(480);
    }

    @Test
    void configurarStock_creaConfigNueva() {
        ConfigStockRequest req = new ConfigStockRequest();
        req.setUmbralPct((short) 25);
        when(tipoEquipoRepository.findById(1)).thenReturn(Optional.of(tipoEquipo));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(configStockRepository.findByTipo_IdTipo(1)).thenReturn(Optional.empty());
        when(configStockRepository.save(any())).thenAnswer(inv -> {
            ConfigStock cs = inv.getArgument(0);
            cs.setIdConfig(1);
            return cs;
        });
        ConfigStockResponse result = catalogoService.configurarStock(1, req, 1);
        assertThat(result.getUmbralPct()).isEqualTo((short) 25);
    }

    @Test
    void configurarSla_actualizaTiempos() {
        SlaConfigRequest req = new SlaConfigRequest();
        req.setTiempoRespuestaMin(30);
        req.setTiempoResolucionMin(120);
        when(tipoIncidenteRepository.findById(1)).thenReturn(Optional.of(tipoIncidente));
        when(tipoIncidenteRepository.save(any())).thenReturn(tipoIncidente);
        TipoIncidenteResponse result = catalogoService.configurarSla(1, req);
        assertThat(result.getTiempoRespuestaMin()).isEqualTo(30);
    }

    @Test
    void configurarSla_tipoNoExiste_lanzaExcepcion() {
        when(tipoIncidenteRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> catalogoService.configurarSla(99, new SlaConfigRequest()))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
```

- [ ] **Step 2: Ejecutar el test para verificar que falla (clase no existe)**

```
mvn test -Dtest=CatalogoServiceTest -q 2>&1 | head -20
```

Expected: Error de compilación o tests en FAIL porque `CatalogoService` no existe.

- [ ] **Step 3: Crear CatalogoService.java**

```java
package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.catalogo.*;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.exception.DuplicateResourceException;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogoService {

    private final AreaRepository areaRepository;
    private final TipoEquipoRepository tipoEquipoRepository;
    private final MarcaRepository marcaRepository;
    private final ModeloEquipoRepository modeloEquipoRepository;
    private final SistemaOperativoRepository sistemaOperativoRepository;
    private final TipoIncidenteRepository tipoIncidenteRepository;
    private final ConfigStockRepository configStockRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<AreaResponse> listarAreas() {
        return areaRepository.findByActivoTrue().stream()
            .map(this::toAreaResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TipoEquipoResponse> listarTiposEquipo() {
        return tipoEquipoRepository.findAll().stream()
            .map(this::toTipoEquipoResponse).toList();
    }

    @Transactional
    public TipoEquipoResponse crearTipoEquipo(TipoEquipoRequest request) {
        if (tipoEquipoRepository.existsByNombreTipo(request.getNombreTipo())) {
            throw new DuplicateResourceException(
                "Ya existe un tipo de equipo con nombre: " + request.getNombreTipo());
        }
        TipoEquipo tipo = new TipoEquipo();
        tipo.setNombreTipo(request.getNombreTipo());
        tipo.setDescripcion(request.getDescripcion());
        return toTipoEquipoResponse(tipoEquipoRepository.save(tipo));
    }

    @Transactional
    public TipoEquipoResponse actualizarTipoEquipo(Integer idTipo, TipoEquipoRequest request) {
        TipoEquipo tipo = tipoEquipoRepository.findById(idTipo)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado: " + idTipo));
        if (tipoEquipoRepository.existsByNombreTipoAndIdTipoNot(request.getNombreTipo(), idTipo)) {
            throw new DuplicateResourceException(
                "Ya existe un tipo de equipo con nombre: " + request.getNombreTipo());
        }
        tipo.setNombreTipo(request.getNombreTipo());
        tipo.setDescripcion(request.getDescripcion());
        return toTipoEquipoResponse(tipoEquipoRepository.save(tipo));
    }

    @Transactional(readOnly = true)
    public List<MarcaResponse> listarMarcas() {
        return marcaRepository.findAll().stream()
            .map(this::toMarcaResponse).toList();
    }

    @Transactional
    public MarcaResponse crearMarca(MarcaRequest request) {
        if (marcaRepository.existsByNombreMarca(request.getNombreMarca())) {
            throw new DuplicateResourceException(
                "Ya existe una marca con nombre: " + request.getNombreMarca());
        }
        Marca marca = new Marca();
        marca.setNombreMarca(request.getNombreMarca());
        return toMarcaResponse(marcaRepository.save(marca));
    }

    @Transactional
    public MarcaResponse actualizarMarca(Integer idMarca, MarcaRequest request) {
        Marca marca = marcaRepository.findById(idMarca)
            .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + idMarca));
        if (marcaRepository.existsByNombreMarcaAndIdMarcaNot(request.getNombreMarca(), idMarca)) {
            throw new DuplicateResourceException(
                "Ya existe una marca con nombre: " + request.getNombreMarca());
        }
        marca.setNombreMarca(request.getNombreMarca());
        return toMarcaResponse(marcaRepository.save(marca));
    }

    @Transactional(readOnly = true)
    public List<ModeloResponse> listarModelos(Integer idMarca) {
        List<ModeloEquipo> modelos = (idMarca != null)
            ? modeloEquipoRepository.findByMarca_IdMarca(idMarca)
            : modeloEquipoRepository.findAll();
        return modelos.stream().map(this::toModeloResponse).toList();
    }

    @Transactional
    public ModeloResponse crearModelo(ModeloRequest request) {
        Marca marca = marcaRepository.findById(request.getIdMarca())
            .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + request.getIdMarca()));
        TipoEquipo tipo = tipoEquipoRepository.findById(request.getIdTipo())
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado: " + request.getIdTipo()));
        if (modeloEquipoRepository.existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModelo(
                request.getIdMarca(), request.getIdTipo(), request.getNombreModelo())) {
            throw new DuplicateResourceException("Ya existe ese modelo para la marca y tipo indicados");
        }
        ModeloEquipo modelo = new ModeloEquipo();
        modelo.setMarca(marca);
        modelo.setTipo(tipo);
        modelo.setNombreModelo(request.getNombreModelo());
        return toModeloResponse(modeloEquipoRepository.save(modelo));
    }

    @Transactional
    public ModeloResponse actualizarModelo(Integer idModelo, ModeloRequest request) {
        ModeloEquipo modelo = modeloEquipoRepository.findById(idModelo)
            .orElseThrow(() -> new ResourceNotFoundException("Modelo no encontrado: " + idModelo));
        Marca marca = marcaRepository.findById(request.getIdMarca())
            .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + request.getIdMarca()));
        TipoEquipo tipo = tipoEquipoRepository.findById(request.getIdTipo())
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado: " + request.getIdTipo()));
        if (modeloEquipoRepository.existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModeloAndIdModeloNot(
                request.getIdMarca(), request.getIdTipo(), request.getNombreModelo(), idModelo)) {
            throw new DuplicateResourceException("Ya existe ese modelo para la marca y tipo indicados");
        }
        modelo.setMarca(marca);
        modelo.setTipo(tipo);
        modelo.setNombreModelo(request.getNombreModelo());
        return toModeloResponse(modeloEquipoRepository.save(modelo));
    }

    @Transactional(readOnly = true)
    public List<SistemaOperativoResponse> listarSistemasOperativos() {
        return sistemaOperativoRepository.findAll().stream()
            .map(this::toSoResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TipoIncidenteResponse> listarTiposIncidente() {
        return tipoIncidenteRepository.findAll().stream()
            .map(this::toTipoIncidenteResponse).toList();
    }

    @Transactional
    public ConfigStockResponse configurarStock(Integer idTipo, ConfigStockRequest request, Integer idUsuarioActivo) {
        TipoEquipo tipo = tipoEquipoRepository.findById(idTipo)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado: " + idTipo));
        Usuario usuario = usuarioRepository.findById(idUsuarioActivo)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + idUsuarioActivo));
        ConfigStock config = configStockRepository.findByTipo_IdTipo(idTipo).orElse(new ConfigStock());
        config.setTipo(tipo);
        config.setUmbralPct(request.getUmbralPct());
        config.setUsuarioConfig(usuario);
        return toConfigStockResponse(configStockRepository.save(config));
    }

    @Transactional
    public TipoIncidenteResponse configurarSla(Integer idTipo, SlaConfigRequest request) {
        TipoIncidente tipo = tipoIncidenteRepository.findById(idTipo)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de incidente no encontrado: " + idTipo));
        tipo.setTiempoRespuestaMin(request.getTiempoRespuestaMin());
        tipo.setTiempoResolucionMin(request.getTiempoResolucionMin());
        return toTipoIncidenteResponse(tipoIncidenteRepository.save(tipo));
    }

    // ── Mappers ──────────────────────────────────────────────────────────────────

    private AreaResponse toAreaResponse(Area a) {
        AreaResponse r = new AreaResponse();
        r.setIdArea(a.getIdArea());
        r.setCodigoArea(a.getCodigoArea());
        r.setNombreArea(a.getNombreArea());
        r.setDescripcion(a.getDescripcion());
        r.setAnioVigencia(a.getAnioVigencia().getYear());
        return r;
    }

    private TipoEquipoResponse toTipoEquipoResponse(TipoEquipo t) {
        TipoEquipoResponse r = new TipoEquipoResponse();
        r.setIdTipo(t.getIdTipo());
        r.setNombreTipo(t.getNombreTipo());
        r.setDescripcion(t.getDescripcion());
        return r;
    }

    private MarcaResponse toMarcaResponse(Marca m) {
        MarcaResponse r = new MarcaResponse();
        r.setIdMarca(m.getIdMarca());
        r.setNombreMarca(m.getNombreMarca());
        return r;
    }

    private ModeloResponse toModeloResponse(ModeloEquipo m) {
        ModeloResponse r = new ModeloResponse();
        r.setIdModelo(m.getIdModelo());
        r.setIdMarca(m.getMarca().getIdMarca());
        r.setNombreMarca(m.getMarca().getNombreMarca());
        r.setIdTipo(m.getTipo().getIdTipo());
        r.setNombreTipo(m.getTipo().getNombreTipo());
        r.setNombreModelo(m.getNombreModelo());
        return r;
    }

    private SistemaOperativoResponse toSoResponse(SistemaOperativo s) {
        SistemaOperativoResponse r = new SistemaOperativoResponse();
        r.setIdSo(s.getIdSo());
        r.setNombreSo(s.getNombreSo());
        r.setVersionSo(s.getVersionSo());
        return r;
    }

    private TipoIncidenteResponse toTipoIncidenteResponse(TipoIncidente t) {
        TipoIncidenteResponse r = new TipoIncidenteResponse();
        r.setIdTipoIncidente(t.getIdTipoIncidente());
        r.setNombreTipo(t.getNombreTipo());
        r.setTiempoRespuestaMin(t.getTiempoRespuestaMin());
        r.setTiempoResolucionMin(t.getTiempoResolucionMin());
        r.setDescripcion(t.getDescripcion());
        return r;
    }

    private ConfigStockResponse toConfigStockResponse(ConfigStock c) {
        ConfigStockResponse r = new ConfigStockResponse();
        r.setIdConfig(c.getIdConfig());
        r.setIdTipo(c.getTipo().getIdTipo());
        r.setNombreTipo(c.getTipo().getNombreTipo());
        r.setUmbralPct(c.getUmbralPct());
        r.setFechaModificacion(c.getFechaModificacion());
        return r;
    }
}
```

- [ ] **Step 4: Ejecutar los tests**

```
mvn test -Dtest=CatalogoServiceTest
```

Expected: BUILD SUCCESS, 14 tests passed, 0 failed.

- [ ] **Step 5: Commit**

```
git add src/main/java/pe/edu/emch/sgi/service/CatalogoService.java src/test/java/pe/edu/emch/sgi/service/CatalogoServiceTest.java
git commit -m "feat(catalogos): add CatalogoService with tests"
```

---

## Task 4: CatalogoController + Tests

**Files:**
- Create: `src/main/java/pe/edu/emch/sgi/controller/CatalogoController.java`
- Create: `src/test/java/pe/edu/emch/sgi/controller/CatalogoControllerTest.java`

- [ ] **Step 1: Escribir el test primero**

Crear `src/test/java/pe/edu/emch/sgi/controller/CatalogoControllerTest.java`:

```java
package pe.edu.emch.sgi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.emch.sgi.dto.catalogo.*;
import pe.edu.emch.sgi.service.CatalogoService;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.security.JwtAuthFilter;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CatalogoController.class)
class CatalogoControllerTest {

    @MockBean CatalogoService catalogoService;
    @MockBean JwtUtil jwtUtil;
    @MockBean UserDetailsServiceImpl userDetailsService;
    @MockBean JwtAuthFilter jwtAuthFilter;

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void listarAreas_retornaLista() throws Exception {
        AreaResponse area = new AreaResponse();
        area.setIdArea(1);
        area.setCodigoArea("DTIC");
        area.setNombreArea("Departamento TIC");
        area.setAnioVigencia(2024);
        when(catalogoService.listarAreas()).thenReturn(List.of(area));

        mockMvc.perform(get("/api/catalogos/areas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].codigoArea").value("DTIC"));
    }

    @Test
    @WithMockUser
    void listarTiposEquipo_retornaLista() throws Exception {
        TipoEquipoResponse tipo = new TipoEquipoResponse();
        tipo.setIdTipo(1);
        tipo.setNombreTipo("Laptop");
        when(catalogoService.listarTiposEquipo()).thenReturn(List.of(tipo));

        mockMvc.perform(get("/api/catalogos/tipos-equipo"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].nombreTipo").value("Laptop"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void crearTipoEquipo_adminPuedeCrear() throws Exception {
        TipoEquipoRequest req = new TipoEquipoRequest();
        req.setNombreTipo("Servidor");
        TipoEquipoResponse resp = new TipoEquipoResponse();
        resp.setIdTipo(2);
        resp.setNombreTipo("Servidor");
        when(catalogoService.crearTipoEquipo(any())).thenReturn(resp);

        mockMvc.perform(post("/api/catalogos/tipos-equipo")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.nombreTipo").value("Servidor"));
    }

    @Test
    @WithMockUser(roles = "TECNICO_CAMPO")
    void crearTipoEquipo_noAdminRechazo() throws Exception {
        TipoEquipoRequest req = new TipoEquipoRequest();
        req.setNombreTipo("Servidor");

        mockMvc.perform(post("/api/catalogos/tipos-equipo")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void listarMarcas_retornaLista() throws Exception {
        MarcaResponse marca = new MarcaResponse();
        marca.setIdMarca(1);
        marca.setNombreMarca("Dell");
        when(catalogoService.listarMarcas()).thenReturn(List.of(marca));

        mockMvc.perform(get("/api/catalogos/marcas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].nombreMarca").value("Dell"));
    }

    @Test
    @WithMockUser
    void listarModelos_sinFiltro() throws Exception {
        ModeloResponse modelo = new ModeloResponse();
        modelo.setIdModelo(1);
        modelo.setNombreModelo("Latitude 5420");
        modelo.setNombreMarca("Dell");
        when(catalogoService.listarModelos(null)).thenReturn(List.of(modelo));

        mockMvc.perform(get("/api/catalogos/modelos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].nombreModelo").value("Latitude 5420"));
    }

    @Test
    @WithMockUser
    void listarModelos_conFiltroMarca() throws Exception {
        ModeloResponse modelo = new ModeloResponse();
        modelo.setIdModelo(1);
        modelo.setNombreModelo("Latitude 5420");
        when(catalogoService.listarModelos(1)).thenReturn(List.of(modelo));

        mockMvc.perform(get("/api/catalogos/modelos?marcaId=1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].idModelo").value(1));
    }

    @Test
    @WithMockUser
    void listarSistemasOperativos_retornaLista() throws Exception {
        SistemaOperativoResponse so = new SistemaOperativoResponse();
        so.setIdSo(1);
        so.setNombreSo("Windows");
        so.setVersionSo("11 Pro");
        when(catalogoService.listarSistemasOperativos()).thenReturn(List.of(so));

        mockMvc.perform(get("/api/catalogos/sistemas-operativos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].versionSo").value("11 Pro"));
    }

    @Test
    @WithMockUser
    void listarTiposIncidente_retornaConSla() throws Exception {
        TipoIncidenteResponse ti = new TipoIncidenteResponse();
        ti.setIdTipoIncidente(1);
        ti.setNombreTipo("Fallo hardware");
        ti.setTiempoRespuestaMin(60);
        ti.setTiempoResolucionMin(480);
        when(catalogoService.listarTiposIncidente()).thenReturn(List.of(ti));

        mockMvc.perform(get("/api/catalogos/tipos-incidente"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].tiempoResolucionMin").value(480));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void configurarStock_adminActualizaUmbral() throws Exception {
        ConfigStockRequest req = new ConfigStockRequest();
        req.setUmbralPct((short) 25);
        ConfigStockResponse resp = new ConfigStockResponse();
        resp.setIdConfig(1);
        resp.setUmbralPct((short) 25);
        when(catalogoService.configurarStock(eq(1), any(), any())).thenReturn(resp);

        mockMvc.perform(put("/api/catalogos/stock/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.umbralPct").value(25));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void configurarSla_adminActualizaTiempos() throws Exception {
        SlaConfigRequest req = new SlaConfigRequest();
        req.setTiempoRespuestaMin(30);
        req.setTiempoResolucionMin(120);
        TipoIncidenteResponse resp = new TipoIncidenteResponse();
        resp.setIdTipoIncidente(1);
        resp.setTiempoRespuestaMin(30);
        resp.setTiempoResolucionMin(120);
        when(catalogoService.configurarSla(eq(1), any())).thenReturn(resp);

        mockMvc.perform(put("/api/catalogos/sla/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.tiempoRespuestaMin").value(30));
    }

    @Test
    void listarAreas_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/catalogos/areas"))
            .andExpect(status().isUnauthorized());
    }
}
```

- [ ] **Step 2: Verificar que el test falla (CatalogoController no existe)**

```
mvn test -Dtest=CatalogoControllerTest -q 2>&1 | head -20
```

Expected: Error de compilación porque `CatalogoController` no existe.

- [ ] **Step 3: Crear CatalogoController.java**

```java
package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.emch.sgi.dto.catalogo.*;
import pe.edu.emch.sgi.dto.common.ApiResponse;
import pe.edu.emch.sgi.service.CatalogoService;

import java.util.List;

@RestController
@RequestMapping("/api/catalogos")
@RequiredArgsConstructor
@Tag(name = "Catálogos", description = "Tablas maestras del sistema")
public class CatalogoController {

    private final CatalogoService catalogoService;

    @GetMapping("/areas")
    @Operation(summary = "Listar áreas activas")
    public ResponseEntity<ApiResponse<List<AreaResponse>>> listarAreas() {
        return ResponseEntity.ok(ApiResponse.ok("OK", catalogoService.listarAreas()));
    }

    @GetMapping("/tipos-equipo")
    @Operation(summary = "Listar tipos de equipo")
    public ResponseEntity<ApiResponse<List<TipoEquipoResponse>>> listarTiposEquipo() {
        return ResponseEntity.ok(ApiResponse.ok("OK", catalogoService.listarTiposEquipo()));
    }

    @PostMapping("/tipos-equipo")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear tipo de equipo")
    public ResponseEntity<ApiResponse<TipoEquipoResponse>> crearTipoEquipo(
            @Valid @RequestBody TipoEquipoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Tipo de equipo creado correctamente",
                catalogoService.crearTipoEquipo(request)));
    }

    @PutMapping("/tipos-equipo/{idTipo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar tipo de equipo")
    public ResponseEntity<ApiResponse<TipoEquipoResponse>> actualizarTipoEquipo(
            @PathVariable Integer idTipo,
            @Valid @RequestBody TipoEquipoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Tipo de equipo actualizado",
            catalogoService.actualizarTipoEquipo(idTipo, request)));
    }

    @GetMapping("/marcas")
    @Operation(summary = "Listar marcas")
    public ResponseEntity<ApiResponse<List<MarcaResponse>>> listarMarcas() {
        return ResponseEntity.ok(ApiResponse.ok("OK", catalogoService.listarMarcas()));
    }

    @PostMapping("/marcas")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear marca")
    public ResponseEntity<ApiResponse<MarcaResponse>> crearMarca(
            @Valid @RequestBody MarcaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Marca creada correctamente", catalogoService.crearMarca(request)));
    }

    @PutMapping("/marcas/{idMarca}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar marca")
    public ResponseEntity<ApiResponse<MarcaResponse>> actualizarMarca(
            @PathVariable Integer idMarca,
            @Valid @RequestBody MarcaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Marca actualizada",
            catalogoService.actualizarMarca(idMarca, request)));
    }

    @GetMapping("/modelos")
    @Operation(summary = "Listar modelos, filtrable por ?marcaId=")
    public ResponseEntity<ApiResponse<List<ModeloResponse>>> listarModelos(
            @RequestParam(required = false) Integer marcaId) {
        return ResponseEntity.ok(ApiResponse.ok("OK", catalogoService.listarModelos(marcaId)));
    }

    @PostMapping("/modelos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear modelo")
    public ResponseEntity<ApiResponse<ModeloResponse>> crearModelo(
            @Valid @RequestBody ModeloRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Modelo creado correctamente", catalogoService.crearModelo(request)));
    }

    @PutMapping("/modelos/{idModelo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar modelo")
    public ResponseEntity<ApiResponse<ModeloResponse>> actualizarModelo(
            @PathVariable Integer idModelo,
            @Valid @RequestBody ModeloRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Modelo actualizado",
            catalogoService.actualizarModelo(idModelo, request)));
    }

    @GetMapping("/sistemas-operativos")
    @Operation(summary = "Listar sistemas operativos")
    public ResponseEntity<ApiResponse<List<SistemaOperativoResponse>>> listarSistemasOperativos() {
        return ResponseEntity.ok(ApiResponse.ok("OK", catalogoService.listarSistemasOperativos()));
    }

    @GetMapping("/tipos-incidente")
    @Operation(summary = "Listar tipos de incidente con SLAs")
    public ResponseEntity<ApiResponse<List<TipoIncidenteResponse>>> listarTiposIncidente() {
        return ResponseEntity.ok(ApiResponse.ok("OK", catalogoService.listarTiposIncidente()));
    }

    @PutMapping("/stock/{idTipo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Configurar umbral de stock crítico por tipo de equipo")
    public ResponseEntity<ApiResponse<ConfigStockResponse>> configurarStock(
            @PathVariable Integer idTipo,
            @Valid @RequestBody ConfigStockRequest request,
            HttpServletRequest httpRequest) {
        Integer idUsuarioActivo = (Integer) httpRequest.getAttribute("idUsuarioActivo");
        return ResponseEntity.ok(ApiResponse.ok("Configuración de stock actualizada",
            catalogoService.configurarStock(idTipo, request, idUsuarioActivo)));
    }

    @PutMapping("/sla/{idTipo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Configurar tiempos SLA de tipo de incidente")
    public ResponseEntity<ApiResponse<TipoIncidenteResponse>> configurarSla(
            @PathVariable Integer idTipo,
            @Valid @RequestBody SlaConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("SLA actualizado",
            catalogoService.configurarSla(idTipo, request)));
    }
}
```

- [ ] **Step 4: Ejecutar los tests**

```
mvn test -Dtest=CatalogoControllerTest
```

Expected: BUILD SUCCESS, 11 tests passed, 0 failed.

Si hay error `No qualifying bean of type 'JwtAuthFilter'` añadir `@MockBean` adicionales según el error. Si falla por `AuditSessionInterceptor`, añadir `@MockBean AuditSessionInterceptor auditSessionInterceptor;` al test.

- [ ] **Step 5: Ejecutar todos los tests**

```
mvn test
```

Expected: BUILD SUCCESS, todos los tests pasan.

- [ ] **Step 6: Commit**

```
git add src/main/java/pe/edu/emch/sgi/controller/CatalogoController.java src/test/java/pe/edu/emch/sgi/controller/CatalogoControllerTest.java
git commit -m "feat(catalogos): add CatalogoController with tests"
```
