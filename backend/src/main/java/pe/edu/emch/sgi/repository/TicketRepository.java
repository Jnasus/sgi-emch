package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.Ticket;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    @Query("SELECT MAX(t.numeroTicket) FROM Ticket t WHERE t.numeroTicket LIKE CONCAT('TKT-', :aniomes, '-%')")
    Optional<String> findMaxNumeroTicketByAniomes(@Param("aniomes") String aniomes);

    @Query("""
            SELECT t FROM Ticket t
            WHERE (:estado IS NULL OR t.estado = :estado)
              AND (:prioridad IS NULL OR t.prioridad = :prioridad)
              AND (:idEquipo IS NULL OR t.equipo.idEquipo = :idEquipo)
              AND (:idTecnico IS NULL OR t.tecnico.idUsuario = :idTecnico)
            """)
    Page<Ticket> findFiltered(
            @Param("estado") String estado,
            @Param("prioridad") String prioridad,
            @Param("idEquipo") Integer idEquipo,
            @Param("idTecnico") Integer idTecnico,
            Pageable pageable);
}
