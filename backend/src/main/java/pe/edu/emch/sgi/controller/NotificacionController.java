package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
            @PageableDefault(size = 20, sort = "fechaCreacion", direction = Sort.Direction.DESC) Pageable pageable,
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
