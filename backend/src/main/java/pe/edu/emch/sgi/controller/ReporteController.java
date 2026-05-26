package pe.edu.emch.sgi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.emch.sgi.service.ReporteService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Exportación de reportes en Excel y PDF")
public class ReporteController {

    private final ReporteService reporteService;

    private static final MediaType EXCEL_TYPE =
        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    @GetMapping("/inventario/excel")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'SUBJEFE_DTIC')")
    @Operation(summary = "Exportar inventario de equipos a Excel (.xlsx)")
    public ResponseEntity<byte[]> inventarioExcel() {
        byte[] content  = reporteService.generarExcel();
        String filename = "inventario-equipos-" + LocalDate.now() + ".xlsx";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(EXCEL_TYPE)
            .body(content);
    }

    @GetMapping("/inventario/pdf")
    @Operation(summary = "Exportar inventario de equipos a PDF")
    public ResponseEntity<byte[]> inventarioPdf() {
        byte[] content  = reporteService.generarPdf();
        String filename = "inventario-equipos-" + LocalDate.now() + ".pdf";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(content);
    }
}
