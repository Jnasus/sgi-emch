package pe.edu.emch.sgi.scheduler;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.repository.StockCriticoRepository;
import pe.edu.emch.sgi.repository.TicketRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.service.NotificadorService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class NotificacionSchedulerTest {

    @Mock TicketRepository ticketRepository;
    @Mock StockCriticoRepository stockCriticoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock NotificadorService notificadorService;

    @InjectMocks NotificacionScheduler scheduler;

    private Usuario tecnico;
    private TipoIncidente tipoIncidente;

    @BeforeEach
    void setUp() {
        tecnico = new Usuario();
        tecnico.setIdUsuario(2);
        tecnico.setNombres("Juan");
        tecnico.setApellidos("Perez");

        tipoIncidente = new TipoIncidente();
        tipoIncidente.setIdTipoIncidente(1);
        tipoIncidente.setNombreTipo("Hardware");
        tipoIncidente.setTiempoResolucionMin((short) 120);
    }

    private Ticket buildTicket(int idTicket, String estado, int minutosAtras) {
        Ticket t = new Ticket();
        t.setIdTicket(idTicket);
        t.setNumeroTicket("TKT-202601-000" + idTicket);
        t.setTitulo("PC no enciende");
        t.setEstado(estado);
        t.setFechaApertura(LocalDateTime.now().minusMinutes(minutosAtras));
        t.setTipoIncidente(tipoIncidente);
        t.setTecnico(tecnico);
        return t;
    }

    // ── SLA tests ─────────────────────────────────────────────────────────────

    @Test
    void checkSlaVencidos_ticketSlaVencido_notificaTecnico() {
        // Ticket abierto hace 200 min, SLA es 120 min → vencido
        Ticket vencido = buildTicket(1, "ABIERTO", 200);
        when(ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO")))
                .thenReturn(List.of(vencido));

        scheduler.checkSlaVencidos();

        verify(notificadorService).crearSiNoExiste(
                eq(tecnico),
                eq("SLA_VENCIDO"),
                contains("TKT-202601-0001"),
                contains("TKT-202601-0001"),
                eq("/incidentes/1")
        );
    }

    @Test
    void checkSlaVencidos_ticketDentroSla_noNotifica() {
        // Ticket abierto hace 30 min, SLA es 120 min → dentro de SLA
        Ticket dentroSla = buildTicket(2, "ABIERTO", 30);
        when(ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO")))
                .thenReturn(List.of(dentroSla));

        scheduler.checkSlaVencidos();

        verify(notificadorService, never()).crearSiNoExiste(any(), any(), any(), any(), any());
    }

    @Test
    void checkSlaVencidos_sinTicketsActivos_noNotifica() {
        when(ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO")))
                .thenReturn(List.of());

        scheduler.checkSlaVencidos();

        verify(notificadorService, never()).crearSiNoExiste(any(), any(), any(), any(), any());
    }

    @Test
    void checkSlaVencidos_ticketEnProcesoVencido_notificaTecnico() {
        // Un ticket EN_PROCESO también debe ser chequeado
        Ticket vencido = buildTicket(3, "EN_PROCESO", 500);
        when(ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO")))
                .thenReturn(List.of(vencido));

        scheduler.checkSlaVencidos();

        verify(notificadorService).crearSiNoExiste(
                eq(tecnico), eq("SLA_VENCIDO"), any(), any(), eq("/incidentes/3"));
    }

    // ── Stock crítico tests ───────────────────────────────────────────────────

    @Test
    void checkStockCritico_sinAlertas_noNotificaNiConsultaUsuarios() {
        when(stockCriticoRepository.findAll()).thenReturn(List.of());

        scheduler.checkStockCritico();

        verify(notificadorService, never()).crearSiNoExiste(any(), any(), any(), any(), any());
        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void checkStockCritico_conAlerta_notificaAdminsYSupervisores() {
        StockCritico alerta = mock(StockCritico.class);
        when(alerta.getEnAlerta()).thenReturn(true);
        when(alerta.getIdTipo()).thenReturn(1);
        when(alerta.getNombreTipo()).thenReturn("Laptop");
        when(alerta.getStockOperativo()).thenReturn(2);
        when(alerta.getTotalEquipos()).thenReturn(10);
        when(alerta.getPctActual()).thenReturn(new BigDecimal("20.00"));
        when(alerta.getUmbralPct()).thenReturn(30);

        Usuario admin = new Usuario();
        admin.setIdUsuario(1);
        admin.setNombres("Admin");
        admin.setApellidos("Sistema");

        when(stockCriticoRepository.findAll()).thenReturn(List.of(alerta));
        when(usuarioRepository.findByRolNombreRolInAndActivoTrue(List.of("ADMINISTRADOR", "SUPERVISOR")))
                .thenReturn(List.of(admin));

        scheduler.checkStockCritico();

        verify(notificadorService).crearSiNoExiste(
                eq(admin),
                eq("STOCK_CRITICO"),
                contains("Laptop"),
                contains("Laptop"),
                eq("/inventario?tipo=1")
        );
    }

    @Test
    void checkStockCritico_sinDestinatarios_noNotifica() {
        StockCritico alerta = mock(StockCritico.class);
        when(alerta.getEnAlerta()).thenReturn(true);

        when(stockCriticoRepository.findAll()).thenReturn(List.of(alerta));
        when(usuarioRepository.findByRolNombreRolInAndActivoTrue(any())).thenReturn(List.of());

        scheduler.checkStockCritico();

        verify(notificadorService, never()).crearSiNoExiste(any(), any(), any(), any(), any());
    }
}
