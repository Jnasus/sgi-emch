package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket")
@Getter
@Setter
@NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Integer idTicket;

    @Column(name = "numero_ticket", nullable = false, unique = true, length = 20)
    private String numeroTicket;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_equipo", nullable = false)
    private Equipo equipo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tecnico", nullable = false)
    private Usuario tecnico;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo_incidente", nullable = false)
    private TipoIncidente tipoIncidente;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "prioridad", nullable = false)
    private String prioridad;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "fuera_de_sla", nullable = false)
    private Boolean fueraDeSla;

    @Column(name = "pdf_acta_path", length = 500)
    private String pdfActaPath;
}
