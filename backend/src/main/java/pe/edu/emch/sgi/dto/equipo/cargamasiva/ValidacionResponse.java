package pe.edu.emch.sgi.dto.equipo.cargamasiva;

import java.util.List;

public record ValidacionResponse(
    int total,
    int totalErrores,
    List<FilaValidada> filas
) {}
