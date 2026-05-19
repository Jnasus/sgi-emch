package pe.edu.emch.sgi.dto.ticket;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HistorialTicketResponse {
    private Integer idHistTicket;
    private String estadoAnterior;
    private String estadoNuevo;
    private String comentario;
    private LocalDateTime fechaCambio;
    private Integer idUsuario;
    private String nombresUsuario;
    private String apellidosUsuario;
}
