package pe.edu.emch.sgi.dto.usuario;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UsuarioResponse {
    private Integer idUsuario;
    private String nombres;
    private String apellidos;
    private String dni;
    private String username;
    private String email;
    private Integer idRol;
    private String nombreRol;
    private Integer idArea;
    private String nombreArea;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime ultimoAcceso;
}
