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
import pe.edu.emch.sgi.dto.notificacion.NotificacionResponse;
import pe.edu.emch.sgi.entity.Notificacion;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.NotificacionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock NotificacionRepository notificacionRepository;

    @InjectMocks NotificacionService notificacionService;

    private Usuario usuario;
    private Notificacion notificacion;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setIdUsuario(1);
        usuario.setNombres("Admin");
        usuario.setApellidos("Sistema");

        notificacion = new Notificacion();
        notificacion.setIdNotif(10);
        notificacion.setUsuario(usuario);
        notificacion.setTipoNotif("INFO");
        notificacion.setTitulo("Aviso de prueba");
        notificacion.setMensaje("Mensaje de prueba");
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(LocalDateTime.of(2026, 1, 15, 9, 0));
    }

    @Test
    void listarNotificaciones_sinFiltro_retornaPagedResponse() {
        Page<Notificacion> page = new PageImpl<>(List.of(notificacion));
        when(notificacionRepository.findByUsuarioFiltered(eq(1), isNull(), any()))
                .thenReturn(page);

        var result = notificacionService.listarNotificaciones(1, null, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitulo()).isEqualTo("Aviso de prueba");
        assertThat(result.getContent().get(0).getLeida()).isFalse();
    }

    @Test
    void listarNotificaciones_conFiltroLeida_filtra() {
        notificacion.setLeida(true);
        Page<Notificacion> page = new PageImpl<>(List.of(notificacion));
        when(notificacionRepository.findByUsuarioFiltered(eq(1), eq(true), any()))
                .thenReturn(page);

        var result = notificacionService.listarNotificaciones(1, true, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getLeida()).isTrue();
    }

    @Test
    void marcarLeida_exitoso_setLeidaTrue() {
        when(notificacionRepository.findById(10)).thenReturn(Optional.of(notificacion));
        when(notificacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        NotificacionResponse result = notificacionService.marcarLeida(10, 1);

        assertThat(result.getLeida()).isTrue();
        assertThat(result.getTitulo()).isEqualTo("Aviso de prueba");
    }

    @Test
    void marcarLeida_noEncontrada_lanzaExcepcion() {
        when(notificacionRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> notificacionService.marcarLeida(99, 1))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void marcarLeida_perteneceAOtroUsuario_lanzaExcepcion() {
        when(notificacionRepository.findById(10)).thenReturn(Optional.of(notificacion));
        assertThatThrownBy(() -> notificacionService.marcarLeida(10, 99))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void marcarTodasLeidas_delegaAlRepository() {
        when(notificacionRepository.marcarTodasLeidasByUsuario(1)).thenReturn(3);

        notificacionService.marcarTodasLeidas(1);

        verify(notificacionRepository).marcarTodasLeidasByUsuario(1);
    }

    @Test
    void eliminarNotificacion_exitoso_borraEntidad() {
        when(notificacionRepository.findById(10)).thenReturn(Optional.of(notificacion));
        doNothing().when(notificacionRepository).delete(notificacion);

        notificacionService.eliminarNotificacion(10, 1);

        verify(notificacionRepository).delete(notificacion);
    }

    @Test
    void eliminarNotificacion_noEncontrada_lanzaExcepcion() {
        when(notificacionRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> notificacionService.eliminarNotificacion(99, 1))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void eliminarNotificacion_perteneceAOtroUsuario_lanzaExcepcion() {
        when(notificacionRepository.findById(10)).thenReturn(Optional.of(notificacion));
        assertThatThrownBy(() -> notificacionService.eliminarNotificacion(10, 99))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
