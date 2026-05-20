package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.notificacion.NotificacionResponse;
import pe.edu.emch.sgi.entity.Notificacion;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.NotificacionRepository;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    @Transactional(readOnly = true)
    public PagedResponse<NotificacionResponse> listarNotificaciones(
            Integer idUsuario, Boolean leida, Pageable pageable) {
        Page<NotificacionResponse> page = notificacionRepository
                .findByUsuarioFiltered(idUsuario, leida, pageable)
                .map(this::toResponse);
        return new PagedResponse<>(page);
    }

    @Transactional
    public NotificacionResponse marcarLeida(Integer idNotif, Integer idUsuario) {
        Notificacion n = findOwnedOrThrow(idNotif, idUsuario);
        n.setLeida(true);
        return toResponse(notificacionRepository.save(n));
    }

    @Transactional
    public void marcarTodasLeidas(Integer idUsuario) {
        notificacionRepository.marcarTodasLeidasByUsuario(idUsuario);
    }

    @Transactional
    public void eliminarNotificacion(Integer idNotif, Integer idUsuario) {
        Notificacion n = findOwnedOrThrow(idNotif, idUsuario);
        notificacionRepository.delete(n);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Notificacion findOwnedOrThrow(Integer idNotif, Integer idUsuario) {
        Notificacion n = notificacionRepository.findById(idNotif)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada: " + idNotif));
        if (!n.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new ResourceNotFoundException("Notificación no encontrada: " + idNotif);
        }
        return n;
    }

    private NotificacionResponse toResponse(Notificacion n) {
        NotificacionResponse r = new NotificacionResponse();
        r.setIdNotif(n.getIdNotif());
        r.setIdUsuario(n.getUsuario().getIdUsuario());
        r.setTipoNotif(n.getTipoNotif());
        r.setTitulo(n.getTitulo());
        r.setMensaje(n.getMensaje());
        r.setLeida(n.getLeida());
        r.setUrlAccion(n.getUrlAccion());
        r.setFechaCreacion(n.getFechaCreacion());
        return r;
    }
}
