package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Marca;

public interface MarcaRepository extends JpaRepository<Marca, Integer> {
    boolean existsByNombreMarca(String nombreMarca);
    boolean existsByNombreMarcaAndIdMarcaNot(String nombreMarca, Integer idMarca);
}
