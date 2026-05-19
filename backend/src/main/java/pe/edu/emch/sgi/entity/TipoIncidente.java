package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipo_incidente")
@Getter
@Setter
@NoArgsConstructor
public class TipoIncidente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_incidente")
    private Integer idTipoIncidente;

    @Column(name = "nombre_tipo", nullable = false, unique = true, length = 50)
    private String nombreTipo;

    @Column(name = "tiempo_respuesta_min", nullable = false)
    private Integer tiempoRespuestaMin;

    @Column(name = "tiempo_resolucion_min", nullable = false)
    private Integer tiempoResolucionMin;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}
