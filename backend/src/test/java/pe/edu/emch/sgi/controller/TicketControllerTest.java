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
import pe.edu.emch.sgi.dto.ticket.*;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.service.TicketService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
@Import(SecurityConfig.class)
class TicketControllerTest {

    @MockBean TicketService ticketService;
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
    void listarTickets_autenticado_retorna200() throws Exception {
        TicketResponse resp = new TicketResponse();
        resp.setIdTicket(1);
        resp.setNumeroTicket("TKT-202601-0001");
        resp.setEstado("ABIERTO");
        PagedResponse<TicketResponse> paged = new PagedResponse<>(new PageImpl<>(List.of(resp)));
        when(ticketService.listarTickets(isNull(), isNull(), isNull(), isNull(), any()))
                .thenReturn(paged);

        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].numeroTicket").value("TKT-202601-0001"));
    }

    @Test
    void listarTickets_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void obtenerTicket_retornaResponse() throws Exception {
        TicketResponse resp = new TicketResponse();
        resp.setIdTicket(1);
        resp.setNumeroTicket("TKT-202601-0001");
        resp.setCodigoEjercito("EQ-001");
        when(ticketService.obtenerTicket(1)).thenReturn(resp);

        mockMvc.perform(get("/api/tickets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.codigoEjercito").value("EQ-001"));
    }

    @Test
    @WithMockUser(roles = "TECNICO")
    void crearTicket_tecnico_retorna201() throws Exception {
        TicketCreateRequest req = buildCreateRequest();
        TicketResponse resp = new TicketResponse();
        resp.setIdTicket(1);
        resp.setNumeroTicket("TKT-202601-0001");
        resp.setEstado("ABIERTO");
        when(ticketService.crearTicket(any())).thenReturn(resp);

        mockMvc.perform(post("/api/tickets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.estado").value("ABIERTO"));
    }

    @Test
    @WithMockUser
    void crearTicket_sinRol_retorna403() throws Exception {
        mockMvc.perform(post("/api/tickets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildCreateRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void cambiarEstado_admin_retorna200() throws Exception {
        TicketCambioEstadoRequest req = new TicketCambioEstadoRequest();
        req.setEstado("EN_PROCESO");
        TicketResponse resp = new TicketResponse();
        resp.setIdTicket(1);
        resp.setEstado("EN_PROCESO");
        when(ticketService.cambiarEstado(eq(1), any())).thenReturn(resp);

        mockMvc.perform(patch("/api/tickets/1/estado")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estado").value("EN_PROCESO"));
    }

    @Test
    @WithMockUser
    void cambiarEstado_sinRol_retorna403() throws Exception {
        TicketCambioEstadoRequest req = new TicketCambioEstadoRequest();
        req.setEstado("EN_PROCESO");
        mockMvc.perform(patch("/api/tickets/1/estado")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void listarHistorial_retornaLista() throws Exception {
        HistorialTicketResponse h = new HistorialTicketResponse();
        h.setIdHistTicket(1);
        h.setEstadoAnterior("ABIERTO");
        h.setEstadoNuevo("EN_PROCESO");
        when(ticketService.listarHistorial(1)).thenReturn(List.of(h));

        mockMvc.perform(get("/api/tickets/1/historial"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].estadoNuevo").value("EN_PROCESO"));
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private TicketCreateRequest buildCreateRequest() {
        TicketCreateRequest r = new TicketCreateRequest();
        r.setIdEquipo(1);
        r.setIdTecnico(2);
        r.setIdTipoIncidente(1);
        r.setTitulo("PC no enciende");
        return r;
    }
}
