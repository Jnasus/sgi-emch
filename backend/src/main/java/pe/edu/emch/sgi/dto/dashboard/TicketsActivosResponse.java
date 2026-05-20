package pe.edu.emch.sgi.dto.dashboard;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketsActivosResponse {
    private Integer idTicket;
    private String numeroTicket;
    private String codigoEjercito;
    private String nombreArea;
    private String tecnico;
    private String tipoIncidente;
    private String titulo;
    private String estado;
    private String prioridad;
    private LocalDateTime fechaApertura;
    private Integer slaMinutos;
    private Integer minutosTranscurridos;
    private Integer minutosRestantesSla;
    private Boolean slaVencido;
    private Boolean fueraDeSla;
}
