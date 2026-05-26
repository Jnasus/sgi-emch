package pe.edu.emch.sgi.service;

// ── POI (Excel) — imports explícitos para evitar conflicto de nombres con OpenPDF ──
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

// ── OpenPDF (PDF) — Font aquí, no de POI (usamos XSSFFont para POI) ─────────
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.emch.sgi.entity.Equipo;
import pe.edu.emch.sgi.repository.EquipoRepository;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final EquipoRepository equipoRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ── Columnas del reporte Excel ────────────────────────────────────────────
    private static final String[] EXCEL_HEADERS = {
        "Código Ejército", "Tipo", "Modelo", "N° Serie",
        "Sistema Operativo", "Área", "Responsable",
        "MAC Address", "IP Address", "Tipo Red", "Estado",
        "Fecha Adquisición", "Fecha Registro", "Observaciones"
    };

    // ── Paleta corporativa ────────────────────────────────────────────────────
    private static final Color VERDE_OSCURO = new Color(0x2C, 0x3E, 0x1F);
    private static final Color VERDE_MEDIO  = new Color(0x4A, 0x5D, 0x23);
    private static final Color VERDE_CLARO  = new Color(0xF0, 0xF4, 0xE8);
    private static final Color GRIS_TEXTO   = new Color(0x5C, 0x60, 0x64);

    // =========================================================================
    // EXCEL
    // =========================================================================

    @Transactional(readOnly = true)
    public byte[] generarExcel(String estado, Integer idArea) {
        List<Equipo> equipos = equipoRepository.findAllFiltered(estado, idArea);

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = wb.createSheet("Inventario de Equipos");

            // Estilos
            XSSFCellStyle titleStyle  = buildTitleStyle(wb);
            XSSFCellStyle subStyle    = buildSubStyle(wb);
            XSSFCellStyle headerStyle = buildHeaderStyle(wb);
            XSSFCellStyle dataStyle   = buildDataStyle(wb, Color.WHITE);
            XSSFCellStyle altStyle    = buildDataStyle(wb, VERDE_CLARO);

            int lastCol = EXCEL_HEADERS.length - 1;

            // Fila 0 — Título
            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(28);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("INVENTARIO DE EQUIPOS INFORMÁTICOS — EMCH CFB");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, lastCol));

            // Fila 1 — Fecha generación
            Row subRow = sheet.createRow(1);
            subRow.setHeightInPoints(16);
            Cell subCell = subRow.createCell(0);
            subCell.setCellValue("Generado: " + LocalDate.now().format(FMT)
                + "   |   Total de equipos: " + equipos.size());
            subCell.setCellStyle(subStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, lastCol));

            // Fila 2 — Encabezados de columna
            Row headerRow = sheet.createRow(2);
            headerRow.setHeightInPoints(20);
            for (int i = 0; i < EXCEL_HEADERS.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(EXCEL_HEADERS[i]);
                c.setCellStyle(headerStyle);
            }

            // Filas de datos
            int rowNum = 3;
            for (Equipo e : equipos) {
                Row row = sheet.createRow(rowNum);
                XSSFCellStyle style = (rowNum % 2 == 0) ? altStyle : dataStyle;
                addCell(row, 0,  e.getCodigoEjercito(), style);
                addCell(row, 1,  e.getTipo().getNombreTipo(), style);
                addCell(row, 2,  e.getModelo().getNombreModelo(), style);
                addCell(row, 3,  e.getNumeroSerie(), style);
                addCell(row, 4,  e.getSo().getNombreSo() + " " + nvl(e.getSo().getVersionSo()), style);
                addCell(row, 5,  e.getArea().getNombreArea(), style);
                addCell(row, 6,  e.getNombreResponsable(), style);
                addCell(row, 7,  nvl(e.getMacAddress()), style);
                addCell(row, 8,  nvl(e.getIpAddress()), style);
                addCell(row, 9,  nvl(e.getTipoRed()), style);
                addCell(row, 10, estadoLabel(e.getEstado()), style);
                addCell(row, 11, fecha(e.getFechaAdquisicion()), style);
                addCell(row, 12, fecha(e.getFechaRegistro()), style);
                addCell(row, 13, nvl(e.getObservaciones()), style);
                rowNum++;
            }

            // Ancho de columnas
            int[] widths = { 18, 14, 18, 20, 22, 16, 24, 18, 14, 10, 14, 15, 15, 30 };
            for (int i = 0; i < widths.length; i++) {
                sheet.setColumnWidth(i, widths[i] * 256);
            }
            sheet.createFreezePane(0, 3); // Inmovilizar encabezados

            wb.write(out);
            return out.toByteArray();

        } catch (Exception ex) {
            throw new RuntimeException("Error generando reporte Excel: " + ex.getMessage(), ex);
        }
    }

    // =========================================================================
    // PDF
    // =========================================================================

    @Transactional(readOnly = true)
    public byte[] generarPdf(String estado, Integer idArea) {
        List<Equipo> equipos = equipoRepository.findAllFiltered(estado, idArea);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 20f, 20f, 40f, 30f);

        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);

            // Pie de página con número de página
            writer.setPageEvent(new PdfPageEventHelper() {
                @Override
                public void onEndPage(PdfWriter w, Document d) {
                    try {
                        Font footFont = FontFactory.getFont(FontFactory.HELVETICA, 7f, Font.NORMAL, GRIS_TEXTO);
                        PdfContentByte cb = w.getDirectContent();
                        Phrase footer = new Phrase(
                            "Página " + w.getPageNumber() + "   |   SGI-EMCH — Documento de uso interno",
                            footFont);
                        ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT, footer,
                            d.right(), d.bottom() - 10f, 0);
                    } catch (Exception ignored) { }
                }
            });

            doc.open();

            // Fuentes
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13f, VERDE_OSCURO);
            Font subFont   = FontFactory.getFont(FontFactory.HELVETICA,       8f,  GRIS_TEXTO);
            Font hFont     = FontFactory.getFont(FontFactory.HELVETICA_BOLD,  7f,  Color.WHITE);
            Font dFont     = FontFactory.getFont(FontFactory.HELVETICA,       7f,  VERDE_OSCURO);

            // Título
            Paragraph title = new Paragraph("INVENTARIO DE EQUIPOS INFORMÁTICOS — EMCH CFB", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(4f);
            doc.add(title);

            Paragraph sub = new Paragraph(
                "Generado: " + LocalDate.now().format(FMT)
                + "   |   Total: " + equipos.size() + " equipo(s)", subFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(12f);
            doc.add(sub);

            // Tabla (columnas reducidas para que quepan en A4 horizontal)
            String[] pdfHeaders = {
                "Código", "Tipo", "Modelo", "N° Serie",
                "Sistema Operativo", "Área", "Responsable", "Estado", "F. Registro"
            };
            int[] relWidths = { 2, 2, 3, 3, 3, 2, 4, 2, 2 };

            PdfPTable table = new PdfPTable(pdfHeaders.length);
            table.setWidthPercentage(100);
            table.setWidths(relWidths);
            table.setHeaderRows(1);

            // Encabezado de tabla
            for (String h : pdfHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(h, hFont));
                cell.setBackgroundColor(VERDE_MEDIO);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(4f);
                table.addCell(cell);
            }

            // Filas de datos
            boolean alt = false;
            for (Equipo e : equipos) {
                Color bg = alt ? VERDE_CLARO : Color.WHITE;
                addPdfCell(table, e.getCodigoEjercito(), dFont, bg, Element.ALIGN_CENTER);
                addPdfCell(table, e.getTipo().getNombreTipo(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getModelo().getNombreModelo(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getNumeroSerie(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getSo().getNombreSo() + " " + nvl(e.getSo().getVersionSo()),
                    dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getArea().getNombreArea(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getNombreResponsable(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, estadoLabel(e.getEstado()), dFont, bg, Element.ALIGN_CENTER);
                addPdfCell(table, fecha(e.getFechaRegistro()), dFont, bg, Element.ALIGN_CENTER);
                alt = !alt;
            }

            doc.add(table);

        } catch (Exception ex) {
            throw new RuntimeException("Error generando reporte PDF: " + ex.getMessage(), ex);
        } finally {
            if (doc.isOpen()) doc.close();
        }

        return out.toByteArray();
    }

    // =========================================================================
    // EXCEL — EQUIPOS ANTIGUOS
    // =========================================================================

    @Transactional(readOnly = true)
    public byte[] generarExcelAntiguos(int anios) {
        LocalDate fechaLimite = LocalDate.now().minusYears(anios);
        List<Equipo> equipos = equipoRepository.findAntiguos(fechaLimite);

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = wb.createSheet("Equipos Antiguos");
            XSSFCellStyle titleStyle  = buildTitleStyle(wb);
            XSSFCellStyle subStyle    = buildSubStyle(wb);
            XSSFCellStyle headerStyle = buildHeaderStyle(wb);
            XSSFCellStyle dataStyle   = buildDataStyle(wb, Color.WHITE);
            XSSFCellStyle altStyle    = buildDataStyle(wb, VERDE_CLARO);

            int lastCol = EXCEL_HEADERS.length - 1;

            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(28);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("EQUIPOS INFORMÁTICOS ANTIGUOS (≥ " + anios + " AÑOS) — EMCH CFB");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, lastCol));

            Row subRow = sheet.createRow(1);
            subRow.setHeightInPoints(16);
            Cell subCell = subRow.createCell(0);
            subCell.setCellValue("Generado: " + LocalDate.now().format(FMT)
                + "   |   Adquiridos antes del: " + fechaLimite.format(FMT)
                + "   |   Total: " + equipos.size() + " equipo(s)");
            subCell.setCellStyle(subStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, lastCol));

            Row headerRow = sheet.createRow(2);
            headerRow.setHeightInPoints(20);
            for (int i = 0; i < EXCEL_HEADERS.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(EXCEL_HEADERS[i]);
                c.setCellStyle(headerStyle);
            }

            int rowNum = 3;
            for (Equipo e : equipos) {
                Row row = sheet.createRow(rowNum);
                XSSFCellStyle style = (rowNum % 2 == 0) ? altStyle : dataStyle;
                addCell(row, 0,  e.getCodigoEjercito(), style);
                addCell(row, 1,  e.getTipo().getNombreTipo(), style);
                addCell(row, 2,  e.getModelo().getNombreModelo(), style);
                addCell(row, 3,  e.getNumeroSerie(), style);
                addCell(row, 4,  e.getSo().getNombreSo() + " " + nvl(e.getSo().getVersionSo()), style);
                addCell(row, 5,  e.getArea().getNombreArea(), style);
                addCell(row, 6,  e.getNombreResponsable(), style);
                addCell(row, 7,  nvl(e.getMacAddress()), style);
                addCell(row, 8,  nvl(e.getIpAddress()), style);
                addCell(row, 9,  nvl(e.getTipoRed()), style);
                addCell(row, 10, estadoLabel(e.getEstado()), style);
                addCell(row, 11, fecha(e.getFechaAdquisicion()), style);
                addCell(row, 12, fecha(e.getFechaRegistro()), style);
                addCell(row, 13, nvl(e.getObservaciones()), style);
                rowNum++;
            }

            int[] widths = { 18, 14, 18, 20, 22, 16, 24, 18, 14, 10, 14, 15, 15, 30 };
            for (int i = 0; i < widths.length; i++) {
                sheet.setColumnWidth(i, widths[i] * 256);
            }
            sheet.createFreezePane(0, 3);

            wb.write(out);
            return out.toByteArray();

        } catch (Exception ex) {
            throw new RuntimeException("Error generando reporte Excel (antiguos): " + ex.getMessage(), ex);
        }
    }

    // =========================================================================
    // PDF — EQUIPOS ANTIGUOS
    // =========================================================================

    @Transactional(readOnly = true)
    public byte[] generarPdfAntiguos(int anios) {
        LocalDate fechaLimite = LocalDate.now().minusYears(anios);
        List<Equipo> equipos = equipoRepository.findAntiguos(fechaLimite);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 20f, 20f, 40f, 30f);

        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            writer.setPageEvent(new PdfPageEventHelper() {
                @Override
                public void onEndPage(PdfWriter w, Document d) {
                    try {
                        Font footFont = FontFactory.getFont(FontFactory.HELVETICA, 7f, Font.NORMAL, GRIS_TEXTO);
                        PdfContentByte cb = w.getDirectContent();
                        Phrase footer = new Phrase(
                            "Página " + w.getPageNumber() + "   |   SGI-EMCH — Documento de uso interno",
                            footFont);
                        ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT, footer,
                            d.right(), d.bottom() - 10f, 0);
                    } catch (Exception ignored) { }
                }
            });

            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13f, VERDE_OSCURO);
            Font subFont   = FontFactory.getFont(FontFactory.HELVETICA,       8f,  GRIS_TEXTO);
            Font hFont     = FontFactory.getFont(FontFactory.HELVETICA_BOLD,  7f,  Color.WHITE);
            Font dFont     = FontFactory.getFont(FontFactory.HELVETICA,       7f,  VERDE_OSCURO);

            Paragraph title = new Paragraph(
                "EQUIPOS INFORMÁTICOS ANTIGUOS (≥ " + anios + " AÑOS) — EMCH CFB", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(4f);
            doc.add(title);

            Paragraph sub = new Paragraph(
                "Generado: " + LocalDate.now().format(FMT)
                + "   |   Adquiridos antes del: " + fechaLimite.format(FMT)
                + "   |   Total: " + equipos.size() + " equipo(s)", subFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(12f);
            doc.add(sub);

            String[] pdfHeaders = {
                "Código", "Tipo", "Modelo", "N° Serie",
                "Sistema Operativo", "Área", "Responsable", "Estado", "F. Adquisición"
            };
            int[] relWidths = { 2, 2, 3, 3, 3, 2, 4, 2, 2 };

            PdfPTable table = new PdfPTable(pdfHeaders.length);
            table.setWidthPercentage(100);
            table.setWidths(relWidths);
            table.setHeaderRows(1);

            for (String h : pdfHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(h, hFont));
                cell.setBackgroundColor(VERDE_MEDIO);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(4f);
                table.addCell(cell);
            }

            boolean alt = false;
            for (Equipo e : equipos) {
                Color bg = alt ? VERDE_CLARO : Color.WHITE;
                addPdfCell(table, e.getCodigoEjercito(), dFont, bg, Element.ALIGN_CENTER);
                addPdfCell(table, e.getTipo().getNombreTipo(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getModelo().getNombreModelo(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getNumeroSerie(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getSo().getNombreSo() + " " + nvl(e.getSo().getVersionSo()),
                    dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getArea().getNombreArea(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, e.getNombreResponsable(), dFont, bg, Element.ALIGN_LEFT);
                addPdfCell(table, estadoLabel(e.getEstado()), dFont, bg, Element.ALIGN_CENTER);
                addPdfCell(table, fecha(e.getFechaAdquisicion()), dFont, bg, Element.ALIGN_CENTER);
                alt = !alt;
            }

            doc.add(table);

        } catch (Exception ex) {
            throw new RuntimeException("Error generando reporte PDF (antiguos): " + ex.getMessage(), ex);
        } finally {
            if (doc.isOpen()) doc.close();
        }

        return out.toByteArray();
    }

    // =========================================================================
    // Helpers — Excel
    // =========================================================================

    private XSSFCellStyle buildTitleStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        XSSFFont f = (XSSFFont) wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 14);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(toXSSFColor(VERDE_MEDIO));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private XSSFCellStyle buildSubStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        XSSFFont f = (XSSFFont) wb.createFont();
        f.setItalic(true);
        f.setColor(toXSSFColor(GRIS_TEXTO));
        s.setFont(f);
        s.setFillForegroundColor(new XSSFColor(new byte[]{ (byte)0xF9, (byte)0xF9, (byte)0xF6 }, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return s;
    }

    private XSSFCellStyle buildHeaderStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        XSSFFont f = (XSSFFont) wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(toXSSFColor(VERDE_OSCURO));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.MEDIUM);
        s.setBorderTop(BorderStyle.MEDIUM);
        return s;
    }

    private XSSFCellStyle buildDataStyle(XSSFWorkbook wb, Color bg) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(toXSSFColor(bg));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private XSSFColor toXSSFColor(Color c) {
        return new XSSFColor(new byte[]{ (byte)c.getRed(), (byte)c.getGreen(), (byte)c.getBlue() }, null);
    }

    private void addCell(Row row, int col, String value, XSSFCellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    // =========================================================================
    // Helpers — PDF
    // =========================================================================

    private void addPdfCell(PdfPTable table, String value, Font font, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(value != null ? value : "", font));
        cell.setBackgroundColor(bg);
        cell.setPadding(3f);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    // =========================================================================
    // Helpers — comunes
    // =========================================================================

    private String nvl(String s) {
        return s != null ? s.trim() : "";
    }

    private String fecha(LocalDate d) {
        return d != null ? d.format(FMT) : "";
    }

    private String estadoLabel(String estado) {
        if (estado == null) return "";
        return switch (estado) {
            case "EN_BODEGA"     -> "En Bodega";
            case "ASIGNADO"      -> "Asignado";
            case "EN_REPARACION" -> "En Reparación";
            case "PRESTADO"      -> "Prestado";
            case "DADO_DE_BAJA"  -> "Dado de Baja";
            default              -> estado;
        };
    }
}
