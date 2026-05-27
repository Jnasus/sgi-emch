package pe.edu.emch.sgi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.Rol;
import pe.edu.emch.sgi.entity.TipoIncidente;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.AreaRepository;
import pe.edu.emch.sgi.repository.RolRepository;
import pe.edu.emch.sgi.repository.TipoIncidenteRepository;
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
    private final TipoIncidenteRepository tipoIncidenteRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRoles();
        seedAreas();
        seedAdminUser();
        seedTiposIncidente();
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
            area.setAnioVigencia(LocalDate.now().getYear());
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

    private void seedTiposIncidente() {
        if (tipoIncidenteRepository.count() > 0) return;

        // { nombreTipo, tiempoRespuestaMin, tiempoResolucionMin, descripcion }
        List<Object[]> tipos = List.of(
            new Object[]{"Falla de Hardware",         30,  480, "Problemas físicos con equipos: pantallas, teclados, fuentes de poder, placas madre, etc."},
            new Object[]{"Falla de Software",         20,  240, "Errores de aplicaciones, sistema operativo o configuración de programas."},
            new Object[]{"Problema de Red",           15,  120, "Pérdida de conectividad, lentitud de red, problemas de DNS o configuración de red."},
            new Object[]{"Falla de Impresora",        60,  480, "Problemas con impresoras o periféricos de salida: atascos, sin tóner, sin conectividad."},
            new Object[]{"Mantenimiento Preventivo", 120,  960, "Mantenimiento programado: limpieza, actualización de drivers, revisión general del equipo."},
            new Object[]{"Incidente de Seguridad",    10,  180, "Acceso no autorizado, malware, pérdida de datos o vulnerabilidad detectada."}
        );

        for (Object[] t : tipos) {
            TipoIncidente tipo = new TipoIncidente();
            tipo.setNombreTipo((String) t[0]);
            tipo.setTiempoRespuestaMin(((Integer) t[1]).shortValue());
            tipo.setTiempoResolucionMin(((Integer) t[2]).shortValue());
            tipo.setDescripcion((String) t[3]);
            tipoIncidenteRepository.save(tipo);
        }
    }
}
