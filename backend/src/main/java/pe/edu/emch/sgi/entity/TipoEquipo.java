package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipo_equipo")
@Getter @Setter @NoArgsConstructor
public class TipoEquipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo")
    private Integer idTipo;

    @Column(name = "nombre_tipo", nullable = false, unique = true, length = 50)
    private String nombreTipo;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}
