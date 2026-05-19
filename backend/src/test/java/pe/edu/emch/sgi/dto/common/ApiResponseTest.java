package pe.edu.emch.sgi.dto.common;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ApiResponseTest {

    @Test
    void of_creaRespuestaExitosa() {
        ApiResponse<String> resp = ApiResponse.ok("Operación exitosa", "dato");
        assertThat(resp.isSuccess()).isTrue();
        assertThat(resp.getMessage()).isEqualTo("Operación exitosa");
        assertThat(resp.getData()).isEqualTo("dato");
    }

    @Test
    void error_creaRespuestaFallida() {
        ApiResponse<Void> resp = ApiResponse.error("Algo salió mal");
        assertThat(resp.isSuccess()).isFalse();
        assertThat(resp.getMessage()).isEqualTo("Algo salió mal");
        assertThat(resp.getData()).isNull();
    }

    @Test
    void ok_sinData_creaRespuestaExitosa() {
        ApiResponse<Void> resp = ApiResponse.ok("Creado");
        assertThat(resp.isSuccess()).isTrue();
        assertThat(resp.getData()).isNull();
    }
}
