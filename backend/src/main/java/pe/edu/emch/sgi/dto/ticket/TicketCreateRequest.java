package pe.edu.emch.sgi.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketCreateRequest {

    @NotNull(message = "El equipo es obligatorio")
    private Integer idEquipo;

    @NotNull(message = "El técnico es obligatorio")
    private Integer idTecnico;

    @NotNull(message = "El tipo de incidente es obligatorio")
    private Integer idTipoIncidente;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede superar los 200 caracteres")
    private String titulo;

    private String descripcion;

    @Pattern(regexp = "BAJA|MEDIA|ALTA|CRITICA", message = "La prioridad debe ser BAJA, MEDIA, ALTA o CRITICA")
    private String prioridad;
}
