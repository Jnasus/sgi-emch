package pe.edu.emch.sgi.dto.usuario;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RolResponse {
    private Integer idRol;
    private String nombreRol;
    private String descripcion;
}
