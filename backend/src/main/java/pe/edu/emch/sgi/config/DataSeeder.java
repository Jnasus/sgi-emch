package pe.edu.emch.sgi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.Rol;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.AreaRepository;
import pe.edu.emch.sgi.repository.RolRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final RolRepository rolRepository;
    private final AreaRepository areaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRoles();
        seedAreas();
        seedAdminUser();
    }

    private void seedRoles() {
        List<String[]> roles = List.of(
            new String[]{"ADMINISTRADOR", "Acceso total al sistema"},
            new String[]{"TECNICO",       "Gestión de tickets e inventario"},
            new String[]{"SUPERVISOR",    "Consulta y supervisión de operaciones"}
        );
        for (String[] r : roles) {
            if (rolRepository.findByNombreRol(r[0]).isEmpty()) {
                Rol rol = new Rol();
                rol.setNombreRol(r[0]);
                rol.setDescripcion(r[1]);
                rolRepository.save(rol);
            }
        }
    }

    private void seedAreas() {
        if (areaRepository.findByCodigoArea("DTIC").isEmpty()) {
            Area area = new Area();
            area.setCodigoArea("DTIC");
            area.setNombreArea("Departamento de Tecnologías de la Información");
            area.setDescripcion("Área responsable de la gestión TI institucional");
            area.setAnioVigencia(LocalDate.of(LocalDate.now().getYear(), 1, 1));
            area.setActivo(true);
            area.setCreatedAt(LocalDateTime.now());
            areaRepository.save(area);
        }
    }

    private void seedAdminUser() {
        if (usuarioRepository.findByUsername("admin").isEmpty()) {
            Rol rolAdmin = rolRepository.findByNombreRol("ADMINISTRADOR")
                .orElseThrow(() -> new IllegalStateException("Rol ADMINISTRADOR no encontrado"));
            Area dtic = areaRepository.findByCodigoArea("DTIC")
                .orElseThrow(() -> new IllegalStateException("Area DTIC no encontrada"));

            Usuario admin = new Usuario();
            admin.setRol(rolAdmin);
            admin.setArea(dtic);
            admin.setNombres("Administrador");
            admin.setApellidos("Sistema");
            admin.setDni("00000001");
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("Admin123!"));
            admin.setEmail("admin@emch.edu.pe");
            admin.setActivo(true);
            admin.setCreatedAt(LocalDateTime.now());
            usuarioRepository.save(admin);
        }
    }
}
