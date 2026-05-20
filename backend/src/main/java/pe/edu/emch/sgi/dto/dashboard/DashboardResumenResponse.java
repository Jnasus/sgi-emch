package pe.edu.emch.sgi.dto.dashboard;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DashboardResumenResponse {
    private String nombreTipo;
    private Integer total;
    private Integer asignados;
    private Integer enBodega;
    private Integer enReparacion;
    private Integer dadosDeBaja;
    private Integer stockOperativo;
    private Integer umbralStockPct;
    private BigDecimal pctOperativo;
    private Integer equiposMayores5Anios;
}
