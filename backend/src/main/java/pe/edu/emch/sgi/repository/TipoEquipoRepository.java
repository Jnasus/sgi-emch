package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.TipoEquipo;

import java.util.Optional;

public interface TipoEquipoRepository extends JpaRepository<TipoEquipo, Integer> {
    boolean existsByNombreTipo(String nombreTipo);
    boolean existsByNombreTipoAndIdTipoNot(String nombreTipo, Integer idTipo);
    Optional<TipoEquipo> findByNombreTipoIgnoreCase(String nombreTipo);
}
