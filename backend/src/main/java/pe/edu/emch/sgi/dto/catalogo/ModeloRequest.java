package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ModeloRequest {
    @NotNull(message = "La marca es obligatoria")
    private Integer idMarca;

    @NotNull(message = "El tipo de equipo es obligatorio")
    private Integer idTipo;

    @NotBlank(message = "El nombre del modelo es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombreModelo;
}
