# Carga Masiva de Inventario — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar carga masiva de equipos + especificaciones técnicas con etapa de previsualización y edición en vivo antes de confirmar la persistencia.

**Architecture:** Flujo de 3 pasos en el frontend (subir → previsualizar/editar → confirmar). El backend expone cuatro endpoints: GET `/plantilla` (genera Excel dinámico con dropdowns de catálogo), POST `/validar` (multipart, parsea el .xlsx y valida sin escribir nada), POST `/validar-json` (JSON, valida una o varias FilaCarga para re-validación desde UI sin necesidad de un Excel), POST `/confirmar` (all-or-nothing transaccional). La edición en vivo en el paso 2 permite corregir celdas con error; FK fields usan `<select>` con catálogos pre-cargados desde los endpoints existentes.

**Tech Stack:** Java 21 / Spring Boot / Apache POI 5.3.0 (ya en pom.xml) / JPA + MySQL 8 — React 18 / TypeScript / shadcn-ui / motion/react / fetchWithAuth

---

## File Structure

```
backend/src/main/java/pe/edu/emch/sgi/
├── dto/equipo/cargamasiva/
│   ├── FilaCarga.java           ← record: 32 campos del Excel como String
│   ├── ErrorFila.java           ← record: { columna, mensaje }
│   ├── FilaValidada.java        ← record: FilaCarga + estado + errores + IDs resueltos
│   ├── ValidacionRequest.java   ← record: List<FilaCarga>
│   ├── ValidacionResponse.java  ← record: total, totalErrores, filas
│   ├── ConfirmacionRequest.java ← record: List<FilaValidada>
│   └── ConfirmacionResponse.java← record: total, guardados, errores, detalleErrores
├── repository/
│   ├── TipoEquipoRepository.java     ← +findByNombreTipoIgnoreCase
│   ├── MarcaRepository.java          ← +findByNombreMarcaIgnoreCase
│   ├── ModeloEquipoRepository.java   ← +findByNombreModeloAndMarcaIgnoreCase, +findByNombreModeloIgnoreCase
│   ├── AreaRepository.java           ← +findByNombreAreaIgnoreCase
│   └── SistemaOperativoRepository.java ← +findByNombreCompleto
├── service/
│   └── CargaMasivaService.java  ← parsearExcel, validar, confirmar, generarPlantilla
└── controller/
    └── CargaMasivaController.java ← GET /plantilla, POST /validar, POST /validar-json, POST /confirmar

frontend/src/
├── services/
│   └── cargaMasivaService.ts   ← descargarPlantilla, validarArchivo, revalidarFilas, confirmarCarga
└── app/components/
    └── CargaMasiva.tsx          ← stepper 3 pasos con edición en vivo
```

**Rutas afectadas:**
- `frontend/src/app/App.tsx` — agregar `<Route path="/inventario/carga-masiva" element={<CargaMasiva />} />`
- `frontend/src/app/components/Inventario.tsx` — agregar botón "Carga masiva" junto a los botones Excel/PDF

---

## Task 1: Backend DTOs

**Files:**
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/equipo/cargamasiva/FilaCarga.java`
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/equipo/cargamasiva/ErrorFila.java`
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/equipo/cargamasiva/FilaValidada.java`
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/equipo/cargamasiva/ValidacionRequest.java`
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/equipo/cargamasiva/ValidacionResponse.java`
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/equipo/cargamasiva/ConfirmacionRequest.java`
- Create: `backend/src/main/java/pe/edu/emch/sgi/dto/equipo/cargamasiva/ConfirmacionResponse.java`

- [ ] **Step 1: Crear el directorio y `FilaCarga.java`** — los 32 campos del Excel como `String`

```java
package pe.edu.emch.sgi.dto.equipo.cargamasiva;

public record FilaCarga(
    // Equipo (14 campos)
    String codigoEjercito,
    String tipo,
    String marca,
    String modelo,
    String area,
    String sistemaOperativo,
    String numeroSerie,
    String nombreResponsable,
    String macAddress,
    String ipAddress,
    String tipoRed,
    String estadoInicial,
    String fechaAdquisicion,
    String observaciones,
    // Especificaciones técnicas (18 campos, todos opcionales)
    String procesador,
    String nucleos,
    String hilos,
    String ramModulos,
    String ramTotalGb,
    String ramVelocidadMhz,
    String ramMarca,
    String discoModelo,
    String discoInterface,
    String discoCapacidadGb,
    String discoUsadoGb,
    String discoLibreGb,
    String gpuMarca,
    String gpuModelo,
    String gpuVramGb,
    String monitorMarca,
    String monitorModelo,
    String redModelo
) {}
```

- [ ] **Step 2: Crear `ErrorFila.java`**

```java
package pe.edu.emch.sgi.dto.equipo.cargamasiva;

public record ErrorFila(String columna, String mensaje) {}
```

- [ ] **Step 3: Crear `FilaValidada.java`** — resultado de validación + IDs resueltos

```java
package pe.edu.emch.sgi.dto.equipo.cargamasiva;

import java.util.List;

public record FilaValidada(
    int numeroFila,
    FilaCarga datos,
    String estado,             // "OK" | "ERROR"
    List<ErrorFila> errores,
    // IDs resueltos para uso en /confirmar (null si estado=ERROR)
    Integer idTipoResuelto,
    Integer idModeloResuelto,
    Integer idAreaResuelta,
    Integer idSoResuelto
) {}
```

- [ ] **Step 4: Crear `ValidacionRequest.java`**

```java
package pe.edu.emch.sgi.dto.equipo.cargamasiva;

import java.util.List;

public record ValidacionRequest(List<FilaCarga> filas) {}
```

- [ ] **Step 5: Crear `ValidacionResponse.java`**

```java
package pe.edu.emch.sgi.dto.equipo.cargamasiva;

import java.util.List;

public record ValidacionResponse(
    int total,
    int totalErrores,
    List<FilaValidada> filas
) {}
```

- [ ] **Step 6: Crear `ConfirmacionRequest.java`**

```java
package pe.edu.emch.sgi.dto.equipo.cargamasiva;

import java.util.List;

public record ConfirmacionRequest(List<FilaValidada> filas) {}
```

- [ ] **Step 7: Crear `ConfirmacionResponse.java`**

```java
package pe.edu.emch.sgi.dto.equipo.cargamasiva;

import java.util.List;

public record ConfirmacionResponse(
    int total,
    int guardados,
    int errores,
    List<ErrorFila> detalleErrores
) {}
```

- [ ] **Step 8: Compilar**

```powershell
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\backend"
mvn compile -q
```

Expected: sin output (compilación limpia).

- [ ] **Step 9: Commit**

```powershell
git add src/main/java/pe/edu/emch/sgi/dto/equipo/cargamasiva/
git commit -m "feat(carga-masiva): add bulk upload DTOs (FilaCarga, FilaValidada, ErrorFila, request/response records)"
```

---

## Task 2: Lookups por nombre en los repositorios

**Files:**
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/TipoEquipoRepository.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/MarcaRepository.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/ModeloEquipoRepository.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/AreaRepository.java`
- Modify: `backend/src/main/java/pe/edu/emch/sgi/repository/SistemaOperativoRepository.java`

- [ ] **Step 1: `TipoEquipoRepository.java`** — agregar al final de la interfaz

El archivo actual tiene solo `existsByNombreTipo` y `existsByNombreTipoAndIdTipoNot`. Agregar:

```java
import java.util.Optional;

// Dentro de la interfaz, después de las líneas existentes:
Optional<TipoEquipo> findByNombreTipoIgnoreCase(String nombreTipo);
```

Archivo completo tras la edición:

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.TipoEquipo;

import java.util.Optional;

public interface TipoEquipoRepository extends JpaRepository<TipoEquipo, Integer> {
    boolean existsByNombreTipo(String nombreTipo);
    boolean existsByNombreTipoAndIdTipoNot(String nombreTipo, Integer idTipo);
    Optional<TipoEquipo> findByNombreTipoIgnoreCase(String nombreTipo);
}
```

- [ ] **Step 2: `MarcaRepository.java`** — agregar lookup por nombre

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Marca;

import java.util.Optional;

