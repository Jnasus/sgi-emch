package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.emch.sgi.dto.common.ApiResponse;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.equipo.*;
import pe.edu.emch.sgi.service.EquipoService;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
@RequiredArgsConstructor
@Tag(name = "Equipos", description = "Gestión del inventario de equipos")
public class EquipoController {

    private final EquipoService equipoService;

    @GetMapping
    @Operation(summary = "Listar equipos paginado, filtrable por ?estado=, ?idArea=, ?idTipo=")
    public ResponseEntity<ApiResponse<PagedResponse<EquipoResponse>>> listarEquipos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer idArea,
            @RequestParam(required = false) Integer idTipo,
            @PageableDefault(size = 20, sort = "codigoEjercito") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("OK",
            equipoService.listarEquipos(estado, idArea, idTipo, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener equipo por ID, incluye especificaciones técnicas si existen")
    public ResponseEntity<ApiResponse<EquipoResponse>> obtenerEquipo(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", equipoService.obtenerEquipo(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Registrar nuevo equipo")
    public ResponseEntity<ApiResponse<EquipoResponse>> crearEquipo(
            @Valid @RequestBody EquipoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Equipo registrado correctamente",
                equipoService.crearEquipo(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Actualizar datos del equipo")
    public ResponseEntity<ApiResponse<EquipoResponse>> actualizarEquipo(
            @PathVariable Integer id,
            @Valid @RequestBody EquipoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Equipo actualizado",
            equipoService.actualizarEquipo(id, request)));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Cambiar estado del equipo y registrar historial")
    public ResponseEntity<ApiResponse<EquipoResponse>> cambiarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody CambioEstadoRequest request,
            HttpServletRequest httpRequest) {
        Integer idUsuarioActivo = (Integer) httpRequest.getAttribute("idUsuarioActivo");
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado",
            equipoService.cambiarEstado(id, request, idUsuarioActivo)));
    }

    @PutMapping("/{id}/especificaciones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Crear o actualizar especificaciones técnicas del equipo")
    public ResponseEntity<ApiResponse<EspecificacionTecnicaResponse>> upsertEspecificaciones(
            @PathVariable Integer id,
            @Valid @RequestBody EspecificacionTecnicaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Especificaciones actualizadas",
            equipoService.upsertEspecificaciones(id, request)));
    }

    @GetMapping("/{id}/historial")
    @Operation(summary = "Listar historial de cambios de estado del equipo")
    public ResponseEntity<ApiResponse<List<HistorialEstadoResponse>>> listarHistorial(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", equipoService.listarHistorial(id)));
    }
}
