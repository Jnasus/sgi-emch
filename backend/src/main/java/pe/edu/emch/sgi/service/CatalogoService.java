package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.catalogo.AreaRequest;
import pe.edu.emch.sgi.dto.catalogo.AreaResponse;
import pe.edu.emch.sgi.dto.catalogo.ConfigStockRequest;
import pe.edu.emch.sgi.dto.catalogo.ConfigStockResponse;
import pe.edu.emch.sgi.dto.catalogo.MarcaRequest;
import pe.edu.emch.sgi.dto.catalogo.MarcaResponse;
import pe.edu.emch.sgi.dto.catalogo.ModeloRequest;
import pe.edu.emch.sgi.dto.catalogo.ModeloResponse;
import pe.edu.emch.sgi.dto.catalogo.SistemaOperativoRequest;
import pe.edu.emch.sgi.dto.catalogo.SistemaOperativoResponse;
import pe.edu.emch.sgi.dto.catalogo.SlaConfigRequest;
import pe.edu.emch.sgi.dto.catalogo.TipoEquipoRequest;
import pe.edu.emch.sgi.dto.catalogo.TipoEquipoResponse;
import pe.edu.emch.sgi.dto.catalogo.TipoIncidenteResponse;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.ConfigStock;
import pe.edu.emch.sgi.entity.Marca;
import pe.edu.emch.sgi.entity.ModeloEquipo;
import pe.edu.emch.sgi.entity.SistemaOperativo;
import pe.edu.emch.sgi.entity.TipoEquipo;
import pe.edu.emch.sgi.entity.TipoIncidente;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.DuplicateResourceException;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.AreaRepository;
import pe.edu.emch.sgi.repository.ConfigStockRepository;
import pe.edu.emch.sgi.repository.MarcaRepository;
import pe.edu.emch.sgi.repository.ModeloEquipoRepository;
import pe.edu.emch.sgi.repository.SistemaOperativoRepository;
import pe.edu.emch.sgi.repository.TipoEquipoRepository;
import pe.edu.emch.sgi.repository.TipoIncidenteRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogoService {

    private final AreaRepository areaRepository;
    private final TipoEquipoRepository tipoEquipoRepository;
    private final MarcaRepository marcaRepository;
    private final ModeloEquipoRepository modeloEquipoRepository;
    private final SistemaOperativoRepository sistemaOperativoRepository;
    private final TipoIncidenteRepository tipoIncidenteRepository;
    private final ConfigStockRepository configStockRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<AreaResponse> listarAreas() {
        return areaRepository.findByActivoTrue().stream()
            .map(this::toAreaResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TipoEquipoResponse> listarTiposEquipo() {
        return tipoEquipoRepository.findAll().stream()
            .map(this::toTipoEquipoResponse).toList();
    }

    @Transactional
    public TipoEquipoResponse crearTipoEquipo(TipoEquipoRequest request) {
        if (tipoEquipoRepository.existsByNombreTipo(request.getNombreTipo())) {
            throw new DuplicateResourceException(
                "Ya existe un tipo de equipo con nombre: " + request.getNombreTipo());
        }
        TipoEquipo tipo = new TipoEquipo();
        tipo.setNombreTipo(request.getNombreTipo());
        tipo.setDescripcion(request.getDescripcion());
        return toTipoEquipoResponse(tipoEquipoRepository.save(tipo));
    }

    @Transactional
    public TipoEquipoResponse actualizarTipoEquipo(Integer idTipo, TipoEquipoRequest request) {
        TipoEquipo tipo = tipoEquipoRepository.findById(idTipo)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado: " + idTipo));
        if (tipoEquipoRepository.existsByNombreTipoAndIdTipoNot(request.getNombreTipo(), idTipo)) {
            throw new DuplicateResourceException(
                "Ya existe un tipo de equipo con nombre: " + request.getNombreTipo());
        }
        tipo.setNombreTipo(request.getNombreTipo());
        tipo.setDescripcion(request.getDescripcion());
        return toTipoEquipoResponse(tipoEquipoRepository.save(tipo));
    }

    @Transactional(readOnly = true)
    public List<MarcaResponse> listarMarcas() {
        return marcaRepository.findAll().stream()
            .map(this::toMarcaResponse).toList();
    }

    @Transactional
    public MarcaResponse crearMarca(MarcaRequest request) {
        if (marcaRepository.existsByNombreMarca(request.getNombreMarca())) {
            throw new DuplicateResourceException(
                "Ya existe una marca con nombre: " + request.getNombreMarca());
        }
        Marca marca = new Marca();
        marca.setNombreMarca(request.getNombreMarca());
        return toMarcaResponse(marcaRepository.save(marca));
    }

    @Transactional
    public MarcaResponse actualizarMarca(Integer idMarca, MarcaRequest request) {
        Marca marca = marcaRepository.findById(idMarca)
            .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + idMarca));
        if (marcaRepository.existsByNombreMarcaAndIdMarcaNot(request.getNombreMarca(), idMarca)) {
            throw new DuplicateResourceException(
                "Ya existe una marca con nombre: " + request.getNombreMarca());
        }
        marca.setNombreMarca(request.getNombreMarca());
        return toMarcaResponse(marcaRepository.save(marca));
    }

    @Transactional(readOnly = true)
    public List<ModeloResponse> listarModelos(Integer idMarca) {
        List<ModeloEquipo> modelos = (idMarca != null)
            ? modeloEquipoRepository.findByMarca_IdMarca(idMarca)
            : modeloEquipoRepository.findAll();
        return modelos.stream().map(this::toModeloResponse).toList();
    }

    @Transactional
    public ModeloResponse crearModelo(ModeloRequest request) {
        Marca marca = marcaRepository.findById(request.getIdMarca())
            .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + request.getIdMarca()));
        TipoEquipo tipo = tipoEquipoRepository.findById(request.getIdTipo())
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado: " + request.getIdTipo()));
        if (modeloEquipoRepository.existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModelo(
                request.getIdMarca(), request.getIdTipo(), request.getNombreModelo())) {
            throw new DuplicateResourceException("Ya existe ese modelo para la marca y tipo indicados");
        }
        ModeloEquipo modelo = new ModeloEquipo();
        modelo.setMarca(marca);
        modelo.setTipo(tipo);
        modelo.setNombreModelo(request.getNombreModelo());
        return toModeloResponse(modeloEquipoRepository.save(modelo));
    }

    @Transactional
    public ModeloResponse actualizarModelo(Integer idModelo, ModeloRequest request) {
        ModeloEquipo modelo = modeloEquipoRepository.findById(idModelo)
            .orElseThrow(() -> new ResourceNotFoundException("Modelo no encontrado: " + idModelo));
        Marca marca = marcaRepository.findById(request.getIdMarca())
            .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + request.getIdMarca()));
        TipoEquipo tipo = tipoEquipoRepository.findById(request.getIdTipo())
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado: " + request.getIdTipo()));
        if (modeloEquipoRepository.existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModeloAndIdModeloNot(
                request.getIdMarca(), request.getIdTipo(), request.getNombreModelo(), idModelo)) {
            throw new DuplicateResourceException("Ya existe ese modelo para la marca y tipo indicados");
        }
        modelo.setMarca(marca);
        modelo.setTipo(tipo);
        modelo.setNombreModelo(request.getNombreModelo());
        return toModeloResponse(modeloEquipoRepository.save(modelo));
    }

    @Transactional(readOnly = true)
    public List<SistemaOperativoResponse> listarSistemasOperativos() {
        return sistemaOperativoRepository.findAll().stream()
            .map(this::toSoResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TipoIncidenteResponse> listarTiposIncidente() {
        return tipoIncidenteRepository.findAll().stream()
            .map(this::toTipoIncidenteResponse).toList();
    }

    @Transactional
    public ConfigStockResponse configurarStock(Integer idTipo, ConfigStockRequest request, Integer idUsuarioActivo) {
        TipoEquipo tipo = tipoEquipoRepository.findById(idTipo)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de equipo no encontrado: " + idTipo));
        Usuario usuario = usuarioRepository.findById(idUsuarioActivo)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + idUsuarioActivo));
        ConfigStock config = configStockRepository.findByTipo_IdTipo(idTipo).orElse(new ConfigStock());
        config.setTipo(tipo);
        config.setUmbralPct(request.getUmbralPct());
        config.setUsuarioConfig(usuario);
        return toConfigStockResponse(configStockRepository.save(config));
    }

    @Transactional
    public TipoIncidenteResponse configurarSla(Integer idTipo, SlaConfigRequest request) {
        TipoIncidente tipo = tipoIncidenteRepository.findById(idTipo)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de incidente no encontrado: " + idTipo));
        tipo.setTiempoRespuestaMin(request.getTiempoRespuestaMin().shortValue());
        tipo.setTiempoResolucionMin(request.getTiempoResolucionMin().shortValue());
        return toTipoIncidenteResponse(tipoIncidenteRepository.save(tipo));
    }

    @Transactional
    public SistemaOperativoResponse crearSistemaOperativo(SistemaOperativoRequest request) {
        if (sistemaOperativoRepository.existsByNombreSoAndVersionSo(
                request.getNombreSo(), request.getVersionSo())) {
            throw new DuplicateResourceException(
                "Ya existe el SO: " + request.getNombreSo() + " " + request.getVersionSo());
        }
        SistemaOperativo so = new SistemaOperativo();
        so.setNombreSo(request.getNombreSo());
        so.setVersionSo(request.getVersionSo());
        return toSoResponse(sistemaOperativoRepository.save(so));
    }

    @Transactional
    public SistemaOperativoResponse actualizarSistemaOperativo(Integer idSo, SistemaOperativoRequest request) {
        SistemaOperativo so = sistemaOperativoRepository.findById(idSo)
            .orElseThrow(() -> new ResourceNotFoundException("Sistema operativo no encontrado: " + idSo));
        if (sistemaOperativoRepository.existsByNombreSoAndVersionSoAndIdSoNot(
                request.getNombreSo(), request.getVersionSo(), idSo)) {
            throw new DuplicateResourceException(
                "Ya existe el SO: " + request.getNombreSo() + " " + request.getVersionSo());
        }
        so.setNombreSo(request.getNombreSo());
        so.setVersionSo(request.getVersionSo());
        return toSoResponse(sistemaOperativoRepository.save(so));
    }

    @Transactional(readOnly = true)
    public List<AreaResponse> listarTodasAreas() {
        return areaRepository.findAll().stream()
            .map(this::toAreaResponse).toList();
    }

    @Transactional
    public AreaResponse crearArea(AreaRequest request) {
        if (areaRepository.existsByCodigoArea(request.getCodigoArea())) {
            throw new DuplicateResourceException(
                "Ya existe un área con código: " + request.getCodigoArea());
        }
        Area area = new Area();
        area.setCodigoArea(request.getCodigoArea().toUpperCase());
        area.setNombreArea(request.getNombreArea());
        area.setDescripcion(request.getDescripcion());
        area.setAnioVigencia(request.getAnioVigencia());
        area.setActivo(true);
        area.setCreatedAt(java.time.LocalDateTime.now());
        return toAreaResponse(areaRepository.save(area));
    }

    @Transactional
    public AreaResponse actualizarArea(Integer idArea, AreaRequest request) {
        Area area = areaRepository.findById(idArea)
            .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada: " + idArea));
        if (areaRepository.existsByCodigoAreaAndIdAreaNot(request.getCodigoArea(), idArea)) {
            throw new DuplicateResourceException(
                "Ya existe un área con código: " + request.getCodigoArea());
        }
        area.setCodigoArea(request.getCodigoArea().toUpperCase());
        area.setNombreArea(request.getNombreArea());
        area.setDescripcion(request.getDescripcion());
        area.setAnioVigencia(request.getAnioVigencia());
        return toAreaResponse(areaRepository.save(area));
    }

    // ── Mappers ──────────────────────────────────────────────────────────────────

    private AreaResponse toAreaResponse(Area a) {
        AreaResponse r = new AreaResponse();
        r.setIdArea(a.getIdArea());
        r.setCodigoArea(a.getCodigoArea());
        r.setNombreArea(a.getNombreArea());
        r.setDescripcion(a.getDescripcion());
        r.setAnioVigencia(a.getAnioVigencia());
        return r;
    }

    private TipoEquipoResponse toTipoEquipoResponse(TipoEquipo t) {
        TipoEquipoResponse r = new TipoEquipoResponse();
        r.setIdTipo(t.getIdTipo());
        r.setNombreTipo(t.getNombreTipo());
        r.setDescripcion(t.getDescripcion());
        return r;
    }

    private MarcaResponse toMarcaResponse(Marca m) {
        MarcaResponse r = new MarcaResponse();
        r.setIdMarca(m.getIdMarca());
        r.setNombreMarca(m.getNombreMarca());
        return r;
    }

    private ModeloResponse toModeloResponse(ModeloEquipo m) {
        ModeloResponse r = new ModeloResponse();
        r.setIdModelo(m.getIdModelo());
        r.setIdMarca(m.getMarca().getIdMarca());
        r.setNombreMarca(m.getMarca().getNombreMarca());
        r.setIdTipo(m.getTipo().getIdTipo());
        r.setNombreTipo(m.getTipo().getNombreTipo());
        r.setNombreModelo(m.getNombreModelo());
        return r;
    }

    private SistemaOperativoResponse toSoResponse(SistemaOperativo s) {
        SistemaOperativoResponse r = new SistemaOperativoResponse();
        r.setIdSo(s.getIdSo());
        r.setNombreSo(s.getNombreSo());
        r.setVersionSo(s.getVersionSo());
        return r;
    }

    private TipoIncidenteResponse toTipoIncidenteResponse(TipoIncidente t) {
        TipoIncidenteResponse r = new TipoIncidenteResponse();
        r.setIdTipoIncidente(t.getIdTipoIncidente());
        r.setNombreTipo(t.getNombreTipo());
        r.setTiempoRespuestaMin(t.getTiempoRespuestaMin().intValue());
        r.setTiempoResolucionMin(t.getTiempoResolucionMin().intValue());
        r.setDescripcion(t.getDescripcion());
        return r;
    }

    private ConfigStockResponse toConfigStockResponse(ConfigStock c) {
        ConfigStockResponse r = new ConfigStockResponse();
        r.setIdConfig(c.getIdConfig());
        r.setIdTipo(c.getTipo().getIdTipo());
        r.setNombreTipo(c.getTipo().getNombreTipo());
        r.setUmbralPct(c.getUmbralPct());
        r.setFechaModificacion(c.getFechaModificacion());
        return r;
    }
}
