package pe.edu.emch.sgi.dto.dashboard;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InventarioCompletoResponse {
    private Integer idEquipo;
    private String codigoEjercito;
    private String tipo;
    private String marca;
    private String modelo;
    private String codigoArea;
    private String area;
    private String nombreSo;
    private String versionSo;
    private String numeroSerie;
    private String nombreResponsable;
    private String macAddress;
    private String ipAddress;
    private String tipoRed;
    private String estado;
    private LocalDate fechaAdquisicion;
    private Integer aniosAntiguedad;
    private LocalDate fechaRegistro;
    private LocalDate fechaBaja;
    private String observaciones;
    private String procesador;
    private Integer nucleos;
    private Integer hilos;
    private Integer ramTotalGb;
    private String ramMarca;
    private Integer ramVelocidadMhz;
    private BigDecimal discoCapacidadGb;
    private BigDecimal discoUsadoGb;
    private BigDecimal discoLibreGb;
    private BigDecimal discoUsoPct;
    private String gpuMarca;
    private String gpuModelo;
    private String monitorMarca;
    private String monitorModelo;
}
