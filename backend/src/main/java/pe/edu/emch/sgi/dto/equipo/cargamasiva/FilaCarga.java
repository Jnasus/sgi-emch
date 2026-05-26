package pe.edu.emch.sgi.dto.equipo.cargamasiva;

public record FilaCarga(
    // Equipo (14 campos)
    String codigoEjercito,
    String tipo,
    String marca,
    String modelo,
    String area,
    String sistemaOperativo,
    String numeroSerie,
    String nombreResponsable,
    String macAddress,
    String ipAddress,
    String tipoRed,
    String estadoInicial,
    String fechaAdquisicion,
    String observaciones,
    // Especificaciones técnicas (18 campos, todos opcionales)
    String procesador,
    String nucleos,
    String hilos,
    String ramModulos,
    String ramTotalGb,
    String ramVelocidadMhz,
    String ramMarca,
    String discoModelo,
    String discoInterface,
    String discoCapacidadGb,
    String discoUsadoGb,
    String discoLibreGb,
    String gpuMarca,
    String gpuModelo,
    String gpuVramGb,
    String monitorMarca,
    String monitorModelo,
    String redModelo
) {}
