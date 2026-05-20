package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_ticket")
@Getter
@Setter
@NoArgsConstructor
public class HistorialTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_hist_ticket")
    private Integer idHistTicket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ticket", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "estado_anterior", nullable = false,
        columnDefinition = "ENUM('ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')")
    private String estadoAnterior;

    @Column(name = "estado_nuevo", nullable = false,
        columnDefinition = "ENUM('ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')")
    private String estadoNuevo;

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "fecha_cambio", insertable = false, updatable = false)
    private LocalDateTime fechaCambio;
}
