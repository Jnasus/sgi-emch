package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.TipoIncidente;

public interface TipoIncidenteRepository extends JpaRepository<TipoIncidente, Integer> {
}
