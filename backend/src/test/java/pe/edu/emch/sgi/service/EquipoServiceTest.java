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
import pe.edu.emch.sgi.dto.equipo.*;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.exception.DuplicateResourceException;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipoServiceTest {

    @Mock EquipoRepository equipoRepository;
    @Mock EspecificacionTecnicaRepository especificacionTecnicaRepository;
    @Mock HistorialEstadoRepository historialEstadoRepository;
    @Mock TipoEquipoRepository tipoEquipoRepository;
    @Mock ModeloEquipoRepository modeloEquipoRepository;
    @Mock AreaRepository areaRepository;
    @Mock SistemaOperativoRepository sistemaOperativoRepository;
    @Mock UsuarioRepository usuarioRepository;

    @InjectMocks EquipoService equipoService;

    private TipoEquipo tipoEquipo;
    private Marca marca;
    private ModeloEquipo modelo;
    private Area area;
    private SistemaOperativo so;
    private Usuario usuario;
    private Equipo equipo;

    @BeforeEach
    void setUp() {
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

        area = new Area();
        area.setIdArea(1);
        area.setNombreArea("DTIC");

        so = new SistemaOperativo();
        so.setIdSo(1);
        so.setNombreSo("Windows");
        so.setVersionSo("11 Pro");

        usuario = new Usuario();
        usuario.setIdUsuario(1);
        usuario.setNombres("Admin");
        usuario.setApellidos("Sistema");

        equipo = new Equipo();
        equipo.setIdEquipo(1);
        equipo.setCodigoEjercito("EQ-001");
        equipo.setTipo(tipoEquipo);
        equipo.setModelo(modelo);
        equipo.setArea(area);
        equipo.setSo(so);
        equipo.setNumeroSerie("SN-001");
        equipo.setNombreResponsable("Juan Perez");
        equipo.setTipoRed("N/A");
        equipo.setEstado("EN_BODEGA");
        equipo.setFechaRegistro(LocalDate.of(2024, 1, 1));
    }

    @Test
    void listarEquipos_retornaPagedResponse() {
        Page<Equipo> page = new PageImpl<>(List.of(equipo));
        when(equipoRepository.findFiltered(isNull(), isNull(), isNull(), any())).thenReturn(page);

        var result = equipoService.listarEquipos(null, null, null, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCodigoEjercito()).isEqualTo("EQ-001");
    }

    @Test
    void obtenerEquipo_sinEspecificaciones_retornaRespuestaSinEspec() {
        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(especificacionTecnicaRepository.findByEquipo(equipo)).thenReturn(Optional.empty());

        EquipoResponse result = equipoService.obtenerEquipo(1);

        assertThat(result.getCodigoEjercito()).isEqualTo("EQ-001");
        assertThat(result.getEspecificaciones()).isNull();
    }

    @Test
    void obtenerEquipo_conEspecificaciones_retornaEspec() {
        EspecificacionTecnica espec = new EspecificacionTecnica();
        espec.setIdEspec(1);
        espec.setProcesador("Intel Core i7");
        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(especificacionTecnicaRepository.findByEquipo(equipo)).thenReturn(Optional.of(espec));

        EquipoResponse result = equipoService.obtenerEquipo(1);

        assertThat(result.getEspecificaciones()).isNotNull();
        assertThat(result.getEspecificaciones().getProcesador()).isEqualTo("Intel Core i7");
    }

    @Test
    void obtenerEquipo_noEncontrado_lanzaExcepcion() {
        when(equipoRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> equipoService.obtenerEquipo(99))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void crearEquipo_exitoso() {
        EquipoRequest req = buildRequest();
        when(equipoRepository.existsByCodigoEjercito("EQ-002")).thenReturn(false);
        when(equipoRepository.existsByNumeroSerie("SN-002")).thenReturn(false);
        when(tipoEquipoRepository.findById(1)).thenReturn(Optional.of(tipoEquipo));
        when(modeloEquipoRepository.findById(1)).thenReturn(Optional.of(modelo));
        when(areaRepository.findById(1)).thenReturn(Optional.of(area));
        when(sistemaOperativoRepository.findById(1)).thenReturn(Optional.of(so));
        when(equipoRepository.save(any())).thenAnswer(inv -> {
            Equipo e = inv.getArgument(0);
            e.setIdEquipo(2);
            return e;
        });

        EquipoResponse result = equipoService.crearEquipo(req);

        assertThat(result.getCodigoEjercito()).isEqualTo("EQ-002");
        assertThat(result.getEstado()).isEqualTo("EN_BODEGA");
        assertThat(result.getFechaRegistro()).isNotNull();
    }

    @Test
    void crearEquipo_codigoDuplicado_lanzaExcepcion() {
        EquipoRequest req = buildRequest();
        when(equipoRepository.existsByCodigoEjercito("EQ-002")).thenReturn(true);
        assertThatThrownBy(() -> equipoService.crearEquipo(req))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void crearEquipo_serieDuplicada_lanzaExcepcion() {
        EquipoRequest req = buildRequest();
        when(equipoRepository.existsByCodigoEjercito("EQ-002")).thenReturn(false);
        when(equipoRepository.existsByNumeroSerie("SN-002")).thenReturn(true);
        assertThatThrownBy(() -> equipoService.crearEquipo(req))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void crearEquipo_macDuplicada_lanzaExcepcion() {
        EquipoRequest req = buildRequest();
        req.setMacAddress("AA:BB:CC:DD:EE:FF");
        when(equipoRepository.existsByCodigoEjercito("EQ-002")).thenReturn(false);
        when(equipoRepository.existsByNumeroSerie("SN-002")).thenReturn(false);
        when(equipoRepository.existsByMacAddress("AA:BB:CC:DD:EE:FF")).thenReturn(true);
        assertThatThrownBy(() -> equipoService.crearEquipo(req))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void actualizarEquipo_noEncontrado_lanzaExcepcion() {
        when(equipoRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> equipoService.actualizarEquipo(99, buildRequest()))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cambiarEstado_registraHistorialYCambiaEstado() {
        equipo.setEstado("EN_BODEGA");
        CambioEstadoRequest req = new CambioEstadoRequest();
        req.setEstado("ASIGNADO");
        req.setMotivo("Asignado a laboratorio");
        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(historialEstadoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(equipoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        equipoService.cambiarEstado(1, req, 1);

        verify(historialEstadoRepository).save(argThat(h ->
            "EN_BODEGA".equals(h.getEstadoAnterior())
            && "ASIGNADO".equals(h.getEstadoNuevo())
            && "Asignado a laboratorio".equals(h.getMotivo())
        ));
    }

    @Test
    void cambiarEstado_dadoDeBaja_setFechaBaja() {
        CambioEstadoRequest req = new CambioEstadoRequest();
        req.setEstado("DADO_DE_BAJA");
        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(historialEstadoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(equipoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EquipoResponse result = equipoService.cambiarEstado(1, req, 1);

        assertThat(result.getEstado()).isEqualTo("DADO_DE_BAJA");
        assertThat(result.getFechaBaja()).isNotNull();
    }

    @Test
    void cambiarEstado_salidaDadoDeBaja_limpiafechaBaja() {
        equipo.setEstado("DADO_DE_BAJA");
        equipo.setFechaBaja(LocalDate.of(2024, 1, 15));
        CambioEstadoRequest req = new CambioEstadoRequest();
        req.setEstado("EN_BODEGA");
        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(historialEstadoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(equipoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EquipoResponse result = equipoService.cambiarEstado(1, req, 1);

        assertThat(result.getFechaBaja()).isNull();
    }

    @Test
    void upsertEspecificaciones_creaNew() {
        EspecificacionTecnicaRequest req = new EspecificacionTecnicaRequest();
        req.setProcesador("Intel Core i5");
        req.setRamTotalGb(8);
        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(especificacionTecnicaRepository.findByEquipo(equipo)).thenReturn(Optional.empty());
        when(especificacionTecnicaRepository.save(any())).thenAnswer(inv -> {
            EspecificacionTecnica e = inv.getArgument(0);
            e.setIdEspec(1);
            return e;
        });

        EspecificacionTecnicaResponse result = equipoService.upsertEspecificaciones(1, req);

        assertThat(result.getProcesador()).isEqualTo("Intel Core i5");
        assertThat(result.getRamTotalGb()).isEqualTo(8);
    }

    @Test
    void upsertEspecificaciones_actualizaExistente() {
        EspecificacionTecnica existente = new EspecificacionTecnica();
        existente.setIdEspec(1);
        existente.setEquipo(equipo);
        existente.setProcesador("Intel Core i5");

        EspecificacionTecnicaRequest req = new EspecificacionTecnicaRequest();
        req.setProcesador("Intel Core i7");
        req.setRamTotalGb(16);

        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(especificacionTecnicaRepository.findByEquipo(equipo)).thenReturn(Optional.of(existente));
        when(especificacionTecnicaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EspecificacionTecnicaResponse result = equipoService.upsertEspecificaciones(1, req);

        assertThat(result.getProcesador()).isEqualTo("Intel Core i7");
        assertThat(result.getRamTotalGb()).isEqualTo(16);
    }

    @Test
    void listarHistorial_retornaOrdenado() {
        HistorialEstado h = new HistorialEstado();
        h.setIdHistorial(1);
        h.setEstadoAnterior("EN_BODEGA");
        h.setEstadoNuevo("ASIGNADO");
        h.setUsuario(usuario);

        when(equipoRepository.findById(1)).thenReturn(Optional.of(equipo));
        when(historialEstadoRepository.findByEquipoOrderByFechaCambioDesc(equipo)).thenReturn(List.of(h));

        List<HistorialEstadoResponse> result = equipoService.listarHistorial(1);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEstadoAnterior()).isEqualTo("EN_BODEGA");
        assertThat(result.get(0).getNombresUsuario()).isEqualTo("Admin");
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private EquipoRequest buildRequest() {
        EquipoRequest r = new EquipoRequest();
        r.setCodigoEjercito("EQ-002");
        r.setIdTipo(1);
        r.setIdModelo(1);
        r.setIdArea(1);
        r.setIdSo(1);
        r.setNumeroSerie("SN-002");
        r.setNombreResponsable("Maria Lopez");
        return r;
    }
}
