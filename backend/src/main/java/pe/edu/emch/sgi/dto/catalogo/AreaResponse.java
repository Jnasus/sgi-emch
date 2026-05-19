package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class AreaResponse {
    private Integer idArea;
    private String codigoArea;
    private String nombreArea;
    private String descripcion;
    private Integer anioVigencia;
}
