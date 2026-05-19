package pe.edu.emch.sgi.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pe.edu.emch.sgi.dto.common.ApiResponse;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleResourceNotFound_retorna404() {
        ResponseEntity<ApiResponse<Void>> resp =
            handler.handleResourceNotFound(new ResourceNotFoundException("Equipo no encontrado"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isFalse();
        assertThat(resp.getBody().getMessage()).isEqualTo("Equipo no encontrado");
    }

    @Test
    void handleBusinessRule_retorna400() {
        ResponseEntity<ApiResponse<Void>> resp =
            handler.handleBusinessRule(new BusinessRuleException("Transición inválida"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isFalse();
    }

    @Test
    void handleDuplicate_retorna409() {
        ResponseEntity<ApiResponse<Void>> resp =
            handler.handleDuplicate(new DuplicateResourceException("DNI ya existe"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isFalse();
    }

    @Test
    void handleUnauthorized_retorna403() {
        ResponseEntity<ApiResponse<Void>> resp =
            handler.handleUnauthorized(new UnauthorizedException("Sin permisos"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isSuccess()).isFalse();
    }
}
