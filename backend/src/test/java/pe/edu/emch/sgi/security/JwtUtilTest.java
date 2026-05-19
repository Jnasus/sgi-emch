package pe.edu.emch.sgi.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pe.edu.emch.sgi.config.JwtConfig;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.Rol;
import pe.edu.emch.sgi.entity.Usuario;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        JwtConfig config = new JwtConfig();
        // 64 chars = 512 bits, sufficient for HS256
        config.setSecret("test-secret-key-minimo-256-bits-para-hs256-algoritmo-seguro-1234");
        config.setExpirationMs(3600000L);
        config.setRefreshExpirationMs(86400000L);
        jwtUtil = new JwtUtil(config);

        Rol rol = new Rol();
        rol.setIdRol(1);
        rol.setNombreRol("ADMINISTRADOR");

        Area area = new Area();
        area.setIdArea(2);
        area.setNombreArea("DTIC");

        usuario = new Usuario();
        usuario.setIdUsuario(10);
        usuario.setUsername("jperez");
        usuario.setRol(rol);
        usuario.setArea(area);
    }

    @Test
    void generateAccessToken_retornaTokenNoNulo() {
        String token = jwtUtil.generateAccessToken(usuario);
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // Header.Payload.Signature
    }

    @Test
    void extractUsername_devuelveUsernameCorrectamente() {
        String token = jwtUtil.generateAccessToken(usuario);
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("jperez");
    }

    @Test
    void extractClaims_contieneIdUsuarioRolIdArea() {
        String token = jwtUtil.generateAccessToken(usuario);
        var claims = jwtUtil.parseClaims(token);
        assertThat(claims.get("id_usuario", Integer.class)).isEqualTo(10);
        assertThat(claims.get("rol", String.class)).isEqualTo("ADMINISTRADOR");
        assertThat(claims.get("id_area", Integer.class)).isEqualTo(2);
    }

    @Test
    void isTokenValid_tokenValido_retornaTrue() {
        String token = jwtUtil.generateAccessToken(usuario);
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_tokenInvalido_retornaFalse() {
        assertThat(jwtUtil.isTokenValid("token.invalido.firma")).isFalse();
    }

    @Test
    void generateRefreshToken_extractUsername_correcto() {
        String refresh = jwtUtil.generateRefreshToken("jperez");
        assertThat(jwtUtil.extractUsername(refresh)).isEqualTo("jperez");
    }
}
