package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TipoEquipoRequest {
    @NotBlank(message = "El nombre del tipo es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
    private String nombreTipo;

    @Size(max = 255)
    private String descripcion;
}
