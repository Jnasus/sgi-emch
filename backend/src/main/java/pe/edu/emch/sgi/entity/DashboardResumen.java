package pe.edu.emch.sgi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

@Entity
@Immutable
@Table(name = "v_dashboard_resumen")
@Getter
@NoArgsConstructor
public class DashboardResumen {

    @Id
    @Column(name = "nombre_tipo")
    private String nombreTipo;

    @Column(name = "total")
    private Integer total;

    @Column(name = "asignados")
    private Integer asignados;

    @Column(name = "en_bodega")
    private Integer enBodega;

    @Column(name = "en_reparacion")
    private Integer enReparacion;

    @Column(name = "dados_de_baja")
    private Integer dadosDeBaja;

    @Column(name = "stock_operativo")
    private Integer stockOperativo;

    @Column(name = "umbral_stock_pct", columnDefinition = "TINYINT")
    private Integer umbralStockPct;

    @Column(name = "pct_operativo")
    private BigDecimal pctOperativo;

    @Column(name = "equipos_mayores_5_anios")
    private Integer equiposMayores5Anios;
}
