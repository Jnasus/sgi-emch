package pe.edu.emch.sgi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sistema_operativo")
@Getter @Setter @NoArgsConstructor
public class SistemaOperativo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_so")
    private Integer idSo;

    @Column(name = "nombre_so", nullable = false, length = 80)
    private String nombreSo;

    @Column(name = "version_so", nullable = false, length = 50)
    private String versionSo;
}
