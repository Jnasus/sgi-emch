package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "especificacion_tecnica")
@Getter
@Setter
@NoArgsConstructor
public class EspecificacionTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_espec")
    private Integer idEspec;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_equipo", nullable = false, unique = true)
    private Equipo equipo;

    @Column(name = "procesador", length = 150)
    private String procesador;

    @Column(name = "nucleos", columnDefinition = "TINYINT UNSIGNED")
    private Short nucleos;

    @Column(name = "hilos", columnDefinition = "TINYINT UNSIGNED")
    private Short hilos;

    @Column(name = "ram_modulos", columnDefinition = "TINYINT UNSIGNED")
    private Short ramModulos;

    @Column(name = "ram_total_gb")
    private Integer ramTotalGb;

    @Column(name = "ram_velocidad_mhz")
    private Integer ramVelocidadMhz;

    @Column(name = "ram_marca", length = 50)
    private String ramMarca;

    @Column(name = "disco_modelo", length = 100)
    private String discoModelo;

    @Column(name = "disco_interface", length = 20)
    private String discoInterface;

    @Column(name = "disco_capacidad_gb", precision = 8, scale = 2)
    private BigDecimal discoCapacidadGb;

    @Column(name = "disco_usado_gb", precision = 8, scale = 2)
    private BigDecimal discoUsadoGb;

    @Column(name = "disco_libre_gb", precision = 8, scale = 2)
    private BigDecimal discoLibreGb;

    @Column(name = "gpu_marca", length = 50)
    private String gpuMarca;

    @Column(name = "gpu_modelo", length = 100)
    private String gpuModelo;

    @Column(name = "gpu_vram_gb", precision = 4, scale = 2)
    private BigDecimal gpuVramGb;

    @Column(name = "monitor_marca", length = 50)
    private String monitorMarca;

    @Column(name = "monitor_modelo", length = 80)
    private String monitorModelo;

    @Column(name = "red_modelo", length = 100)
    private String redModelo;
}
