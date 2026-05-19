package pe.edu.emch.sgi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.emch.sgi.entity.Usuario;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByUsernameAndActivoTrue(String username);

    boolean existsByDni(String dni);

    boolean existsByUsername(String username);

    boolean existsByDniAndIdUsuarioNot(String dni, Integer idUsuario);

    boolean existsByUsernameAndIdUsuarioNot(String username, Integer idUsuario);

    @Query("SELECT u FROM Usuario u WHERE (:activo IS NULL OR u.activo = :activo) AND (:idRol IS NULL OR u.rol.idRol = :idRol)")
    Page<Usuario> findFiltered(@Param("activo") Boolean activo, @Param("idRol") Integer idRol, Pageable pageable);

    @Modifying
    @Query("UPDATE Usuario u SET u.ultimoAcceso = :ahora WHERE u.idUsuario = :idUsuario")
    void actualizarUltimoAcceso(@Param("idUsuario") Integer idUsuario, @Param("ahora") LocalDateTime ahora);
}
