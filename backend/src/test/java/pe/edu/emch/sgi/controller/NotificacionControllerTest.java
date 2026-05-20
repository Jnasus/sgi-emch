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
import pe.edu.emch.sgi.dto.notificacion.NotificacionResponse;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.service.NotificacionService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificacionController.class)
@Import(SecurityConfig.class)
class NotificacionControllerTest {

    @MockBean NotificacionService notificacionService;
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
    void listarNotificaciones_autenticado_retorna200() throws Exception {
        NotificacionResponse resp = new NotificacionResponse();
        resp.setIdNotif(1);
        resp.setTitulo("Aviso");
        resp.setLeida(false);
        PagedResponse<NotificacionResponse> paged = new PagedResponse<>(new PageImpl<>(List.of(resp)));
        when(notificacionService.listarNotificaciones(isNull(), isNull(), any())).thenReturn(paged);

        mockMvc.perform(get("/api/notificaciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].titulo").value("Aviso"));
    }

    @Test
    void listarNotificaciones_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/notificaciones"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void marcarLeida_retorna200() throws Exception {
        NotificacionResponse resp = new NotificacionResponse();
        resp.setIdNotif(1);
        resp.setLeida(true);
        when(notificacionService.marcarLeida(eq(1), isNull())).thenReturn(resp);

        mockMvc.perform(patch("/api/notificaciones/1/leer").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.leida").value(true));
    }

    @Test
    @WithMockUser
    void marcarTodasLeidas_retorna200() throws Exception {
        doNothing().when(notificacionService).marcarTodasLeidas(isNull());

        mockMvc.perform(patch("/api/notificaciones/leer-todas").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    void eliminarNotificacion_retorna200() throws Exception {
        doNothing().when(notificacionService).eliminarNotificacion(eq(1), isNull());

        mockMvc.perform(delete("/api/notificaciones/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void eliminarNotificacion_sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(delete("/api/notificaciones/1").with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}
