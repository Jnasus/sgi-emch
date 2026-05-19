package pe.edu.emch.sgi;

import org.junit.jupiter.api.Test;

class SgiEmchApplicationTests {

    @Test
    void mainClassCargaCorrectamente() {
        // Smoke test: verifica que la clase main existe y es instanciable
        new SgiEmchApplication();
    }
}
