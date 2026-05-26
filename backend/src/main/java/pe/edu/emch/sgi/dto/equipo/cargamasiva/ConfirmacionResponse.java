package pe.edu.emch.sgi.dto.equipo.cargamasiva;

import java.util.List;

public record ConfirmacionResponse(
    int total,
    int guardados,
    int errores,
    List<ErrorFila> detalleErrores
) {}
