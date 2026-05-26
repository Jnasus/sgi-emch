package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.Equipo;

import java.time.LocalDate;
import java.util.List;

public interface EquipoRepository extends JpaRepository<Equipo, Integer> {

    boolean existsByCodigoEjercito(String codigoEjercito);
    boolean existsByNumeroSerie(String numeroSerie);
    boolean existsByMacAddress(String macAddress);

    boolean existsByCodigoEjercitoAndIdEquipoNot(String codigoEjercito, Integer idEquipo);
    boolean existsByNumeroSerieAndIdEquipoNot(String numeroSerie, Integer idEquipo);
    boolean existsByMacAddressAndIdEquipoNot(String macAddress, Integer idEquipo);

    @Query("""
            SELECT e FROM Equipo e
            WHERE (:estado IS NULL OR e.estado = :estado)
              AND (:idArea IS NULL OR e.area.idArea = :idArea)
              AND (:idTipo IS NULL OR e.tipo.idTipo = :idTipo)
            """)
    Page<Equipo> findFiltered(@Param("estado") String estado,
                              @Param("idArea") Integer idArea,
                              @Param("idTipo") Integer idTipo,
                              Pageable pageable);

    /** Lista completa sin paginación, para reportes. */
    @Query("""
            SELECT e FROM Equipo e
            WHERE (:estado IS NULL OR e.estado = :estado)
              AND (:idArea IS NULL OR e.area.idArea = :idArea)
            ORDER BY e.codigoEjercito
            """)
    List<Equipo> findAllFiltered(@Param("estado") String estado,
                                 @Param("idArea") Integer idArea);

    /** Lista de equipos por IDs específicos, ordenada por código ejército. */
    @Query("""
            SELECT e FROM Equipo e
            WHERE e.idEquipo IN :ids
            ORDER BY e.codigoEjercito
            """)
    List<Equipo> findAllByIds(@Param("ids") List<Integer> ids);

    /** Equipos cuya fecha de adquisición es anterior o igual a la fecha límite. */
    @Query("""
            SELECT e FROM Equipo e
            WHERE e.fechaAdquisicion IS NOT NULL
              AND e.fechaAdquisicion <= :fechaLimite
            ORDER BY e.fechaAdquisicion ASC
            """)
    List<Equipo> findAntiguos(@Param("fechaLimite") LocalDate fechaLimite);
}
