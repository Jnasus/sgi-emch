package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.SistemaOperativo;

public interface SistemaOperativoRepository extends JpaRepository<SistemaOperativo, Integer> {
    boolean existsByNombreSoAndVersionSo(String nombreSo, String versionSo);
    boolean existsByNombreSoAndVersionSoAndIdSoNot(String nombreSo, String versionSo, Integer idSo);
}
