package pe.edu.emch.sgi.dto.notificacion;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificacionResponse {
    private Integer idNotif;
    private Integer idUsuario;
    private String tipoNotif;
    private String titulo;
    private String mensaje;
    private Boolean leida;
    private String urlAccion;
    private LocalDateTime fechaCreacion;
}
