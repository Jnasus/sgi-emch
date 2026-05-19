package pe.edu.emch.sgi.dto.usuario;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EstadoUsuarioRequest {

    @NotNull
    private Boolean activo;
}
