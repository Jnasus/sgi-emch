package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SlaConfigRequest {
    @NotNull(message = "El tiempo de respuesta es obligatorio")
    @Min(value = 1, message = "El tiempo mínimo es 1 minuto")
    private Integer tiempoRespuestaMin;

    @NotNull(message = "El tiempo de resolución es obligatorio")
    @Min(value = 1, message = "El tiempo mínimo es 1 minuto")
    private Integer tiempoResolucionMin;
}
