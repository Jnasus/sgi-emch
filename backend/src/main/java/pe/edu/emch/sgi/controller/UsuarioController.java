package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.emch.sgi.dto.common.ApiResponse;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.usuario.CambioPasswordRequest;
import pe.edu.emch.sgi.dto.usuario.EstadoUsuarioRequest;
import pe.edu.emch.sgi.dto.usuario.RolResponse;
import pe.edu.emch.sgi.dto.usuario.UsuarioCreateRequest;
import pe.edu.emch.sgi.dto.usuario.UsuarioResponse;
import pe.edu.emch.sgi.dto.usuario.UsuarioUpdateRequest;
import pe.edu.emch.sgi.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
@Tag(name = "Usuarios", description = "Gestión de usuarios del sistema")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @Operation(summary = "Listar usuarios paginado, filtrable por ?activo= y ?idRol=")
    public ResponseEntity<ApiResponse<PagedResponse<UsuarioResponse>>> listarUsuarios(
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) Integer idRol,
            @PageableDefault(size = 20, sort = "apellidos") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("OK",
            usuarioService.listarUsuarios(activo, idRol, pageable)));
    }

    @GetMapping("/roles")
    @Operation(summary = "Listar roles disponibles")
    public ResponseEntity<ApiResponse<List<RolResponse>>> listarRoles() {
        return ResponseEntity.ok(ApiResponse.ok("OK", usuarioService.listarRoles()));
    }

    @GetMapping("/tecnicos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','TECNICO_CAMPO')")
    @Operation(summary = "Listar técnicos de campo activos")
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> listarTecnicos() {
        return ResponseEntity.ok(ApiResponse.ok("OK", usuarioService.listarTecnicos()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<ApiResponse<UsuarioResponse>> obtenerUsuario(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", usuarioService.obtenerUsuario(id)));
    }

    @PostMapping
    @Operation(summary = "Crear usuario")
    public ResponseEntity<ApiResponse<UsuarioResponse>> crearUsuario(
            @Valid @RequestBody UsuarioCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Usuario creado correctamente",
                usuarioService.crearUsuario(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de usuario")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizarUsuario(
            @PathVariable Integer id,
            @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado",
            usuarioService.actualizarUsuario(id, request)));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar o desactivar usuario")
    public ResponseEntity<ApiResponse<UsuarioResponse>> cambiarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody EstadoUsuarioRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado",
            usuarioService.cambiarEstado(id, request)));
    }

    @PutMapping("/{id}/password")
    @Operation(summary = "Resetear contraseña de usuario")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(
            @PathVariable Integer id,
            @Valid @RequestBody CambioPasswordRequest request) {
        usuarioService.cambiarPassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada correctamente"));
    }
}
