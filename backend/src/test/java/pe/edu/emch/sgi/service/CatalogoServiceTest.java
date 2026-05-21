package pe.edu.emch.sgi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.emch.sgi.dto.catalogo.*;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.exception.DuplicateResourceException;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.*;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogoServiceTest {

    @Mock AreaRepository areaRepository;
    @Mock TipoEquipoRepository tipoEquipoRepository;
    @Mock MarcaRepository marcaRepository;
    @Mock ModeloEquipoRepository modeloEquipoRepository;
    @Mock SistemaOperativoRepository sistemaOperativoRepository;
    @Mock TipoIncidenteRepository tipoIncidenteRepository;
    @Mock ConfigStockRepository configStockRepository;
    @Mock UsuarioRepository usuarioRepository;

    @InjectMocks CatalogoService catalogoService;

    private Area areaActiva;
    private TipoEquipo tipoEquipo;
    private Marca marca;
    private ModeloEquipo modelo;
    private SistemaOperativo so;
    private TipoIncidente tipoIncidente;
    private ConfigStock configStock;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        areaActiva = new Area();
        areaActiva.setIdArea(1);
        areaActiva.setCodigoArea("DTIC");
        areaActiva.setNombreArea("Departamento TIC");
        areaActiva.setAnioVigencia(2024);
        areaActiva.setActivo(true);

        tipoEquipo = new TipoEquipo();
        tipoEquipo.setIdTipo(1);
        tipoEquipo.setNombreTipo("Laptop");

        marca = new Marca();
        marca.setIdMarca(1);
        marca.setNombreMarca("Dell");

        modelo = new ModeloEquipo();
        modelo.setIdModelo(1);
        modelo.setMarca(marca);
        modelo.setTipo(tipoEquipo);
        modelo.setNombreModelo("Latitude 5420");

        so = new SistemaOperativo();
        so.setIdSo(1);
        so.setNombreSo("Windows");
        so.setVersionSo("11 Pro");

        tipoIncidente = new TipoIncidente();
        tipoIncidente.setIdTipoIncidente(1);
        tipoIncidente.setNombreTipo("Fallo de hardware");
        tipoIncidente.setTiempoRespuestaMin((short) 60);
        tipoIncidente.setTiempoResolucionMin((short) 480);

        usuario = new Usuario();
        usuario.setIdUsuario(1);

        configStock = new ConfigStock();
        configStock.setIdConfig(1);
        configStock.setTipo(tipoEquipo);
        configStock.setUmbralPct((short) 20);
        configStock.setUsuarioConfig(usuario);
    }

    @Test
    void listarAreas_retornaAreasActivas() {
        when(areaRepository.findByActivoTrue()).thenReturn(List.of(areaActiva));
        List<AreaResponse> result = catalogoService.listarAreas();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCodigoArea()).isEqualTo("DTIC");
        assertThat(result.get(0).getAnioVigencia()).isEqualTo(2024);
    }

    @Test
    void listarTiposEquipo_retornaLista() {
        when(tipoEquipoRepository.findAll()).thenReturn(List.of(tipoEquipo));
        List<TipoEquipoResponse> result = catalogoService.listarTiposEquipo();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreTipo()).isEqualTo("Laptop");
    }

    @Test
    void crearTipoEquipo_exitoso() {
        TipoEquipoRequest req = new TipoEquipoRequest();
        req.setNombreTipo("Servidor");
        when(tipoEquipoRepository.existsByNombreTipo("Servidor")).thenReturn(false);
        when(tipoEquipoRepository.save(any())).thenAnswer(inv -> {
            TipoEquipo t = inv.getArgument(0);
            t.setIdTipo(2);
            return t;
        });
        TipoEquipoResponse result = catalogoService.crearTipoEquipo(req);
        assertThat(result.getNombreTipo()).isEqualTo("Servidor");
        assertThat(result.getIdTipo()).isEqualTo(2);
    }

    @Test
    void crearTipoEquipo_nombreDuplicado_lanzaExcepcion() {
        TipoEquipoRequest req = new TipoEquipoRequest();
        req.setNombreTipo("Laptop");
        when(tipoEquipoRepository.existsByNombreTipo("Laptop")).thenReturn(true);
        assertThatThrownBy(() -> catalogoService.crearTipoEquipo(req))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void actualizarTipoEquipo_noEncontrado_lanzaExcepcion() {
        when(tipoEquipoRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> catalogoService.actualizarTipoEquipo(99, new TipoEquipoRequest()))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void crearMarca_exitosa() {
        MarcaRequest req = new MarcaRequest();
        req.setNombreMarca("HP");
        when(marcaRepository.existsByNombreMarca("HP")).thenReturn(false);
        when(marcaRepository.save(any())).thenAnswer(inv -> {
            Marca m = inv.getArgument(0);
            m.setIdMarca(2);
            return m;
        });
        MarcaResponse result = catalogoService.crearMarca(req);
        assertThat(result.getNombreMarca()).isEqualTo("HP");
    }

    @Test
    void listarModelos_sinFiltro_retornaTodos() {
        when(modeloEquipoRepository.findAll()).thenReturn(List.of(modelo));
        List<ModeloResponse> result = catalogoService.listarModelos(null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreMarca()).isEqualTo("Dell");
    }

    @Test
    void listarModelos_conFiltroMarca_filtraCorrectamente() {
        when(modeloEquipoRepository.findByMarca_IdMarca(1)).thenReturn(List.of(modelo));
        List<ModeloResponse> result = catalogoService.listarModelos(1);
        assertThat(result).hasSize(1);
    }

    @Test
    void crearModelo_marcaNoExiste_lanzaExcepcion() {
        ModeloRequest req = new ModeloRequest();
        req.setIdMarca(99);
        req.setIdTipo(1);
        req.setNombreModelo("Test");
        when(marcaRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> catalogoService.crearModelo(req))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listarSistemasOperativos_retornaLista() {
        when(sistemaOperativoRepository.findAll()).thenReturn(List.of(so));
        List<SistemaOperativoResponse> result = catalogoService.listarSistemasOperativos();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNombreSo()).isEqualTo("Windows");
        assertThat(result.get(0).getVersionSo()).isEqualTo("11 Pro");
    }

    @Test
    void listarTiposIncidente_retornaConSla() {
        when(tipoIncidenteRepository.findAll()).thenReturn(List.of(tipoIncidente));
        List<TipoIncidenteResponse> result = catalogoService.listarTiposIncidente();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTiempoResolucionMin()).isEqualTo(480);
    }

    @Test
    void configurarStock_creaConfigNueva() {
        ConfigStockRequest req = new ConfigStockRequest();
        req.setUmbralPct((short) 25);
        when(tipoEquipoRepository.findById(1)).thenReturn(Optional.of(tipoEquipo));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(configStockRepository.findByTipo_IdTipo(1)).thenReturn(Optional.empty());
        when(configStockRepository.save(any())).thenAnswer(inv -> {
            ConfigStock cs = inv.getArgument(0);
            cs.setIdConfig(1);
            return cs;
        });
        ConfigStockResponse result = catalogoService.configurarStock(1, req, 1);
        assertThat(result.getUmbralPct()).isEqualTo((short) 25);
    }

    @Test
    void configurarSla_actualizaTiempos() {
        SlaConfigRequest req = new SlaConfigRequest();
        req.setTiempoRespuestaMin(30);
        req.setTiempoResolucionMin(120);
        when(tipoIncidenteRepository.findById(1)).thenReturn(Optional.of(tipoIncidente));
        when(tipoIncidenteRepository.save(any())).thenReturn(tipoIncidente);
        TipoIncidenteResponse result = catalogoService.configurarSla(1, req);
        assertThat(result.getTiempoRespuestaMin()).isEqualTo(30);
    }

    @Test
    void configurarSla_tipoNoExiste_lanzaExcepcion() {
        when(tipoIncidenteRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> catalogoService.configurarSla(99, new SlaConfigRequest()))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
