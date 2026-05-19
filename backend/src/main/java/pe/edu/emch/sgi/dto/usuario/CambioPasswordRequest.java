package pe.edu.emch.sgi.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CambioPasswordRequest {

    @NotBlank
    @Size(min = 6, max = 255)
    private String nuevaPassword;
}
