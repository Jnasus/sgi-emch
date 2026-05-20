package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.InventarioCompleto;

public interface InventarioCompletoRepository extends JpaRepository<InventarioCompleto, Integer> {
}
