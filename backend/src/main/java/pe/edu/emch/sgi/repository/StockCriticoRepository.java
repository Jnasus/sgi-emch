package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.StockCritico;

public interface StockCriticoRepository extends JpaRepository<StockCritico, Integer> {
}
