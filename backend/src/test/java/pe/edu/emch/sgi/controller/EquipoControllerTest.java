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
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.emch.sgi.config.SecurityConfig;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.equipo.*;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.service.EquipoService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EquipoController.class)
@Import(SecurityConfig.class)
class EquipoControllerTest {

    @MockBean EquipoService equipoService;
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
    void listarEquipos_autenticado_retorna200() throws Exception {
        EquipoResponse resp = new EquipoResponse();
        resp.setIdEquipo(1);
        resp.setCodigoEjercito("EQ-001");
        resp.setEstado("EN_BODEGA");
        PagedResponse<EquipoResponse> paged = new PagedResponse<>(new PageImpl<>(List.of(resp)));
        when(equipoService.listarEquipos(isNull(), isNull(), isNull(), any())).thenReturn(paged);

        mockMvc.perform(get("/api/equipos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].codigoEjercito").value("EQ-001"));
    }

    @Test
    @WithMockUser
    void obtenerEquipo_retornaConEspecificaciones() throws Exception {
        EspecificacionTecnicaResponse espec = new EspecificacionTecnicaResponse();
        espec.setIdEspec(1);
        espec.setProcesador("Intel Core i7");
        EquipoResponse resp = new EquipoResponse();
        resp.setIdEquipo(1);
        resp.setCodigoEjercito("EQ-001");
        resp.setEspecificaciones(espec);
        when(equipoService.obtenerEquipo(1)).thenReturn(resp);

        mockMvc.perform(get("/api/equipos/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.especificaciones.procesador").value("Intel Core i7"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void crearEquipo_admin_retorna201() throws Exception {
        EquipoRequest req = buildRequest();
        EquipoResponse resp = new EquipoResponse();
        resp.setIdEquipo(1);
        resp.setCodigoEjercito("EQ-002");
        resp.setEstado("EN_BODEGA");
        when(equipoService.crearEquipo(any())).thenReturn(resp);

        mockMvc.perform(post("/api/equipos")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.codigoEjercito").value("EQ-002"));
    }

    @Test
    @WithMockUser
    void crearEquipo_noAdmin_retorna403() throws Exception {
        mockMvc.perform(post("/api/equipos")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildRequest())))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void actualizarEquipo_admin_retorna200() throws Exception {
        EquipoRequest req = buildRequest();
        EquipoResponse resp = new EquipoResponse();
        resp.setIdEquipo(1);
        resp.setCodigoEjercito("EQ-002");
        when(equipoService.actualizarEquipo(eq(1), any())).thenReturn(resp);

        mockMvc.perform(put("/api/equipos/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.codigoEjercito").value("EQ-002"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void cambiarEstado_retorna200() throws Exception {
        CambioEstadoRequest req = new CambioEstadoRequest();
        req.setEstado("ASIGNADO");
        EquipoResponse resp = new EquipoResponse();
        resp.setIdEquipo(1);
        resp.setEstado("ASIGNADO");
        when(equipoService.cambiarEstado(eq(1), any(), any())).thenReturn(resp);

        mockMvc.perform(patch("/api/equipos/1/estado")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.estado").value("ASIGNADO"));
    }

    @Test
    @WithMockUser(roles = "TECNICO_CAMPO")
    void upsertEspecificaciones_tecnico_retorna200() throws Exception {
        EspecificacionTecnicaRequest req = new EspecificacionTecnicaRequest();
        req.setProcesador("Intel Core i5");
        EspecificacionTecnicaResponse resp = new EspecificacionTecnicaResponse();
        resp.setIdEspec(1);
        resp.setProcesador("Intel Core i5");
        when(equipoService.upsertEspecificaciones(eq(1), any())).thenReturn(resp);

        mockMvc.perform(put("/api/equipos/1/especificaciones")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.procesador").value("Intel Core i5"));
    }

    @Test
    @WithMockUser
    void listarHistorial_retornaLista() throws Exception {
        HistorialEstadoResponse h = new HistorialEstadoResponse();
        h.setIdHistorial(1);
        h.setEstadoAnterior("EN_BODEGA");
        h.setEstadoNuevo("ASIGNADO");
        when(equipoService.listarHistorial(1)).thenReturn(List.of(h));

        mockMvc.perform(get("/api/equipos/1/historial"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].estadoNuevo").value("ASIGNADO"));
    }

    @Test
    void listarEquipos_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/equipos"))
            .andExpect(status().isUnauthorized());
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
