package pe.edu.emch.sgi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.emch.sgi.config.SecurityConfig;
import pe.edu.emch.sgi.dto.catalogo.AreaResponse;
import pe.edu.emch.sgi.dto.catalogo.ConfigStockRequest;
import pe.edu.emch.sgi.dto.catalogo.ConfigStockResponse;
import pe.edu.emch.sgi.dto.catalogo.MarcaRequest;
import pe.edu.emch.sgi.dto.catalogo.MarcaResponse;
import pe.edu.emch.sgi.dto.catalogo.ModeloResponse;
import pe.edu.emch.sgi.dto.catalogo.SistemaOperativoResponse;
import pe.edu.emch.sgi.dto.catalogo.SlaConfigRequest;
import pe.edu.emch.sgi.dto.catalogo.TipoEquipoRequest;
import pe.edu.emch.sgi.dto.catalogo.TipoEquipoResponse;
import pe.edu.emch.sgi.dto.catalogo.TipoIncidenteResponse;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.service.CatalogoService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CatalogoController.class)
@Import(SecurityConfig.class)
class CatalogoControllerTest {

    @MockBean CatalogoService catalogoService;
    @MockBean JwtUtil jwtUtil;
    @MockBean UserDetailsServiceImpl userDetailsService;
    @MockBean JwtAuthFilter jwtAuthFilter;
    @MockBean AuditSessionInterceptor auditSessionInterceptor;

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @BeforeEach
    void setUpFilter() throws Exception {
        doAnswer(invocation -> {
            HttpServletRequest req = invocation.getArgument(0);
            HttpServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());

        when(auditSessionInterceptor.preHandle(any(), any(), any())).thenReturn(true);
    }

    @Test
    @WithMockUser
    void listarAreas_retornaLista() throws Exception {
        AreaResponse area = new AreaResponse();
        area.setIdArea(1);
        area.setCodigoArea("DTIC");
        area.setNombreArea("Departamento TIC");
        area.setAnioVigencia(2024);
        when(catalogoService.listarAreas()).thenReturn(List.of(area));

        mockMvc.perform(get("/api/catalogos/areas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].codigoArea").value("DTIC"));
    }

    @Test
    @WithMockUser
    void listarTiposEquipo_retornaLista() throws Exception {
        TipoEquipoResponse tipo = new TipoEquipoResponse();
        tipo.setIdTipo(1);
        tipo.setNombreTipo("Laptop");
        when(catalogoService.listarTiposEquipo()).thenReturn(List.of(tipo));

        mockMvc.perform(get("/api/catalogos/tipos-equipo"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].nombreTipo").value("Laptop"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void crearTipoEquipo_adminPuedeCrear() throws Exception {
        TipoEquipoRequest req = new TipoEquipoRequest();
        req.setNombreTipo("Servidor");
        TipoEquipoResponse resp = new TipoEquipoResponse();
        resp.setIdTipo(2);
        resp.setNombreTipo("Servidor");
        when(catalogoService.crearTipoEquipo(any())).thenReturn(resp);

        mockMvc.perform(post("/api/catalogos/tipos-equipo")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.nombreTipo").value("Servidor"));
    }

    @Test
    @WithMockUser(roles = "TECNICO_CAMPO")
    void crearTipoEquipo_noAdminRechazo() throws Exception {
        TipoEquipoRequest req = new TipoEquipoRequest();
        req.setNombreTipo("Servidor");

        mockMvc.perform(post("/api/catalogos/tipos-equipo")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void listarMarcas_retornaLista() throws Exception {
        MarcaResponse marca = new MarcaResponse();
        marca.setIdMarca(1);
        marca.setNombreMarca("Dell");
        when(catalogoService.listarMarcas()).thenReturn(List.of(marca));

        mockMvc.perform(get("/api/catalogos/marcas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].nombreMarca").value("Dell"));
    }

    @Test
    @WithMockUser
    void listarModelos_sinFiltro() throws Exception {
        ModeloResponse modelo = new ModeloResponse();
        modelo.setIdModelo(1);
        modelo.setNombreModelo("Latitude 5420");
        modelo.setNombreMarca("Dell");
        when(catalogoService.listarModelos(null)).thenReturn(List.of(modelo));

        mockMvc.perform(get("/api/catalogos/modelos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].nombreModelo").value("Latitude 5420"));
    }

    @Test
    @WithMockUser
    void listarModelos_conFiltroMarca() throws Exception {
        ModeloResponse modelo = new ModeloResponse();
        modelo.setIdModelo(1);
        modelo.setNombreModelo("Latitude 5420");
        when(catalogoService.listarModelos(1)).thenReturn(List.of(modelo));

        mockMvc.perform(get("/api/catalogos/modelos?marcaId=1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].idModelo").value(1));
    }

    @Test
    @WithMockUser
    void listarSistemasOperativos_retornaLista() throws Exception {
        SistemaOperativoResponse so = new SistemaOperativoResponse();
        so.setIdSo(1);
        so.setNombreSo("Windows");
        so.setVersionSo("11 Pro");
        when(catalogoService.listarSistemasOperativos()).thenReturn(List.of(so));

        mockMvc.perform(get("/api/catalogos/sistemas-operativos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].versionSo").value("11 Pro"));
    }

    @Test
    @WithMockUser
    void listarTiposIncidente_retornaConSla() throws Exception {
        TipoIncidenteResponse ti = new TipoIncidenteResponse();
        ti.setIdTipoIncidente(1);
        ti.setNombreTipo("Fallo hardware");
        ti.setTiempoRespuestaMin(60);
        ti.setTiempoResolucionMin(480);
        when(catalogoService.listarTiposIncidente()).thenReturn(List.of(ti));

        mockMvc.perform(get("/api/catalogos/tipos-incidente"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].tiempoResolucionMin").value(480));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void configurarStock_adminActualizaUmbral() throws Exception {
        ConfigStockRequest req = new ConfigStockRequest();
        req.setUmbralPct((short) 25);
        ConfigStockResponse resp = new ConfigStockResponse();
        resp.setIdConfig(1);
        resp.setUmbralPct((short) 25);
        when(catalogoService.configurarStock(eq(1), any(), any())).thenReturn(resp);

        mockMvc.perform(put("/api/catalogos/stock/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.umbralPct").value(25));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void configurarSla_adminActualizaTiempos() throws Exception {
        SlaConfigRequest req = new SlaConfigRequest();
        req.setTiempoRespuestaMin(30);
        req.setTiempoResolucionMin(120);
        TipoIncidenteResponse resp = new TipoIncidenteResponse();
        resp.setIdTipoIncidente(1);
        resp.setTiempoRespuestaMin(30);
        resp.setTiempoResolucionMin(120);
        when(catalogoService.configurarSla(eq(1), any())).thenReturn(resp);

        mockMvc.perform(put("/api/catalogos/sla/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.tiempoRespuestaMin").value(30));
    }

    @Test
    void listarAreas_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/catalogos/areas"))
            .andExpect(status().isUnauthorized());
    }
}
