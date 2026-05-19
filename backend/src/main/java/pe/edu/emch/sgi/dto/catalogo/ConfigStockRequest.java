package pe.edu.emch.sgi.dto.catalogo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConfigStockRequest {
    @NotNull(message = "El umbral es obligatorio")
    @Min(value = 1, message = "El umbral mínimo es 1%")
    @Max(value = 100, message = "El umbral máximo es 100%")
    private Short umbralPct;
}
