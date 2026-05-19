package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.Equipo;
import pe.edu.emch.sgi.entity.HistorialEstado;

import java.util.List;

public interface HistorialEstadoRepository extends JpaRepository<HistorialEstado, Integer> {
    List<HistorialEstado> findByEquipoOrderByFechaCambioDesc(Equipo equipo);
}
