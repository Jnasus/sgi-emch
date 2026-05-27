package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    @Query("""
            SELECT n FROM Notificacion n
            WHERE n.usuario.idUsuario = :idUsuario
              AND (:leida IS NULL OR n.leida = :leida)
            """)
    Page<Notificacion> findByUsuarioFiltered(
            @Param("idUsuario") Integer idUsuario,
            @Param("leida") Boolean leida,
            Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.idUsuario = :idUsuario AND n.leida = false")
    int marcarTodasLeidasByUsuario(@Param("idUsuario") Integer idUsuario);

    boolean existsByUsuario_IdUsuarioAndTipoNotifAndUrlAccion(
            Integer idUsuario, String tipoNotif, String urlAccion);
}
