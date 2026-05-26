package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.SistemaOperativo;

import java.util.Optional;

public interface SistemaOperativoRepository extends JpaRepository<SistemaOperativo, Integer> {
    boolean existsByNombreSoAndVersionSo(String nombreSo, String versionSo);
    boolean existsByNombreSoAndVersionSoAndIdSoNot(String nombreSo, String versionSo, Integer idSo);

    /**
     * Busca por "nombreSo versionSo" concatenados (ej: "Windows 11 Pro")
     * o solo por nombreSo como fallback.
     */
    @Query("""
            SELECT s FROM SistemaOperativo s
            WHERE LOWER(CONCAT(s.nombreSo, ' ', COALESCE(s.versionSo, ''))) = LOWER(:texto)
               OR LOWER(s.nombreSo) = LOWER(:texto)
            ORDER BY s.idSo ASC
            """)
    Optional<SistemaOperativo> findByNombreCompleto(@Param("texto") String texto);
}
