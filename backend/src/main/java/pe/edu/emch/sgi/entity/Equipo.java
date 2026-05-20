package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "equipo")
@Getter
@Setter
@NoArgsConstructor
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Integer idEquipo;

    @Column(name = "codigo_ejercito", nullable = false, unique = true, length = 20)
    private String codigoEjercito;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoEquipo tipo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_modelo", nullable = false)
    private ModeloEquipo modelo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_area", nullable = false)
    private Area area;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_so", nullable = false)
    private SistemaOperativo so;

    @Column(name = "numero_serie", nullable = false, unique = true, length = 80)
    private String numeroSerie;

    @Column(name = "nombre_responsable", nullable = false, length = 150)
    private String nombreResponsable;

    @Column(name = "mac_address", unique = true, length = 17)
    private String macAddress;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "tipo_red", nullable = false,
        columnDefinition = "ENUM('ETHERNET', 'WIFI', 'N/A')")
    private String tipoRed;

    @Column(name = "estado", nullable = false,
        columnDefinition = "ENUM('EN_BODEGA', 'ASIGNADO', 'EN_REPARACION', 'PRESTADO', 'DADO_DE_BAJA')")
    private String estado;

    @Column(name = "fecha_adquisicion")
    private LocalDate fechaAdquisicion;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro;

    @Column(name = "fecha_baja")
    private LocalDate fechaBaja;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
}
