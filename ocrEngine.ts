import { RenderEngine, PDFPasswordError } from './renderEngine';

export interface OCRResult {
  text: string;
  confidence: number;
  txtBlob: Blob;
  docxBlob: Blob;
  previewSnippet: string;
}

export class OCREngine {
  /**
   * Run OCR on an image file (JPG, PNG, WebP)
   */
  public static async recognizeImage(
    file: File,
    onProgress?: (progress: number, status: string) => void
  ): Promise<OCRResult> {
    onProgress?.(0.1, 'Initializing OCR engine...');

    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker('eng', 1, {
      logger: (m: any) => {
        if (m.status === 'recognizing text' && m.progress !== undefined) {
          onProgress?.(0.2 + m.progress * 0.7, `Recognizing text (${Math.round(m.progress * 100)}%)...`);
        } else if (m.status) {
          onProgress?.(0.15, m.status);
        }
      }
    });

    try {
      onProgress?.(0.3, 'Analyzing image character glyphs...');
      const result = await worker.recognize(file);
      const text = result.data.text.trim();
      const confidence = Math.round(result.data.confidence);

      onProgress?.(0.95, 'Formatting text output...');

      const txtBlob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
      const docxBlob = await this.buildDocxFromText(text, file.name);

      return {
        text,
        confidence,
        txtBlob,
        docxBlob,
        previewSnippet: text.slice(0, 300) || 'No text detected in image.'
      };
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Extract selectable text from a digital PDF's text layer.
   */
  public static async extractPDFText(
    file: File,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ text: string; pageCount: number; txtBlob: Blob; docxBlob: Blob }> {
    const pdf = await RenderEngine.openPDF(await file.arrayBuffer());
    try {
      const totalPages = pdf.numPages;
      let fullText = '';
      let sawAnyText = false;

      for (let p = 1; p <= totalPages; p++) {
        const page = await pdf.getPage(p);
        try {
          const textContent = await page.getTextContent();
          const pageStrings = textContent.items.map((i: any) => i.str).filter(Boolean);
          const pageText = pageStrings.join(' ').replace(/\s+/g, ' ').trim();
          if (pageText) sawAnyText = true;
          fullText += `--- Page ${p} ---\n${pageText}\n\n`;
        } finally {
          page.cleanup();
        }
        onProgress?.(p, totalPages);
      }

      if (!sawAnyText) {
        fullText =
          'No selectable text was found in this PDF. If it is a scan or photo of a document, use the "Scanned PDF OCR" tool instead.';
      }

      const cleanText = fullText.trim();
      const txtBlob = new Blob([cleanText], { type: 'text/plain;charset=utf-8;' });
      const docxBlob = await this.buildDocxFromText(cleanText, file.name);

      return { text: cleanText, pageCount: totalPages, txtBlob, docxBlob };
    } finally {
      await pdf.destroy();
    }
  }

  /**
   * Scanned PDF OCR: renders each page to an image and runs OCR across the raster bitmaps.
   * The PDF is opened once and reused for every page (previously each page reopened and
   * re-parsed the entire document, which was both slow and, once a shared render helper
   * started copying/consuming the buffer per call, unreliable for pages after the first).
   */
  public static async recognizeScannedPDF(
    file: File,
    onProgress?: (progress: number, status: string) => void
  ): Promise<OCRResult> {
    onProgress?.(0.05, 'Reading PDF structure...');
    const pdf = await RenderEngine.openPDF(await file.arrayBuffer());
    const MAX_PAGES = 10; // keep in-browser OCR responsive
    const totalPages = Math.min(pdf.numPages, MAX_PAGES);
    const truncated = pdf.numPages > MAX_PAGES;

    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng', 1);

    try {
      let aggregatedText = '';
      let totalConfidence = 0;

      for (let p = 1; p <= totalPages; p++) {
        onProgress?.(0.1 + (p / totalPages) * 0.8, `Running OCR on page ${p} of ${totalPages}...`);

        const pageImg = await RenderEngine.renderPage(pdf, p, 1.8, 'image/jpeg', 0.9, false);
        const res = await worker.recognize(pageImg.blob);

        aggregatedText += `--- Page ${p} ---\n${res.data.text.trim()}\n\n`;
        totalConfidence += res.data.confidence;
      }

      if (truncated) {
        aggregatedText += `\n[Only the first ${MAX_PAGES} of ${pdf.numPages} pages were processed to keep in-browser OCR responsive.]\n`;
      }

      onProgress?.(0.95, 'Compiling document...');

      const averageConfidence = totalPages > 0 ? Math.round(totalConfidence / totalPages) : 0;
      const txtBlob = new Blob([aggregatedText], { type: 'text/plain;charset=utf-8;' });
      const docxBlob = await this.buildDocxFromText(aggregatedText, file.name);

      return {
        text: aggregatedText,
        confidence: averageConfidence,
        txtBlob,
        docxBlob,
        previewSnippet: aggregatedText.slice(0, 300)
      };
    } finally {
      await worker.terminate();
      await pdf.destroy();
    }
  }

  /**
   * Helper to format text lines into an authentic DOCX file. DOCX text runs are plain
   * Unicode strings (unlike pdf-lib's built-in PDF fonts), so no font-encoding limits apply
   * here — any script the source document contained comes through unchanged.
   */
  private static async buildDocxFromText(text: string, sourceName: string): Promise<Blob> {
    const { Document, Paragraph, TextRun, Packer, HeadingLevel } = await import('docx');

    const titleParagraph = new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 80 },
      children: [new TextRun({ text: `OCR Result: ${sourceName}`, bold: true })]
    });

    const subtitleParagraph = new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `Extracted ${new Date().toLocaleDateString()} by DocuForge`,
          italics: true,
          color: '64748B',
          size: 18
        })
      ]
    });

    const paragraphs = text.split(/\r?\n/).map((line) => {
      const isHeader = line.startsWith('---');
      return new Paragraph({
        children: [
          new TextRun({
            text: line || ' ',
            bold: isHeader,
            color: isHeader ? '2563EB' : '1E293B',
            size: isHeader ? 24 : 22
          })
        ],
        spacing: { after: 120 }
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children:
            paragraphs.length > 0
              ? [titleParagraph, subtitleParagraph, ...paragraphs]
              : [titleParagraph, subtitleParagraph, new Paragraph({ text: 'No text extracted.' })]
        }
      ]
    });

    return await Packer.toBlob(doc);
  }
}

export { PDFPasswordError };
