package pe.edu.emch.sgi.dto.equipo;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EquipoResponse {

    private Integer idEquipo;
    private String codigoEjercito;

    private Integer idTipo;
    private String nombreTipo;

    private Integer idModelo;
    private String nombreModelo;

    private Integer idArea;
    private String nombreArea;

    private Integer idSo;
    private String nombreSo;
    private String versionSo;

    private String numeroSerie;
    private String nombreResponsable;
    private String macAddress;
    private String ipAddress;
    private String tipoRed;
    private String estado;

    private LocalDate fechaAdquisicion;
    private LocalDate fechaRegistro;
    private LocalDate fechaBaja;
    private String observaciones;

    private EspecificacionTecnicaResponse especificaciones;
}
