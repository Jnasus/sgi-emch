package pe.edu.emch.sgi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.usuario.CambioPasswordRequest;
import pe.edu.emch.sgi.dto.usuario.EstadoUsuarioRequest;
import pe.edu.emch.sgi.dto.usuario.RolResponse;
import pe.edu.emch.sgi.dto.usuario.UsuarioCreateRequest;
import pe.edu.emch.sgi.dto.usuario.UsuarioResponse;
import pe.edu.emch.sgi.dto.usuario.UsuarioUpdateRequest;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.Rol;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.DuplicateResourceException;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.AreaRepository;
import pe.edu.emch.sgi.repository.RolRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock RolRepository rolRepository;
    @Mock AreaRepository areaRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UsuarioService usuarioService;

    private Usuario usuario;
    private Rol rol;
    private Area area;

    @BeforeEach
    void setUp() {
        rol = new Rol();
        rol.setIdRol(1);
        rol.setNombreRol("ADMINISTRADOR");

        area = new Area();
        area.setIdArea(1);
        area.setNombreArea("DTIC");

        usuario = new Usuario();
        usuario.setIdUsuario(1);
        usuario.setRol(rol);
        usuario.setArea(area);
        usuario.setNombres("Juan");
        usuario.setApellidos("Torres");
        usuario.setDni("12345678");
        usuario.setUsername("jtorres");
        usuario.setPasswordHash("$2a$10$hash");
        usuario.setActivo(true);
        usuario.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void obtenerUsuario_encontrado() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        UsuarioResponse r = usuarioService.obtenerUsuario(1);
        assertThat(r.getIdUsuario()).isEqualTo(1);
        assertThat(r.getUsername()).isEqualTo("jtorres");
    }

    @Test
    void obtenerUsuario_noEncontrado_lanzaExcepcion() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> usuarioService.obtenerUsuario(99))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listarRoles_retornaLista() {
        when(rolRepository.findAll()).thenReturn(List.of(rol));
        List<RolResponse> lista = usuarioService.listarRoles();
        assertThat(lista).hasSize(1);
        assertThat(lista.get(0).getNombreRol()).isEqualTo("ADMINISTRADOR");
    }

    @Test
    void listarUsuarios_retornaPagedResponse() {
        Page<Usuario> page = new PageImpl<>(List.of(usuario));
        when(usuarioRepository.findFiltered(isNull(), isNull(), any())).thenReturn(page);
        PagedResponse<UsuarioResponse> result = usuarioService.listarUsuarios(null, null, PageRequest.of(0, 20));
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUsername()).isEqualTo("jtorres");
    }

    @Test
    void crearUsuario_exitoso() {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setNombres("Juan");
        request.setApellidos("Torres");
        request.setDni("12345678");
        request.setUsername("jtorres");
        request.setPassword("password123");
        request.setIdRol(1);
        request.setIdArea(1);

        when(usuarioRepository.existsByDni("12345678")).thenReturn(false);
        when(usuarioRepository.existsByUsername("jtorres")).thenReturn(false);
        when(rolRepository.findById(1)).thenReturn(Optional.of(rol));
        when(areaRepository.findById(1)).thenReturn(Optional.of(area));
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hash");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioResponse r = usuarioService.crearUsuario(request);
        assertThat(r.getIdUsuario()).isEqualTo(1);
        verify(passwordEncoder).encode("password123");
        verify(usuarioRepository).save(argThat(u ->
            u.getCreatedAt() != null && Boolean.TRUE.equals(u.getActivo())));
    }

    @Test
    void crearUsuario_dniDuplicado_lanzaExcepcion() {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setDni("12345678");
        request.setUsername("jtorres");
        when(usuarioRepository.existsByDni("12345678")).thenReturn(true);
        assertThatThrownBy(() -> usuarioService.crearUsuario(request))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void crearUsuario_usernameDuplicado_lanzaExcepcion() {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setDni("12345678");
        request.setUsername("jtorres");
        when(usuarioRepository.existsByDni("12345678")).thenReturn(false);
        when(usuarioRepository.existsByUsername("jtorres")).thenReturn(true);
        assertThatThrownBy(() -> usuarioService.crearUsuario(request))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void actualizarUsuario_exitoso() {
        UsuarioUpdateRequest request = new UsuarioUpdateRequest();
        request.setNombres("Juan Carlos");
        request.setApellidos("Torres");
        request.setDni("12345678");
        request.setUsername("jtorres");
        request.setIdRol(1);
        request.setIdArea(1);

        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByDniAndIdUsuarioNot("12345678", 1)).thenReturn(false);
        when(usuarioRepository.existsByUsernameAndIdUsuarioNot("jtorres", 1)).thenReturn(false);
        when(rolRepository.findById(1)).thenReturn(Optional.of(rol));
        when(areaRepository.findById(1)).thenReturn(Optional.of(area));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioResponse r = usuarioService.actualizarUsuario(1, request);
        assertThat(r.getIdUsuario()).isEqualTo(1);
        verify(usuarioRepository).save(argThat(u -> "Juan Carlos".equals(u.getNombres())));
    }

    @Test
    void actualizarUsuario_noEncontrado_lanzaExcepcion() {
        UsuarioUpdateRequest request = new UsuarioUpdateRequest();
        request.setDni("12345678");
        request.setUsername("jtorres");
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> usuarioService.actualizarUsuario(99, request))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void actualizarUsuario_dniDuplicado_lanzaExcepcion() {
        UsuarioUpdateRequest request = new UsuarioUpdateRequest();
        request.setDni("12345678");
        request.setUsername("jtorres");
        request.setIdRol(1);
        request.setIdArea(1);
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByDniAndIdUsuarioNot("12345678", 1)).thenReturn(true);
        lenient().when(rolRepository.findById(1)).thenReturn(Optional.of(rol));
        lenient().when(areaRepository.findById(1)).thenReturn(Optional.of(area));
        assertThatThrownBy(() -> usuarioService.actualizarUsuario(1, request))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void actualizarUsuario_usernameDuplicado_lanzaExcepcion() {
        UsuarioUpdateRequest request = new UsuarioUpdateRequest();
        request.setDni("12345678");
        request.setUsername("jtorres");
        request.setIdRol(1);
        request.setIdArea(1);
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByDniAndIdUsuarioNot("12345678", 1)).thenReturn(false);
        when(usuarioRepository.existsByUsernameAndIdUsuarioNot("jtorres", 1)).thenReturn(true);
        lenient().when(rolRepository.findById(1)).thenReturn(Optional.of(rol));
        lenient().when(areaRepository.findById(1)).thenReturn(Optional.of(area));
        assertThatThrownBy(() -> usuarioService.actualizarUsuario(1, request))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void cambiarEstado_desactiva() {
        EstadoUsuarioRequest request = new EstadoUsuarioRequest();
        request.setActivo(false);
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
        UsuarioResponse r = usuarioService.cambiarEstado(1, request);
        assertThat(r.getIdUsuario()).isEqualTo(1);
        verify(usuarioRepository).save(argThat(u -> Boolean.FALSE.equals(u.getActivo())));
    }

    @Test
    void cambiarPassword_exitoso() {
        CambioPasswordRequest request = new CambioPasswordRequest();
        request.setNuevaPassword("newpass123");
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("newpass123")).thenReturn("$2a$10$newhash");
        usuarioService.cambiarPassword(1, request);
        verify(passwordEncoder).encode("newpass123");
        verify(usuarioRepository).save(argThat(u -> "$2a$10$newhash".equals(u.getPasswordHash())));
    }

    @Test
    void cambiarPassword_noEncontrado_lanzaExcepcion() {
        CambioPasswordRequest request = new CambioPasswordRequest();
        request.setNuevaPassword("newpass123");
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> usuarioService.cambiarPassword(99, request))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
