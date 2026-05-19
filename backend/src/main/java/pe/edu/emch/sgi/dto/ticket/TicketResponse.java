package pe.edu.emch.sgi.dto.ticket;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Integer idTicket;
    private String numeroTicket;
    private Integer idEquipo;
    private String codigoEjercito;
    private Integer idTecnico;
    private String nombresTecnico;
    private String apellidosTecnico;
    private Integer idTipoIncidente;
    private String nombreTipoIncidente;
    private String titulo;
    private String descripcion;
    private String estado;
    private String prioridad;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaRespuesta;
    private LocalDateTime fechaResolucion;
    private LocalDateTime fechaCierre;
    private Boolean fueraDeSla;
    private String pdfActaPath;
}
