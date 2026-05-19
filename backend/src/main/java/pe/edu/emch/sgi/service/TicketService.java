package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.ticket.HistorialTicketResponse;
import pe.edu.emch.sgi.dto.ticket.TicketCambioEstadoRequest;
import pe.edu.emch.sgi.dto.ticket.TicketCreateRequest;
import pe.edu.emch.sgi.dto.ticket.TicketResponse;
import pe.edu.emch.sgi.entity.Equipo;
import pe.edu.emch.sgi.entity.HistorialTicket;
import pe.edu.emch.sgi.entity.Ticket;
import pe.edu.emch.sgi.entity.TipoIncidente;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.EquipoRepository;
import pe.edu.emch.sgi.repository.HistorialTicketRepository;
import pe.edu.emch.sgi.repository.TipoIncidenteRepository;
import pe.edu.emch.sgi.repository.TicketRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final HistorialTicketRepository historialTicketRepository;
    private final EquipoRepository equipoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TipoIncidenteRepository tipoIncidenteRepository;

    @Transactional(readOnly = true)
    public PagedResponse<TicketResponse> listarTickets(
            String estado, String prioridad, Integer idEquipo, Integer idTecnico, Pageable pageable) {
        Page<TicketResponse> page = ticketRepository
                .findFiltered(estado, prioridad, idEquipo, idTecnico, pageable)
                .map(this::toTicketResponse);
        return new PagedResponse<>(page);
    }

    @Transactional(readOnly = true)
    public TicketResponse obtenerTicket(Integer id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado: " + id));
        return toTicketResponse(ticket);
    }

    @Transactional
    public TicketResponse crearTicket(TicketCreateRequest request) {
        Equipo equipo = equipoRepository.findById(request.getIdEquipo())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado: " + request.getIdEquipo()));
        Usuario tecnico = usuarioRepository.findById(request.getIdTecnico())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + request.getIdTecnico()));
        TipoIncidente tipoIncidente = tipoIncidenteRepository.findById(request.getIdTipoIncidente())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de incidente no encontrado: " + request.getIdTipoIncidente()));

        Ticket ticket = new Ticket();
        ticket.setNumeroTicket(generarNumeroTicket());
        ticket.setEquipo(equipo);
        ticket.setTecnico(tecnico);
        ticket.setTipoIncidente(tipoIncidente);
        ticket.setTitulo(request.getTitulo());
        ticket.setDescripcion(request.getDescripcion());
        ticket.setEstado("ABIERTO");
        ticket.setPrioridad(request.getPrioridad() != null ? request.getPrioridad() : "MEDIA");
        ticket.setFechaApertura(LocalDateTime.now());
        ticket.setFueraDeSla(false);

        return toTicketResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse cambiarEstado(Integer id, TicketCambioEstadoRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado: " + id));

        String nuevoEstado = request.getEstado();
        switch (nuevoEstado) {
            case "EN_PROCESO" -> {
                if (ticket.getFechaRespuesta() == null) {
                    ticket.setFechaRespuesta(LocalDateTime.now());
                }
            }
            case "RESUELTO" -> {
                LocalDateTime ahora = LocalDateTime.now();
                ticket.setFechaResolucion(ahora);
                long mins = ChronoUnit.MINUTES.between(ticket.getFechaApertura(), ahora);
                ticket.setFueraDeSla(mins > ticket.getTipoIncidente().getTiempoResolucionMin());
            }
            case "CERRADO" -> ticket.setFechaCierre(LocalDateTime.now());
        }

        ticket.setEstado(nuevoEstado);
        return toTicketResponse(ticketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public List<HistorialTicketResponse> listarHistorial(Integer idTicket) {
        Ticket ticket = ticketRepository.findById(idTicket)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado: " + idTicket));
        return historialTicketRepository.findByTicketOrderByFechaCambioDesc(ticket)
                .stream().map(this::toHistorialResponse).toList();
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private String generarNumeroTicket() {
        String aniomes = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String ultimo = ticketRepository.findMaxNumeroTicketByAniomes(aniomes).orElse(null);
        int siguiente = 1;
        if (ultimo != null) {
            String[] parts = ultimo.split("-");
            siguiente = Integer.parseInt(parts[parts.length - 1]) + 1;
        }
        return String.format("TKT-%s-%04d", aniomes, siguiente);
    }

    private TicketResponse toTicketResponse(Ticket t) {
        TicketResponse r = new TicketResponse();
        r.setIdTicket(t.getIdTicket());
        r.setNumeroTicket(t.getNumeroTicket());
        r.setIdEquipo(t.getEquipo().getIdEquipo());
        r.setCodigoEjercito(t.getEquipo().getCodigoEjercito());
        r.setIdTecnico(t.getTecnico().getIdUsuario());
        r.setNombresTecnico(t.getTecnico().getNombres());
        r.setApellidosTecnico(t.getTecnico().getApellidos());
        r.setIdTipoIncidente(t.getTipoIncidente().getIdTipoIncidente());
        r.setNombreTipoIncidente(t.getTipoIncidente().getNombreTipo());
        r.setTitulo(t.getTitulo());
        r.setDescripcion(t.getDescripcion());
        r.setEstado(t.getEstado());
        r.setPrioridad(t.getPrioridad());
        r.setFechaApertura(t.getFechaApertura());
        r.setFechaRespuesta(t.getFechaRespuesta());
        r.setFechaResolucion(t.getFechaResolucion());
        r.setFechaCierre(t.getFechaCierre());
        r.setFueraDeSla(t.getFueraDeSla());
        r.setPdfActaPath(t.getPdfActaPath());
        return r;
    }

    private HistorialTicketResponse toHistorialResponse(HistorialTicket h) {
        HistorialTicketResponse r = new HistorialTicketResponse();
        r.setIdHistTicket(h.getIdHistTicket());
        r.setEstadoAnterior(h.getEstadoAnterior());
        r.setEstadoNuevo(h.getEstadoNuevo());
        r.setComentario(h.getComentario());
        r.setFechaCambio(h.getFechaCambio());
        r.setIdUsuario(h.getUsuario().getIdUsuario());
        r.setNombresUsuario(h.getUsuario().getNombres());
        r.setApellidosUsuario(h.getUsuario().getApellidos());
        return r;
    }
}
