package pe.edu.emch.sgi.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TicketCambioEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "ABIERTO|EN_PROCESO|RESUELTO|CERRADO",
            message = "El estado debe ser ABIERTO, EN_PROCESO, RESUELTO o CERRADO")
    private String estado;
}
