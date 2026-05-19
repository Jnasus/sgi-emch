package pe.edu.emch.sgi.dto.usuario;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EstadoUsuarioRequest {

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean activo;
}
