package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "area")
@Getter
@Setter
@NoArgsConstructor
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area")
    private Integer idArea;

    @Column(name = "codigo_area", nullable = false, unique = true, length = 20)
    private String codigoArea;

    @Column(name = "nombre_area", nullable = false, length = 100)
    private String nombreArea;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    /**
     * En MySQL la columna es tipo YEAR; el driver JDBC la expone como DATE.
     * LocalDate alinea el mapeo con {@code spring.jpa.hibernate.ddl-auto=validate}.
     */
    @Column(name = "anio_vigencia", nullable = false)
    private LocalDate anioVigencia;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
