package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AreaRequest {

    @NotBlank(message = "El código de área es obligatorio")
    @Size(max = 20, message = "El código no puede superar 20 caracteres")
    private String codigoArea;

    @NotBlank(message = "El nombre del área es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombreArea;

    @Size(max = 255)
    private String descripcion;

    @NotNull(message = "El año de vigencia es obligatorio")
    private Integer anioVigencia;
}
