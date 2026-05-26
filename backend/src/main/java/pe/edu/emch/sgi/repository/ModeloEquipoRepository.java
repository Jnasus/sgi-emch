package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.ModeloEquipo;

import java.util.List;
import java.util.Optional;

public interface ModeloEquipoRepository extends JpaRepository<ModeloEquipo, Integer> {
    List<ModeloEquipo> findByMarca_IdMarca(Integer idMarca);
    boolean existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModelo(
            Integer idMarca, Integer idTipo, String nombreModelo);
    boolean existsByMarca_IdMarcaAndTipo_IdTipoAndNombreModeloAndIdModeloNot(
            Integer idMarca, Integer idTipo, String nombreModelo, Integer idModelo);

    /** Busca por nombre de modelo Y nombre de marca (case-insensitive). */
    @Query("""
            SELECT m FROM ModeloEquipo m
            WHERE LOWER(m.nombreModelo) = LOWER(:nombreModelo)
              AND LOWER(m.marca.nombreMarca) = LOWER(:nombreMarca)
            """)
    Optional<ModeloEquipo> findByNombreModeloAndMarcaIgnoreCase(
        @Param("nombreModelo") String nombreModelo,
        @Param("nombreMarca") String nombreMarca);

    /** Fallback: busca solo por nombre de modelo cuando no se provee marca. */
    Optional<ModeloEquipo> findFirstByNombreModeloIgnoreCase(String nombreModelo);
}
