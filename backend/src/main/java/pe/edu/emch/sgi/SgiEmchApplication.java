package pe.edu.emch.sgi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SgiEmchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SgiEmchApplication.class, args);
    }
}
