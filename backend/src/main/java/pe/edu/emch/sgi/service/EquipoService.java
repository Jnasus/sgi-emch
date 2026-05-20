package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.equipo.*;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.exception.DuplicateResourceException;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.*;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final EspecificacionTecnicaRepository especificacionTecnicaRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final TipoEquipoRepository tipoEquipoRepository;
    private final ModeloEquipoRepository modeloEquipoRepository;
    private final AreaRepository areaRepository;
    private final SistemaOperativoRepository sistemaOperativoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public PagedResponse<EquipoResponse> listarEquipos(String estado, Integer idArea, Integer idTipo, Pageable pageable) {
        Page<EquipoResponse> page = equipoRepository.findFiltered(estado, idArea, idTipo, pageable)
            .map(this::toEquipoResponse);
        return new PagedResponse<>(page);
    }

    @Transactional(readOnly = true)
    public EquipoResponse obtenerEquipo(Integer id) {
        Equipo equipo = equipoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado: " + id));
        EquipoResponse response = toEquipoResponse(equipo);
        especificacionTecnicaRepository.findByEquipo(equipo)
            .ifPresent(e -> response.setEspecificaciones(toEspecificacionResponse(e)));
        return response;
    }

    @Transactional
    public EquipoResponse crearEquipo(EquipoRequest request) {
        if (equipoRepository.existsByCodigoEjercito(request.getCodigoEjercito())) {
            throw new DuplicateResourceException(
                "Ya existe un equipo con código: " + request.getCodigoEjercito());
        }
        if (equipoRepository.existsByNumeroSerie(request.getNumeroSerie())) {
            throw new DuplicateResourceException(
                "Ya existe un equipo con número de serie: " + request.getNumeroSerie());
        }
        if (request.getMacAddress() != null && !request.getMacAddress().isBlank()
                && equipoRepository.existsByMacAddress(request.getMacAddress())) {
            throw new DuplicateResourceException(
                "Ya existe un equipo con MAC: " + request.getMacAddress());
        }
        Equipo equipo = buildEquipo(new Equipo(), request);
        equipo.setEstado("EN_BODEGA");
        equipo.setFechaRegistro(LocalDate.now());
        return toEquipoResponse(equipoRepository.save(equipo));
    }

    @Transactional
    public EquipoResponse actualizarEquipo(Integer id, EquipoRequest request) {
        Equipo equipo = equipoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado: " + id));
        if (equipoRepository.existsByCodigoEjercitoAndIdEquipoNot(request.getCodigoEjercito(), id)) {
            throw new DuplicateResourceException(
                "Ya existe un equipo con código: " + request.getCodigoEjercito());
        }
        if (equipoRepository.existsByNumeroSerieAndIdEquipoNot(request.getNumeroSerie(), id)) {
            throw new DuplicateResourceException(
                "Ya existe un equipo con número de serie: " + request.getNumeroSerie());
        }
        if (request.getMacAddress() != null && !request.getMacAddress().isBlank()
                && equipoRepository.existsByMacAddressAndIdEquipoNot(request.getMacAddress(), id)) {
            throw new DuplicateResourceException(
                "Ya existe un equipo con MAC: " + request.getMacAddress());
        }
        buildEquipo(equipo, request);
        return toEquipoResponse(equipoRepository.save(equipo));
    }

    @Transactional
    public EquipoResponse cambiarEstado(Integer id, CambioEstadoRequest request, Integer idUsuarioActivo) {
        Equipo equipo = equipoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado: " + id));
        Usuario usuario = usuarioRepository.findById(idUsuarioActivo)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + idUsuarioActivo));

        HistorialEstado historial = new HistorialEstado();
        historial.setEquipo(equipo);
        historial.setUsuario(usuario);
        historial.setEstadoAnterior(equipo.getEstado());
        historial.setEstadoNuevo(request.getEstado());
        historial.setMotivo(request.getMotivo());
        historialEstadoRepository.save(historial);

        equipo.setEstado(request.getEstado());
        if ("DADO_DE_BAJA".equals(request.getEstado())) {
            equipo.setFechaBaja(LocalDate.now());
        } else {
            equipo.setFechaBaja(null);
        }
        return toEquipoResponse(equipoRepository.save(equipo));
    }

    @Transactional
    public EspecificacionTecnicaResponse upsertEspecificaciones(Integer idEquipo,
                                                                 EspecificacionTecnicaRequest request) {
        Equipo equipo = equipoRepository.findById(idEquipo)
            .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado: " + idEquipo));
        EspecificacionTecnica espec = especificacionTecnicaRepository.findByEquipo(equipo)
            .orElse(new EspecificacionTecnica());
        espec.setEquipo(equipo);
        applyEspecificacion(espec, request);
        return toEspecificacionResponse(especificacionTecnicaRepository.save(espec));
    }

    @Transactional(readOnly = true)
    public List<HistorialEstadoResponse> listarHistorial(Integer idEquipo) {
        Equipo equipo = equipoRepository.findById(idEquipo)
            .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado: " + idEquipo));
        return historialEstadoRepository.findByEquipoOrderByFechaCambioDesc(equipo).stream()
            .map(this::toHistorialResponse).toList();
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private Equipo buildEquipo(Equipo equipo, EquipoRequest request) {
        TipoEquipo tipo = tipoEquipoRepository.findById(request.getIdTipo())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Tipo de equipo no encontrado: " + request.getIdTipo()));
        ModeloEquipo modelo = modeloEquipoRepository.findById(request.getIdModelo())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Modelo no encontrado: " + request.getIdModelo()));
        Area area = areaRepository.findById(request.getIdArea())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Área no encontrada: " + request.getIdArea()));
        SistemaOperativo so = sistemaOperativoRepository.findById(request.getIdSo())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Sistema operativo no encontrado: " + request.getIdSo()));

        equipo.setCodigoEjercito(request.getCodigoEjercito());
        equipo.setTipo(tipo);
        equipo.setModelo(modelo);
        equipo.setArea(area);
        equipo.setSo(so);
        equipo.setNumeroSerie(request.getNumeroSerie());
        equipo.setNombreResponsable(request.getNombreResponsable());
        equipo.setMacAddress(request.getMacAddress());
        equipo.setIpAddress(request.getIpAddress());
        equipo.setTipoRed(request.getTipoRed() != null ? request.getTipoRed() : "N/A");
        equipo.setFechaAdquisicion(request.getFechaAdquisicion());
        equipo.setObservaciones(request.getObservaciones());
        return equipo;
    }

    private void applyEspecificacion(EspecificacionTecnica e, EspecificacionTecnicaRequest r) {
        e.setProcesador(r.getProcesador());
        e.setNucleos(r.getNucleos());
        e.setHilos(r.getHilos());
        e.setRamModulos(r.getRamModulos());
        e.setRamTotalGb(r.getRamTotalGb() != null ? r.getRamTotalGb().shortValue() : null);
        e.setRamVelocidadMhz(r.getRamVelocidadMhz() != null ? r.getRamVelocidadMhz().shortValue() : null);
        e.setRamMarca(r.getRamMarca());
        e.setDiscoModelo(r.getDiscoModelo());
        e.setDiscoInterface(r.getDiscoInterface());
        e.setDiscoCapacidadGb(r.getDiscoCapacidadGb());
        e.setDiscoUsadoGb(r.getDiscoUsadoGb());
        e.setDiscoLibreGb(r.getDiscoLibreGb());
        e.setGpuMarca(r.getGpuMarca());
        e.setGpuModelo(r.getGpuModelo());
        e.setGpuVramGb(r.getGpuVramGb());
        e.setMonitorMarca(r.getMonitorMarca());
        e.setMonitorModelo(r.getMonitorModelo());
        e.setRedModelo(r.getRedModelo());
    }

    // ── mappers ───────────────────────────────────────────────────────────────

    private EquipoResponse toEquipoResponse(Equipo e) {
        EquipoResponse r = new EquipoResponse();
        r.setIdEquipo(e.getIdEquipo());
        r.setCodigoEjercito(e.getCodigoEjercito());
        r.setIdTipo(e.getTipo().getIdTipo());
        r.setNombreTipo(e.getTipo().getNombreTipo());
        r.setIdModelo(e.getModelo().getIdModelo());
        r.setNombreModelo(e.getModelo().getNombreModelo());
        r.setIdArea(e.getArea().getIdArea());
        r.setNombreArea(e.getArea().getNombreArea());
        r.setIdSo(e.getSo().getIdSo());
        r.setNombreSo(e.getSo().getNombreSo());
        r.setVersionSo(e.getSo().getVersionSo());
        r.setNumeroSerie(e.getNumeroSerie());
        r.setNombreResponsable(e.getNombreResponsable());
        r.setMacAddress(e.getMacAddress());
        r.setIpAddress(e.getIpAddress());
        r.setTipoRed(e.getTipoRed());
        r.setEstado(e.getEstado());
        r.setFechaAdquisicion(e.getFechaAdquisicion());
        r.setFechaRegistro(e.getFechaRegistro());
        r.setFechaBaja(e.getFechaBaja());
        r.setObservaciones(e.getObservaciones());
        return r;
    }

    private EspecificacionTecnicaResponse toEspecificacionResponse(EspecificacionTecnica e) {
        EspecificacionTecnicaResponse r = new EspecificacionTecnicaResponse();
        r.setIdEspec(e.getIdEspec());
        r.setProcesador(e.getProcesador());
        r.setNucleos(e.getNucleos());
        r.setHilos(e.getHilos());
        r.setRamModulos(e.getRamModulos());
        r.setRamTotalGb(e.getRamTotalGb() != null ? e.getRamTotalGb().intValue() : null);
        r.setRamVelocidadMhz(e.getRamVelocidadMhz() != null ? e.getRamVelocidadMhz().intValue() : null);
        r.setRamMarca(e.getRamMarca());
        r.setDiscoModelo(e.getDiscoModelo());
        r.setDiscoInterface(e.getDiscoInterface());
        r.setDiscoCapacidadGb(e.getDiscoCapacidadGb());
        r.setDiscoUsadoGb(e.getDiscoUsadoGb());
        r.setDiscoLibreGb(e.getDiscoLibreGb());
        r.setGpuMarca(e.getGpuMarca());
        r.setGpuModelo(e.getGpuModelo());
        r.setGpuVramGb(e.getGpuVramGb());
        r.setMonitorMarca(e.getMonitorMarca());
        r.setMonitorModelo(e.getMonitorModelo());
        r.setRedModelo(e.getRedModelo());
        return r;
    }

    private HistorialEstadoResponse toHistorialResponse(HistorialEstado h) {
        HistorialEstadoResponse r = new HistorialEstadoResponse();
        r.setIdHistorial(h.getIdHistorial());
        r.setEstadoAnterior(h.getEstadoAnterior());
        r.setEstadoNuevo(h.getEstadoNuevo());
        r.setMotivo(h.getMotivo());
        r.setFechaCambio(h.getFechaCambio());
        r.setIdUsuario(h.getUsuario().getIdUsuario());
        r.setNombresUsuario(h.getUsuario().getNombres());
        r.setApellidosUsuario(h.getUsuario().getApellidos());
        return r;
    }
}
