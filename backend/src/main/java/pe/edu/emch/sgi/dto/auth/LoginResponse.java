package pe.edu.emch.sgi.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private Integer idUsuario;
    private String username;
    private String rol;
    private Integer idArea;
}
