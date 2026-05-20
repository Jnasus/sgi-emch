package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.common.PagedResponse;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardResumenRepository dashboardResumenRepository;
    private final InventarioCompletoRepository inventarioCompletoRepository;
    private final StockCriticoRepository stockCriticoRepository;
    private final TicketsActivosRepository ticketsActivosRepository;

    @Transactional(readOnly = true)
    public List<DashboardResumenResponse> listarResumen() {
        return dashboardResumenRepository.findAll().stream()
                .map(this::toResumenResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<InventarioCompletoResponse> listarInventario(Pageable pageable) {
        return new PagedResponse<>(inventarioCompletoRepository.findAll(pageable)
                .map(this::toInventarioResponse));
    }

    @Transactional(readOnly = true)
    public List<StockCriticoResponse> listarStockCritico() {
        return stockCriticoRepository.findAll().stream()
                .map(this::toStockCriticoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketsActivosResponse> listarTicketsActivos() {
        return ticketsActivosRepository.findAll().stream()
                .map(this::toTicketsActivosResponse)
                .toList();
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private DashboardResumenResponse toResumenResponse(DashboardResumen e) {
        DashboardResumenResponse r = new DashboardResumenResponse();
        r.setNombreTipo(e.getNombreTipo());
        r.setTotal(e.getTotal());
        r.setAsignados(e.getAsignados());
        r.setEnBodega(e.getEnBodega());
        r.setEnReparacion(e.getEnReparacion());
        r.setDadosDeBaja(e.getDadosDeBaja());
        r.setStockOperativo(e.getStockOperativo());
        r.setUmbralStockPct(e.getUmbralStockPct());
        r.setPctOperativo(e.getPctOperativo());
        r.setEquiposMayores5Anios(e.getEquiposMayores5Anios());
        return r;
    }

    private StockCriticoResponse toStockCriticoResponse(StockCritico e) {
        StockCriticoResponse r = new StockCriticoResponse();
        r.setIdTipo(e.getIdTipo());
        r.setNombreTipo(e.getNombreTipo());
        r.setTotalEquipos(e.getTotalEquipos());
        r.setStockOperativo(e.getStockOperativo());
        r.setUmbralPct(e.getUmbralPct());
        r.setPctActual(e.getPctActual());
        r.setEnAlerta(e.getEnAlerta());
        return r;
    }

    private TicketsActivosResponse toTicketsActivosResponse(TicketsActivos e) {
        TicketsActivosResponse r = new TicketsActivosResponse();
        r.setIdTicket(e.getIdTicket());
        r.setNumeroTicket(e.getNumeroTicket());
        r.setCodigoEjercito(e.getCodigoEjercito());
        r.setNombreArea(e.getNombreArea());
        r.setTecnico(e.getTecnico());
        r.setTipoIncidente(e.getTipoIncidente());
        r.setTitulo(e.getTitulo());
        r.setEstado(e.getEstado());
        r.setPrioridad(e.getPrioridad());
        r.setFechaApertura(e.getFechaApertura());
        r.setSlaMinutos(e.getSlaMinutos());
        r.setMinutosTranscurridos(e.getMinutosTranscurridos());
        r.setMinutosRestantesSla(e.getMinutosRestantesSla());
        r.setSlaVencido(e.getSlaVencido());
        r.setFueraDeSla(e.getFueraDeSla());
        return r;
    }

    private InventarioCompletoResponse toInventarioResponse(InventarioCompleto e) {
        InventarioCompletoResponse r = new InventarioCompletoResponse();
        r.setIdEquipo(e.getIdEquipo());
        r.setCodigoEjercito(e.getCodigoEjercito());
        r.setTipo(e.getTipo());
        r.setMarca(e.getMarca());
        r.setModelo(e.getModelo());
        r.setCodigoArea(e.getCodigoArea());
        r.setArea(e.getArea());
        r.setNombreSo(e.getNombreSo());
        r.setVersionSo(e.getVersionSo());
        r.setNumeroSerie(e.getNumeroSerie());
        r.setNombreResponsable(e.getNombreResponsable());
        r.setMacAddress(e.getMacAddress());
        r.setIpAddress(e.getIpAddress());
        r.setTipoRed(e.getTipoRed());
        r.setEstado(e.getEstado());
        r.setFechaAdquisicion(e.getFechaAdquisicion());
        r.setAniosAntiguedad(e.getAniosAntiguedad());
        r.setFechaRegistro(e.getFechaRegistro());
        r.setFechaBaja(e.getFechaBaja());
        r.setObservaciones(e.getObservaciones());
        r.setProcesador(e.getProcesador());
        r.setNucleos(e.getNucleos());
        r.setHilos(e.getHilos());
        r.setRamTotalGb(e.getRamTotalGb());
        r.setRamMarca(e.getRamMarca());
        r.setRamVelocidadMhz(e.getRamVelocidadMhz());
        r.setDiscoCapacidadGb(e.getDiscoCapacidadGb());
        r.setDiscoUsadoGb(e.getDiscoUsadoGb());
        r.setDiscoLibreGb(e.getDiscoLibreGb());
        r.setDiscoUsoPct(e.getDiscoUsoPct());
        r.setGpuMarca(e.getGpuMarca());
        r.setGpuModelo(e.getGpuModelo());
        r.setMonitorMarca(e.getMonitorMarca());
        r.setMonitorModelo(e.getMonitorModelo());
        return r;
    }
}
