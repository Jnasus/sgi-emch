package pe.edu.emch.sgi.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.emch.sgi.dto.equipo.cargamasiva.*;
import pe.edu.emch.sgi.entity.*;
import pe.edu.emch.sgi.repository.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CargaMasivaService {

    private final TipoEquipoRepository tipoEquipoRepository;
    private final MarcaRepository marcaRepository;
    private final ModeloEquipoRepository modeloEquipoRepository;
    private final AreaRepository areaRepository;
    private final SistemaOperativoRepository sistemaOperativoRepository;
    private final EquipoRepository equipoRepository;
    private final EspecificacionTecnicaRepository especificacionTecnicaRepository;

    private static final DateTimeFormatter FMT_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Set<String> ESTADOS_VALIDOS = Set.of(
        "EN_BODEGA", "ASIGNADO", "EN_REPARACION", "PRESTADO", "DADO_DE_BAJA");
    private static final Set<String> TIPO_RED_VALIDOS = Set.of("ETHERNET", "WIFI", "N/A");

    // ── VALIDAR (sin escritura) ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ValidacionResponse validar(ValidacionRequest request) {
        List<FilaValidada> resultado = new ArrayList<>();
        Set<String> codigosEnLote = new LinkedHashSet<>();
        Set<String> seriesEnLote  = new LinkedHashSet<>();
        Set<String> macsEnLote    = new LinkedHashSet<>();

        int numeroFila = 2; // fila 1 del Excel = encabezados
        for (FilaCarga fila : request.filas()) {
            FilaValidada validada = validarFila(fila, numeroFila,
                codigosEnLote, seriesEnLote, macsEnLote);
            if (!isBlank(fila.codigoEjercito()))
                codigosEnLote.add(fila.codigoEjercito().trim().toUpperCase());
            if (!isBlank(fila.numeroSerie()))
                seriesEnLote.add(fila.numeroSerie().trim().toUpperCase());
            if (!isBlank(fila.macAddress()))
                macsEnLote.add(fila.macAddress().trim().toUpperCase());
            resultado.add(validada);
            numeroFila++;
        }

        long totalErrores = resultado.stream().filter(f -> "ERROR".equals(f.estado())).count();
        return new ValidacionResponse(resultado.size(), (int) totalErrores, resultado);
    }

    private FilaValidada validarFila(
            FilaCarga fila, int numeroFila,
            Set<String> codigosEnLote, Set<String> seriesEnLote, Set<String> macsEnLote) {

        List<ErrorFila> errores = new ArrayList<>();
        Integer idTipo = null, idModelo = null, idArea = null, idSo = null;

        // ── Campos obligatorios ───────────────────────────────────────────────
        if (isBlank(fila.codigoEjercito()))
            errores.add(new ErrorFila("codigoEjercito", "El código ejército es obligatorio"));
        if (isBlank(fila.numeroSerie()))
            errores.add(new ErrorFila("numeroSerie", "El número de serie es obligatorio"));
        if (isBlank(fila.nombreResponsable()))
            errores.add(new ErrorFila("nombreResponsable", "El responsable es obligatorio"));

        // ── Duplicados en el lote ────────────────────────────────────────────
        if (!isBlank(fila.codigoEjercito())
                && codigosEnLote.contains(fila.codigoEjercito().trim().toUpperCase()))
            errores.add(new ErrorFila("codigoEjercito",
                "Código duplicado en el lote: " + fila.codigoEjercito().trim()));
        if (!isBlank(fila.numeroSerie())
                && seriesEnLote.contains(fila.numeroSerie().trim().toUpperCase()))
            errores.add(new ErrorFila("numeroSerie",
                "N° Serie duplicado en el lote: " + fila.numeroSerie().trim()));
        if (!isBlank(fila.macAddress())
                && macsEnLote.contains(fila.macAddress().trim().toUpperCase()))
            errores.add(new ErrorFila("macAddress",
                "MAC duplicada en el lote: " + fila.macAddress().trim()));

        // ── Duplicados en base de datos ──────────────────────────────────────
        if (!isBlank(fila.codigoEjercito())
                && equipoRepository.existsByCodigoEjercito(fila.codigoEjercito().trim()))
            errores.add(new ErrorFila("codigoEjercito",
                "Ya existe en el sistema: " + fila.codigoEjercito().trim()));
        if (!isBlank(fila.numeroSerie())
                && equipoRepository.existsByNumeroSerie(fila.numeroSerie().trim()))
            errores.add(new ErrorFila("numeroSerie",
                "N° Serie ya registrado: " + fila.numeroSerie().trim()));
        if (!isBlank(fila.macAddress())
                && equipoRepository.existsByMacAddress(fila.macAddress().trim()))
            errores.add(new ErrorFila("macAddress",
                "MAC ya registrada: " + fila.macAddress().trim()));

        // ── Resolución FK: Tipo ──────────────────────────────────────────────
        if (isBlank(fila.tipo())) {
            errores.add(new ErrorFila("tipo", "El tipo de equipo es obligatorio"));
        } else {
            idTipo = tipoEquipoRepository
                .findByNombreTipoIgnoreCase(fila.tipo().trim())
                .map(TipoEquipo::getIdTipo)
                .orElse(null);
            if (idTipo == null)
                errores.add(new ErrorFila("tipo",
                    "Tipo no encontrado: '" + fila.tipo().trim() + "'"));
        }

        // ── Resolución FK: Modelo ────────────────────────────────────────────
        if (isBlank(fila.modelo())) {
            errores.add(new ErrorFila("modelo", "El modelo es obligatorio"));
        } else {
            Optional<ModeloEquipo> modeloOpt;
            if (!isBlank(fila.marca())) {
                modeloOpt = modeloEquipoRepository
                    .findByNombreModeloAndMarcaIgnoreCase(fila.modelo().trim(), fila.marca().trim());
                if (modeloOpt.isEmpty())
                    errores.add(new ErrorFila("modelo",
                        "Modelo '" + fila.modelo().trim()
                        + "' no encontrado para marca '" + fila.marca().trim() + "'"));
            } else {
                modeloOpt = modeloEquipoRepository
                    .findFirstByNombreModeloIgnoreCase(fila.modelo().trim());
                if (modeloOpt.isEmpty())
                    errores.add(new ErrorFila("modelo",
                        "Modelo no encontrado: '" + fila.modelo().trim() + "'"));
            }
            idModelo = modeloOpt.map(ModeloEquipo::getIdModelo).orElse(null);
        }

        // ── Resolución FK: Área ──────────────────────────────────────────────
        if (isBlank(fila.area())) {
            errores.add(new ErrorFila("area", "El área es obligatoria"));
        } else {
            idArea = areaRepository
                .findByNombreAreaIgnoreCase(fila.area().trim())
                .map(Area::getIdArea)
                .orElse(null);
            if (idArea == null)
                errores.add(new ErrorFila("area",
                    "Área no encontrada: '" + fila.area().trim() + "'"));
        }

        // ── Resolución FK: Sistema Operativo ────────────────────────────────
        if (isBlank(fila.sistemaOperativo())) {
            errores.add(new ErrorFila("sistemaOperativo", "El sistema operativo es obligatorio"));
        } else {
            idSo = sistemaOperativoRepository
                .findByNombreCompleto(fila.sistemaOperativo().trim())
                .map(SistemaOperativo::getIdSo)
                .orElse(null);
            if (idSo == null)
                errores.add(new ErrorFila("sistemaOperativo",
                    "SO no encontrado: '" + fila.sistemaOperativo().trim() + "'"));
        }

        // ── Enums opcionales ─────────────────────────────────────────────────
        if (!isBlank(fila.tipoRed())
                && !TIPO_RED_VALIDOS.contains(fila.tipoRed().trim().toUpperCase()))
            errores.add(new ErrorFila("tipoRed",
                "Valor inválido. Use: ETHERNET, WIFI o N/A"));
        if (!isBlank(fila.estadoInicial())
                && !ESTADOS_VALIDOS.contains(fila.estadoInicial().trim().toUpperCase()))
            errores.add(new ErrorFila("estadoInicial",
                "Estado inválido. Use: EN_BODEGA, ASIGNADO, EN_REPARACION, PRESTADO o DADO_DE_BAJA"));

        // ── Fecha ────────────────────────────────────────────────────────────
        if (!isBlank(fila.fechaAdquisicion())) {
            try { LocalDate.parse(fila.fechaAdquisicion().trim(), FMT_FECHA); }
            catch (DateTimeParseException ex) {
                errores.add(new ErrorFila("fechaAdquisicion",
                    "Formato inválido. Use dd/MM/yyyy"));
            }
        }

        String estado = errores.isEmpty() ? "OK" : "ERROR";
        return new FilaValidada(numeroFila, fila, estado, errores,
            idTipo, idModelo, idArea, idSo);
    }

    // ── CONFIRMAR (transaccional all-or-nothing) ─────────────────────────────

    /**
     * Persiste todas las filas OK en una sola transacción.
     * Si cualquier fila falla, toda la transacción se revierte y la excepción
     * se propaga al GlobalExceptionHandler (no hay try-catch interno para evitar
     * el antipatrón de capturar excepciones dentro de @Transactional, que provoca
     * UnexpectedRollbackException al intentar el commit).
     */
    @Transactional
    public ConfirmacionResponse confirmar(ConfirmacionRequest request) {
        int guardados = 0;
        for (FilaValidada fila : request.filas()) {
            if (!"OK".equals(fila.estado())) continue;
            guardarFila(fila);
            guardados++;
        }
        return new ConfirmacionResponse(guardados, guardados, 0, List.of());
    }

    private void guardarFila(FilaValidada fila) {
        FilaCarga d = fila.datos();

        // Re-verificar unicidad (ventana de tiempo entre /validar y /confirmar)
        if (equipoRepository.existsByCodigoEjercito(d.codigoEjercito().trim()))
            throw new RuntimeException(
                "El código '" + d.codigoEjercito().trim() + "' fue registrado por otro proceso");
        if (equipoRepository.existsByNumeroSerie(d.numeroSerie().trim()))
            throw new RuntimeException("N° Serie ya registrado: " + d.numeroSerie().trim());
        if (!isBlank(d.macAddress()) && equipoRepository.existsByMacAddress(d.macAddress().trim()))
            throw new RuntimeException("MAC ya registrada: " + d.macAddress().trim());

        TipoEquipo tipo = tipoEquipoRepository.findById(fila.idTipoResuelto())
            .orElseThrow(() -> new RuntimeException("Tipo ID " + fila.idTipoResuelto() + " no encontrado"));
        ModeloEquipo modelo = modeloEquipoRepository.findById(fila.idModeloResuelto())
            .orElseThrow(() -> new RuntimeException("Modelo ID " + fila.idModeloResuelto() + " no encontrado"));
        Area area = areaRepository.findById(fila.idAreaResuelta())
            .orElseThrow(() -> new RuntimeException("Área ID " + fila.idAreaResuelta() + " no encontrada"));
        SistemaOperativo so = sistemaOperativoRepository.findById(fila.idSoResuelto())
            .orElseThrow(() -> new RuntimeException("SO ID " + fila.idSoResuelto() + " no encontrado"));

        Equipo equipo = new Equipo();
        equipo.setCodigoEjercito(d.codigoEjercito().trim());
        equipo.setTipo(tipo);
        equipo.setModelo(modelo);
        equipo.setArea(area);
        equipo.setSo(so);
        equipo.setNumeroSerie(d.numeroSerie().trim());
        equipo.setNombreResponsable(d.nombreResponsable().trim());
        equipo.setMacAddress(isBlank(d.macAddress()) ? null : d.macAddress().trim());
        equipo.setIpAddress(isBlank(d.ipAddress()) ? null : d.ipAddress().trim());
        equipo.setTipoRed(isBlank(d.tipoRed()) ? "N/A" : d.tipoRed().trim().toUpperCase());
        equipo.setEstado(isBlank(d.estadoInicial()) ? "EN_BODEGA" : d.estadoInicial().trim().toUpperCase());
        equipo.setFechaRegistro(LocalDate.now());
        equipo.setFechaAdquisicion(isBlank(d.fechaAdquisicion()) ? null
            : LocalDate.parse(d.fechaAdquisicion().trim(), FMT_FECHA));
        equipo.setObservaciones(isBlank(d.observaciones()) ? null : d.observaciones().trim());
        Equipo guardado = equipoRepository.save(equipo);

        if (tieneSpecs(d)) {
            EspecificacionTecnica espec = new EspecificacionTecnica();
            espec.setEquipo(guardado);
            espec.setProcesador(isBlank(d.procesador()) ? null : d.procesador().trim());
            espec.setNucleos(parseShort(d.nucleos()));
            espec.setHilos(parseShort(d.hilos()));
            espec.setRamModulos(parseShort(d.ramModulos()));
            espec.setRamTotalGb(parseShort(d.ramTotalGb()));
            espec.setRamVelocidadMhz(parseShort(d.ramVelocidadMhz()));
            espec.setRamMarca(isBlank(d.ramMarca()) ? null : d.ramMarca().trim());
            espec.setDiscoModelo(isBlank(d.discoModelo()) ? null : d.discoModelo().trim());
            espec.setDiscoInterface(isBlank(d.discoInterface()) ? null : d.discoInterface().trim());
            espec.setDiscoCapacidadGb(parseBD(d.discoCapacidadGb()));
            espec.setDiscoUsadoGb(parseBD(d.discoUsadoGb()));
            espec.setDiscoLibreGb(parseBD(d.discoLibreGb()));
            espec.setGpuMarca(isBlank(d.gpuMarca()) ? null : d.gpuMarca().trim());
            espec.setGpuModelo(isBlank(d.gpuModelo()) ? null : d.gpuModelo().trim());
            espec.setGpuVramGb(parseBD(d.gpuVramGb()));
            espec.setMonitorMarca(isBlank(d.monitorMarca()) ? null : d.monitorMarca().trim());
            espec.setMonitorModelo(isBlank(d.monitorModelo()) ? null : d.monitorModelo().trim());
            espec.setRedModelo(isBlank(d.redModelo()) ? null : d.redModelo().trim());
            especificacionTecnicaRepository.save(espec);
        }
    }

    private boolean tieneSpecs(FilaCarga d) {
        return !isBlank(d.procesador()) || !isBlank(d.ramTotalGb())
            || !isBlank(d.discoCapacidadGb()) || !isBlank(d.gpuModelo())
            || !isBlank(d.monitorModelo()) || !isBlank(d.redModelo());
    }

    // ── PARSEAR EXCEL ────────────────────────────────────────────────────────

    public List<FilaCarga> parsearExcel(MultipartFile file) {
        List<FilaCarga> filas = new ArrayList<>();
        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                if (isBlank(cellStr(row, 0)) && isBlank(cellStr(row, 6))) continue;
                filas.add(new FilaCarga(
                    cellStr(row, 0),  cellStr(row, 1),  cellStr(row, 2),  cellStr(row, 3),
                    cellStr(row, 4),  cellStr(row, 5),  cellStr(row, 6),  cellStr(row, 7),
                    cellStr(row, 8),  cellStr(row, 9),  cellStr(row, 10), cellStr(row, 11),
                    cellStr(row, 12), cellStr(row, 13), cellStr(row, 14), cellStr(row, 15),
                    cellStr(row, 16), cellStr(row, 17), cellStr(row, 18), cellStr(row, 19),
                    cellStr(row, 20), cellStr(row, 21), cellStr(row, 22), cellStr(row, 23),
                    cellStr(row, 24), cellStr(row, 25), cellStr(row, 26), cellStr(row, 27),
                    cellStr(row, 28), cellStr(row, 29), cellStr(row, 30), cellStr(row, 31)
                ));
            }
        } catch (Exception ex) {
            throw new RuntimeException("Error al leer el archivo Excel: " + ex.getMessage(), ex);
        }
        return filas;
    }

    private String cellStr(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell))
                    yield cell.getLocalDateTimeCellValue().toLocalDate().format(FMT_FECHA);
                double val = cell.getNumericCellValue();
                yield val == Math.floor(val) ? String.valueOf((long) val) : String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try { yield String.valueOf((long) cell.getNumericCellValue()); }
                catch (Exception e) { yield cell.getStringCellValue().trim(); }
            }
            default -> "";
        };
    }

    // ── PLANTILLA EXCEL DINÁMICA ──────────────────────────────────────────────

    public byte[] generarPlantilla() {
        List<String> tipos   = tipoEquipoRepository.findAll().stream()
            .map(TipoEquipo::getNombreTipo).sorted().toList();
        List<String> marcas  = marcaRepository.findAll().stream()
            .map(Marca::getNombreMarca).sorted().toList();
        List<String> modelos = modeloEquipoRepository.findAll().stream()
            .map(ModeloEquipo::getNombreModelo).distinct().sorted().toList();
        List<String> areas   = areaRepository.findByActivoTrue().stream()
            .map(Area::getNombreArea).sorted().toList();
        List<String> soList  = sistemaOperativoRepository.findAll().stream()
            .map(s -> s.getNombreSo() + " " + s.getVersionSo())
            .sorted().toList();

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Hoja oculta con listas para dropdowns
            org.apache.poi.xssf.usermodel.XSSFSheet listas = wb.createSheet("_listas");
            wb.setSheetHidden(wb.getSheetIndex("_listas"), true);
            escribirLista(listas, 0, tipos);
            escribirLista(listas, 1, marcas);
            escribirLista(listas, 2, modelos);
            escribirLista(listas, 3, areas);
            escribirLista(listas, 4, soList);
            escribirLista(listas, 5, List.of("ETHERNET", "WIFI", "N/A"));
            escribirLista(listas, 6, List.of(
                "EN_BODEGA", "ASIGNADO", "EN_REPARACION", "PRESTADO", "DADO_DE_BAJA"));

            // Hoja de datos
            org.apache.poi.xssf.usermodel.XSSFSheet datos = wb.createSheet("Carga Masiva Equipos");

            // Estilo encabezado
            org.apache.poi.xssf.usermodel.XSSFCellStyle hStyle = wb.createCellStyle();
            org.apache.poi.xssf.usermodel.XSSFFont hFont = wb.createFont();
            hFont.setBold(true);
            hFont.setColor(IndexedColors.WHITE.getIndex());
            hStyle.setFont(hFont);
            hStyle.setFillForegroundColor(
                new org.apache.poi.xssf.usermodel.XSSFColor(
                    new byte[]{(byte)0x4A, (byte)0x5D, (byte)0x23}, null));
            hStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            hStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {
                "Código Ejército*", "Tipo*", "Marca*", "Modelo*", "Área*",
                "Sistema Operativo*", "N° Serie*", "Responsable*",
                "MAC Address", "IP Address", "Tipo Red", "Estado Inicial",
                "Fecha Adquisición (dd/MM/yyyy)", "Observaciones",
                "Procesador", "Núcleos", "Hilos",
                "RAM Módulos", "RAM Total GB", "RAM Velocidad MHz", "RAM Marca",
                "Disco Modelo", "Disco Interface", "Disco Capacidad GB",
                "Disco Usado GB", "Disco Libre GB",
                "GPU Marca", "GPU Modelo", "GPU VRAM GB",
                "Monitor Marca", "Monitor Modelo", "Red (NIC) Modelo"
            };

            Row headerRow = datos.createRow(0);
            headerRow.setHeightInPoints(20);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(hStyle);
                datos.setColumnWidth(i, 22 * 256);
            }

            // Dropdowns (colDatos=índice en hoja datos, colLista=índice columna en _listas)
            agregarDropdown(wb, datos, tipos.size(),   1,  0); // B = Tipo
            agregarDropdown(wb, datos, marcas.size(),  2,  1); // C = Marca
            agregarDropdown(wb, datos, modelos.size(), 3,  2); // D = Modelo
            agregarDropdown(wb, datos, areas.size(),   4,  3); // E = Área
            agregarDropdown(wb, datos, soList.size(),  5,  4); // F = SO
            agregarDropdown(wb, datos, 3,             10,  5); // K = TipoRed
            agregarDropdown(wb, datos, 5,             11,  6); // L = EstadoInicial

            datos.createFreezePane(0, 1);
            wb.write(out);
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Error generando plantilla: " + ex.getMessage(), ex);
        }
    }

    private void escribirLista(org.apache.poi.ss.usermodel.Sheet sheet,
                                int col, List<String> valores) {
        for (int i = 0; i < valores.size(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) row = sheet.createRow(i);
            row.createCell(col).setCellValue(valores.get(i));
        }
    }

    private void agregarDropdown(XSSFWorkbook wb,
                                  org.apache.poi.ss.usermodel.Sheet datos,
                                  int numOpciones, int colDatos, int colLista) {
        String letra  = columnLetra(colLista);
        String formula = "'_listas'!$" + letra + "$1:$" + letra + "$" + numOpciones;
        DataValidationHelper dvh = datos.getDataValidationHelper();
        DataValidationConstraint dvc = dvh.createFormulaListConstraint(formula);
        org.apache.poi.ss.util.CellRangeAddressList rng =
            new org.apache.poi.ss.util.CellRangeAddressList(1, 500, colDatos, colDatos);
        DataValidation dv = dvh.createValidation(dvc, rng);
        dv.setShowErrorBox(false);
        datos.addValidationData(dv);
    }

    private String columnLetra(int index) {
        StringBuilder sb = new StringBuilder();
        index++;
        while (index > 0) {
            index--;
            sb.insert(0, (char)('A' + index % 26));
            index /= 26;
        }
        return sb.toString();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private boolean isBlank(String s) { return s == null || s.isBlank(); }

    private Short parseShort(String s) {
        if (isBlank(s)) return null;
        try { return Short.parseShort(s.trim()); }
        catch (NumberFormatException e) { return null; }
    }

    private BigDecimal parseBD(String s) {
        if (isBlank(s)) return null;
        try { return new BigDecimal(s.trim().replace(",", ".")); }
        catch (NumberFormatException e) { return null; }
    }
}
