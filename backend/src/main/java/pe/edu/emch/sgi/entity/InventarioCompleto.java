package pe.edu.emch.sgi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Immutable
@Table(name = "v_inventario_completo")
@Getter
@NoArgsConstructor
public class InventarioCompleto {

    @Id
    @Column(name = "id_equipo")
    private Integer idEquipo;

    @Column(name = "codigo_ejercito")
    private String codigoEjercito;

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "marca")
    private String marca;

    @Column(name = "modelo")
    private String modelo;

    @Column(name = "codigo_area")
    private String codigoArea;

    @Column(name = "area")
    private String area;

    @Column(name = "nombre_so")
    private String nombreSo;

    @Column(name = "version_so")
    private String versionSo;

    @Column(name = "numero_serie")
    private String numeroSerie;

    @Column(name = "nombre_responsable")
    private String nombreResponsable;

    @Column(name = "mac_address")
    private String macAddress;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "tipo_red")
    private String tipoRed;

    @Column(name = "estado")
    private String estado;

    @Column(name = "fecha_adquisicion")
    private LocalDate fechaAdquisicion;

    @Column(name = "anios_antiguedad")
    private Integer aniosAntiguedad;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Column(name = "fecha_baja")
    private LocalDate fechaBaja;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "procesador")
    private String procesador;

    @Column(name = "nucleos", columnDefinition = "TINYINT")
    private Integer nucleos;

    @Column(name = "hilos", columnDefinition = "TINYINT")
    private Integer hilos;

    @Column(name = "ram_total_gb", columnDefinition = "SMALLINT")
    private Integer ramTotalGb;

    @Column(name = "ram_marca")
    private String ramMarca;

    @Column(name = "ram_velocidad_mhz", columnDefinition = "SMALLINT")
    private Integer ramVelocidadMhz;

    @Column(name = "disco_capacidad_gb")
    private BigDecimal discoCapacidadGb;

    @Column(name = "disco_usado_gb")
    private BigDecimal discoUsadoGb;

    @Column(name = "disco_libre_gb")
    private BigDecimal discoLibreGb;

    @Column(name = "disco_uso_pct")
    private BigDecimal discoUsoPct;

    @Column(name = "gpu_marca")
    private String gpuMarca;

    @Column(name = "gpu_modelo")
    private String gpuModelo;

    @Column(name = "monitor_marca")
    private String monitorMarca;

    @Column(name = "monitor_modelo")
    private String monitorModelo;
}