public interface MarcaRepository extends JpaRepository<Marca, Integer> {
    boolean existsByNombreMarca(String nombreMarca);
    boolean existsByNombreMarcaAndIdMarcaNot(String nombreMarca, Integer idMarca);
    Optional<Marca> findByNombreMarcaIgnoreCase(String nombreMarca);
}
```

- [ ] **Step 3: `ModeloEquipoRepository.java`** — agregar dos lookups

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.ModeloEquipo;

import java.util.List;
import java.util.Optional;

public interface ModeloEquipoRepository extends JpaRepository<ModeloEquipo, Integer> {
    List<ModeloEquipo> findByMarca_IdMarca(Integer idMarca);
    boolean existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModelo(
            Integer idMarca, Integer idTipo, String nombreModelo);
    boolean existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModeloAndIdModeloNot(
            Integer idMarca, Integer idTipo, String nombreModelo, Integer idModelo);

    /** Busca por nombre de modelo Y nombre de marca (case-insensitive). */
    @Query("""
            SELECT m FROM ModeloEquipo m
            WHERE LOWER(m.nombreModelo) = LOWER(:nombreModelo)
              AND LOWER(m.marca.nombreMarca) = LOWER(:nombreMarca)
            """)
    Optional<ModeloEquipo> findByNombreModeloAndMarcaIgnoreCase(
        @Param("nombreModelo") String nombreModelo,
        @Param("nombreMarca") String nombreMarca);

    /** Fallback: busca solo por nombre de modelo cuando no se provee marca. */
    Optional<ModeloEquipo> findFirstByNombreModeloIgnoreCase(String nombreModelo);
}
```

- [ ] **Step 4: `AreaRepository.java`** — agregar lookup por nombreArea

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Area;

import java.util.List;
import java.util.Optional;

public interface AreaRepository extends JpaRepository<Area, Integer> {
    List<Area> findByActivoTrue();
    Optional<Area> findByCodigoArea(String codigoArea);
    boolean existsByCodigoArea(String codigoArea);
    boolean existsByCodigoAreaAndIdAreaNot(String codigoArea, Integer idArea);
    Optional<Area> findByNombreAreaIgnoreCase(String nombreArea);
}
```

- [ ] **Step 5: `SistemaOperativoRepository.java`** — lookup por texto completo (nombre + versión)

```java
package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.SistemaOperativo;

import java.util.Optional;

public interface SistemaOperativoRepository extends JpaRepository<SistemaOperativo, Integer> {
    boolean existsByNombreSoAndVersionSo(String nombreSo, String versionSo);
    boolean existsByNombreSoAndVersionSoAndIdSoNot(String nombreSo, String versionSo, Integer idSo);

