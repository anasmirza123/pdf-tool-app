import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { RenderEngine, PDFPasswordError } from './renderEngine';
import { createWinAnsiSanitizer } from '../utils/pdfText';

export interface PDFCompressionResult {
  blob: Blob;
  originalSize: number;
  newSize: number;
  reductionPercentage: number;
  method: 'structural' | 'rasterized' | 'unchanged';
  note?: string;
}

export interface PDFMetadataInfo {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  pdfVersion?: string;
  encrypted: boolean;
  dimensions?: { width: number; height: number };
}

export interface PDFUnlockResult {
  blob: Blob;
  pageCount: number;
  method: 'unchanged' | 'rasterized';
  note: string;
}

const PDF_MIME = 'application/pdf';
const BRAND = 'DocuForge';

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: PDF_MIME });
}

/** Give documents we create a consistent, non-misleading producer instead of pdf-lib's default. */
function brand(doc: PDFDocument): void {
  doc.setProducer(BRAND);
  doc.setCreator(BRAND);
}

/** Carry the descriptive metadata over when we rebuild a document page-by-page. */
function copyInfo(from: PDFDocument, to: PDFDocument): void {
  try {
    const title = from.getTitle();
    const author = from.getAuthor();
    const subject = from.getSubject();
    const keywords = from.getKeywords();
    if (title) to.setTitle(title);
    if (author) to.setAuthor(author);
    if (subject) to.setSubject(subject);
    if (keywords) to.setKeywords(keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean));
  } catch {
    // Metadata is best-effort; never fail a job over it.
  }
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export class PDFEngine {
  /**
   * Load a PDF with pdf-lib and fail early with a clear message.
   *
   * pdf-lib cannot decrypt files. Loading an encrypted PDF with `ignoreEncryption`
   * "works" but copies still-encrypted content into an unencrypted file, producing a
   * silently corrupted (blank/garbled) result. So for every tool except Unlock we stop
   * and tell the user what to do instead.
   */
  private static async loadPDF(
    file: File,
    options: { allowEncrypted?: boolean; lenient?: boolean } = {}
  ): Promise<{ doc: PDFDocument; buffer: ArrayBuffer }> {
    const buffer = await file.arrayBuffer();

    // Cheap signature check so "not a PDF" gets a friendly message.
    const head = new Uint8Array(buffer.slice(0, 1024));
    let headText = '';
    for (let i = 0; i < head.length; i++) headText += String.fromCharCode(head[i]);
    if (!headText.includes('%PDF-')) {
      throw new Error(`"${file.name}" does not look like a PDF file. Please choose a valid .pdf document.`);
    }

    let doc: PDFDocument;
    try {
      doc = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
        updateMetadata: false,
        ...(options.lenient ? { throwOnInvalidObject: false } : {})
      });
    } catch {
      throw new Error(
        `Failed to read "${file.name}". The file may be damaged. Try the Repair PDF tool first.`
      );
    }

    if (doc.isEncrypted && !options.allowEncrypted) {
      throw new Error(
        `"${file.name}" is encrypted or permission-protected. Run it through the Unlock PDF tool first, then try again.`
      );
    }

    return { doc, buffer };
  }

  /**
   * Merge multiple PDF files into one combined PDF
   */
  public static async mergePDFs(files: File[]): Promise<Blob> {
    if (files.length < 2) {
      throw new Error('Please select at least 2 PDF files to merge.');
    }

    const mergedPdf = await PDFDocument.create();
    brand(mergedPdf);

    for (const file of files) {
      const { doc } = await this.loadPDF(file);
      const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return pdfBlob(await mergedPdf.save({ useObjectStreams: true }));
  }

  /**
   * Split PDF into separate pages or specified ranges
   */
  public static async splitPDF(
    file: File,
    mode: 'all_pages' | 'custom_ranges',
    rangeString?: string
  ): Promise<{ blob: Blob; fileName: string; isZip: boolean }> {
    const { doc: sourceDoc } = await this.loadPDF(file);
    const totalPages = sourceDoc.getPageCount();

    if (totalPages === 0) {
      throw new Error('This PDF has no pages.');
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '');

    const makeSubDoc = async (indices: number[]): Promise<Uint8Array> => {
      const subDoc = await PDFDocument.create();
      brand(subDoc);
      copyInfo(sourceDoc, subDoc);
      const copied = await subDoc.copyPages(sourceDoc, indices);
      copied.forEach((p) => subDoc.addPage(p));
      return subDoc.save({ useObjectStreams: true });
    };

    // Mode 1: Split every single page into individual PDFs packaged in a ZIP
    if (mode === 'all_pages') {
      const zip = new JSZip();
      const padWidth = Math.max(3, String(totalPages).length);

      for (let i = 0; i < totalPages; i++) {
        const subBytes = await makeSubDoc([i]);
        zip.file(`${baseName}-page-${String(i + 1).padStart(padWidth, '0')}.pdf`, subBytes);
      }

      return {
        blob: await zip.generateAsync({ type: 'blob' }),
        fileName: `${baseName}-split-pages.zip`,
        isZip: true
      };
    }

    // Mode 2: Custom ranges e.g. "1-3, 5, 7-9"
    const { ranges, invalid } = this.parsePageRangesDetailed(rangeString || '', totalPages);
    if (invalid.length > 0) {
      throw new Error(
        `These page ranges are not valid for a ${totalPages}-page document: ${invalid.join(', ')}. Use a format like 1-3, 5.`
      );
    }
    if (ranges.length === 0) {
      throw new Error('Please enter a valid page range (e.g. 1-3, 5).');
    }

    if (ranges.length === 1 && ranges[0].start === ranges[0].end) {
      const bytes = await makeSubDoc([ranges[0].start - 1]);
      return {
        blob: pdfBlob(bytes),
        fileName: `${baseName}-page-${ranges[0].start}.pdf`,
        isZip: false
      };
    }

    const zip = new JSZip();
    for (const r of ranges) {
      const indices: number[] = [];
      for (let p = r.start - 1; p <= r.end - 1; p++) indices.push(p);
      const bytes = await makeSubDoc(indices);
      const name = r.start === r.end ? `page-${r.start}` : `pages-${r.start}-to-${r.end}`;
      zip.file(`${baseName}-${name}.pdf`, bytes);
    }

    return {
      blob: await zip.generateAsync({ type: 'blob' }),
      fileName: `${baseName}-split-ranges.zip`,
      isZip: true
    };
  }

  /**
   * Parse ranges like "1-3, 5, 8-10". Reversed ranges ("5-3") are accepted and
   * normalised; tokens that cannot be used are reported back instead of vanishing.
   */
  public static parsePageRangesDetailed(
    rangeStr: string,
    maxPages: number
  ): { ranges: Array<{ start: number; end: number }>; invalid: string[] } {
    const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);
    const ranges: Array<{ start: number; end: number }> = [];
    const invalid: string[] = [];

    for (const part of parts) {
      const match = /^(\d+)\s*(?:-\s*(\d+))?$/.exec(part);
      if (!match) {
        invalid.push(part);
        continue;
      }
      let start = parseInt(match[1], 10);
      let end = match[2] !== undefined ? parseInt(match[2], 10) : start;
      if (start > end) [start, end] = [end, start];
      if (start < 1 || start > maxPages) {
        invalid.push(part);
        continue;
      }
      ranges.push({ start, end: Math.min(end, maxPages) });
    }

    return { ranges, invalid };
  }

  /** Lenient variant kept for callers that just want the usable ranges. */
  public static parsePageRanges(rangeStr: string, maxPages: number): Array<{ start: number; end: number }> {
    return this.parsePageRangesDetailed(rangeStr, maxPages).ranges;
  }

  /**
   * Compress a PDF.
   *
   * Pass 1 rebuilds the file structurally (genuine, lossless where it helps).
   * Pass 2 (High/Recommended only, and only if pass 1 didn't help) re-encodes pages as
   * JPEG images. That trades selectable text for size, so it is only used if it really
   * produces a smaller file — otherwise the original is returned untouched.
   */
  public static async compressPDF(
    file: File,
    level: 'high' | 'recommended' | 'low' = 'recommended'
  ): Promise<PDFCompressionResult> {
    const originalSize = file.size;
    const { doc: sourceDoc, buffer } = await this.loadPDF(file);

    const optimizedDoc = await PDFDocument.create();
    const copiedPages = await optimizedDoc.copyPages(sourceDoc, sourceDoc.getPageIndices());
    copiedPages.forEach((page) => optimizedDoc.addPage(page));

    if (level === 'low') {
      copyInfo(sourceDoc, optimizedDoc);
    } else {
      // Privacy scrub for the stronger levels: drop descriptive metadata.
      optimizedDoc.setTitle('');
      optimizedDoc.setAuthor('');
      optimizedDoc.setSubject('');
      optimizedDoc.setKeywords([]);
    }
    brand(optimizedDoc);

    const structuralBytes = await optimizedDoc.save({ useObjectStreams: true, addDefaultPage: false });
    const percent = (size: number) => Math.max(0, Math.round(((originalSize - size) / originalSize) * 100));

    const unchanged = (note: string): PDFCompressionResult => ({
      blob: new Blob([buffer], { type: PDF_MIME }),
      originalSize,
      newSize: originalSize,
      reductionPercentage: 0,
      method: 'unchanged',
      note
    });

    const structuralIsMeaningful = structuralBytes.byteLength < originalSize * 0.97;
    if (structuralIsMeaningful) {
      return {
        blob: pdfBlob(structuralBytes),
        originalSize,
        newSize: structuralBytes.byteLength,
        reductionPercentage: percent(structuralBytes.byteLength),
        method: 'structural'
      };
    }

    if (level === 'low') {
      return structuralBytes.byteLength < originalSize
        ? {
            blob: pdfBlob(structuralBytes),
            originalSize,
            newSize: structuralBytes.byteLength,
            reductionPercentage: percent(structuralBytes.byteLength),
            method: 'structural'
          }
        : unchanged('This file is already well optimized, so it was returned unchanged. Try a higher compression level.');
    }

    // Pass 2: rasterize pages and re-encode as JPEG.
    const scale = level === 'high' ? 1.0 : 1.3;
    const quality = level === 'high' ? 0.45 : 0.65;

    const pdfjsDoc = await RenderEngine.openPDF(buffer);
    let rasterBytes: Uint8Array;
    try {
      const rasterDoc = await PDFDocument.create();
      brand(rasterDoc);

      for (let i = 1; i <= pdfjsDoc.numPages; i++) {
        const base = await pdfjsDoc.getPage(i).then((p) => {
          const vp = p.getViewport({ scale: 1 });
          p.cleanup();
          return vp;
        });
        const img = await RenderEngine.renderPage(pdfjsDoc, i, scale, 'image/jpeg', quality, false);
        const jpegBytes = new Uint8Array(await img.blob.arrayBuffer());
        const embedded = await rasterDoc.embedJpg(jpegBytes);
        const pdfPage = rasterDoc.addPage([base.width, base.height]);
        pdfPage.drawImage(embedded, { x: 0, y: 0, width: base.width, height: base.height });
      }
      rasterBytes = await rasterDoc.save({ useObjectStreams: true });
    } finally {
      await pdfjsDoc.destroy();
    }

    if (rasterBytes.byteLength >= originalSize) {
      return unchanged(
        'Re-encoding would not make this file smaller (it is mostly text or already compact), so it was returned unchanged to keep your text selectable.'
      );
    }

    return {
      blob: pdfBlob(rasterBytes),
      originalSize,
      newSize: rasterBytes.byteLength,
      reductionPercentage: percent(rasterBytes.byteLength),
      method: 'rasterized',
      note: 'This level re-encodes pages as images to reach a smaller size — text is no longer selectable in the result.'
    };
  }

  /**
   * Rotate pages in a PDF
   */
  public static async rotatePDF(file: File, pageRotations: Record<number, number> | number): Promise<Blob> {
    const { doc } = await this.loadPDF(file);
    const pages = doc.getPages();

    pages.forEach((page, index) => {
      const pageNum = index + 1;
      const angleToAdd = typeof pageRotations === 'number' ? pageRotations : pageRotations[pageNum] || 0;

      if (angleToAdd % 360 !== 0) {
        page.setRotation(degrees(normalizeAngle(page.getRotation().angle + angleToAdd)));
      }
    });

    return pdfBlob(await doc.save({ useObjectStreams: true }));
  }

  /**
   * Delete specific pages from a PDF (pagesToDelete is a 1-indexed array)
   */
  public static async deletePages(file: File, pagesToDelete: number[]): Promise<Blob> {
    const { doc } = await this.loadPDF(file);
    const totalPages = doc.getPageCount();

    // De-duplicate and keep only real pages so repeats can't delete the wrong page.
    const unique = Array.from(new Set(pagesToDelete)).filter((p) => Number.isInteger(p) && p >= 1 && p <= totalPages);

    if (unique.length === 0) {
      throw new Error('Please select at least one valid page to delete.');
    }
    if (unique.length >= totalPages) {
      throw new Error('You cannot delete all pages. A PDF must retain at least one page.');
    }

    // Remove from the end so earlier indices do not shift.
    for (const pageNum of unique.sort((a, b) => b - a)) {
      doc.removePage(pageNum - 1);
    }

    return pdfBlob(await doc.save({ useObjectStreams: true }));
  }

  /**
   * Extract specific pages into a new PDF (pagesToExtract is a 1-indexed array)
   */
  public static async extractPages(file: File, pagesToExtract: number[]): Promise<Blob> {
    if (pagesToExtract.length === 0) {
      throw new Error('Please select at least one page to extract.');
    }

    const { doc: sourceDoc } = await this.loadPDF(file);
    const total = sourceDoc.getPageCount();
    const indices = Array.from(new Set(pagesToExtract))
      .filter((p) => Number.isInteger(p) && p >= 1 && p <= total)
      .map((p) => p - 1);

    if (indices.length === 0) {
      throw new Error('None of the selected pages exist in this document.');
    }

    const newDoc = await PDFDocument.create();
    brand(newDoc);
    copyInfo(sourceDoc, newDoc);
    const copiedPages = await newDoc.copyPages(sourceDoc, indices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    return pdfBlob(await newDoc.save({ useObjectStreams: true }));
  }

  /**
   * Reorder PDF pages given a new 1-indexed order array (e.g. [3, 1, 2])
   */
  public static async reorderPages(file: File, newOrder: number[]): Promise<Blob> {
    const { doc: sourceDoc } = await this.loadPDF(file);
    const total = sourceDoc.getPageCount();

    const valid =
      newOrder.length === total &&
      new Set(newOrder).size === total &&
      newOrder.every((p) => Number.isInteger(p) && p >= 1 && p <= total);
    if (!valid) {
      throw new Error('The page order is out of date for this file. Please re-upload the PDF and try again.');
    }

    const newDoc = await PDFDocument.create();
    brand(newDoc);
    copyInfo(sourceDoc, newDoc);
    const copiedPages = await newDoc.copyPages(
      sourceDoc,
      newOrder.map((p) => p - 1)
    );
    copiedPages.forEach((page) => newDoc.addPage(page));

    return pdfBlob(await newDoc.save({ useObjectStreams: true }));
  }

  /**
   * Convert multiple images (JPG, PNG, WebP) into a standardized PDF
   */
  public static async imagesToPDF(
    imageFiles: File[],
    options: {
      pageSize: 'a4' | 'letter' | 'fit';
      orientation: 'portrait' | 'landscape';
      margin: 'none' | 'small' | 'large';
    } = { pageSize: 'a4', orientation: 'portrait', margin: 'small' }
  ): Promise<Blob> {
    if (imageFiles.length === 0) {
      throw new Error('Please select at least one image.');
    }

    const pdfDoc = await PDFDocument.create();
    brand(pdfDoc);

    // Standard paper dimensions in points (72 points = 1 inch)
    let standardWidth = 595.28; // A4 width
    let standardHeight = 841.89; // A4 height

    if (options.pageSize === 'letter') {
      standardWidth = 612.0;
      standardHeight = 792.0;
    }

    if (options.orientation === 'landscape') {
      [standardWidth, standardHeight] = [standardHeight, standardWidth];
    }

    const marginPt = options.margin === 'none' ? 0 : options.margin === 'small' ? 24 : 48;

    for (const imageFile of imageFiles) {
      // Re-encode through canvas: handles WebP and applies EXIF orientation for phone photos.
      const { buffer, isPng, naturalWidth, naturalHeight } = await this.normalizeImageFile(imageFile);
      const embeddedImage = isPng ? await pdfDoc.embedPng(buffer) : await pdfDoc.embedJpg(buffer);

      if (options.pageSize === 'fit') {
        const page = pdfDoc.addPage([naturalWidth, naturalHeight]);
        page.drawImage(embeddedImage, { x: 0, y: 0, width: naturalWidth, height: naturalHeight });
      } else {
        const page = pdfDoc.addPage([standardWidth, standardHeight]);
        const availWidth = standardWidth - marginPt * 2;
        const availHeight = standardHeight - marginPt * 2;

        const imgAspect = naturalWidth / naturalHeight;
        const availAspect = availWidth / availHeight;

        let drawWidth = availWidth;
        let drawHeight = availHeight;

        if (imgAspect > availAspect) {
          drawHeight = availWidth / imgAspect;
        } else {
          drawWidth = availHeight * imgAspect;
        }

        page.drawImage(embeddedImage, {
          x: marginPt + (availWidth - drawWidth) / 2,
          y: marginPt + (availHeight - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight
        });
      }
    }

    return pdfBlob(await pdfDoc.save({ useObjectStreams: true }));
  }

  /**
   * Helper to normalize images (including WebP/PNG) into compatible buffer
   */
  private static async normalizeImageFile(file: File): Promise<{
    buffer: ArrayBuffer;
    isPng: boolean;
    naturalWidth: number;
    naturalHeight: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context failed'));
        }

        // Keep transparency for PNG; flatten everything else onto white.
        const isPng = file.type === 'image/png';
        if (!isPng) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          async (blob) => {
            if (!blob) return reject(new Error(`Failed to encode image "${file.name}".`));
            resolve({
              buffer: await blob.arrayBuffer(),
              isPng,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
          },
          isPng ? 'image/png' : 'image/jpeg',
          0.92
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load image "${file.name}". Ensure the file is a valid image.`));
      };

      img.src = url;
    });
  }

  /**
   * Read metadata and properties of a PDF
   */
  public static async inspectPDF(file: File): Promise<PDFMetadataInfo> {
    const { doc } = await this.loadPDF(file, { allowEncrypted: true });
    const encrypted = doc.isEncrypted;
    const pages = doc.getPages();
    const pageCount = pages.length;

    // Version comes from the "%PDF-1.x" header.
    let pdfVersion: string | undefined;
    try {
      const headBytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
      let head = '';
      for (let i = 0; i < headBytes.length; i++) head += String.fromCharCode(headBytes[i]);
      pdfVersion = /%PDF-(\d\.\d)/.exec(head)?.[1];
    } catch {
      // ignore
    }

    let dimensions: { width: number; height: number } | undefined;
    if (pageCount > 0) {
      const first = pages[0];
      dimensions = {
        width: Math.round(first.getWidth()),
        height: Math.round(first.getHeight())
      };
    }

    // Info-dictionary strings are themselves encrypted in protected files, so they
    // would be garbage; skip them rather than show nonsense.
    const info = (read: () => string | undefined): string | undefined => {
      if (encrypted) return undefined;
      try {
        return read() || undefined;
      } catch {
        return undefined;
      }
    };
    const created = encrypted ? undefined : doc.getCreationDate();

    return {
      pageCount,
      title: info(() => doc.getTitle()),
      author: info(() => doc.getAuthor()),
      subject: info(() => doc.getSubject()),
      keywords: info(() => doc.getKeywords()),
      creator: info(() => doc.getCreator()),
      producer: info(() => doc.getProducer()),
      creationDate: created ? created.toLocaleDateString() : undefined,
      pdfVersion,
      encrypted,
      dimensions
    };
  }

  /**
   * Add page numbers to all pages of a PDF
   */
  public static async addPageNumbers(
    file: File,
    options: {
      position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right';
      format: 'page_x_of_y' | 'x_of_y' | 'x';
      fontSize?: number;
      startNumber?: number;
      margin?: number;
    } = { position: 'bottom-center', format: 'page_x_of_y', fontSize: 10, startNumber: 1, margin: 30 }
  ): Promise<Blob> {
    const { doc } = await this.loadPDF(file);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const totalPages = pages.length;

    const fontSize = options.fontSize || 10;
    const margin = options.margin !== undefined ? options.margin : 30;
    const startNumber = Math.max(1, Math.floor(options.startNumber || 1));

    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];
      const pageNum = startNumber + i;
      const width = page.getWidth();
      const height = page.getHeight();

      // "of Y" shows the last number in the sequence, so a custom start reads correctly
      // (e.g. start at 5 in a 3-page file → "Page 5 of 7").
      const lastNum = startNumber + totalPages - 1;
      let text: string;
      if (options.format === 'page_x_of_y') text = `Page ${pageNum} of ${lastNum}`;
      else if (options.format === 'x_of_y') text = `${pageNum} / ${lastNum}`;
      else text = `${pageNum}`;

      const textWidth = font.widthOfTextAtSize(text, fontSize);
      let x = 0;
      let y = 0;

      switch (options.position) {
        case 'bottom-center':
          x = (width - textWidth) / 2;
          y = margin;
          break;
        case 'bottom-right':
          x = width - margin - textWidth;
          y = margin;
          break;
        case 'bottom-left':
          x = margin;
          y = margin;
          break;
        case 'top-center':
          x = (width - textWidth) / 2;
          y = height - margin - fontSize;
          break;
        case 'top-right':
          x = width - margin - textWidth;
          y = height - margin - fontSize;
          break;
      }

      page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
    }

    return pdfBlob(await doc.save({ useObjectStreams: true }));
  }

  /**
   * Add a text or image watermark across all pages of a PDF
   */
  public static async addWatermark(
    file: File,
    options: {
      type: 'text' | 'image';
      text?: string;
      imageFile?: File;
      opacity?: number;
      rotation?: number;
      fontSize?: number;
      color?: 'gray' | 'red' | 'blue' | 'black';
      scale?: number;
    }
  ): Promise<{ blob: Blob; note?: string }> {
    const { doc } = await this.loadPDF(file);
    const pages = doc.getPages();

    const opacity = options.opacity !== undefined ? options.opacity : 0.25;
    const angleDeg = options.rotation !== undefined ? options.rotation : 45;
    const theta = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    // pdf-lib rotates around the drawing origin (bottom-left of the item), so to put the
    // *centre* of an item at the page centre we offset the origin by the rotated half-size.
    const originFor = (pageW: number, pageH: number, w: number, h: number) => ({
      x: pageW / 2 - ((w / 2) * cos - (h / 2) * sin),
      y: pageH / 2 - ((w / 2) * sin + (h / 2) * cos)
    });

    let unsupportedChars: string[] = [];
    if (options.type === 'text') {
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const sanitizer = createWinAnsiSanitizer(font);
      const text = sanitizer.sanitize(options.text || 'CONFIDENTIAL').trim();
      unsupportedChars = sanitizer.unsupported();
      if (!text || text.replace(/\?/g, '').trim() === '') {
        throw new Error(
          'This watermark text uses a script the built-in PDF font cannot draw (only Latin letters, numbers and punctuation are supported). Try an image watermark instead for other scripts.'
        );
      }

      let textColor = rgb(0.5, 0.5, 0.5);
      if (options.color === 'red') textColor = rgb(0.85, 0.15, 0.15);
      if (options.color === 'blue') textColor = rgb(0.15, 0.35, 0.85);
      if (options.color === 'black') textColor = rgb(0.1, 0.1, 0.1);

      for (const page of pages) {
        const { width, height } = page.getSize();

        // Shrink the text if needed so the rotated stamp stays inside the page.
        let fontSize = options.fontSize || 48;
        const unitW = font.widthOfTextAtSize(text, 1);
        const unitH = 0.72; // approx. cap height for Helvetica
        const boxW = Math.abs(unitW * cos) + Math.abs(unitH * sin);
        const boxH = Math.abs(unitW * sin) + Math.abs(unitH * cos);
        const fit = Math.min((0.9 * width) / (boxW * fontSize), (0.9 * height) / (boxH * fontSize), 1);
        fontSize = Math.max(6, fontSize * fit);

        const w = unitW * fontSize;
        const h = unitH * fontSize;
        const { x, y } = originFor(width, height, w, h);

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: textColor,
          opacity,
          rotate: degrees(angleDeg)
        });
      }
    } else if (options.imageFile) {
      const { buffer: imgBuf, isPng, naturalWidth, naturalHeight } = await this.normalizeImageFile(options.imageFile);
      const embeddedImg = isPng ? await doc.embedPng(imgBuf) : await doc.embedJpg(imgBuf);
      const userScale = options.scale || 0.5;

      for (const page of pages) {
        const { width, height } = page.getSize();

        // Cap the logo so it always fits on the page.
        let targetW = naturalWidth * userScale;
        let targetH = naturalHeight * userScale;
        const fit = Math.min((0.8 * width) / targetW, (0.8 * height) / targetH, 1);
        targetW *= fit;
        targetH *= fit;

        const { x, y } = originFor(width, height, targetW, targetH);
        page.drawImage(embeddedImg, {
          x,
          y,
          width: targetW,
          height: targetH,
          opacity,
          rotate: degrees(angleDeg)
        });
      }
    } else {
      throw new Error('Please select an image file to use as a watermark.');
    }

    const blob = pdfBlob(await doc.save({ useObjectStreams: true }));
    const note =
      unsupportedChars.length > 0
        ? `The built-in PDF font can't draw ${unsupportedChars.slice(0, 6).join(' ')}${unsupportedChars.length > 6 ? '…' : ''} — those characters were replaced with "?". Latin letters, numbers and punctuation are fully supported.`
        : undefined;
    return { blob, note };
  }

  /**
   * Edit and update PDF document metadata
   */
  public static async editMetadata(
    file: File,
    metadata: {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string;
      creator?: string;
      producer?: string;
    }
  ): Promise<Blob> {
    const { doc } = await this.loadPDF(file);

    if (metadata.title !== undefined) doc.setTitle(metadata.title);
    if (metadata.author !== undefined) doc.setAuthor(metadata.author);
    if (metadata.subject !== undefined) doc.setSubject(metadata.subject);
    if (metadata.creator !== undefined) doc.setCreator(metadata.creator);
    if (metadata.producer !== undefined) doc.setProducer(metadata.producer);

    if (metadata.keywords !== undefined) {
      doc.setKeywords(metadata.keywords.split(',').map((k) => k.trim()).filter(Boolean));
    }

    doc.setModificationDate(new Date());

    return pdfBlob(await doc.save({ useObjectStreams: true }));
  }

  /**
   * Flatten PDF form fields into static page content
   */
  public static async flattenPDF(file: File): Promise<{ blob: Blob; fieldsFlattened: number; note?: string }> {
    const { doc } = await this.loadPDF(file);

    let count = 0;
    let note: string | undefined;
    try {
      const form = doc.getForm();
      const fields = form.getFields();
      if (fields.length === 0) {
        note = 'No fillable form fields were found in this PDF, so nothing needed flattening.';
      } else {
        form.flatten();
        count = fields.length;
      }
    } catch (e) {
      note = 'The form fields in this PDF could not be flattened (unusual or incomplete form data). The file was saved unchanged.';
      console.warn('flattenPDF:', e);
    }

    return { blob: pdfBlob(await doc.save({ useObjectStreams: true })), fieldsFlattened: count, note };
  }

  /**
   * Sign PDF by embedding a drawn signature (PNG with transparent background)
   */
  public static async signPDF(
    file: File,
    signatureDataUrl: string,
    options: {
      targetPage: 'first' | 'last' | 'all' | number;
      position: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center';
      scale?: number;
    } = { targetPage: 'last', position: 'bottom-right', scale: 0.6 }
  ): Promise<Blob> {
    const { doc } = await this.loadPDF(file);
    const pages = doc.getPages();

    const base64Data = signatureDataUrl.split(',')[1];
    if (!base64Data) throw new Error('The signature is empty. Please draw it again.');
    const sigBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const sigImage = await doc.embedPng(sigBytes);

    const scale = options.scale || 0.6;
    const margin = 40;

    let targetIndices: number[] = [];
    if (options.targetPage === 'first') targetIndices = [0];
    else if (options.targetPage === 'last') targetIndices = [pages.length - 1];
    else if (options.targetPage === 'all') targetIndices = pages.map((_, i) => i);
    else if (typeof options.targetPage === 'number') targetIndices = [options.targetPage - 1];

    for (const idx of targetIndices) {
      if (idx < 0 || idx >= pages.length) continue;
      const page = pages[idx];
      const { width, height } = page.getSize();

      // Keep the signature a sensible size on small pages.
      let sigW = sigImage.width * scale;
      let sigH = sigImage.height * scale;
      const cap = Math.min(1, (width * 0.4) / sigW);
      sigW *= cap;
      sigH *= cap;

      let x = width - sigW - margin;
      let y = margin;

      if (options.position === 'bottom-left') {
        x = margin;
      } else if (options.position === 'bottom-center') {
        x = (width - sigW) / 2;
      } else if (options.position === 'center') {
        x = (width - sigW) / 2;
        y = (height - sigH) / 2;
      }

      page.drawImage(sigImage, { x, y, width: sigW, height: sigH });
    }

    return pdfBlob(await doc.save({ useObjectStreams: true }));
  }

  /**
   * Resize PDF pages to standard paper dimensions with content scaling
   */
  public static async resizePDFPages(
    file: File,
    pageSize: 'a4' | 'letter' | 'legal' | 'a3',
    orientation: 'match' | 'portrait' | 'landscape' = 'portrait'
  ): Promise<Blob> {
    const { doc: sourceDoc } = await this.loadPDF(file);
    const newDoc = await PDFDocument.create();
    brand(newDoc);
    copyInfo(sourceDoc, newDoc);

    const sizes = {
      a4: { w: 595.28, h: 841.89 },
      letter: { w: 612.0, h: 792.0 },
      legal: { w: 612.0, h: 1008.0 },
      a3: { w: 841.89, h: 1190.55 }
    };

    const targetW = sizes[pageSize].w;
    const targetH = sizes[pageSize].h;

    for (const sourcePage of sourceDoc.getPages()) {
      const rawW = sourcePage.getWidth();
      const rawH = sourcePage.getHeight();
      const rot = normalizeAngle(sourcePage.getRotation().angle);

      // What a viewer actually shows (pdf-lib reports the unrotated box).
      const dispW = rot === 90 || rot === 270 ? rawH : rawW;
      const dispH = rot === 90 || rot === 270 ? rawW : rawH;

      let pageTargetW = targetW;
      let pageTargetH = targetH;
      if (orientation === 'landscape' || (orientation === 'match' && dispW > dispH)) {
        pageTargetW = Math.max(targetW, targetH);
        pageTargetH = Math.min(targetW, targetH);
      } else {
        pageTargetW = Math.min(targetW, targetH);
        pageTargetH = Math.max(targetW, targetH);
      }

      const [embeddedPage] = await newDoc.embedPages([sourcePage]);
      const newPage = newDoc.addPage([pageTargetW, pageTargetH]);

      const scale = Math.min(pageTargetW / dispW, pageTargetH / dispH);
      const boxX = (pageTargetW - dispW * scale) / 2;
      const boxY = (pageTargetH - dispH * scale) / 2;

      // Re-apply the source page's /Rotate so pages don't come out sideways.
      let originX = boxX;
      let originY = boxY;
      if (rot === 90) {
        originX = boxX;
        originY = boxY + rawW * scale;
      } else if (rot === 180) {
        originX = boxX + rawW * scale;
        originY = boxY + rawH * scale;
      } else if (rot === 270) {
        originX = boxX + rawH * scale;
        originY = boxY;
      }

      newPage.drawPage(embeddedPage, {
        x: originX,
        y: originY,
        xScale: scale,
        yScale: scale,
        rotate: degrees(rot === 0 ? 0 : 360 - rot)
      });
    }

    return pdfBlob(await newDoc.save({ useObjectStreams: true }));
  }

  /**
   * Crop PDF pages. Insets describe the margins to trim from what you SEE on screen
   * (top/bottom/left/right), even for pages that carry a 90/180/270° rotation flag.
   */
  public static async cropPDF(
    file: File,
    insets: { top: number; bottom: number; left: number; right: number }
  ): Promise<Blob> {
    const { doc } = await this.loadPDF(file);
    const pages = doc.getPages();

    pages.forEach((page, index) => {
      const mb = page.getMediaBox();
      const rot = normalizeAngle(page.getRotation().angle);

      // Map on-screen edges to the page's unrotated coordinate space.
      let left = insets.left;
      let right = insets.right;
      let top = insets.top;
      let bottom = insets.bottom;
      if (rot === 90) {
        [left, top, right, bottom] = [insets.bottom, insets.left, insets.top, insets.right];
      } else if (rot === 180) {
        [left, top, right, bottom] = [insets.right, insets.bottom, insets.left, insets.top];
      } else if (rot === 270) {
        [left, top, right, bottom] = [insets.top, insets.right, insets.bottom, insets.left];
      }

      const newX = mb.x + Math.max(0, left);
      const newY = mb.y + Math.max(0, bottom);
      const newW = mb.width - Math.max(0, left) - Math.max(0, right);
      const newH = mb.height - Math.max(0, top) - Math.max(0, bottom);

      if (newW < 20 || newH < 20) {
        throw new Error(
          `The crop margins are too large for page ${index + 1} (${Math.round(mb.width)} × ${Math.round(mb.height)} pt). Reduce the margins and try again.`
        );
      }

      page.setCropBox(newX, newY, newW, newH);
      page.setMediaBox(newX, newY, newW, newH);
    });

    return pdfBlob(await doc.save({ useObjectStreams: true }));
  }

  /**
   * Repair a damaged PDF by parsing it permissively and rebuilding a clean document
   * (fresh cross-reference table) from the pages that can be read.
   */
  public static async repairPDF(file: File): Promise<{ blob: Blob; salvagedPages: number; status: string }> {
    const { doc: sourceDoc } = await this.loadPDF(file, { lenient: true });

    const repairedDoc = await PDFDocument.create();
    brand(repairedDoc);
    copyInfo(sourceDoc, repairedDoc);

    // Copy page by page so one unreadable page doesn't sink the whole file.
    let salvaged = 0;
    let skipped = 0;
    for (const index of sourceDoc.getPageIndices()) {
      try {
        const [page] = await repairedDoc.copyPages(sourceDoc, [index]);
        repairedDoc.addPage(page);
        salvaged++;
      } catch {
        skipped++;
      }
    }

    if (salvaged === 0) {
      throw new Error('No readable pages could be recovered from this file.');
    }

    const bytes = await repairedDoc.save({ useObjectStreams: true });
    return {
      blob: pdfBlob(bytes),
      salvagedPages: salvaged,
      status:
        skipped === 0
          ? `Rebuilt ${salvaged} page(s) into a clean document with a fresh cross-reference table.`
          : `Rebuilt ${salvaged} page(s); ${skipped} unreadable page(s) could not be recovered.`
    };
  }

  /**
   * Unlock a PDF.
   *
   * pdf-lib cannot decrypt, and copying pages out of an encrypted file yields a corrupted
   * document. PDF.js *can* decrypt (owner-restricted files open with an empty password;
   * open-password files with the correct password), so encrypted files are rebuilt from
   * rendered page images. The trade-off — text is no longer selectable — is reported.
   * Files that are not encrypted are returned unchanged.
   */
  public static async unlockPDF(file: File, password?: string): Promise<PDFUnlockResult> {
    const { doc, buffer } = await this.loadPDF(file, { allowEncrypted: true });

    if (!doc.isEncrypted) {
      return {
        blob: new Blob([buffer], { type: PDF_MIME }),
        pageCount: doc.getPageCount(),
        method: 'unchanged',
        note: 'This PDF is not encrypted or restricted, so there was nothing to remove. The original file is returned unchanged.'
      };
    }

    const pdfjsDoc = await RenderEngine.openPDF(buffer, password || undefined); // throws PDFPasswordError if needed
    try {
      const out = await PDFDocument.create();
      brand(out);

      for (let i = 1; i <= pdfjsDoc.numPages; i++) {
        const page = await pdfjsDoc.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        page.cleanup();

        const img = await RenderEngine.renderPage(pdfjsDoc, i, 2, 'image/jpeg', 0.85, false);
        const embedded = await out.embedJpg(new Uint8Array(await img.blob.arrayBuffer()));
        const newPage = out.addPage([vp.width, vp.height]);
        newPage.drawImage(embedded, { x: 0, y: 0, width: vp.width, height: vp.height });
      }

      return {
        blob: pdfBlob(await out.save({ useObjectStreams: true })),
        pageCount: pdfjsDoc.numPages,
        method: 'rasterized',
        note: 'Restrictions were removed by rebuilding each page from an image, so text in the result is not selectable.'
      };
    } finally {
      await pdfjsDoc.destroy();
    }
  }
}

export { PDFPasswordError };
