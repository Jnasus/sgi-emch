package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MarcaRequest {
    @NotBlank(message = "El nombre de la marca es obligatorio")
    @Size(max = 80, message = "El nombre no puede superar 80 caracteres")
    private String nombreMarca;
}
