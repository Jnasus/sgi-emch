package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

@Data
public class TipoIncidenteResponse {
    private Integer idTipoIncidente;
    private String nombreTipo;
    private Integer tiempoRespuestaMin;
    private Integer tiempoResolucionMin;
    private String descripcion;
}
