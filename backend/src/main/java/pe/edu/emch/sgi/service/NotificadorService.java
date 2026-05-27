package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.entity.Notificacion;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.NotificacionRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificadorService {

    private final NotificacionRepository notificacionRepository;

    /**
     * Crea una notificación solo si no existe ya una con el mismo usuario + tipo + urlAccion.
     * Usa REQUIRES_NEW para que un fallo aquí no revierta la transacción del llamador.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void crearSiNoExiste(Usuario usuario, String tipoNotif,
                                String titulo, String mensaje, String urlAccion) {
        if (usuario == null || usuario.getIdUsuario() == null) {
            log.warn("crearSiNoExiste ignorado — usuario o idUsuario es null");
            return;
        }
        if (tipoNotif == null || urlAccion == null) {
            log.warn("crearSiNoExiste ignorado — tipoNotif o urlAccion es null (usuario={})",
                     usuario.getIdUsuario());
            return;
        }
        if (notificacionRepository.existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
                usuario.getIdUsuario(), tipoNotif, urlAccion)) {
            log.debug("Notificación duplicada ignorada — usuario={} tipo={} url={}",
                      usuario.getIdUsuario(), tipoNotif, urlAccion);
            return;
        }
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTipoNotif(tipoNotif);
        n.setTitulo(titulo);
        n.setMensaje(mensaje);
        n.setLeida(false);
        n.setUrlAccion(urlAccion);
        notificacionRepository.save(n);
        log.info("Notificación creada — usuario={} tipo={}", usuario.getIdUsuario(), tipoNotif);
    }
}
