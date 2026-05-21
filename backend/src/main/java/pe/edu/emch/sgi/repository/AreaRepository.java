package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Area;

import java.util.List;
import java.util.Optional;

public interface AreaRepository extends JpaRepository<Area, Integer> {
    List<Area> findByActivoTrue();
    Optional<Area> findByCodigoArea(String codigoArea);
}
