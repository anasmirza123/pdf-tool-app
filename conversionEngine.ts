import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { RenderEngine } from './renderEngine';
import { createWinAnsiSanitizer, wrapLine } from '../utils/pdfText';

export class ConversionEngine {
  /**
   * PDF to Word (.docx):
   * Extracts text runs and lines from the PDF and creates an authentic,
   * fully-editable Microsoft Word .docx file using the docx package.
   * DOCX text runs are plain Unicode, so nothing here is limited to WinAnsi.
   */
  public static async pdfToWord(file: File): Promise<{ blob: Blob; fileName: string; textPreview: string }> {
    const { Document: DocxDocument, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx');

    const pdf = await RenderEngine.openPDF(await file.arrayBuffer());
    const docxParagraphs: any[] = [];
    let extractedSample = '';

    try {
      const totalPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        let items: Array<{ str: string; transform: number[] }>;
        try {
          const textContent = await page.getTextContent();
          items = textContent.items as any;
        } finally {
          page.cleanup();
        }

        // Group items by vertical Y coordinate to reconstruct lines
        const lineMap = new Map<number, string[]>();
        items.forEach((item) => {
          if (!item.str || item.str.trim() === '') return;
          const y = Math.round((item.transform ? item.transform[5] : 0) / 4) * 4;
          const currentLine = lineMap.get(y) || [];
          currentLine.push(item.str);
          lineMap.set(y, currentLine);
        });

        // Sort lines by Y descending (PDF coordinates origin is bottom-left)
        const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);

        if (pageNum > 1) {
          docxParagraphs.push(
            new Paragraph({
              text: `--- Page ${pageNum} ---`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 }
            })
          );
        }

        for (const y of sortedY) {
          const lineText = lineMap.get(y)?.join(' ') || '';
          if (!lineText.trim()) continue;

          if (extractedSample.length < 500) extractedSample += lineText + '\n';

          const isHeading = lineText.length < 60 && (lineText === lineText.toUpperCase() || lineText.endsWith(':'));

          docxParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: lineText,
                  bold: isHeading,
                  size: isHeading ? 28 : 22,
                  color: isHeading ? '1E293B' : '334155',
                  font: 'Calibri'
                })
              ],
              spacing: { after: 120 }
            })
          );
        }
      }
    } finally {
      await pdf.destroy();
    }

    if (docxParagraphs.length === 0) {
      docxParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Note: Document contained no selectable text streams. If this was a scanned image, please use the Scanned PDF OCR tool.',
              italics: true,
              color: 'DC2626'
            })
          ]
        })
      );
    }

    const doc = new DocxDocument({ sections: [{ properties: {}, children: docxParagraphs }] });
    const docxBlob = await Packer.toBlob(doc);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return {
      blob: docxBlob,
      fileName: `${baseName}.docx`,
      textPreview: extractedSample || 'Text extracted successfully into DOCX document.'
    };
  }

  /**
   * Word / Text to PDF:
   * Generates a clean, paginated, print-ready PDF from text/document content.
   * If a Word (.docx) file is provided, it extracts paragraphs from word/document.xml.
   */
  public static async textToPDF(file: File): Promise<Blob> {
    let text = '';
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.type.includes('wordprocessingml');

    if (isDocx) {
      try {
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const docXmlFile = zip.file('word/document.xml');
        if (docXmlFile) {
          const xmlText = await docXmlFile.async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
          if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('Malformed document.xml');
          }
          const paragraphs = xmlDoc.getElementsByTagName('w:p');
          const lines: string[] = [];
          for (let i = 0; i < paragraphs.length; i++) {
            const texts = paragraphs[i].getElementsByTagName('w:t');
            let pStr = '';
            for (let j = 0; j < texts.length; j++) pStr += texts[j].textContent || '';
            lines.push(pStr);
          }
          text = lines.join('\n');
        }
      } catch (e) {
        console.warn('DOCX XML parsing error, falling back to plain text:', e);
      }
    }

    if (!text) {
      try {
        text = await file.text();
      } catch {
        text = `Document: ${file.name}\n(Content could not be decoded as plain text)`;
      }
    }
    if (!text.trim()) {
      text = `Document: ${file.name}\n(No readable text content was found in this file.)`;
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const sanitizer = createWinAnsiSanitizer(font);

    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 18;
    const bodySize = 10.5;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    const titleText = sanitizer.sanitize(file.name.replace(/\.[^/.]+$/, '').toUpperCase());
    currentPage.drawText(titleText, { x: margin, y: currentY, size: 16, font: fontBold, color: rgb(0.12, 0.23, 0.44) });
    currentY -= 28;
    currentPage.drawLine({
      start: { x: margin, y: currentY },
      end: { x: pageWidth - margin, y: currentY },
      thickness: 1,
      color: rgb(0.8, 0.85, 0.9)
    });
    currentY -= 20;

    const newPage = () => {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
    };

    for (const rawLine of text.split(/\r?\n/)) {
      const clean = sanitizer.sanitize(rawLine);
      const wrapped = wrapLine(clean, font, bodySize, contentWidth);

      for (const line of wrapped) {
        if (currentY <= margin + lineHeight) newPage();
        if (line) {
          currentPage.drawText(line, { x: margin, y: currentY, size: bodySize, font, color: rgb(0.15, 0.15, 0.2) });
        }
        currentY -= lineHeight;
      }
      if (clean === '') currentY -= 8;
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }

  /**
   * PDF to Excel / CSV:
   * Detects tabular structure and columnar text from a PDF and exports it as CSV data.
   */
  public static async pdfToExcel(file: File): Promise<{ blob: Blob; fileName: string; rowCount: number }> {
    const pdf = await RenderEngine.openPDF(await file.arrayBuffer());
    const csvRows: string[] = [];

    try {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        let items: Array<{ str: string; transform: number[] }>;
        try {
          const textContent = await page.getTextContent();
          items = textContent.items as any;
        } finally {
          page.cleanup();
        }

        const rowMap = new Map<number, Array<{ x: number; text: string }>>();
        items.forEach((item) => {
          if (!item.str || item.str.trim() === '') return;
          const y = Math.round((item.transform ? item.transform[5] : 0) / 6) * 6;
          const x = Math.round(item.transform ? item.transform[4] : 0);
          const row = rowMap.get(y) || [];
          row.push({ x, text: item.str });
          rowMap.set(y, row);
        });

        const sortedY = Array.from(rowMap.keys()).sort((a, b) => b - a);
        for (const y of sortedY) {
          const cells = rowMap.get(y)?.sort((a, b) => a.x - b.x) || [];
          const escaped = cells.map((c) => `"${c.text.replace(/"/g, '""').trim()}"`);
          if (escaped.length > 0) csvRows.push(escaped.join(','));
        }
      }
    } finally {
      await pdf.destroy();
    }

    // Excel/Sheets need a UTF-8 BOM to display accented/non-Latin text correctly.
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return { blob, fileName: `${baseName}-data.csv`, rowCount: csvRows.length };
  }

  /**
   * Excel / CSV to PDF:
   * Formats CSV and Excel (.xlsx) tables into a clean, paginated PDF report.
   */
  public static async excelToPDF(file: File): Promise<Blob> {
    let rows: string[][] = [];
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx') || file.type.includes('spreadsheetml');

    if (isXlsx) {
      try {
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const sharedStrings: string[] = [];
        const ssFile = zip.file('xl/sharedStrings.xml');
        if (ssFile) {
          const ssDoc = new DOMParser().parseFromString(await ssFile.async('text'), 'application/xml');
          const siNodes = ssDoc.getElementsByTagName('si');
          for (let i = 0; i < siNodes.length; i++) {
            const tNodes = siNodes[i].getElementsByTagName('t');
            let str = '';
            for (let j = 0; j < tNodes.length; j++) str += tNodes[j].textContent || '';
            sharedStrings.push(str);
          }
        }

        // Read every worksheet, not just the first, so a report never silently drops sheets.
        const sheetFiles = Object.keys(zip.files)
          .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
          .sort((a, b) => {
            const na = parseInt(a.match(/(\d+)/)?.[1] || '0', 10);
            const nb = parseInt(b.match(/(\d+)/)?.[1] || '0', 10);
            return na - nb;
          });

        for (const sheetPath of sheetFiles) {
          const sheetDoc = new DOMParser().parseFromString(await zip.file(sheetPath)!.async('text'), 'application/xml');
          const rowNodes = sheetDoc.getElementsByTagName('row');
          for (let i = 0; i < rowNodes.length; i++) {
            const cellNodes = rowNodes[i].getElementsByTagName('c');
            const rowCells: string[] = [];
            for (let j = 0; j < cellNodes.length; j++) {
              const c = cellNodes[j];
              const tType = c.getAttribute('t');
              const vNode = c.getElementsByTagName('v')[0];
              let val = vNode ? vNode.textContent || '' : '';
              if (tType === 's') val = sharedStrings[parseInt(val, 10)] || val;
              rowCells.push(val);
            }
            if (rowCells.some((c) => c.trim())) rows.push(rowCells);
          }
        }
      } catch (err) {
        console.warn('XLSX parsing failed, falling back to CSV parser:', err);
      }
    }

    if (rows.length === 0) {
      const text = await file.text();
      rows = text
        .split(/\r?\n/)
        .map((r) => r.trim())
        .filter(Boolean)
        .map((rowStr) => {
          const pattern = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
          const entries: string[] = [];
          let match;
          let lastIndex = 0;
          while ((match = pattern.exec(rowStr)) && match.index >= lastIndex) {
            if (match[0] === '' && entries.length > 0) break;
            entries.push((match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2] || '').trim());
            lastIndex = pattern.lastIndex;
          }
          return entries;
        });
    }

    if (rows.length === 0) {
      throw new Error('No rows could be read from this file. Check that it is a valid spreadsheet or CSV.');
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const sanitizer = createWinAnsiSanitizer(font);

    const pageWidth = 841.89; // Landscape A4 for wide tables
    const pageHeight = 595.28;
    const margin = 40;
    const rowHeight = 22;

    const maxCols = Math.min(Math.max(...rows.map((r) => r.length), 1), 8);
    const colWidth = (pageWidth - margin * 2) / maxCols;
    const maxCharsPerCell = Math.max(6, Math.floor(colWidth / 6) - 2);

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    currentPage.drawText(sanitizer.sanitize(`Spreadsheet Report: ${file.name}`), {
      x: margin,
      y: currentY,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.4)
    });
    currentY -= 26;

    rows.forEach((row, rowIndex) => {
      if (currentY <= margin + rowHeight) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      const isHeader = rowIndex === 0;
      if (isHeader) {
        currentPage.drawRectangle({ x: margin, y: currentY - 5, width: pageWidth - margin * 2, height: rowHeight, color: rgb(0.9, 0.93, 0.98) });
      } else if (rowIndex % 2 === 1) {
        currentPage.drawRectangle({ x: margin, y: currentY - 5, width: pageWidth - margin * 2, height: rowHeight, color: rgb(0.98, 0.98, 0.99) });
      }

      row.slice(0, maxCols).forEach((cellText, colIndex) => {
        const x = margin + colIndex * colWidth;
        const clean = sanitizer.sanitize(cellText);
        const truncated = clean.length > maxCharsPerCell ? clean.substring(0, maxCharsPerCell - 1) + '…' : clean;
        currentPage.drawText(truncated, {
          x: x + 6,
          y: currentY,
          size: 9.5,
          font: isHeader ? fontBold : font,
          color: isHeader ? rgb(0.1, 0.2, 0.4) : rgb(0.2, 0.2, 0.2)
        });
      });

      currentPage.drawLine({
        start: { x: margin, y: currentY - 5 },
        end: { x: pageWidth - margin, y: currentY - 5 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.92)
      });

      currentY -= rowHeight;
    });

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }

  /**
   * PowerPoint / Presentation to PDF:
   * Generates a modern 16:9 widescreen presentation slide deck PDF from a text/Markdown outline.
   */
  public static async presentationToPDF(file: File): Promise<Blob> {
    const text = await file.text();
    if (!text.trim()) {
      throw new Error('This file has no text content to turn into slides.');
    }
    const rawSlides = text.split(/(?:^|\n)(?:---|===|Slide\s*\d+:?)/gi).filter((s) => s.trim().length > 0);
    const slides = rawSlides.length > 0 ? rawSlides : [text];

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const sanitizer = createWinAnsiSanitizer(font);

    const slideWidth = 960;
    const slideHeight = 540;
    const contentWidth = slideWidth - 95 - 60;

    slides.forEach((slideContent, index) => {
      const page = pdfDoc.addPage([slideWidth, slideHeight]);
      page.drawRectangle({ x: 0, y: 0, width: slideWidth, height: slideHeight, color: rgb(0.96, 0.97, 0.99) });
      page.drawRectangle({ x: 0, y: 0, width: 16, height: slideHeight, color: rgb(0.3, 0.45, 0.95) });

      const lines = slideContent.split(/\r?\n/).map((l) => sanitizer.sanitize(l.trim())).filter(Boolean);
      const title = lines[0] || `Slide ${index + 1}`;
      const bullets = lines.slice(1, 9); // cap bullets so they can't run off the bottom of the slide

      page.drawText(title, { x: 60, y: slideHeight - 80, size: 26, font: fontBold, color: rgb(0.08, 0.12, 0.25) });
      page.drawLine({
        start: { x: 60, y: slideHeight - 100 },
        end: { x: slideWidth - 60, y: slideHeight - 100 },
        thickness: 2,
        color: rgb(0.8, 0.85, 0.92)
      });

      let yPos = slideHeight - 145;
      for (const bullet of bullets) {
        if (yPos < 50) break;
        const bulletText = bullet.startsWith('-') || bullet.startsWith('*') ? bullet.substring(1).trim() : bullet;
        const wrapped = wrapLine(bulletText, font, 15, contentWidth).slice(0, 2); // cap wrap to 2 lines/bullet
        page.drawText('•', { x: 70, y: yPos, size: 16, font: fontBold, color: rgb(0.3, 0.45, 0.95) });
        for (const line of wrapped) {
          if (yPos < 40) break;
          page.drawText(line, { x: 95, y: yPos, size: 15, font, color: rgb(0.2, 0.25, 0.35) });
          yPos -= 22;
        }
        yPos -= 14;
      }

      page.drawText(`Slide ${index + 1} of ${slides.length}`, { x: slideWidth - 140, y: 30, size: 10, font, color: rgb(0.5, 0.55, 0.65) });
    });

    const bytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([bytes as any], { type: 'application/pdf' });
  }

  /**
   * PDF to PowerPoint:
   * Extracts slides as high-res presentation graphics and an outline in a ZIP package.
   */
  public static async pdfToPowerPoint(file: File): Promise<{ blob: Blob; fileName: string; slideCount: number }> {
    const pdf = await RenderEngine.openPDF(await file.arrayBuffer());
    try {
      const slideCount = pdf.numPages;
      const zip = new JSZip();
      let outlineContent = `Presentation Outline & Speaker Notes\nSource: ${file.name}\nTotal Slides: ${slideCount}\n\n`;
      const padWidth = Math.max(2, String(slideCount).length);

      for (let p = 1; p <= slideCount; p++) {
        const page = await pdf.getPage(p);
        let pageText: string;
        try {
          const textContent = await page.getTextContent();
          pageText = textContent.items.map((i: any) => i.str).join(' ').trim();
        } finally {
          page.cleanup();
        }
        outlineContent += `--- Slide ${p} ---\n${pageText}\n\n`;

        const rendered = await RenderEngine.renderPage(pdf, p, 1.5, 'image/png', 1, false);
        zip.file(`slide-${p.toString().padStart(padWidth, '0')}.png`, rendered.blob);
      }

      zip.file('presentation-outline.txt', outlineContent);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      return { blob: zipBlob, fileName: `${baseName}-slides.zip`, slideCount };
    } finally {
      await pdf.destroy();
    }
  }
}
