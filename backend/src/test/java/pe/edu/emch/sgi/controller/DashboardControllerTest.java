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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.emch.sgi.config.SecurityConfig;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.dashboard.DashboardResumenResponse;
import pe.edu.emch.sgi.dto.dashboard.InventarioCompletoResponse;
import pe.edu.emch.sgi.dto.dashboard.StockCriticoResponse;
import pe.edu.emch.sgi.dto.dashboard.TicketsActivosResponse;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.service.DashboardService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import(SecurityConfig.class)
class DashboardControllerTest {

    @MockBean DashboardService dashboardService;
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
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarResumen_admin_retorna200() throws Exception {
        DashboardResumenResponse resp = new DashboardResumenResponse();
        resp.setNombreTipo("LAPTOP");
        resp.setTotal(10);
        when(dashboardService.listarResumen()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/dashboard/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].nombreTipo").value("LAPTOP"));
    }

    @Test
    void listarResumen_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/dashboard/resumen"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void listarResumen_sinAdmin_retorna403() throws Exception {
        mockMvc.perform(get("/api/dashboard/resumen"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarInventario_admin_retorna200() throws Exception {
        InventarioCompletoResponse resp = new InventarioCompletoResponse();
        resp.setIdEquipo(1);
        resp.setCodigoEjercito("EQ-001");
        PagedResponse<InventarioCompletoResponse> paged =
                new PagedResponse<>(new PageImpl<>(List.of(resp)));
        when(dashboardService.listarInventario(any())).thenReturn(paged);

        mockMvc.perform(get("/api/dashboard/inventario"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].codigoEjercito").value("EQ-001"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarStockCritico_admin_retorna200() throws Exception {
        StockCriticoResponse resp = new StockCriticoResponse();
        resp.setNombreTipo("LAPTOP");
        resp.setEnAlerta(true);
        when(dashboardService.listarStockCritico()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/dashboard/stock-critico"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].enAlerta").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarTicketsActivos_admin_retorna200() throws Exception {
        TicketsActivosResponse resp = new TicketsActivosResponse();
        resp.setNumeroTicket("TKT-202601-0001");
        resp.setEstado("ABIERTO");
        when(dashboardService.listarTicketsActivos()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/dashboard/tickets-activos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].numeroTicket").value("TKT-202601-0001"));
    }
}
