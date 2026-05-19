package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "config_stock")
@Getter @Setter @NoArgsConstructor
public class ConfigStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Integer idConfig;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoEquipo tipo;

    @Column(name = "umbral_pct", nullable = false)
    private Short umbralPct;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario_config", nullable = false)
    private Usuario usuarioConfig;

    @Column(name = "fecha_modificacion", insertable = false, updatable = false)
    private LocalDateTime fechaModificacion;
}
