package pe.edu.emch.sgi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import pe.edu.emch.sgi.config.JwtConfig;
import pe.edu.emch.sgi.dto.auth.LoginRequest;
import pe.edu.emch.sgi.dto.auth.LoginResponse;
import pe.edu.emch.sgi.dto.auth.RefreshTokenRequest;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.Rol;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.UnauthorizedException;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.security.JwtUtil;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private JwtConfig jwtConfig;

    @InjectMocks
    private AuthService authService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        Rol rol = new Rol();
        rol.setIdRol(1);
        rol.setNombreRol("TECNICO");

        Area area = new Area();
        area.setIdArea(3);
        area.setNombreArea("DTIC");

        usuario = new Usuario();
        usuario.setIdUsuario(5);
        usuario.setUsername("jperez");
        usuario.setPasswordHash("$2a$10$hash");
        usuario.setActivo(true);
        usuario.setRol(rol);
        usuario.setArea(area);
    }

    @Test
    void login_credencialesValidas_retornaLoginResponse() {
        LoginRequest request = new LoginRequest();
        request.setUsername("jperez");
        request.setPassword("pass123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(usuarioRepository.findByUsernameAndActivoTrue("jperez"))
            .thenReturn(Optional.of(usuario));
        when(jwtUtil.generateAccessToken(usuario)).thenReturn("access.token.jwt");
        when(jwtUtil.generateRefreshToken("jperez")).thenReturn("refresh.token.jwt");
        when(jwtConfig.getExpirationMs()).thenReturn(3600000L);

        LoginResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access.token.jwt");
        assertThat(response.getRefreshToken()).isEqualTo("refresh.token.jwt");
        assertThat(response.getUsername()).isEqualTo("jperez");
        assertThat(response.getRol()).isEqualTo("TECNICO");
        assertThat(response.getIdUsuario()).isEqualTo(5);
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        verify(usuarioRepository).actualizarUltimoAcceso(eq(5), any());
    }

    @Test
    void login_credencialesInvalidas_lanzaExcepcion() {
        LoginRequest request = new LoginRequest();
        request.setUsername("jperez");
        request.setPassword("wrongpass");

        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void refresh_tokenValido_retornaNewAccessToken() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("valid.refresh.token");

        when(jwtUtil.isTokenValid("valid.refresh.token")).thenReturn(true);
        when(jwtUtil.extractUsername("valid.refresh.token")).thenReturn("jperez");
        when(usuarioRepository.findByUsernameAndActivoTrue("jperez"))
            .thenReturn(Optional.of(usuario));
        when(jwtUtil.generateAccessToken(usuario)).thenReturn("new.access.token");
        when(jwtUtil.generateRefreshToken("jperez")).thenReturn("new.refresh.token");
        when(jwtConfig.getExpirationMs()).thenReturn(3600000L);

        LoginResponse response = authService.refresh(request);

        assertThat(response.getAccessToken()).isEqualTo("new.access.token");
        assertThat(response.getRefreshToken()).isEqualTo("new.refresh.token");
    }

    @Test
    void refresh_tokenInvalido_lanzaUnauthorizedException() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("bad.token");

        when(jwtUtil.isTokenValid("bad.token")).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh(request))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessageContaining("Refresh token inválido");
    }
}
