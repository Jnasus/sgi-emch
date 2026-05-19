package pe.edu.emch.sgi.dto.equipo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EquipoRequest {

    @NotBlank(message = "El código ejército es obligatorio")
    @Size(max = 20, message = "El código ejército no puede superar 20 caracteres")
    private String codigoEjercito;

    @NotNull(message = "El tipo de equipo es obligatorio")
    private Integer idTipo;

    @NotNull(message = "El modelo es obligatorio")
    private Integer idModelo;

    @NotNull(message = "El área es obligatoria")
    private Integer idArea;

    @NotNull(message = "El sistema operativo es obligatorio")
    private Integer idSo;

    @NotBlank(message = "El número de serie es obligatorio")
    @Size(max = 80, message = "El número de serie no puede superar 80 caracteres")
    private String numeroSerie;

    @NotBlank(message = "El nombre del responsable es obligatorio")
    @Size(max = 150, message = "El nombre del responsable no puede superar 150 caracteres")
    private String nombreResponsable;

    @Size(max = 17, message = "La MAC address no puede superar 17 caracteres")
    private String macAddress;

    @Size(max = 45, message = "La IP no puede superar 45 caracteres")
    private String ipAddress;

    @Pattern(regexp = "ETHERNET|WIFI|N/A",
             message = "El tipo de red debe ser ETHERNET, WIFI o N/A")
    private String tipoRed;

    private LocalDate fechaAdquisicion;
    private String observaciones;
}
