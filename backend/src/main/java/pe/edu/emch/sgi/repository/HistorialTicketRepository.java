package pe.edu.emch.sgi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.emch.sgi.entity.HistorialTicket;
import pe.edu.emch.sgi.entity.Ticket;

import java.util.List;

public interface HistorialTicketRepository extends JpaRepository<HistorialTicket, Integer> {

    List<HistorialTicket> findByTicketOrderByFechaCambioDesc(Ticket ticket);
}
