package pe.edu.emch.sgi.dto.equipo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HistorialEstadoResponse {

    private Integer idHistorial;
    private String estadoAnterior;
    private String estadoNuevo;
    private String motivo;
    private LocalDateTime fechaCambio;
    private Integer idUsuario;
    private String nombresUsuario;
    private String apellidosUsuario;
}
