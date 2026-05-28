package pe.edu.emch.sgi.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditSessionInterceptor implements HandlerInterceptor {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        Integer idUsuario = (Integer) request.getAttribute("idUsuarioActivo");
        String ip = resolverIpCliente(request);

        try {
            jdbcTemplate.update("SET @id_usuario_activo = ?", idUsuario);
            jdbcTemplate.update("SET @ip_cliente = ?", ip);
        } catch (Exception ex) {
            log.warn("No se pudieron establecer variables de sesión MySQL: {}", ex.getMessage());
        }

        if (idUsuario != null) {
            try {
                jdbcTemplate.update(
                    "UPDATE usuario_sistema SET ultimo_acceso = NOW() WHERE id_usuario = ?",
                    idUsuario);
            } catch (Exception ex) {
                log.warn("No se pudo actualizar ultimo_acceso para usuario {}: {}", idUsuario, ex.getMessage());
            }
        }

        return true;
    }

    private String resolverIpCliente(HttpServletRequest request) {
        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isBlank()) {
            return xForwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
