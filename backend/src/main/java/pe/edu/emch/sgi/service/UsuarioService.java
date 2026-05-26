package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.dto.common.PagedResponse;
import pe.edu.emch.sgi.dto.usuario.CambioPasswordRequest;
import pe.edu.emch.sgi.dto.usuario.EstadoUsuarioRequest;
import pe.edu.emch.sgi.dto.usuario.RolResponse;
import pe.edu.emch.sgi.dto.usuario.UsuarioCreateRequest;
import pe.edu.emch.sgi.dto.usuario.UsuarioResponse;
import pe.edu.emch.sgi.dto.usuario.UsuarioUpdateRequest;
import pe.edu.emch.sgi.entity.Area;
import pe.edu.emch.sgi.entity.Rol;
import pe.edu.emch.sgi.entity.Usuario;
import pe.edu.emch.sgi.exception.DuplicateResourceException;
import pe.edu.emch.sgi.exception.ResourceNotFoundException;
import pe.edu.emch.sgi.repository.AreaRepository;
import pe.edu.emch.sgi.repository.RolRepository;
import pe.edu.emch.sgi.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final AreaRepository areaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PagedResponse<UsuarioResponse> listarUsuarios(Boolean activo, Integer idRol, Pageable pageable) {
        Page<UsuarioResponse> page = usuarioRepository.findFiltered(activo, idRol, pageable)
            .map(this::toUsuarioResponse);
        return new PagedResponse<>(page);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuario(Integer id) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
        return toUsuarioResponse(u);
    }

    @Transactional(readOnly = true)
    public List<RolResponse> listarRoles() {
        return rolRepository.findAll(Sort.by("nombreRol")).stream()
            .map(this::toRolResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTecnicos() {
        return usuarioRepository.findTecnicosCampoActivos()
            .stream().map(this::toUsuarioResponse).toList();
    }

    @Transactional
    public UsuarioResponse crearUsuario(UsuarioCreateRequest request) {
        if (usuarioRepository.existsByDni(request.getDni())) {
            throw new DuplicateResourceException("Ya existe un usuario con DNI: " + request.getDni());
        }
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Ya existe un usuario con username: " + request.getUsername());
        }
        Rol rol = rolRepository.findById(request.getIdRol())
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + request.getIdRol()));
        Area area = areaRepository.findById(request.getIdArea())
            .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada: " + request.getIdArea()));
        Usuario u = new Usuario();
        u.setRol(rol);
        u.setArea(area);
        u.setNombres(request.getNombres());
        u.setApellidos(request.getApellidos());
        u.setDni(request.getDni());
        u.setUsername(request.getUsername());
        u.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        u.setEmail(request.getEmail());
        u.setActivo(true);
        u.setCreatedAt(LocalDateTime.now());
        return toUsuarioResponse(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioResponse actualizarUsuario(Integer id, UsuarioUpdateRequest request) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
        if (usuarioRepository.existsByDniAndIdUsuarioNot(request.getDni(), id)) {
            throw new DuplicateResourceException("Ya existe un usuario con DNI: " + request.getDni());
        }
        if (usuarioRepository.existsByUsernameAndIdUsuarioNot(request.getUsername(), id)) {
            throw new DuplicateResourceException("Ya existe un usuario con username: " + request.getUsername());
        }
        Rol rol = rolRepository.findById(request.getIdRol())
            .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + request.getIdRol()));
        Area area = areaRepository.findById(request.getIdArea())
            .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada: " + request.getIdArea()));
        u.setRol(rol);
        u.setArea(area);
        u.setNombres(request.getNombres());
        u.setApellidos(request.getApellidos());
        u.setDni(request.getDni());
        u.setUsername(request.getUsername());
        u.setEmail(request.getEmail());
        return toUsuarioResponse(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Integer id, EstadoUsuarioRequest request) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
        u.setActivo(request.getActivo());
        return toUsuarioResponse(usuarioRepository.save(u));
    }

    @Transactional
    public void cambiarPassword(Integer id, CambioPasswordRequest request) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
        u.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword()));
        usuarioRepository.save(u);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private UsuarioResponse toUsuarioResponse(Usuario u) {
        UsuarioResponse r = new UsuarioResponse();
        r.setIdUsuario(u.getIdUsuario());
        r.setNombres(u.getNombres());
        r.setApellidos(u.getApellidos());
        r.setDni(u.getDni());
        r.setUsername(u.getUsername());
        r.setEmail(u.getEmail());
        r.setIdRol(u.getRol().getIdRol());
        r.setNombreRol(u.getRol().getNombreRol());
        r.setIdArea(u.getArea().getIdArea());
        r.setNombreArea(u.getArea().getNombreArea());
        r.setActivo(u.getActivo());
        r.setCreatedAt(u.getCreatedAt());
        r.setUltimoAcceso(u.getUltimoAcceso());
        return r;
    }

    private RolResponse toRolResponse(Rol r) {
        RolResponse rr = new RolResponse();
        rr.setIdRol(r.getIdRol());
        rr.setNombreRol(r.getNombreRol());
        rr.setDescripcion(r.getDescripcion());
        return rr;
    }
}
