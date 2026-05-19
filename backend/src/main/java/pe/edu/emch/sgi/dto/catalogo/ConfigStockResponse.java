package pe.edu.emch.sgi.dto.catalogo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConfigStockResponse {
    private Integer idConfig;
    private Integer idTipo;
    private String nombreTipo;
    private Short umbralPct;
    private LocalDateTime fechaModificacion;
}
