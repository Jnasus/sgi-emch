package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.ConfigStock;

import java.util.Optional;

public interface ConfigStockRepository extends JpaRepository<ConfigStock, Integer> {
    Optional<ConfigStock> findByTipo_IdTipo(Integer idTipo);
}
