package pe.edu.emch.sgi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.emch.sgi.entity.Notificacion;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.NotificacionRepository;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificadorServiceTest {

    @Mock NotificacionRepository notificacionRepository;
    @InjectMocks NotificadorService notificadorService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setIdUsuario(1);
        usuario.setNombres("Juan");
        usuario.setApellidos("Perez");
    }

    @Test
    void crearSiNoExiste_cuandoNoExiste_guardaNotificacion() {
        when(notificacionRepository.existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
                1, "TICKET_ASIGNADO", "/incidentes/10")).thenReturn(false);
        when(notificacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificadorService.crearSiNoExiste(
                usuario, "TICKET_ASIGNADO", "Nuevo ticket", "Mensaje", "/incidentes/10");

        verify(notificacionRepository).save(argThat(n ->
                "TICKET_ASIGNADO".equals(n.getTipoNotif()) &&
                Boolean.FALSE.equals(n.getLeida()) &&
                "/incidentes/10".equals(n.getUrlAccion())
        ));
    }

    @Test
    void crearSiNoExiste_cuandoYaExiste_noGuarda() {
        when(notificacionRepository.existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
                1, "SLA_VENCIDO", "/incidentes/10")).thenReturn(true);

        notificadorService.crearSiNoExiste(
                usuario, "SLA_VENCIDO", "SLA vencido", "Mensaje", "/incidentes/10");

        verify(notificacionRepository, never()).save(any());
    }
}
