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
import pe.edu.emch.sgi.dto.usuario.CambioPasswordRequest;
import pe.edu.emch.sgi.dto.usuario.EstadoUsuarioRequest;
import pe.edu.emch.sgi.dto.usuario.RolResponse;
import pe.edu.emch.sgi.dto.usuario.UsuarioCreateRequest;
import pe.edu.emch.sgi.dto.usuario.UsuarioResponse;
import pe.edu.emch.sgi.dto.usuario.UsuarioUpdateRequest;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;
import pe.edu.emch.sgi.security.JwtAuthFilter;
import pe.edu.emch.sgi.security.JwtUtil;
import pe.edu.emch.sgi.security.UserDetailsServiceImpl;
import pe.edu.emch.sgi.service.UsuarioService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
@Import(SecurityConfig.class)
class UsuarioControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean UsuarioService usuarioService;
    @MockBean JwtUtil jwtUtil;
    @MockBean UserDetailsServiceImpl userDetailsService;
    @MockBean JwtAuthFilter jwtAuthFilter;
    @MockBean AuditSessionInterceptor auditSessionInterceptor;

    private UsuarioResponse usuarioResponse;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            HttpServletRequest req = invocation.getArgument(0);
            HttpServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());

        when(auditSessionInterceptor.preHandle(any(), any(), any())).thenReturn(true);

        usuarioResponse = new UsuarioResponse();
        usuarioResponse.setIdUsuario(1);
        usuarioResponse.setNombres("Juan");
        usuarioResponse.setApellidos("Torres");
        usuarioResponse.setDni("12345678");
        usuarioResponse.setUsername("jtorres");
        usuarioResponse.setIdRol(1);
        usuarioResponse.setNombreRol("ADMINISTRADOR");
        usuarioResponse.setIdArea(1);
        usuarioResponse.setNombreArea("DTIC");
        usuarioResponse.setActivo(true);
        usuarioResponse.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarUsuarios_retornaOk() throws Exception {
        PagedResponse<UsuarioResponse> paged = new PagedResponse<>(
            new PageImpl<>(List.of(usuarioResponse)));
        when(usuarioService.listarUsuarios(any(), any(), any())).thenReturn(paged);

        mockMvc.perform(get("/api/usuarios"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].username").value("jtorres"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void listarRoles_retornaOk() throws Exception {
        RolResponse rol = new RolResponse();
        rol.setIdRol(1);
        rol.setNombreRol("ADMINISTRADOR");
        when(usuarioService.listarRoles()).thenReturn(List.of(rol));

        mockMvc.perform(get("/api/usuarios/roles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].nombreRol").value("ADMINISTRADOR"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void obtenerUsuario_retornaOk() throws Exception {
        when(usuarioService.obtenerUsuario(1)).thenReturn(usuarioResponse);
        mockMvc.perform(get("/api/usuarios/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.idUsuario").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void crearUsuario_retorna201() throws Exception {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setNombres("Juan");
        request.setApellidos("Torres");
        request.setDni("12345678");
        request.setUsername("jtorres");
        request.setPassword("password123");
        request.setIdRol(1);
        request.setIdArea(1);

        when(usuarioService.crearUsuario(any())).thenReturn(usuarioResponse);

        mockMvc.perform(post("/api/usuarios")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.username").value("jtorres"));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void actualizarUsuario_retornaOk() throws Exception {
        UsuarioUpdateRequest request = new UsuarioUpdateRequest();
        request.setNombres("Juan");
        request.setApellidos("Torres");
        request.setDni("12345678");
        request.setUsername("jtorres");
        request.setIdRol(1);
        request.setIdArea(1);

        when(usuarioService.actualizarUsuario(eq(1), any())).thenReturn(usuarioResponse);

        mockMvc.perform(put("/api/usuarios/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.idUsuario").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void cambiarEstado_retornaOk() throws Exception {
        EstadoUsuarioRequest request = new EstadoUsuarioRequest();
        request.setActivo(false);
        when(usuarioService.cambiarEstado(eq(1), any())).thenReturn(usuarioResponse);

        mockMvc.perform(patch("/api/usuarios/1/estado")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void cambiarPassword_retornaOk() throws Exception {
        CambioPasswordRequest request = new CambioPasswordRequest();
        request.setNuevaPassword("newpass123");
        doNothing().when(usuarioService).cambiarPassword(eq(1), any());

        mockMvc.perform(put("/api/usuarios/1/password")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void crearUsuario_requestInvalido_retorna400() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void sinAutenticacion_retorna401() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "TECNICO")
    void sinRolAdmin_retorna403() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "TECNICO")
    void crearUsuario_sinRolAdmin_retorna403() throws Exception {
        UsuarioCreateRequest request = new UsuarioCreateRequest();
        request.setNombres("Test");
        request.setApellidos("User");
        request.setDni("12345678");
        request.setUsername("testuser");
        request.setPassword("password123");
        request.setIdRol(1);
        request.setIdArea(1);

        mockMvc.perform(post("/api/usuarios")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }
}
