package pe.edu.emch.sgi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "v_tickets_activos")
@Getter
@NoArgsConstructor
public class TicketsActivos {

    @Id
    @Column(name = "id_ticket")
    private Integer idTicket;

    @Column(name = "numero_ticket")
    private String numeroTicket;

    @Column(name = "codigo_ejercito")
    private String codigoEjercito;

    @Column(name = "nombre_area")
    private String nombreArea;

    @Column(name = "tecnico")
    private String tecnico;

    @Column(name = "tipo_incidente")
    private String tipoIncidente;

    @Column(name = "titulo")
    private String titulo;

    @Column(name = "estado")
    private String estado;

    @Column(name = "prioridad")
    private String prioridad;

    @Column(name = "fecha_apertura")
    private LocalDateTime fechaApertura;

    @Column(name = "sla_minutos", columnDefinition = "SMALLINT")
    private Integer slaMinutos;

    @Column(name = "minutos_transcurridos")
    private Integer minutosTranscurridos;

    @Column(name = "minutos_restantes_sla")
    private Integer minutosRestantesSla;

    @Column(name = "sla_vencido")
    private Boolean slaVencido;

    @Column(name = "fuera_de_sla")
    private Boolean fueraDeSla;
}
