package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.ModeloEquipo;

import java.util.List;

public interface ModeloEquipoRepository extends JpaRepository<ModeloEquipo, Integer> {
    List<ModeloEquipo> findByMarca_IdMarca(Integer idMarca);
    boolean existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModelo(
            Integer idMarca, Integer idTipo, String nombreModelo);
    boolean existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModeloAndIdModeloNot(
            Integer idMarca, Integer idTipo, String nombreModelo, Integer idModelo);
}
