package pe.edu.emch.sgi.dto.equipo.cargamasiva;

import java.util.List;

public record FilaValidada(
    int numeroFila,
    FilaCarga datos,
    String estado,             // "OK" | "ERROR"
    List<ErrorFila> errores,
    // IDs resueltos para uso en /confirmar (null si estado=ERROR)
    Integer idTipoResuelto,
    Integer idModeloResuelto,
    Integer idAreaResuelta,
    Integer idSoResuelto
) {}