    /**
     * Busca por "nombreSo versionSo" concatenados (ej: "Windows 11 Pro")
     * o solo por nombreSo como fallback.
     */
    @Query("""
            SELECT s FROM SistemaOperativo s
            WHERE LOWER(CONCAT(s.nombreSo, ' ', COALESCE(s.versionSo, ''))) = LOWER(:texto)
               OR LOWER(s.nombreSo) = LOWER(:texto)
            ORDER BY s.idSo ASC
            """)
    Optional<SistemaOperativo> findByNombreCompleto(@Param("texto") String texto);
}
```

- [ ] **Step 6: Compilar**

```powershell
mvn compile -q
```

Expected: sin output.

- [ ] **Step 7: Commit**

```powershell
git add src/main/java/pe/edu/emch/sgi/repository/
git commit -m "feat(carga-masiva): add case-insensitive name lookups to catalog repositories"
```

---

## Task 3: CargaMasivaService — parte 1: validar y confirmar

**Files:**
- Create: `backend/src/main/java/pe/edu/emch/sgi/service/CargaMasivaService.java`

- [ ] **Step 1: Crear `CargaMasivaService.java`** con los métodos `validar`, `validarFila` y `confirmar`

```java
package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.equipo.cargamasiva.*;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.repository.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CargaMasivaService {

    private final TipoEquipoRepository tipoEquipoRepository;
    private final MarcaRepository marcaRepository;
    private final ModeloEquipoRepository modeloEquipoRepository;
    private final AreaRepository areaRepository;
    private final SistemaOperativoRepository sistemaOperativoRepository;
    private final EquipoRepository equipoRepository;
    private final EspecificacionTecnicaRepository especificacionTecnicaRepository;

    private static final DateTimeFormatter FMT_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Set<String> ESTADOS_VALIDOS = Set.of(
        "EN_BODEGA", "ASIGNADO", "EN_REPARACION", "PRESTADO", "DADO_DE_BAJA");
    private static final Set<String> TIPO_RED_VALIDOS = Set.of("ETHERNET", "WIFI", "N/A");

    // ── VALIDAR (sin escritura) ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ValidacionResponse validar(ValidacionRequest request) {
        List<FilaValidada> resultado = new ArrayList<>();
        // Rastrear unicidad dentro del mismo lote
        Set<String> codigosEnLote = new LinkedHashSet<>();
        Set<String> seriesEnLote  = new LinkedHashSet<>();
        Set<String> macsEnLote    = new LinkedHashSet<>();

        int numeroFila = 2; // fila 1 del Excel = encabezados
        for (FilaCarga fila : request.filas()) {
            FilaValidada validada = validarFila(fila, numeroFila,
                codigosEnLote, seriesEnLote, macsEnLote);
            // Agregar a sets de lote para detección de duplicados internos
            if (!isBlank(fila.codigoEjercito()))
                codigosEnLote.add(fila.codigoEjercito().trim().toUpperCase());
            if (!isBlank(fila.numeroSerie()))
                seriesEnLote.add(fila.numeroSerie().trim().toUpperCase());
            if (!isBlank(fila.macAddress()))
                macsEnLote.add(fila.macAddress().trim().toUpperCase());
            resultado.add(validada);
            numeroFila++;
        }

        long totalErrores = resultado.stream().filter(f -> "ERROR".equals(f.estado())).count();
        return new ValidacionResponse(resultado.size(), (int) totalErrores, resultado);
    }

    private FilaValidada validarFila(
            FilaCarga fila, int numeroFila,
            Set<String> codigosEnLote, Set<String> seriesEnLote, Set<String> macsEnLote) {

        List<ErrorFila> errores = new ArrayList<>();
        Integer idTipo = null, idModelo = null, idArea = null, idSo = null;

        // ── Campos obligatorios de texto ──────────────────────────────────────
        if (isBlank(fila.codigoEjercito()))
            errores.add(new ErrorFila("codigoEjercito", "El código ejército es obligatorio"));
        if (isBlank(fila.numeroSerie()))
            errores.add(new ErrorFila("numeroSerie", "El número de serie es obligatorio"));
        if (isBlank(fila.nombreResponsable()))
            errores.add(new ErrorFila("nombreResponsable", "El responsable es obligatorio"));

        // ── Duplicados dentro del lote ─────────────────────────────────────────
        if (!isBlank(fila.codigoEjercito())
                && codigosEnLote.contains(fila.codigoEjercito().trim().toUpperCase()))
            errores.add(new ErrorFila("codigoEjercito",
                "Código duplicado en el lote: " + fila.codigoEjercito().trim()));
        if (!isBlank(fila.numeroSerie())
                && seriesEnLote.contains(fila.numeroSerie().trim().toUpperCase()))
            errores.add(new ErrorFila("numeroSerie",
                "N° Serie duplicado en el lote: " + fila.numeroSerie().trim()));
        if (!isBlank(fila.macAddress())
                && macsEnLote.contains(fila.macAddress().trim().toUpperCase()))
            errores.add(new ErrorFila("macAddress",
                "MAC duplicada en el lote: " + fila.macAddress().trim()));

        // ── Duplicados en base de datos ────────────────────────────────────────
        if (!isBlank(fila.codigoEjercito())
                && equipoRepository.existsByCodigoEjercito(fila.codigoEjercito().trim()))
            errores.add(new ErrorFila("codigoEjercito",
                "Ya existe en el sistema: " + fila.codigoEjercito().trim()));
        if (!isBlank(fila.numeroSerie())
                && equipoRepository.existsByNumeroSerie(fila.numeroSerie().trim()))
            errores.add(new ErrorFila("numeroSerie",
                "N° Serie ya registrado: " + fila.numeroSerie().trim()));
        if (!isBlank(fila.macAddress())
                && equipoRepository.existsByMacAddress(fila.macAddress().trim()))
            errores.add(new ErrorFila("macAddress",
                "MAC ya registrada: " + fila.macAddress().trim()));

        // ── Resolución FK: Tipo ───────────────────────────────────────────────
        if (isBlank(fila.tipo())) {
            errores.add(new ErrorFila("tipo", "El tipo de equipo es obligatorio"));
        } else {
            idTipo = tipoEquipoRepository
                .findByNombreTipoIgnoreCase(fila.tipo().trim())
                .map(TipoEquipo::getIdTipo)
                .orElse(null);
            if (idTipo == null)
                errores.add(new ErrorFila("tipo",
                    "Tipo no encontrado: '" + fila.tipo().trim() + "'"));
        }

        // ── Resolución FK: Modelo (filtrado por marca si se provee) ──────────
        if (isBlank(fila.modelo())) {
            errores.add(new ErrorFila("modelo", "El modelo es obligatorio"));
        } else {
            Optional<ModeloEquipo> modeloOpt;
            if (!isBlank(fila.marca())) {
                modeloOpt = modeloEquipoRepository
                    .findByNombreModeloAndMarcaIgnoreCase(fila.modelo().trim(), fila.marca().trim());
                if (modeloOpt.isEmpty())
                    errores.add(new ErrorFila("modelo",
                        "Modelo '" + fila.modelo().trim()
                        + "' no encontrado para marca '" + fila.marca().trim() + "'"));
            } else {
                modeloOpt = modeloEquipoRepository
                    .findFirstByNombreModeloIgnoreCase(fila.modelo().trim());
                if (modeloOpt.isEmpty())
                    errores.add(new ErrorFila("modelo",
                        "Modelo no encontrado: '" + fila.modelo().trim() + "'"));
            }
            idModelo = modeloOpt.map(ModeloEquipo::getIdModelo).orElse(null);
        }

        // ── Resolución FK: Área ───────────────────────────────────────────────
        if (isBlank(fila.area())) {
            errores.add(new ErrorFila("area", "El área es obligatoria"));
        } else {
            idArea = areaRepository
                .findByNombreAreaIgnoreCase(fila.area().trim())
                .map(Area::getIdArea)
                .orElse(null);
            if (idArea == null)
                errores.add(new ErrorFila("area",
                    "Área no encontrada: '" + fila.area().trim() + "'"));
        }

        // ── Resolución FK: Sistema Operativo ──────────────────────────────────
        if (isBlank(fila.sistemaOperativo())) {
            errores.add(new ErrorFila("sistemaOperativo", "El sistema operativo es obligatorio"));
        } else {
            idSo = sistemaOperativoRepository
                .findByNombreCompleto(fila.sistemaOperativo().trim())
                .map(SistemaOperativo::getIdSo)
                .orElse(null);
            if (idSo == null)
                errores.add(new ErrorFila("sistemaOperativo",
                    "SO no encontrado: '" + fila.sistemaOperativo().trim() + "'"));
        }

        // ── Enums opcionales ──────────────────────────────────────────────────
        if (!isBlank(fila.tipoRed())
                && !TIPO_RED_VALIDOS.contains(fila.tipoRed().trim().toUpperCase()))
            errores.add(new ErrorFila("tipoRed",
                "Valor inválido. Use: ETHERNET, WIFI o N/A"));
        if (!isBlank(fila.estadoInicial())
                && !ESTADOS_VALIDOS.contains(fila.estadoInicial().trim().toUpperCase()))
            errores.add(new ErrorFila("estadoInicial",
                "Estado inválido. Use: EN_BODEGA, ASIGNADO, EN_REPARACION, PRESTADO o DADO_DE_BAJA"));

        // ── Fecha ─────────────────────────────────────────────────────────────
        if (!isBlank(fila.fechaAdquisicion())) {
            try { LocalDate.parse(fila.fechaAdquisicion().trim(), FMT_FECHA); }
            catch (DateTimeParseException ex) {
                errores.add(new ErrorFila("fechaAdquisicion",
                    "Formato inválido. Use dd/MM/yyyy"));
            }
        }

        String estado = errores.isEmpty() ? "OK" : "ERROR";
        return new FilaValidada(numeroFila, fila, estado, errores,
            idTipo, idModelo, idArea, idSo);
    }

    // ── CONFIRMAR (transaccional) ────────────────────────────────────────────

    @Transactional
    public ConfirmacionResponse confirmar(ConfirmacionRequest request) {
        List<ErrorFila> erroresConfirmacion = new ArrayList<>();
        int guardados = 0;

        for (FilaValidada fila : request.filas()) {
            if (!"OK".equals(fila.estado())) continue;
            try {
                guardarFila(fila);
                guardados++;
            } catch (Exception ex) {
                erroresConfirmacion.add(new ErrorFila(
                    "fila_" + fila.numeroFila(),
                    "Error al guardar fila " + fila.numeroFila() + ": " + ex.getMessage()));
            }
        }

        int totalOk = (int) request.filas().stream().filter(f -> "OK".equals(f.estado())).count();
        return new ConfirmacionResponse(totalOk, guardados,
            erroresConfirmacion.size(), erroresConfirmacion);
    }

    private void guardarFila(FilaValidada fila) {
        FilaCarga d = fila.datos();

        // Re-verificar unicidad (ventana de tiempo entre /validar y /confirmar)
        if (equipoRepository.existsByCodigoEjercito(d.codigoEjercito().trim()))
            throw new RuntimeException(
                "El código '" + d.codigoEjercito().trim() + "' fue registrado por otro proceso");
        if (equipoRepository.existsByNumeroSerie(d.numeroSerie().trim()))
            throw new RuntimeException("N° Serie ya registrado: " + d.numeroSerie().trim());
        if (!isBlank(d.macAddress()) && equipoRepository.existsByMacAddress(d.macAddress().trim()))
            throw new RuntimeException("MAC ya registrada: " + d.macAddress().trim());

        // Recuperar entidades con los IDs resueltos en /validar
        TipoEquipo tipo = tipoEquipoRepository.findById(fila.idTipoResuelto())
            .orElseThrow(() -> new RuntimeException("Tipo ID " + fila.idTipoResuelto() + " no encontrado"));
        ModeloEquipo modelo = modeloEquipoRepository.findById(fila.idModeloResuelto())
            .orElseThrow(() -> new RuntimeException("Modelo ID " + fila.idModeloResuelto() + " no encontrado"));
        Area area = areaRepository.findById(fila.idAreaResuelta())
            .orElseThrow(() -> new RuntimeException("Área ID " + fila.idAreaResuelta() + " no encontrada"));
        SistemaOperativo so = sistemaOperativoRepository.findById(fila.idSoResuelto())
            .orElseThrow(() -> new RuntimeException("SO ID " + fila.idSoResuelto() + " no encontrado"));

        Equipo equipo = new Equipo();
        equipo.setCodigoEjercito(d.codigoEjercito().trim());
        equipo.setTipo(tipo);
        equipo.setModelo(modelo);
        equipo.setArea(area);
        equipo.setSo(so);
        equipo.setNumeroSerie(d.numeroSerie().trim());
        equipo.setNombreResponsable(d.nombreResponsable().trim());
        equipo.setMacAddress(isBlank(d.macAddress()) ? null : d.macAddress().trim());
        equipo.setIpAddress(isBlank(d.ipAddress()) ? null : d.ipAddress().trim());
        equipo.setTipoRed(isBlank(d.tipoRed()) ? "N/A" : d.tipoRed().trim().toUpperCase());
        equipo.setEstado(isBlank(d.estadoInicial()) ? "EN_BODEGA" : d.estadoInicial().trim().toUpperCase());
        equipo.setFechaRegistro(LocalDate.now());
        equipo.setFechaAdquisicion(isBlank(d.fechaAdquisicion()) ? null
            : LocalDate.parse(d.fechaAdquisicion().trim(), FMT_FECHA));
        equipo.setObservaciones(isBlank(d.observaciones()) ? null : d.observaciones().trim());
        Equipo guardado = equipoRepository.save(equipo);

        // Guardar specs solo si al menos un campo tiene valor
        if (tieneSpecs(d)) {
            EspecificacionTecnica espec = new EspecificacionTecnica();
            espec.setEquipo(guardado);
            espec.setProcesador(d.procesador());
            espec.setNucleos(parseShort(d.nucleos()));
            espec.setHilos(parseShort(d.hilos()));
            espec.setRamModulos(parseShort(d.ramModulos()));
            espec.setRamTotalGb(parseShort(d.ramTotalGb()));
            espec.setRamVelocidadMhz(parseShort(d.ramVelocidadMhz()));
            espec.setRamMarca(isBlank(d.ramMarca()) ? null : d.ramMarca().trim());
            espec.setDiscoModelo(isBlank(d.discoModelo()) ? null : d.discoModelo().trim());
            espec.setDiscoInterface(isBlank(d.discoInterface()) ? null : d.discoInterface().trim());
            espec.setDiscoCapacidadGb(parseBD(d.discoCapacidadGb()));
            espec.setDiscoUsadoGb(parseBD(d.discoUsadoGb()));
            espec.setDiscoLibreGb(parseBD(d.discoLibreGb()));
            espec.setGpuMarca(isBlank(d.gpuMarca()) ? null : d.gpuMarca().trim());
            espec.setGpuModelo(isBlank(d.gpuModelo()) ? null : d.gpuModelo().trim());
            espec.setGpuVramGb(parseBD(d.gpuVramGb()));
            espec.setMonitorMarca(isBlank(d.monitorMarca()) ? null : d.monitorMarca().trim());
            espec.setMonitorModelo(isBlank(d.monitorModelo()) ? null : d.monitorModelo().trim());
            espec.setRedModelo(isBlank(d.redModelo()) ? null : d.redModelo().trim());
            especificacionTecnicaRepository.save(espec);
        }
    }

    private boolean tieneSpecs(FilaCarga d) {
        return !isBlank(d.procesador()) || !isBlank(d.ramTotalGb())
            || !isBlank(d.discoCapacidadGb()) || !isBlank(d.gpuModelo())
            || !isBlank(d.monitorModelo()) || !isBlank(d.redModelo());
    }

    // ── Helpers de parseo ────────────────────────────────────────────────────

    private boolean isBlank(String s) { return s == null || s.isBlank(); }

    private Short parseShort(String s) {
        if (isBlank(s)) return null;
        try { return Short.parseShort(s.trim()); }
        catch (NumberFormatException e) { return null; }
    }

    private BigDecimal parseBD(String s) {
        if (isBlank(s)) return null;
        try { return new BigDecimal(s.trim().replace(",", ".")); }
        catch (NumberFormatException e) { return null; }
    }
