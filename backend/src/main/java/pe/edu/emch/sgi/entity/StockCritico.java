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
@Table(name = "v_stock_critico")
@Getter
@NoArgsConstructor
public class StockCritico {

    @Id
    @Column(name = "id_tipo")
    private Integer idTipo;

    @Column(name = "nombre_tipo")
    private String nombreTipo;

    @Column(name = "total_equipos")
    private Integer totalEquipos;

    @Column(name = "stock_operativo")
    private Integer stockOperativo;

    @Column(name = "umbral_pct", columnDefinition = "TINYINT")
    private Integer umbralPct;

    @Column(name = "pct_actual")
    private BigDecimal pctActual;

    @Column(name = "en_alerta")
    private Boolean enAlerta;
}
