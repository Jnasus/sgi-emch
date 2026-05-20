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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.emch.sgi.dto.common.ApiResponse;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.ticket.HistorialTicketResponse;
import pe.edu.emch.sgi.dto.ticket.TicketCambioEstadoRequest;
import pe.edu.emch.sgi.dto.ticket.TicketCreateRequest;
import pe.edu.emch.sgi.dto.ticket.TicketResponse;
import pe.edu.emch.sgi.service.TicketService;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Gestión de tickets de incidencias")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    @Operation(summary = "Listar tickets paginado, filtrable por ?estado=, ?prioridad=, ?idEquipo=, ?idTecnico=")
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponse>>> listarTickets(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) Integer idEquipo,
            @RequestParam(required = false) Integer idTecnico,
            @PageableDefault(size = 20, sort = "fechaApertura") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("OK",
                ticketService.listarTickets(estado, prioridad, idEquipo, idTecnico, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener ticket por ID")
    public ResponseEntity<ApiResponse<TicketResponse>> obtenerTicket(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", ticketService.obtenerTicket(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('TECNICO_CAMPO')")
    @Operation(summary = "Crear ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> crearTicket(
            @Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ticket creado correctamente", ticketService.crearTicket(request)));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('TECNICO_CAMPO')")
    @Operation(summary = "Cambiar estado del ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> cambiarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody TicketCambioEstadoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado",
                ticketService.cambiarEstado(id, request)));
    }

    @GetMapping("/{id}/historial")
    @Operation(summary = "Listar historial de cambios de estado del ticket")
    public ResponseEntity<ApiResponse<List<HistorialTicketResponse>>> listarHistorial(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", ticketService.listarHistorial(id)));
    }
}