```

- [ ] **Step 2: Compilar**

```powershell
mvn compile -q
```

Expected: sin output.

---

## Task 4: CargaMasivaService — parte 2: parsearExcel y generarPlantilla

**Files:**
- Modify: `backend/src/main/java/pe/edu/emch/sgi/service/CargaMasivaService.java`

> **Nota:** Agregar los métodos siguientes dentro de la clase, antes del cierre `}` final.

- [ ] **Step 1: Agregar `parsearExcel`** — lee un `.xlsx` subido y devuelve `List<FilaCarga>`

```java
    // ── PARSEAR EXCEL ────────────────────────────────────────────────────────

    public List<FilaCarga> parsearExcel(org.springframework.web.multipart.MultipartFile file) {
        List<FilaCarga> filas = new ArrayList<>();
        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            // Fila 0 = encabezados; datos desde fila 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                // Ignorar filas completamente vacías
                if (isBlank(cellStr(row, 0)) && isBlank(cellStr(row, 6))) continue;
                filas.add(new FilaCarga(
                    cellStr(row, 0),  // codigoEjercito
                    cellStr(row, 1),  // tipo
                    cellStr(row, 2),  // marca
                    cellStr(row, 3),  // modelo
                    cellStr(row, 4),  // area
                    cellStr(row, 5),  // sistemaOperativo
                    cellStr(row, 6),  // numeroSerie
                    cellStr(row, 7),  // nombreResponsable
                    cellStr(row, 8),  // macAddress
                    cellStr(row, 9),  // ipAddress
                    cellStr(row, 10), // tipoRed
                    cellStr(row, 11), // estadoInicial
                    cellStr(row, 12), // fechaAdquisicion
                    cellStr(row, 13), // observaciones
                    cellStr(row, 14), // procesador
                    cellStr(row, 15), // nucleos
                    cellStr(row, 16), // hilos
                    cellStr(row, 17), // ramModulos
                    cellStr(row, 18), // ramTotalGb
                    cellStr(row, 19), // ramVelocidadMhz
                    cellStr(row, 20), // ramMarca
                    cellStr(row, 21), // discoModelo
                    cellStr(row, 22), // discoInterface
                    cellStr(row, 23), // discoCapacidadGb
                    cellStr(row, 24), // discoUsadoGb
                    cellStr(row, 25), // discoLibreGb
                    cellStr(row, 26), // gpuMarca
                    cellStr(row, 27), // gpuModelo
                    cellStr(row, 28), // gpuVramGb
                    cellStr(row, 29), // monitorMarca
                    cellStr(row, 30), // monitorModelo
                    cellStr(row, 31)  // redModelo
                ));
            }
        } catch (Exception ex) {
            throw new RuntimeException("Error al leer el archivo Excel: " + ex.getMessage(), ex);
        }
        return filas;
    }

    private String cellStr(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell))
                    yield cell.getLocalDateTimeCellValue().toLocalDate().format(FMT_FECHA);
                double val = cell.getNumericCellValue();
                yield val == Math.floor(val) ? String.valueOf((long) val) : String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try { yield String.valueOf((long) cell.getNumericCellValue()); }
                catch (Exception e) { yield cell.getStringCellValue().trim(); }
            }
            default -> "";
        };
    }
