package pe.edu.emch.sgi.dto.equipo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class EspecificacionTecnicaRequest {

    private String procesador;
    private Short nucleos;
    private Short hilos;
    private Short ramModulos;
    private Integer ramTotalGb;
    private Integer ramVelocidadMhz;
    private String ramMarca;
    private String discoModelo;
    private String discoInterface;
    private BigDecimal discoCapacidadGb;
    private BigDecimal discoUsadoGb;
    private BigDecimal discoLibreGb;
    private String gpuMarca;
    private String gpuModelo;
    private BigDecimal gpuVramGb;
    private String monitorMarca;
    private String monitorModelo;
    private String redModelo;
}
