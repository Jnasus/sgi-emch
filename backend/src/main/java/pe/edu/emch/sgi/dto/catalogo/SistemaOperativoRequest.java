package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SistemaOperativoRequest {

    @NotBlank(message = "El nombre del SO es obligatorio")
    @Size(max = 80, message = "El nombre no puede superar 80 caracteres")
    private String nombreSo;

    @NotBlank(message = "La versión del SO es obligatoria")
    @Size(max = 50, message = "La versión no puede superar 50 caracteres")
    private String versionSo;
}
