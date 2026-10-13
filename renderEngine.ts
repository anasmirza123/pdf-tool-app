import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import JSZip from 'jszip';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the PDF.js worker once, for every module that renders or reads PDFs.
// The worker script is bundled locally by Vite (not fetched from a CDN at runtime).
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
  }
} catch (e) {
  console.warn('pdfjs worker configuration warning:', e);
}

export interface RenderedPageImage {
  pageNumber: number;
  blob: Blob;
  /** Only populated when requested (data URLs are expensive for large pages). */
  dataUrl?: string;
  width: number;
  height: number;
}

export type ImageFormat = 'image/jpeg' | 'image/png';

// Browsers cap canvas size (iOS Safari is the strictest at ~16.7 megapixels).
const MAX_CANVAS_PIXELS = 16_000_000;

export class PDFPasswordError extends Error {
  public readonly incorrect: boolean;
  constructor(incorrect: boolean) {
    super(
      incorrect
        ? 'The password you entered is incorrect.'
        : 'This PDF is password-protected. Enter its password to continue.'
    );
    this.name = 'PDFPasswordError';
    this.incorrect = incorrect;
  }
}

export class RenderEngine {
  /**
   * Open a PDF with PDF.js.
   *
   * IMPORTANT: PDF.js *transfers* (detaches) the ArrayBuffer it is given. Passing the
   * same buffer to a second getDocument() call therefore throws, which previously made
   * PDF→image, thumbnails and scanned-PDF OCR silently fall back to placeholder pages.
   * We always hand PDF.js its own private copy, so callers can keep using their buffer.
   */
  public static async openPDF(data: ArrayBuffer | Uint8Array, password?: string): Promise<PDFDocumentProxy> {
    const copy = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));
    const version = (pdfjsLib as any).version as string | undefined;
    const cdn = version ? `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}` : null;

    const task = pdfjsLib.getDocument({
      data: copy,
      password,
      ...(cdn
        ? {
            cMapUrl: `${cdn}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `${cdn}/standard_fonts/`
          }
        : {})
    } as any);

    try {
      return await task.promise;
    } catch (err: any) {
      if (err?.name === 'PasswordException') {
        // pdf.js codes: 1 = password needed, 2 = wrong password
        throw new PDFPasswordError(err.code === 2);
      }
      if (err?.name === 'InvalidPDFException' || err?.name === 'FormatError') {
        throw new Error('This file could not be read as a PDF. It may be damaged or not a real PDF.');
      }
      throw err;
    }
  }

  /**
   * Render one page of an already-open PDF. Throws if rendering fails — callers decide
   * how to degrade. (A fake placeholder image must never be returned as real output.)
   */
  public static async renderPage(
    pdf: PDFDocumentProxy,
    pageNumber: number,
    scale: number = 1.5,
    format: ImageFormat = 'image/jpeg',
    quality: number = 0.88,
    withDataUrl: boolean = false
  ): Promise<RenderedPageImage> {
    const page = await pdf.getPage(pageNumber);
    try {
      let viewport = page.getViewport({ scale });
      const pixels = viewport.width * viewport.height;
      if (pixels > MAX_CANVAS_PIXELS) {
        viewport = page.getViewport({ scale: scale * Math.sqrt(MAX_CANVAS_PIXELS / pixels) });
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not obtain a canvas 2D rendering context.');

      // White background for JPEG (no alpha) and for PNG (matches what a viewer shows).
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await (page.render({ canvas, canvasContext: ctx, viewport } as any) as any).promise;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed.'))),
          format,
          quality
        );
      });

      const result: RenderedPageImage = {
        pageNumber,
        blob,
        width: canvas.width,
        height: canvas.height
      };
      if (withDataUrl) result.dataUrl = canvas.toDataURL(format, quality);

      // Release the backing store promptly (matters for big multi-page jobs on mobile).
      canvas.width = 0;
      canvas.height = 0;
      return result;
    } finally {
      page.cleanup();
    }
  }

  /**
   * Convenience wrapper: open, render a single page, close.
   */
  public static async renderPageToImage(
    pdfData: ArrayBuffer | Uint8Array,
    pageNumber: number,
    scale: number = 1.5,
    format: ImageFormat = 'image/jpeg',
    quality: number = 0.88
  ): Promise<RenderedPageImage> {
    const pdf = await this.openPDF(pdfData);
    try {
      return await this.renderPage(pdf, pageNumber, scale, format, quality, true);
    } finally {
      await pdf.destroy();
    }
  }

  /**
   * Render all pages of a PDF to images and package them into a ZIP
   * (or return the single image directly for one-page PDFs).
   */
  public static async convertPDFToImages(
    file: File,
    format: ImageFormat = 'image/jpeg',
    onProgress?: (current: number, total: number) => void
  ): Promise<{ blob: Blob; fileName: string; isZip: boolean; singlePreviewUrl?: string; totalPages: number }> {
    const buffer = await file.arrayBuffer();
    const pdf = await this.openPDF(buffer);
    try {
      const totalPages = pdf.numPages;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const extension = format === 'image/png' ? 'png' : 'jpg';

      if (totalPages === 1) {
        const pageImg = await this.renderPage(pdf, 1, 2.0, format, 0.92, true);
        onProgress?.(1, 1);
        return {
          blob: pageImg.blob,
          fileName: `${baseName}-page-1.${extension}`,
          isZip: false,
          singlePreviewUrl: pageImg.dataUrl,
          totalPages: 1
        };
      }

      const zip = new JSZip();
      const padWidth = Math.max(3, String(totalPages).length);
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pageImg = await this.renderPage(pdf, pageNum, 1.8, format, 0.88, false);
        zip.file(`${baseName}-page-${String(pageNum).padStart(padWidth, '0')}.${extension}`, pageImg.blob);
        onProgress?.(pageNum, totalPages);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return {
        blob: zipBlob,
        fileName: `${baseName}-images.zip`,
        isZip: true,
        totalPages
      };
    } finally {
      await pdf.destroy();
    }
  }

  /**
   * Generate small preview thumbnails for the first pages of a PDF (used by the
   * rotate / delete / extract / reorder tools). Never throws: on failure the UI
   * falls back to generic page tiles, and only for the pages that failed.
   */
  public static async generatePageThumbnails(
    file: File,
    maxPagesToPreview: number = 50,
    shouldStop?: () => boolean
  ): Promise<Array<{ pageNumber: number; thumbnailUrl: string }>> {
    const thumbnails: Array<{ pageNumber: number; thumbnailUrl: string }> = [];
    let pdf: PDFDocumentProxy | null = null;
    try {
      pdf = await this.openPDF(await file.arrayBuffer());
      const count = Math.min(pdf.numPages, maxPagesToPreview);
      for (let p = 1; p <= count; p++) {
        if (shouldStop?.()) break;
        try {
          const rendered = await this.renderPage(pdf, p, 0.45, 'image/jpeg', 0.75, true);
          thumbnails.push({ pageNumber: p, thumbnailUrl: rendered.dataUrl || '' });
        } catch (pageErr) {
          console.warn(`Could not render preview for page ${p}:`, pageErr);
        }
      }
    } catch (e) {
      console.warn('Could not generate page previews; showing generic tiles instead.', e);
    } finally {
      if (pdf) await pdf.destroy();
    }
    return thumbnails;
  }
}
