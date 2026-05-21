package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.emch.sgi.dto.catalogo.AreaRequest;
import pe.edu.emch.sgi.dto.catalogo.AreaResponse;
import pe.edu.emch.sgi.dto.catalogo.ConfigStockRequest;
import pe.edu.emch.sgi.dto.catalogo.ConfigStockResponse;
import pe.edu.emch.sgi.dto.catalogo.MarcaRequest;
import pe.edu.emch.sgi.dto.catalogo.MarcaResponse;
import pe.edu.emch.sgi.dto.catalogo.ModeloRequest;
import pe.edu.emch.sgi.dto.catalogo.ModeloResponse;
import pe.edu.emch.sgi.dto.catalogo.SistemaOperativoRequest;
import pe.edu.emch.sgi.dto.catalogo.SistemaOperativoResponse;
import pe.edu.emch.sgi.dto.catalogo.SlaConfigRequest;
import pe.edu.emch.sgi.dto.catalogo.TipoEquipoRequest;
import pe.edu.emch.sgi.dto.catalogo.TipoEquipoResponse;
import pe.edu.emch.sgi.dto.catalogo.TipoIncidenteResponse;
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

    @PostMapping("/sistemas-operativos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear sistema operativo")
    public ResponseEntity<ApiResponse<SistemaOperativoResponse>> crearSistemaOperativo(
            @Valid @RequestBody SistemaOperativoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Sistema operativo creado",
                catalogoService.crearSistemaOperativo(request)));
    }

    @PutMapping("/sistemas-operativos/{idSo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar sistema operativo")
    public ResponseEntity<ApiResponse<SistemaOperativoResponse>> actualizarSistemaOperativo(
            @PathVariable Integer idSo,
            @Valid @RequestBody SistemaOperativoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Sistema operativo actualizado",
            catalogoService.actualizarSistemaOperativo(idSo, request)));
    }

    @GetMapping("/areas/todas")
    @Operation(summary = "Listar todas las áreas (incluye inactivas)")
    public ResponseEntity<ApiResponse<List<AreaResponse>>> listarTodasAreas() {
        return ResponseEntity.ok(ApiResponse.ok("OK", catalogoService.listarTodasAreas()));
    }

    @PostMapping("/areas")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear área")
    public ResponseEntity<ApiResponse<AreaResponse>> crearArea(
            @Valid @RequestBody AreaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Área creada", catalogoService.crearArea(request)));
    }

    @PutMapping("/areas/{idArea}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar área")
    public ResponseEntity<ApiResponse<AreaResponse>> actualizarArea(
            @PathVariable Integer idArea,
            @Valid @RequestBody AreaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Área actualizada",
            catalogoService.actualizarArea(idArea, request)));
    }
}
