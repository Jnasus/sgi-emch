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

    /** Descarga la plantilla Excel dinámica con dropdowns de catálogos actuales. */
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
     * Recibe el archivo Excel subido, lo parsea fila a fila y valida sin escribir en BD.
     */
    @PostMapping(value = "/validar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Subir y validar archivo Excel (sin guardar)")
    public ResponseEntity<ApiResponse<ValidacionResponse>> validarArchivo(
            @RequestParam("file") MultipartFile file) {
        List<FilaCarga> filas = cargaMasivaService.parsearExcel(file);
        ValidacionResponse resp = cargaMasivaService.validar(new ValidacionRequest(filas));
        return ResponseEntity.ok(ApiResponse.<ValidacionResponse>ok("Validación completada", resp));
    }

    /**
     * Re-valida filas enviadas como JSON desde la UI (edición en vivo).
     * No escribe nada en BD.
     */
    @PostMapping("/validar-json")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Validar filas enviadas como JSON (re-validación desde UI)")
    public ResponseEntity<ApiResponse<ValidacionResponse>> validarJson(
            @RequestBody ValidacionRequest request) {
        ValidacionResponse resp = cargaMasivaService.validar(request);
        return ResponseEntity.ok(ApiResponse.ok("Validación completada", resp));
    }

    /**
     * Persiste todas las filas con estado "OK" en una sola transacción all-or-nothing.
     */
    @PostMapping("/confirmar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'JEFE_DTIC', 'SUBJEFE_DTIC', 'TECNICO_CAMPO')")
    @Operation(summary = "Confirmar y guardar el lote validado")
    public ResponseEntity<ApiResponse<ConfirmacionResponse>> confirmar(
            @RequestBody ConfirmacionRequest request) {
        ConfirmacionResponse resp = cargaMasivaService.confirmar(request);
        return ResponseEntity.ok(ApiResponse.ok("Carga completada", resp));
    }
}
