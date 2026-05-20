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
    @Operation(summary = "Tickets activos con SLA")
    public ResponseEntity<ApiResponse<List<TicketsActivosResponse>>> listarTicketsActivos() {
        return ResponseEntity.ok(ApiResponse.ok("OK", dashboardService.listarTicketsActivos()));
    }
}
