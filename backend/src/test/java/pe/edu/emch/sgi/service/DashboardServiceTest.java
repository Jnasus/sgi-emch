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
import pe.edu.emch.sgi.dto.dashboard.DashboardResumenResponse;
import pe.edu.emch.sgi.dto.dashboard.InventarioCompletoResponse;
import pe.edu.emch.sgi.dto.dashboard.StockCriticoResponse;
import pe.edu.emch.sgi.dto.dashboard.TicketsActivosResponse;
import pe.edu.emch.sgi.entity.DashboardResumen;
import pe.edu.emch.sgi.entity.InventarioCompleto;
import pe.edu.emch.sgi.entity.StockCritico;
import pe.edu.emch.sgi.entity.TicketsActivos;
import pe.edu.emch.sgi.repository.DashboardResumenRepository;
import pe.edu.emch.sgi.repository.InventarioCompletoRepository;
import pe.edu.emch.sgi.repository.StockCriticoRepository;
import pe.edu.emch.sgi.repository.TicketsActivosRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock DashboardResumenRepository dashboardResumenRepository;
    @Mock InventarioCompletoRepository inventarioCompletoRepository;
    @Mock StockCriticoRepository stockCriticoRepository;
    @Mock TicketsActivosRepository ticketsActivosRepository;

    @InjectMocks DashboardService dashboardService;

    private DashboardResumen resumen;
    private InventarioCompleto inventario;
    private StockCritico stockCritico;
    private TicketsActivos ticketsActivos;

    @BeforeEach
    void setUp() throws Exception {
        resumen = buildResumen();
        inventario = buildInventario();
        stockCritico = buildStockCritico();
        ticketsActivos = buildTicketsActivos();
    }

    @Test
    void listarResumen_retornaLista() {
        when(dashboardResumenRepository.findAll()).thenReturn(List.of(resumen));

        List<DashboardResumenResponse> result = dashboardService.listarResumen();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreTipo()).isEqualTo("LAPTOP");
        assertThat(result.get(0).getTotal()).isEqualTo(10);
    }

    @Test
    void listarInventario_retornaPaged() {
        Page<InventarioCompleto> page = new PageImpl<>(List.of(inventario));
        when(inventarioCompletoRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);

        var result = dashboardService.listarInventario(PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCodigoEjercito()).isEqualTo("EQ-001");
    }

    @Test
    void listarStockCritico_retornaLista() {
        when(stockCriticoRepository.findAll()).thenReturn(List.of(stockCritico));

        List<StockCriticoResponse> result = dashboardService.listarStockCritico();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreTipo()).isEqualTo("LAPTOP");
        assertThat(result.get(0).getEnAlerta()).isTrue();
    }

    @Test
    void listarTicketsActivos_retornaLista() {
        when(ticketsActivosRepository.findAll()).thenReturn(List.of(ticketsActivos));

        List<TicketsActivosResponse> result = dashboardService.listarTicketsActivos();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNumeroTicket()).isEqualTo("TKT-202601-0001");
        assertThat(result.get(0).getSlaVencido()).isFalse();
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private DashboardResumen buildResumen() throws Exception {
        DashboardResumen r = new DashboardResumen();
        setField(r, "nombreTipo", "LAPTOP");
        setField(r, "total", 10);
        setField(r, "asignados", 5);
        setField(r, "enBodega", 3);
        setField(r, "enReparacion", 1);
        setField(r, "dadosDeBaja", 1);
        setField(r, "stockOperativo", 9);
        setField(r, "umbralStockPct", 80);
        setField(r, "pctOperativo", new BigDecimal("90.0"));
        setField(r, "equiposMayores5Anios", 2);
        return r;
    }

    private InventarioCompleto buildInventario() throws Exception {
        InventarioCompleto i = new InventarioCompleto();
        setField(i, "idEquipo", 1);
        setField(i, "codigoEjercito", "EQ-001");
        setField(i, "tipo", "LAPTOP");
        setField(i, "marca", "Dell");
        setField(i, "modelo", "Latitude 5420");
        setField(i, "estado", "ASIGNADO");
        return i;
    }

    private StockCritico buildStockCritico() throws Exception {
        StockCritico s = new StockCritico();
        setField(s, "idTipo", 1);
        setField(s, "nombreTipo", "LAPTOP");
        setField(s, "totalEquipos", 10);
        setField(s, "stockOperativo", 7);
        setField(s, "umbralPct", 80);
        setField(s, "pctActual", new BigDecimal("70.0"));
        setField(s, "enAlerta", true);
        return s;
    }

    private TicketsActivos buildTicketsActivos() throws Exception {
        TicketsActivos t = new TicketsActivos();
        setField(t, "idTicket", 1);
        setField(t, "numeroTicket", "TKT-202601-0001");
        setField(t, "codigoEjercito", "EQ-001");
        setField(t, "estado", "ABIERTO");
        setField(t, "prioridad", "ALTA");
        setField(t, "fechaApertura", LocalDateTime.of(2026, 1, 15, 9, 0));
        setField(t, "slaMinutos", 480);
        setField(t, "minutosTranscurridos", 120);
        setField(t, "minutosRestantesSla", 360);
        setField(t, "slaVencido", false);
        setField(t, "fueraDeSla", false);
        return t;
    }

    private void setField(Object obj, String fieldName, Object value) throws Exception {
        var field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}
