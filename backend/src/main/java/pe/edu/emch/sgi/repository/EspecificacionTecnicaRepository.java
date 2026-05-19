package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Equipo;
import pe.edu.emch.sgi.entity.EspecificacionTecnica;

import java.util.Optional;

public interface EspecificacionTecnicaRepository extends JpaRepository<EspecificacionTecnica, Integer> {
    Optional<EspecificacionTecnica> findByEquipo(Equipo equipo);
}