```

- [ ] **Step 2: Agregar `generarPlantilla`** — Excel con encabezados + dropdowns de catálogo en hoja oculta

```java
    // ── PLANTILLA EXCEL DINÁMICA ──────────────────────────────────────────────

    public byte[] generarPlantilla() {
        List<String> tipos   = tipoEquipoRepository.findAll().stream()
            .map(TipoEquipo::getNombreTipo).sorted().toList();
        List<String> marcas  = marcaRepository.findAll().stream()
            .map(Marca::getNombreMarca).sorted().toList();
        List<String> modelos = modeloEquipoRepository.findAll().stream()
            .map(ModeloEquipo::getNombreModelo).distinct().sorted().toList();
        List<String> areas   = areaRepository.findByActivoTrue().stream()
            .map(Area::getNombreArea).sorted().toList();
        List<String> soList  = sistemaOperativoRepository.findAll().stream()
            .map(s -> s.getNombreSo() + " " + s.getVersionSo())
            .sorted().toList();

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Hoja oculta con listas para dropdowns
            org.apache.poi.xssf.usermodel.XSSFSheet listas = wb.createSheet("_listas");
            wb.setSheetHidden(wb.getSheetIndex("_listas"), true);
            escribirLista(listas, 0, tipos);
            escribirLista(listas, 1, marcas);
            escribirLista(listas, 2, modelos);
            escribirLista(listas, 3, areas);
            escribirLista(listas, 4, soList);
            escribirLista(listas, 5, List.of("ETHERNET", "WIFI", "N/A"));
            escribirLista(listas, 6, List.of(
                "EN_BODEGA", "ASIGNADO", "EN_REPARACION", "PRESTADO", "DADO_DE_BAJA"));

            // Hoja de datos
            org.apache.poi.xssf.usermodel.XSSFSheet datos = wb.createSheet("Carga Masiva Equipos");

            // Estilo de encabezado
            org.apache.poi.xssf.usermodel.XSSFCellStyle hStyle = wb.createCellStyle();
            org.apache.poi.xssf.usermodel.XSSFFont hFont = wb.createFont();
            hFont.setBold(true);
            hFont.setColor(IndexedColors.WHITE.getIndex());
            hStyle.setFont(hFont);
            hStyle.setFillForegroundColor(
                new org.apache.poi.xssf.usermodel.XSSFColor(
                    new byte[]{(byte)0x4A, (byte)0x5D, (byte)0x23}, null));
            hStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            hStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {
                "Código Ejército*", "Tipo*", "Marca*", "Modelo*", "Área*",
                "Sistema Operativo*", "N° Serie*", "Responsable*",
                "MAC Address", "IP Address", "Tipo Red", "Estado Inicial",
                "Fecha Adquisición (dd/MM/yyyy)", "Observaciones",
                "Procesador", "Núcleos", "Hilos",
                "RAM Módulos", "RAM Total GB", "RAM Velocidad MHz", "RAM Marca",
                "Disco Modelo", "Disco Interface", "Disco Capacidad GB",
                "Disco Usado GB", "Disco Libre GB",
                "GPU Marca", "GPU Modelo", "GPU VRAM GB",
                "Monitor Marca", "Monitor Modelo", "Red (NIC) Modelo"
            };

            Row headerRow = datos.createRow(0);
            headerRow.setHeightInPoints(20);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(hStyle);
                datos.setColumnWidth(i, 22 * 256);
            }

            // Dropdowns para filas 2..501
            agregarDropdown(wb, datos, tipos.size(),   0,  1); // col B = Tipo
            agregarDropdown(wb, datos, marcas.size(),  1,  1); // col C = Marca
            agregarDropdown(wb, datos, modelos.size(), 2,  1); // col D = Modelo
            agregarDropdown(wb, datos, areas.size(),   3,  1); // col E = Área
            agregarDropdown(wb, datos, soList.size(),  4,  1); // col F = SO
            agregarDropdown(wb, datos, 3,             10,  1); // col K = TipoRed
            agregarDropdown(wb, datos, 5,             11,  1); // col L = EstadoInicial

            datos.createFreezePane(0, 1); // congelar encabezado
            wb.write(out);
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Error generando plantilla: " + ex.getMessage(), ex);
        }
    }

    private void escribirLista(org.apache.poi.ss.usermodel.Sheet sheet,
                                int col, List<String> valores) {
        for (int i = 0; i < valores.size(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) row = sheet.createRow(i);
            row.createCell(col).setCellValue(valores.get(i));
        }
    }

    /** colLista=0→A, 1→B, etc. colDatos es la columna en la hoja "datos" (0-indexed). */
    private void agregarDropdown(
            XSSFWorkbook wb,
            org.apache.poi.ss.usermodel.Sheet datos,
            int numOpciones, int colDatos, int colLista) {

        String letra = columnLetra(colLista);
        String formula = "'_listas'!$" + letra + "$1:$" + letra + "$" + numOpciones;
        DataValidationHelper dvh = datos.getDataValidationHelper();
        DataValidationConstraint dvc = dvh.createFormulaListConstraint(formula);
        org.apache.poi.ss.util.CellRangeAddressList rng =
            new org.apache.poi.ss.util.CellRangeAddressList(1, 500, colDatos, colDatos);
        DataValidation dv = dvh.createValidation(dvc, rng);
        dv.setShowErrorBox(false); // no bloquear — solo orientar
        datos.addValidationData(dv);
    }

    private String columnLetra(int index) {
        StringBuilder sb = new StringBuilder();
        index++;
        while (index > 0) {
            index--;
            sb.insert(0, (char)('A' + index % 26));
            index /= 26;
        }
        return sb.toString();
    }
} // ← cierre de la clase CargaMasivaService
```

- [ ] **Step 3: Compilar**

```powershell
mvn compile -q
```

Expected: sin output.

- [ ] **Step 4: Commit**

```powershell
git add src/main/java/pe/edu/emch/sgi/service/CargaMasivaService.java
git commit -m "feat(carga-masiva): add CargaMasivaService (validar, confirmar, parsearExcel, generarPlantilla)"
```

---

## Task 5: CargaMasivaController

**Files:**
- Create: `backend/src/main/java/pe/edu/emch/sgi/controller/CargaMasivaController.java`

- [ ] **Step 1: Crear el controller**

```java
package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.emch.sgi.dto.common.ApiResponse;
import pe.edu.emch.sgi.dto.equipo.cargamasiva.*;
import pe.edu.emch.sgi.service.CargaMasivaService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/equipos/carga-masiva")
@RequiredArgsConstructor
@Tag(name = "Carga Masiva", description = "Carga masiva de equipos desde archivo Excel")
public class CargaMasivaController {

    private final CargaMasivaService cargaMasivaService;

    private static final MediaType EXCEL_TYPE =
        MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    /** Descarga la plantilla Excel dinámica con dropdowns de catálogo. */
    @GetMapping("/plantilla")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Descargar plantilla Excel para carga masiva")
    public ResponseEntity<byte[]> descargarPlantilla() {
        byte[] content  = cargaMasivaService.generarPlantilla();
        String filename = "plantilla-carga-masiva-" + LocalDate.now() + ".xlsx";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(EXCEL_TYPE)
            .body(content);
    }

    /**
     * Recibe el archivo Excel, lo parsea y valida fila a fila.
     * NO escribe nada en la base de datos.
     */
    @PostMapping(value = "/validar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Subir y validar archivo Excel (sin guardar)")
    public ResponseEntity<ApiResponse<ValidacionResponse>> validarArchivo(
            @RequestParam("file") MultipartFile file) {
        List<FilaCarga> filas = cargaMasivaService.parsearExcel(file);
        ValidacionResponse resp = cargaMasivaService.validar(new ValidacionRequest(filas));
        return ResponseEntity.ok(ApiResponse.success(resp, "Validación completada"));
    }

    /**
     * Re-valida una lista de FilaCarga enviada como JSON
     * (usado por el frontend al editar celdas en vivo).
     */
    @PostMapping("/validar-json")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Validar filas enviadas como JSON (re-validación desde UI)")
    public ResponseEntity<ApiResponse<ValidacionResponse>> validarJson(
            @RequestBody ValidacionRequest request) {
        ValidacionResponse resp = cargaMasivaService.validar(request);
        return ResponseEntity.ok(ApiResponse.success(resp, "Validación completada"));
    }

    /**
     * Persiste las filas validadas en una sola transacción all-or-nothing.
     * Solo procesa filas con estado "OK".
     */
    @PostMapping("/confirmar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Confirmar y guardar el lote validado")
    public ResponseEntity<ApiResponse<ConfirmacionResponse>> confirmar(
            @RequestBody ConfirmacionRequest request) {
        ConfirmacionResponse resp = cargaMasivaService.confirmar(request);
        return ResponseEntity.ok(ApiResponse.success(resp, "Carga completada"));
    }
}
```

- [ ] **Step 2: Compilar**

```powershell
mvn compile -q
```

Expected: sin output.

- [ ] **Step 3: Commit**

```powershell
git add src/main/java/pe/edu/emch/sgi/controller/CargaMasivaController.java
git commit -m "feat(carga-masiva): add CargaMasivaController (plantilla, validar, validar-json, confirmar)"
```

---

## Task 6: Frontend — cargaMasivaService.ts

**Files:**
- Create: `frontend/src/services/cargaMasivaService.ts`

- [ ] **Step 1: Crear el service**

```typescript
import { fetchWithAuth } from '../lib/api';

// ── Tipos (mirrors de los DTOs del backend) ──────────────────────────────────

export interface FilaCarga {
  codigoEjercito: string;
  tipo: string;
  marca: string;
  modelo: string;
  area: string;
  sistemaOperativo: string;
  numeroSerie: string;
  nombreResponsable: string;
  macAddress: string;
  ipAddress: string;
  tipoRed: string;
  estadoInicial: string;
  fechaAdquisicion: string;
  observaciones: string;
  procesador: string;
  nucleos: string;
  hilos: string;
  ramModulos: string;
  ramTotalGb: string;
  ramVelocidadMhz: string;
  ramMarca: string;
  discoModelo: string;
  discoInterface: string;
  discoCapacidadGb: string;
  discoUsadoGb: string;
  discoLibreGb: string;
  gpuMarca: string;
  gpuModelo: string;
  gpuVramGb: string;
  monitorMarca: string;
  monitorModelo: string;
  redModelo: string;
}

export interface ErrorFila {
  columna: string;
  mensaje: string;
}

export interface FilaValidada {
  numeroFila: number;
  datos: FilaCarga;
  estado: 'OK' | 'ERROR';
  errores: ErrorFila[];
  idTipoResuelto: number | null;
  idModeloResuelto: number | null;
  idAreaResuelta: number | null;
  idSoResuelto: number | null;
}

export interface ValidacionResponse {
  total: number;
  totalErrores: number;
  filas: FilaValidada[];
}

