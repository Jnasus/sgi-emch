package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estado")
@Getter
@Setter
@NoArgsConstructor
public class HistorialEstado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Integer idHistorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_equipo", nullable = false)
    private Equipo equipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "estado_anterior", nullable = false,
        columnDefinition = "ENUM('EN_BODEGA', 'ASIGNADO', 'EN_REPARACION', 'PRESTADO', 'DADO_DE_BAJA')")
    private String estadoAnterior;

    @Column(name = "estado_nuevo", nullable = false,
        columnDefinition = "ENUM('EN_BODEGA', 'ASIGNADO', 'EN_REPARACION', 'PRESTADO', 'DADO_DE_BAJA')")
    private String estadoNuevo;

    @Column(name = "motivo", length = 255)
    private String motivo;

    @Column(name = "fecha_cambio", insertable = false, updatable = false)
    private LocalDateTime fechaCambio;
}
