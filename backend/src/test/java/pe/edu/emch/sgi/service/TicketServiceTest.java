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
import pe.edu.emch.sgi.dto.ticket.*;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock TicketRepository ticketRepository;
    @Mock HistorialTicketRepository historialTicketRepository;
    @Mock EquipoRepository equipoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock TipoIncidenteRepository tipoIncidenteRepository;

    @InjectMocks TicketService ticketService;

    private Equipo equipo;
    private Usuario tecnico;
    private TipoIncidente tipoIncidente;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        equipo = new Equipo();
        equipo.setIdEquipo(1);
        equipo.setCodigoEjercito("EQ-001");

        tecnico = new Usuario();
        tecnico.setIdUsuario(2);
        tecnico.setNombres("Juan");
        tecnico.setApellidos("Perez");

        tipoIncidente = new TipoIncidente();
        tipoIncidente.setIdTipoIncidente(1);
        tipoIncidente.setNombreTipo("Hardware");
        tipoIncidente.setTiempoResolucionMin((short) 120);

        ticket = new Ticket();
        ticket.setIdTicket(1);
        ticket.setNumeroTicket("TKT-202601-0001");
        ticket.setEquipo(equipo);
        ticket.setTecnico(tecnico);
        ticket.setTipoIncidente(tipoIncidente);
        ticket.setTitulo("PC no enciende");
        ticket.setEstado("ABIERTO");
        ticket.setPrioridad("MEDIA");
        ticket.setFechaApertura(LocalDateTime.of(2026, 1, 10, 9, 0));
        ticket.setFueraDeSla(false);
    }

    @Test
    void listarTickets_retornaPagedResponse() {
        Page<Ticket> page = new PageImpl<>(List.of(ticket));
        when(ticketRepository.findFiltered(isNull(), isNull(), isNull(), isNull(), any()))
                .thenReturn(page);

        var result = ticketService.listarTickets(null, null, null, null, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getNumeroTicket()).isEqualTo("TKT-202601-0001");
    }

    @Test
    void obtenerTicket_existente_retornaResponse() {
        when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));

        TicketResponse result = ticketService.obtenerTicket(1);

        assertThat(result.getNumeroTicket()).isEqualTo("TKT-202601-0001");
        assertThat(result.getCodigoEjercito()).isEqualTo("EQ-001");
        assertThat(result.getNombresTecnico()).isEqualTo("Juan");
    }

    @Test
    void obtenerTicket_noEncontrado_lanzaExcepcion() {
        when(ticketRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> ticketService.obtenerTicket(99))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void crearTicket_sinPrioridad_defaultsMediaYEstadoAbierto() {
        TicketCreateRequest req = buildCreateRequest();
        req.setPrioridad(null);

        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(usuarioRepository.findById(2)).thenReturn(Optional.of(tecnico));
        when(tipoIncidenteRepository.findById(1)).thenReturn(Optional.of(tipoIncidente));
        when(ticketRepository.findMaxNumeroTicketByAniomes(any())).thenReturn(Optional.empty());
        when(ticketRepository.save(any())).thenAnswer(inv -> {
            Ticket t = inv.getArgument(0);
            t.setIdTicket(10);
            return t;
        });

        TicketResponse result = ticketService.crearTicket(req);

        assertThat(result.getPrioridad()).isEqualTo("MEDIA");
        assertThat(result.getEstado()).isEqualTo("ABIERTO");
        assertThat(result.getFueraDeSla()).isFalse();
        assertThat(result.getFechaApertura()).isNotNull();
    }

    @Test
    void crearTicket_conPrioridad_usaPrioridadDelRequest() {
        TicketCreateRequest req = buildCreateRequest();
        req.setPrioridad("ALTA");

        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(usuarioRepository.findById(2)).thenReturn(Optional.of(tecnico));
        when(tipoIncidenteRepository.findById(1)).thenReturn(Optional.of(tipoIncidente));
        when(ticketRepository.findMaxNumeroTicketByAniomes(any())).thenReturn(Optional.empty());
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse result = ticketService.crearTicket(req);

        assertThat(result.getPrioridad()).isEqualTo("ALTA");
    }

    @Test
    void crearTicket_numeroTicketSecuencia_siguienteCorrecto() {
        TicketCreateRequest req = buildCreateRequest();

        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(usuarioRepository.findById(2)).thenReturn(Optional.of(tecnico));
        when(tipoIncidenteRepository.findById(1)).thenReturn(Optional.of(tipoIncidente));
        when(ticketRepository.findMaxNumeroTicketByAniomes(any()))
                .thenReturn(Optional.of("TKT-202601-0003"));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse result = ticketService.crearTicket(req);

        assertThat(result.getNumeroTicket()).endsWith("-0004");
    }

    @Test
    void crearTicket_equipoNoEncontrado_lanzaExcepcion() {
        TicketCreateRequest req = buildCreateRequest();
        when(equipoRepository.findById(1)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> ticketService.crearTicket(req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cambiarEstado_aEnProceso_setFechaRespuesta() {
        ticket.setFechaRespuesta(null);
        TicketCambioEstadoRequest req = new TicketCambioEstadoRequest();
        req.setEstado("EN_PROCESO");

        when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse result = ticketService.cambiarEstado(1, req);

        assertThat(result.getEstado()).isEqualTo("EN_PROCESO");
        assertThat(result.getFechaRespuesta()).isNotNull();
    }

    @Test
    void cambiarEstado_aEnProceso_noSobreescribeFechaRespuestaExistente() {
        LocalDateTime respuestaOriginal = LocalDateTime.of(2026, 1, 10, 10, 0);
        ticket.setFechaRespuesta(respuestaOriginal);
        TicketCambioEstadoRequest req = new TicketCambioEstadoRequest();
        req.setEstado("EN_PROCESO");

        when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse result = ticketService.cambiarEstado(1, req);

        assertThat(result.getFechaRespuesta()).isEqualTo(respuestaOriginal);
    }

    @Test
    void cambiarEstado_aResuelto_setFechaResolucionYCalculaSla() {
        ticket.setFechaApertura(LocalDateTime.now().minusMinutes(200));
        TicketCambioEstadoRequest req = new TicketCambioEstadoRequest();
        req.setEstado("RESUELTO");

        when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse result = ticketService.cambiarEstado(1, req);

        assertThat(result.getEstado()).isEqualTo("RESUELTO");
        assertThat(result.getFechaResolucion()).isNotNull();
        assertThat(result.getFueraDeSla()).isTrue();
    }

    @Test
    void cambiarEstado_aResuelto_dentroSla_fueraDeSlaFalse() {
        ticket.setFechaApertura(LocalDateTime.now().minusMinutes(30));
        TicketCambioEstadoRequest req = new TicketCambioEstadoRequest();
        req.setEstado("RESUELTO");

        when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse result = ticketService.cambiarEstado(1, req);

        assertThat(result.getFueraDeSla()).isFalse();
    }

    @Test
    void cambiarEstado_aCerrado_setFechaCierre() {
        TicketCambioEstadoRequest req = new TicketCambioEstadoRequest();
        req.setEstado("CERRADO");

        when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse result = ticketService.cambiarEstado(1, req);

        assertThat(result.getEstado()).isEqualTo("CERRADO");
        assertThat(result.getFechaCierre()).isNotNull();
    }

    @Test
    void cambiarEstado_noInsertaHistorialManualmente() {
        TicketCambioEstadoRequest req = new TicketCambioEstadoRequest();
        req.setEstado("EN_PROCESO");

        when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ticketService.cambiarEstado(1, req);

        verifyNoInteractions(historialTicketRepository);
    }

    @Test
    void listarHistorial_retornaOrdenado() {
        HistorialTicket h = new HistorialTicket();
        h.setIdHistTicket(1);
        h.setEstadoAnterior("ABIERTO");
        h.setEstadoNuevo("EN_PROCESO");
        h.setUsuario(tecnico);

        when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));
        when(historialTicketRepository.findByTicketOrderByFechaCambioDesc(ticket))
                .thenReturn(List.of(h));

        List<HistorialTicketResponse> result = ticketService.listarHistorial(1);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEstadoAnterior()).isEqualTo("ABIERTO");
        assertThat(result.get(0).getNombresUsuario()).isEqualTo("Juan");
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private TicketCreateRequest buildCreateRequest() {
        TicketCreateRequest r = new TicketCreateRequest();
        r.setIdEquipo(1);
        r.setIdTecnico(2);
        r.setIdTipoIncidente(1);
        r.setTitulo("PC no enciende");
        return r;
    }
}