export interface ConfirmacionResponse {
  total: number;
  guardados: number;
  errores: number;
  detalleErrores: ErrorFila[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchWithAuth(path, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return ((await res.json()) as { data: T }).data;
}

// ── API ──────────────────────────────────────────────────────────────────────

/** Descarga la plantilla Excel generada dinámicamente con los catálogos actuales. */
export async function descargarPlantilla(): Promise<void> {
  const res = await fetchWithAuth('/api/equipos/carga-masiva/plantilla');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `plantilla-carga-masiva-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Sube el archivo Excel al backend para parseo y validación (sin guardar). */
export async function validarArchivo(file: File): Promise<ValidacionResponse> {
  const form = new FormData();
  form.append('file', file);
  // No establecer Content-Type manualmente: el browser agrega el boundary correcto
  const res = await fetchWithAuth('/api/equipos/carga-masiva/validar', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return ((await res.json()) as { data: ValidacionResponse }).data;
}

/**
 * Re-valida una o varias FilaCarga enviándolas como JSON.
 * Usada para re-validar filas individuales tras edición en UI.
 */
export async function revalidarFilas(filas: FilaCarga[]): Promise<ValidacionResponse> {
  return postJson<ValidacionResponse>('/api/equipos/carga-masiva/validar-json', { filas });
}

/** Envía las filas validadas al backend para persistirlas en una transacción. */
export async function confirmarCarga(filas: FilaValidada[]): Promise<ConfirmacionResponse> {
  return postJson<ConfirmacionResponse>('/api/equipos/carga-masiva/confirmar', { filas });
}
```

- [ ] **Step 2: Verificar que el archivo no tiene errores de TypeScript**

```powershell
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npx tsc --noEmit 2>&1 | Select-String "cargaMasiva"
```

Expected: sin líneas con "cargaMasiva" (sin errores).

- [ ] **Step 3: Commit**

```powershell
git add src/services/cargaMasivaService.ts
git commit -m "feat(carga-masiva): add frontend cargaMasivaService with descargarPlantilla, validarArchivo, revalidarFilas, confirmarCarga"
```

---

## Task 7: Frontend — CargaMasiva.tsx

**Files:**
- Create: `frontend/src/app/components/CargaMasiva.tsx`

- [ ] **Step 1: Crear el componente CargaMasiva.tsx**

```tsx
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, RotateCcw, Download, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  listarTipos, listarMarcas, listarModelos,
  listarAreas, listarSO,
  type TipoEquipoResponse, type MarcaResponse,
  type ModeloResponse, type AreaResponse, type SistemaOperativoResponse,
} from '../../services/catalogoService';
import {
  descargarPlantilla, validarArchivo, revalidarFilas, confirmarCarga,
  type FilaCarga, type FilaValidada, type ErrorFila, type ConfirmacionResponse,
} from '../../services/cargaMasivaService';

// ── Catálogos para selects de edición en vivo ─────────────────────────────────

interface Catalogos {
  tipos: TipoEquipoResponse[];
  marcas: MarcaResponse[];
  modelos: ModeloResponse[];
  areas: AreaResponse[];
  sistemas: SistemaOperativoResponse[];
}

// ── Columnas editables y sus labels ──────────────────────────────────────────

const COLS_TEXTO: Array<{ key: keyof FilaCarga; label: string }> = [
  { key: 'codigoEjercito',   label: 'Código Ejército' },
  { key: 'numeroSerie',      label: 'N° Serie' },
  { key: 'nombreResponsable',label: 'Responsable' },
  { key: 'macAddress',       label: 'MAC Address' },
  { key: 'ipAddress',        label: 'IP Address' },
  { key: 'fechaAdquisicion', label: 'Fecha (dd/MM/yyyy)' },
  { key: 'observaciones',    label: 'Observaciones' },
];

const COLS_ENUM: Array<{ key: keyof FilaCarga; label: string; opciones: string[] }> = [
  { key: 'tipoRed',       label: 'Tipo Red',      opciones: ['ETHERNET', 'WIFI', 'N/A'] },
  { key: 'estadoInicial', label: 'Estado Inicial', opciones: ['EN_BODEGA', 'ASIGNADO', 'EN_REPARACION', 'PRESTADO', 'DADO_DE_BAJA'] },
];

// ── Componente principal ──────────────────────────────────────────────────────

export function CargaMasiva() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del stepper
  const [paso, setPaso] = useState<1 | 2 | 3>(1);

  // Paso 1 — archivo
  const [archivo, setArchivo] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  // Paso 2 — previsualización
  const [filas, setFilas] = useState<FilaValidada[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [revalidando, setRevalidando] = useState<Set<number>>(new Set());
  const [revalidandoTodo, setRevalidandoTodo] = useState(false);

  // Paso 3 — resultado
  const [confirmando, setConfirmando] = useState(false);
  const [resultado, setResultado] = useState<ConfirmacionResponse | null>(null);

  // ── Paso 1: subir archivo ──────────────────────────────────────────────────

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setErrorSubida('Solo se aceptan archivos .xlsx');
      return;
    }
    setArchivo(file);
    setErrorSubida(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleValidarArchivo = async () => {
    if (!archivo) return;
    setSubiendo(true);
    setErrorSubida(null);
    try {
      // Cargar catálogos en paralelo con la validación
      const [respValidacion, tipos, marcas, modelos, areas, sistemas] = await Promise.all([
        validarArchivo(archivo),
        listarTipos(),
        listarMarcas(),
        listarModelos(),
        listarAreas(),
        listarSO(),
      ]);
      setFilas(respValidacion.filas);
      setCatalogos({ tipos, marcas, modelos, areas, sistemas });
      setPaso(2);
    } catch (err) {
      setErrorSubida(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setSubiendo(false);
    }
  };

  // ── Paso 2: edición en vivo ───────────────────────────────────────────────

  const actualizarCampo = useCallback(
    (filaIdx: number, campo: keyof FilaCarga, valor: string) => {
      setFilas(prev => prev.map((f, i) => {
        if (i !== filaIdx) return f;
        return { ...f, datos: { ...f.datos, [campo]: valor } };
      }));
    },
    [],
  );

  const revalidarFila = async (filaIdx: number) => {
    setRevalidando(prev => new Set(prev).add(filaIdx));
    try {
      const fila = filas[filaIdx];
      const resp = await revalidarFilas([fila.datos]);
      const nueva = resp.filas[0];
      setFilas(prev => prev.map((f, i) =>
        i === filaIdx
          ? { ...nueva, numeroFila: fila.numeroFila }
          : f,
      ));
    } finally {
      setRevalidando(prev => { const s = new Set(prev); s.delete(filaIdx); return s; });
    }
  };

  const revalidarTodo = async () => {
    setRevalidandoTodo(true);
    try {
      const resp = await revalidarFilas(filas.map(f => f.datos));
      setFilas(prev =>
        resp.filas.map((nueva, i) => ({ ...nueva, numeroFila: prev[i].numeroFila })),
      );
    } finally {
      setRevalidandoTodo(false);
    }
  };

  const todasOk = filas.length > 0 && filas.every(f => f.estado === 'OK');

  // ── Paso 3: confirmar ─────────────────────────────────────────────────────

  const handleConfirmar = async () => {
    setConfirmando(true);
    try {
      const resp = await confirmarCarga(filas.filter(f => f.estado === 'OK'));
      setResultado(resp);
      setPaso(3);
    } catch (err) {
      setErrorSubida(err instanceof Error ? err.message : 'Error al confirmar la carga');
    } finally {
      setConfirmando(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const totalErrores = filas.filter(f => f.estado === 'ERROR').length;

  function CeldaEditable({
    filaIdx, fila,
  }: { filaIdx: number; fila: FilaValidada }) {
    const { datos, errores } = fila;
    const columnaConError = (k: string) => errores.some(e => e.columna === k);

    return (
      <div className="space-y-2 text-xs">
        {/* Campos de texto */}
        {COLS_TEXTO.map(({ key, label }) => (
          <div key={key} className={columnaConError(key) ? 'ring-1 ring-red-400 rounded p-1' : ''}>
            <label className="text-[#5C6064] font-medium block">{label}</label>
            <input
              className="w-full border rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6B7F3A]"
              value={(datos[key] as string) ?? ''}
              onChange={e => actualizarCampo(filaIdx, key, e.target.value)}
            />
            {columnaConError(key) && (
              <p className="text-red-500 text-[10px]">
                {errores.find(e => e.columna === key)?.mensaje}
              </p>
            )}
          </div>
        ))}

        {/* Campos enum */}
        {COLS_ENUM.map(({ key, label, opciones }) => (
          <div key={key} className={columnaConError(key) ? 'ring-1 ring-red-400 rounded p-1' : ''}>
            <label className="text-[#5C6064] font-medium block">{label}</label>
            <select
              className="w-full border rounded px-1 py-0.5 text-xs focus:outline-none"
              value={(datos[key] as string) ?? ''}
              onChange={e => actualizarCampo(filaIdx, key, e.target.value)}
            >
              <option value="">— elegir —</option>
              {opciones.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        {/* Campos FK */}
        {catalogos && (
          <>
            {/* Tipo */}
            <div className={columnaConError('tipo') ? 'ring-1 ring-red-400 rounded p-1' : ''}>
              <label className="text-[#5C6064] font-medium block">Tipo</label>
              <select
                className="w-full border rounded px-1 py-0.5 text-xs"
                value={datos.tipo}
                onChange={e => actualizarCampo(filaIdx, 'tipo', e.target.value)}
              >
                <option value="">— elegir —</option>
                {catalogos.tipos.map(t => (
                  <option key={t.idTipo} value={t.nombreTipo}>{t.nombreTipo}</option>
                ))}
              </select>
              {columnaConError('tipo') && (
                <p className="text-red-500 text-[10px]">
                  {errores.find(e => e.columna === 'tipo')?.mensaje}
                </p>
              )}
            </div>

            {/* Marca */}
            <div className={columnaConError('marca') ? 'ring-1 ring-red-400 rounded p-1' : ''}>
              <label className="text-[#5C6064] font-medium block">Marca</label>
              <select
                className="w-full border rounded px-1 py-0.5 text-xs"
                value={datos.marca}
                onChange={e => actualizarCampo(filaIdx, 'marca', e.target.value)}
              >
                <option value="">— elegir —</option>
                {catalogos.marcas.map(m => (
                  <option key={m.idMarca} value={m.nombreMarca}>{m.nombreMarca}</option>
                ))}
              </select>
            </div>

            {/* Modelo */}
            <div className={columnaConError('modelo') ? 'ring-1 ring-red-400 rounded p-1' : ''}>
              <label className="text-[#5C6064] font-medium block">Modelo</label>
              <select
                className="w-full border rounded px-1 py-0.5 text-xs"
                value={datos.modelo}
                onChange={e => actualizarCampo(filaIdx, 'modelo', e.target.value)}
              >
                <option value="">— elegir —</option>
                {catalogos.modelos
                  .filter(m => !datos.marca || m.nombreMarca === datos.marca)
                  .map(m => (
                    <option key={m.idModelo} value={m.nombreModelo}>{m.nombreModelo}</option>
                  ))}
              </select>
              {columnaConError('modelo') && (
                <p className="text-red-500 text-[10px]">
                  {errores.find(e => e.columna === 'modelo')?.mensaje}
                </p>
              )}
            </div>

            {/* Área */}
            <div className={columnaConError('area') ? 'ring-1 ring-red-400 rounded p-1' : ''}>
              <label className="text-[#5C6064] font-medium block">Área</label>
              <select
                className="w-full border rounded px-1 py-0.5 text-xs"
                value={datos.area}
                onChange={e => actualizarCampo(filaIdx, 'area', e.target.value)}
              >
                <option value="">— elegir —</option>
                {catalogos.areas.map(a => (
                  <option key={a.idArea} value={a.nombreArea}>{a.nombreArea}</option>
                ))}
              </select>
              {columnaConError('area') && (
                <p className="text-red-500 text-[10px]">
                  {errores.find(e => e.columna === 'area')?.mensaje}
                </p>
              )}
            </div>

            {/* Sistema Operativo */}
            <div className={columnaConError('sistemaOperativo') ? 'ring-1 ring-red-400 rounded p-1' : ''}>
              <label className="text-[#5C6064] font-medium block">Sistema Operativo</label>
              <select
                className="w-full border rounded px-1 py-0.5 text-xs"
                value={datos.sistemaOperativo}
                onChange={e => actualizarCampo(filaIdx, 'sistemaOperativo', e.target.value)}
              >
                <option value="">— elegir —</option>
                {catalogos.sistemas.map(s => {
                  const label = `${s.nombreSo} ${s.versionSo}`.trim();
                  return <option key={s.idSo} value={label}>{label}</option>;
                })}
              </select>
              {columnaConError('sistemaOperativo') && (
                <p className="text-red-500 text-[10px]">
                  {errores.find(e => e.columna === 'sistemaOperativo')?.mensaje}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/inventario')}
          className="text-[#5C6064] hover:text-[#2C3E50] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[#2C3E50]">Carga Masiva de Equipos</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Subir archivo' },
          { n: 2, label: 'Revisar y editar' },
          { n: 3, label: 'Resultado' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${paso === n ? 'bg-[#6B7F3A] text-white'
              : paso > n ? 'bg-[#4A5D23] text-white'
              : 'bg-gray-200 text-gray-500'}`}>
              {paso > n ? <CheckCircle2 className="w-4 h-4" /> : n}
            </div>
            <span className={`text-sm font-medium ${paso === n ? 'text-[#2C3E50]' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── PASO 1: SUBIR ARCHIVO ──────────────────────────────────────── */}
        {paso === 1 && (
          <motion.div key="paso1"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>

            {/* Botón descargar plantilla */}
            <div className="mb-6 p-4 bg-[#F0F4E8] rounded-xl border border-[#C4CF9A] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#2C3E50]">Plantilla Excel</p>
                <p className="text-sm text-[#5C6064]">
                  Descarga la plantilla con los catálogos actuales precargados
                </p>
              </div>
              <Button variant="outline" size="sm"
                className="border-[#6B7F3A] text-[#6B7F3A] hover:bg-[#6B7F3A] hover:text-white"
                onClick={() => descargarPlantilla().catch(console.error)}>
                <Download className="w-4 h-4 mr-2" />
                Descargar plantilla
              </Button>
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                ${dragging ? 'border-[#6B7F3A] bg-[#F0F4E8]' : 'border-gray-300 hover:border-[#6B7F3A]'}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".xlsx" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} />

              {archivo ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="w-12 h-12 text-[#6B7F3A]" />
                  <p className="font-semibold text-[#2C3E50]">{archivo.name}</p>
                  <p className="text-sm text-[#5C6064]">
                    {(archivo.size / 1024).toFixed(1)} KB — haz clic para cambiar
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Upload className="w-12 h-12" />
                  <p className="text-lg font-medium">Arrastra el archivo Excel aquí</p>
                  <p className="text-sm">o haz clic para seleccionar (.xlsx)</p>
                </div>
              )}
            </div>

            {errorSubida && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorSubida}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button disabled={!archivo || subiendo}
                className="bg-[#6B7F3A] hover:bg-[#4A5D23] text-white px-6"
                onClick={handleValidarArchivo}>
                {subiendo ? 'Procesando…' : 'Validar archivo'}
                {!subiendo && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── PASO 2: REVISAR Y EDITAR ───────────────────────────────────── */}
        {paso === 2 && (
          <motion.div key="paso2"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>

            {/* Resumen */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4 text-sm">
                <span className="text-[#5C6064]">
                  Total: <strong>{filas.length}</strong>
                </span>
                <span className="text-green-700">
                  OK: <strong>{filas.length - totalErrores}</strong>
                </span>
                {totalErrores > 0 && (
                  <span className="text-red-600">
                    Con errores: <strong>{totalErrores}</strong>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={revalidandoTodo}
                  onClick={revalidarTodo}>
                  <RotateCcw className={`w-3 h-3 mr-1 ${revalidandoTodo ? 'animate-spin' : ''}`} />
                  Re-validar todo
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPaso(1)}>
                  <ArrowLeft className="w-3 h-3 mr-1" /> Cambiar archivo
                </Button>
              </div>
            </div>

            {/* Tabla de filas */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {filas.map((fila, idx) => (
                <div key={idx}
                  className={`rounded-xl border p-4
                    ${fila.estado === 'OK'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {fila.estado === 'OK'
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className="font-semibold text-[#2C3E50] text-sm">
                        Fila {fila.numeroFila}
                        {fila.datos.codigoEjercito && ` — ${fila.datos.codigoEjercito}`}
                      </span>
                    </div>
                    {fila.estado === 'ERROR' && (
                      <Button variant="ghost" size="sm"
                        disabled={revalidando.has(idx)}
                        onClick={() => revalidarFila(idx)}
                        className="text-[#6B7F3A] hover:bg-[#F0F4E8] h-7 px-2 text-xs">
                        <RotateCcw className={`w-3 h-3 mr-1 ${revalidando.has(idx) ? 'animate-spin' : ''}`} />
                        Re-validar fila
                      </Button>
                    )}
                  </div>

                  {/* Mostrar errores actuales */}
                  {fila.estado === 'ERROR' && (
                    <div className="mb-3">
                      {fila.errores.map((e, ei) => (
                        <p key={ei} className="text-red-600 text-xs">
                          <strong>{e.columna}:</strong> {e.mensaje}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Panel de edición solo para filas con error */}
                  {fila.estado === 'ERROR' && (
                    <details className="mt-2">
                      <summary className="text-xs text-[#6B7F3A] cursor-pointer font-medium">
                        Editar campos
                      </summary>
                      <div className="mt-2">
                        <CeldaEditable filaIdx={idx} fila={fila} />
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-[#5C6064]">
                {todasOk
                  ? 'Todas las filas son válidas. Puedes confirmar la carga.'
                  : `Corrige los ${totalErrores} error(es) antes de confirmar.`}
              </p>
              <Button
                disabled={!todasOk || confirmando}
                className="bg-[#4A5D23] hover:bg-[#2C3E0D] text-white px-6"
                onClick={handleConfirmar}>
                {confirmando ? 'Guardando…' : `Confirmar carga (${filas.length} equipos)`}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── PASO 3: RESULTADO ─────────────────────────────────────────── */}
        {paso === 3 && resultado && (
          <motion.div key="paso3"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12">

            {resultado.errores === 0 ? (
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            )}

            <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
              {resultado.errores === 0 ? 'Carga completada' : 'Carga con advertencias'}
            </h2>
            <p className="text-[#5C6064] mb-6">
              {resultado.guardados} de {resultado.total} equipos guardados correctamente.
            </p>

            {resultado.detalleErrores.length > 0 && (
              <div className="mb-6 text-left bg-red-50 border border-red-200 rounded-xl p-4 max-w-lg mx-auto">
                <p className="font-semibold text-red-700 mb-2">Errores al guardar:</p>
                {resultado.detalleErrores.map((e, i) => (
                  <p key={i} className="text-red-600 text-sm">
                    <strong>{e.columna}:</strong> {e.mensaje}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => {
                setPaso(1); setArchivo(null); setFilas([]); setResultado(null);
              }}>
                Nueva carga
              </Button>
              <Button className="bg-[#6B7F3A] hover:bg-[#4A5D23] text-white"
                onClick={() => navigate('/inventario')}>
                Ir al inventario
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipado**

```powershell
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npx tsc --noEmit 2>&1 | Select-String "CargaMasiva"
```

Expected: sin output (sin errores).

- [ ] **Step 3: Commit**

```powershell
git add src/app/components/CargaMasiva.tsx
git commit -m "feat(carga-masiva): add CargaMasiva component with 3-step stepper and live editing"
```

---

## Task 8: Integrar en App.tsx e Inventario.tsx

**Files:**
- Modify: `frontend/src/app/App.tsx`
- Modify: `frontend/src/app/components/Inventario.tsx`

- [ ] **Step 1: Agregar la importación y ruta en `App.tsx`**

Agregar import después de la línea de `EspecificacionesForm`:

```tsx
import { CargaMasiva } from './components/CargaMasiva';
```

Agregar ruta **antes** de `<Route path="/inventario/:id" ...>` (el catch-all dinámico debe ir al final):

```tsx
<Route path="/inventario/carga-masiva" element={<CargaMasiva />} />
```

El bloque de rutas de inventario debe quedar así:

```tsx
<Route path="/inventario" element={<Inventario />} />
<Route path="/inventario/nuevo" element={<InventarioNuevo />} />
<Route path="/inventario/:id/editar" element={<InventarioNuevo />} />
<Route path="/inventario/:id/especificaciones" element={<EspecificacionesForm />} />
<Route path="/inventario/carga-masiva" element={<CargaMasiva />} />
<Route path="/inventario/:id" element={<InventarioDetalle />} />
```

- [ ] **Step 2: Agregar el botón en `Inventario.tsx`**

En `Inventario.tsx`, localizar el bloque donde están los botones de Excel/PDF (buscar `inventarioExcel` o el botón de "Exportar"). Agregar el botón de carga masiva junto a ellos:

```tsx
// Agregar import al inicio del archivo:
import { useNavigate } from 'react-router';

// Dentro del componente, agregar junto al botón de exportar Excel:
const navigate = useNavigate();

// En el JSX, junto a los botones existentes de Excel/PDF:
<Button
  variant="outline"
  size="sm"
  className="border-[#6B7F3A] text-[#6B7F3A] hover:bg-[#6B7F3A] hover:text-white"
  onClick={() => navigate('/inventario/carga-masiva')}
>
  <Upload className="w-4 h-4 mr-2" />
  Carga masiva
</Button>
```

> **Nota:** Si `Inventario.tsx` ya importa `useNavigate` desde sesiones anteriores, no duplicar el import. Verificar antes de agregar. Agregar `Upload` al import de `lucide-react` si no existe ya.

- [ ] **Step 3: Build de verificación**

```powershell
cd "C:\Users\jtorr\OneDrive\Documentos\Drive_Recuperado\1_UTP\Noveno\INTEGRADOR II\sgi-emch\frontend"
npm run build 2>&1 | tail -20
```

Expected: `✓ built in Xs` — sin errores. Puede haber advertencias de chunk size.

- [ ] **Step 4: Commit final**

```powershell
git add src/app/App.tsx src/app/components/Inventario.tsx
git commit -m "feat(carga-masiva): wire CargaMasiva route and add button in Inventario"
```

---

## Self-Review

### Spec coverage

| Requisito | Tarea |
|-----------|-------|
| Plantilla Excel con dropdowns de catálogo | Task 4 (generarPlantilla) |
| POST /validar — read-only, parsea Excel | Task 4 (parsearExcel) + Task 5 (controller) |
| POST /validar-json — re-validación desde UI | Task 5 (controller) |
| POST /confirmar — all-or-nothing | Task 3 (confirmar) + Task 5 (controller) |
| 32 columnas (14 equipo + 18 specs) | Task 1 (FilaCarga) |
| FK por nombre case-insensitive | Task 2 (repositorios) + Task 3 (validarFila) |
| Detección de duplicados intra-lote | Task 3 (validarFila) |
| Detección de duplicados en BD | Task 3 (validarFila) |
| Re-verificación de unicidad en /confirmar | Task 3 (guardarFila) |
| Stepper 3 pasos | Task 7 (CargaMasiva.tsx) |
| Edición en vivo de celdas con error | Task 7 (CeldaEditable + actualizarCampo) |
| Re-validación por fila | Task 7 (revalidarFila) |
| Re-validación masiva | Task 7 (revalidarTodo) |
| "Confirmar" deshabilitado si hay errores | Task 7 (todasOk) |
| Resultado final con resumen | Task 7 (Paso 3) |
| Ruta /inventario/carga-masiva | Task 8 (App.tsx) |
| Botón en Inventario.tsx | Task 8 |

### Consistencia de tipos

- `FilaCarga.java` ↔ `FilaCarga` (TS): 32 campos `String`/`string` ✓
- `FilaValidada.java` ↔ `FilaValidada` (TS): `numeroFila`, `datos`, `estado`, `errores`, IDs resueltos ✓
- `ValidacionRequest`: `{ filas: FilaCarga[] }` en ambos lados ✓
- `ConfirmacionRequest`: `{ filas: FilaValidada[] }` en ambos lados ✓
- `revalidarFilas` en el service → llama a `/validar-json` (endpoint JSON, no multipart) ✓
- `EspecificacionTecnica` setters: usan los nombres exactos del entity (verificados en código fuente) ✓
- `Equipo.setSo()` (no `setSistemaOperativo`) — alineado con el entity ✓
