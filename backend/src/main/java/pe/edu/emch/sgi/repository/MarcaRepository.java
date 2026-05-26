package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Marca;

import java.util.Optional;

public interface MarcaRepository extends JpaRepository<Marca, Integer> {
    boolean existsByNombreMarca(String nombreMarca);
    boolean existsByNombreMarcaAndIdMarcaNot(String nombreMarca, Integer idMarca);
    Optional<Marca> findByNombreMarcaIgnoreCase(String nombreMarca);
}
