package pe.edu.emch.sgi.dto.dashboard;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockCriticoResponse {
    private Integer idTipo;
    private String nombreTipo;
    private Integer totalEquipos;
    private Integer stockOperativo;
    private Integer umbralPct;
    private BigDecimal pctActual;
    private Boolean enAlerta;
}
