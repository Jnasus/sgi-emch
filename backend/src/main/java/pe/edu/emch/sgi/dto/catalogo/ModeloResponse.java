package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class ModeloResponse {
    private Integer idModelo;
    private Integer idMarca;
    private String nombreMarca;
    private Integer idTipo;
    private String nombreTipo;
    private String nombreModelo;
}
