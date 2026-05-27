package pe.edu.emch.sgi.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pe.edu.emch.sgi.entity.StockCritico;
import pe.edu.emch.sgi.entity.Ticket;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.repository.StockCriticoRepository;
import pe.edu.emch.sgi.repository.TicketRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;
import pe.edu.emch.sgi.service.NotificadorService;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificacionScheduler {

    private final TicketRepository ticketRepository;
    private final StockCriticoRepository stockCriticoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificadorService notificadorService;

    /**
     * Cada 15 minutos: busca tickets ABIERTO/EN_PROCESO cuyo tiempo de resolución
     * según SLA ya fue superado y notifica al técnico asignado (una sola vez por ticket
     * gracias a la deduplicación en NotificadorService).
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void checkSlaVencidos() {
        log.info("Scheduler SLA: iniciando verificación...");
        LocalDateTime ahora = LocalDateTime.now();
        List<Ticket> activos = ticketRepository.findByEstadoIn(List.of("ABIERTO", "EN_PROCESO"));
        int count = 0;
        for (Ticket t : activos) {
            LocalDateTime limite = t.getFechaApertura()
                    .plusMinutes(t.getTipoIncidente().getTiempoResolucionMin());
            if (limite.isBefore(ahora)) {
                notificadorService.crearSiNoExiste(
                        t.getTecnico(),
                        "SLA_VENCIDO",
                        "SLA vencido: " + t.getNumeroTicket(),
                        "El ticket " + t.getNumeroTicket() + " (" + t.getTitulo() + ")" +
                                " superó su tiempo de resolución de " +
                                t.getTipoIncidente().getTiempoResolucionMin() + " min.",
                        "/incidentes/" + t.getIdTicket()
                );
                count++;
            }
        }
        log.info("Scheduler SLA: {} ticket(s) con SLA vencido detectado(s).", count);
    }

    // checkStockCritico will be added in Task 4
}
