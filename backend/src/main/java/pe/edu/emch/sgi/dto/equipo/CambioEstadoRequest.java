package pe.edu.emch.sgi.dto.equipo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CambioEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "EN_BODEGA|ASIGNADO|EN_REPARACION|PRESTADO|DADO_DE_BAJA",
             message = "Estado inválido. Valores permitidos: EN_BODEGA, ASIGNADO, EN_REPARACION, PRESTADO, DADO_DE_BAJA")
    private String estado;

    @Size(max = 255, message = "El motivo no puede superar 255 caracteres")
    private String motivo;
}
