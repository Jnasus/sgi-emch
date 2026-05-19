package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.config.JwtConfig;
import pe.edu.emch.sgi.dto.auth.LoginRequest;
import pe.edu.emch.sgi.dto.auth.LoginResponse;
import pe.edu.emch.sgi.dto.auth.RefreshTokenRequest;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.exception.UnauthorizedException;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.security.JwtUtil;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final JwtConfig jwtConfig;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsernameAndActivoTrue(request.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String accessToken = jwtUtil.generateAccessToken(usuario);
        String refreshToken = jwtUtil.generateRefreshToken(usuario.getUsername());

        usuarioRepository.actualizarUltimoAcceso(usuario.getIdUsuario(), LocalDateTime.now());

        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtConfig.getExpirationMs() / 1000)
            .idUsuario(usuario.getIdUsuario())
            .username(usuario.getUsername())
            .rol(usuario.getRol().getNombreRol())
            .idArea(usuario.getArea().getIdArea())
            .build();
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new UnauthorizedException("Refresh token inválido o expirado");
        }

        String username = jwtUtil.extractUsername(refreshToken);
        Usuario usuario = usuarioRepository.findByUsernameAndActivoTrue(username)
            .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado o inactivo"));

        String newAccessToken = jwtUtil.generateAccessToken(usuario);
        String newRefreshToken = jwtUtil.generateRefreshToken(username);

        return LoginResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtConfig.getExpirationMs() / 1000)
            .idUsuario(usuario.getIdUsuario())
            .username(usuario.getUsername())
            .rol(usuario.getRol().getNombreRol())
            .idArea(usuario.getArea().getIdArea())
            .build();
    }
}
