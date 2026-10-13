import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  FileCheck,
  Eraser,
  Wrench,
  Unlock
} from 'lucide-react';
import { ToolDefinition, UploadedFileItem, ProcessingState, ProcessedResult, PDFPageInfo } from '../types';
import { FileUploader } from '../components/FileUploader';
import { ProgressBar } from '../components/ProgressBar';
import { ResultCard } from '../components/ResultCard';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { FAQAccordion } from '../components/FAQAccordion';
import { RelatedTools } from '../components/RelatedTools';
import { PDFEngine, PDFPasswordError } from '../services/pdfEngine';
import { RenderEngine } from '../services/renderEngine';
import { ConversionEngine } from '../services/conversionEngine';
import { ImageEngine } from '../services/imageEngine';
import { OCREngine } from '../services/ocrEngine';
import { AnalyticsService } from '../services/analyticsService';
import { analyzeText, formatExactBytes } from '../utils/formatters';
import { getToolIcon } from '../utils/toolIcon';
import { categoryLabel } from '../config/seo';

interface ToolPageProps {
  tool: ToolDefinition;
  onNavigate: (path: string) => void;
}

export const ToolPage: React.FC<ToolPageProps> = ({ tool, onNavigate }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  // PDF page tools state (Rotate, Delete, Extract, Reorder)
  const [pdfPages, setPdfPages] = useState<PDFPageInfo[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Specific Tool Options State
  // Split options
  const [splitMode, setSplitMode] = useState<'all_pages' | 'custom_ranges'>('all_pages');
  const [splitRange, setSplitRange] = useState('1-3');

  // Compress PDF options
  const [compressLevel, setCompressLevel] = useState<'high' | 'recommended' | 'low'>('recommended');

  // Image to PDF options
  const [imgPdfPageSize, setImgPdfPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [imgPdfOrientation, setImgPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [imgPdfMargin, setImgPdfMargin] = useState<'none' | 'small' | 'large'>('small');

  // Compress Image options
  const [imgQuality, setImgQuality] = useState<number>(0.75);
  const [imgFormat, setImgFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Resize Image options
  const [imgWidth, setImgWidth] = useState<number>(1280);
  const [imgHeight, setImgHeight] = useState<number>(720);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

  // Utilities direct text input state
  const [utilityText, setUtilityText] = useState<string>('');

  // 1. Page Number Options
  const [pageNumPosition, setPageNumPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right'>('bottom-center');
  const [pageNumFormat, setPageNumFormat] = useState<'page_x_of_y' | 'x_of_y' | 'x'>('page_x_of_y');
  const [pageNumStart, setPageNumStart] = useState<number>(1);

  // 2. Watermark Options
  const [wmType, setWmType] = useState<'text' | 'image'>('text');
  const [wmText, setWmText] = useState<string>('CONFIDENTIAL');
  const [wmOpacity, setWmOpacity] = useState<number>(0.25);
  const [wmRotation, setWmRotation] = useState<number>(45);
  const [wmColor, setWmColor] = useState<'gray' | 'red' | 'blue' | 'black'>('gray');
  const [wmImageFile, setWmImageFile] = useState<File | null>(null);

  // 3. Edit Metadata Options
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaAuthor, setMetaAuthor] = useState<string>('');
  const [metaSubject, setMetaSubject] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');

  // 4. Resize PDF Pages Options
  const [targetPdfPageSize, setTargetPdfPageSize] = useState<'a4' | 'letter' | 'legal' | 'a3'>('a4');
  const [targetPdfOrientation, setTargetPdfOrientation] = useState<'portrait' | 'landscape' | 'match'>('portrait');

  // 5. Crop PDF Options (in points)
  const [cropTop, setCropTop] = useState<number>(36);
  const [cropBottom, setCropBottom] = useState<number>(36);
  const [cropLeft, setCropLeft] = useState<number>(36);
  const [cropRight, setCropRight] = useState<number>(36);

  // Unlock PDF: optional password for files that need one to open at all
  const [unlockPassword, setUnlockPassword] = useState<string>('');

  // 6. Sign PDF Options & Canvas
  const [sigPosition, setSigPosition] = useState<'bottom-right' | 'bottom-left' | 'bottom-center' | 'center'>('bottom-right');
  const [sigTargetPage, setSigTargetPage] = useState<'last' | 'first' | 'all'>('last');
  const [sigPenColor, setSigPenColor] = useState<'#000000' | '#1e3a8a'>('#1e3a8a');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clean state when tool changes
  useEffect(() => {
    resetState();
  }, [tool.id]);

  const resetState = () => {
    setFiles([]);
    setProcessingState('idle');
    setProgressPercent(0);
    setStatusMessage('');
    setErrorMessage(null);
    setResult(null);
    setPdfPages([]);
    setLoadingPages(false);
    setSignatureDataUrl('');
    setWmImageFile(null);
    setUnlockPassword('');
    clearSignatureCanvas();
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureDataUrl('');
  };

  // Canvas drawing handlers for signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = sigPenColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  // Auto-populate metadata when file is selected for edit-pdf-metadata
  useEffect(() => {
    if (tool.id === 'edit-pdf-metadata' && files.length === 1) {
      PDFEngine.inspectPDF(files[0].file)
        .then((info) => {
          if (info.title) setMetaTitle(info.title);
          if (info.author) setMetaAuthor(info.author);
          if (info.subject) setMetaSubject(info.subject);
          if (info.keywords) setMetaKeywords(info.keywords);
        })
        .catch(() => {});
    }
  }, [files, tool.id]);

  // If user uploads PDF for Rotate, Delete, Extract, or Reorder, load thumbnails
  useEffect(() => {
    const isPageTool = ['rotate-pdf', 'delete-pdf-pages', 'extract-pdf-pages', 'reorder-pdf-pages'].includes(tool.id);
    if (isPageTool && files.length === 1) {
      loadPageThumbnails(files[0].file);
    } else {
      setPdfPages([]);
    }
  }, [files, tool.id]);

  // If user uploads an image for Resize, measure original dimensions
  useEffect(() => {
    if (tool.id === 'resize-image' && files.length === 1) {
      ImageEngine.loadImage(files[0].file).then((img) => {
        setImgWidth(img.naturalWidth);
        setImgHeight(img.naturalHeight);
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      });
    }
  }, [files, tool.id]);

  const loadPageThumbnails = async (file: File) => {
    setLoadingPages(true);
    try {
      const inspect = await PDFEngine.inspectPDF(file);
      const thumbs = await RenderEngine.generatePageThumbnails(file, 40);

      const items: PDFPageInfo[] = Array.from({ length: inspect.pageCount }, (_, i) => {
        const pageNum = i + 1;
        const found = thumbs.find((t) => t.pageNumber === pageNum);
        return {
          pageNumber: pageNum,
          rotation: 0,
          selected: tool.id === 'extract-pdf-pages' ? i === 0 : false, // select first page by default for extract
          thumbnailUrl: found?.thumbnailUrl
        };
      });
      setPdfPages(items);
    } catch (err: any) {
      console.warn('Failed to load page previews:', err);
    } finally {
      setLoadingPages(false);
    }
  };

  // Rotate handlers
  const handleRotateSinglePage = (pageNumber: number) => {
    setPdfPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleRotateAll = () => {
    setPdfPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 })));
  };

  // Selection handlers
  const handleToggleSelectPage = (pageNumber: number) => {
    setPdfPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleSelectAllPages = () => {
    setPdfPages((prev) => prev.map((p) => ({ ...p, selected: true })));
  };

  const handleDeselectAllPages = () => {
    setPdfPages((prev) => prev.map((p) => ({ ...p, selected: false })));
  };

  // Reorder handlers
  const handleMovePage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= pdfPages.length) return;
    const copy = [...pdfPages];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setPdfPages(copy);
  };

  // Width/Height sync with aspect lock
  const handleWidthChange = (val: number) => {
    setImgWidth(val);
    if (lockAspect && aspectRatio > 0) {
      setImgHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setImgHeight(val);
    if (lockAspect && aspectRatio > 0) {
      setImgWidth(Math.round(val * aspectRatio));
    }
  };

  // Main Execution Process
  const handleExecuteProcessing = async () => {
    if (files.length === 0 && !['word-counter', 'character-counter'].includes(tool.id)) {
      setErrorMessage('Please select a file to process.');
      return;
    }

    setErrorMessage(null);
    setProcessingState('uploading');
    setProgressPercent(15);
    setStatusMessage('Reading file data...');

    const startTime = Date.now();
    const primaryFile = files[0]?.file;
    const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

    try {
      // Transition to analyzing
      setTimeout(() => {
        setProcessingState('analyzing');
        setProgressPercent(35);
        setStatusMessage('Validating and preparing document streams...');
      }, 200);

      await new Promise((r) => setTimeout(r, 400));
      setProcessingState('processing');
      setProgressPercent(60);
      setStatusMessage('Executing processing engine...');

      let finalBlob: Blob;
      let finalFileName: string = 'document.pdf';
      let extractedText: string | undefined = undefined;
      let newSize: number = 0;
      let reductionPercent: number | undefined = undefined;
      let effectiveOriginalSize: number = totalOriginalSize;
      let resultPageCount: number | undefined = undefined;
      let resultMetadata: Record<string, string | number> | undefined = undefined;

      switch (tool.id) {
        // --- PDF TOOLS ---
        case 'merge-pdf': {
          const rawFiles = files.map((f) => f.file);
          finalBlob = await PDFEngine.mergePDFs(rawFiles);
          finalFileName = 'merged-document.pdf';
          newSize = finalBlob.size;
          break;
        }

        case 'split-pdf': {
          const res = await PDFEngine.splitPDF(primaryFile, splitMode, splitRange);
          finalBlob = res.blob;
          finalFileName = res.fileName;
          newSize = finalBlob.size;
          break;
        }

        case 'compress-pdf': {
          const comp = await PDFEngine.compressPDF(primaryFile, compressLevel);
          finalBlob = comp.blob;
          finalFileName = `compressed-${primaryFile.name}`;
          newSize = comp.newSize;
          reductionPercent = comp.reductionPercentage;
          resultMetadata = {
            Method:
              comp.method === 'rasterized'
                ? 'Image-based (aggressive)'
                : comp.method === 'unchanged'
                ? 'No change needed'
                : 'Structural optimization',
            ...(comp.note ? { Note: comp.note } : {})
          };
          break;
        }

        case 'rotate-pdf': {
          const rotations: Record<number, number> = {};
          pdfPages.forEach((p) => {
            if (p.rotation > 0) rotations[p.pageNumber] = p.rotation;
          });
          finalBlob = await PDFEngine.rotatePDF(primaryFile, rotations);
          finalFileName = `rotated-${primaryFile.name}`;
          newSize = finalBlob.size;
          break;
        }

        case 'delete-pdf-pages': {
          const toDelete = pdfPages.filter((p) => p.selected).map((p) => p.pageNumber);
          if (toDelete.length === 0) {
            throw new Error('Please select at least one page to delete.');
          }
          finalBlob = await PDFEngine.deletePages(primaryFile, toDelete);
          finalFileName = `trimmed-${primaryFile.name}`;
          newSize = finalBlob.size;
          break;
        }

        case 'extract-pdf-pages': {
          const toExtract = pdfPages.filter((p) => p.selected).map((p) => p.pageNumber);
          if (toExtract.length === 0) {
            throw new Error('Please select at least one page to extract.');
          }
          finalBlob = await PDFEngine.extractPages(primaryFile, toExtract);
          finalFileName = `extracted-${primaryFile.name}`;
          newSize = finalBlob.size;
          break;
        }

        case 'reorder-pdf-pages': {
          const order = pdfPages.map((p) => p.pageNumber);
          finalBlob = await PDFEngine.reorderPages(primaryFile, order);
          finalFileName = `reordered-${primaryFile.name}`;
          newSize = finalBlob.size;
          break;
        }

        // --- ADVANCED PDF TOOLS ---
        case 'page-number-pdf': {
          finalBlob = await PDFEngine.addPageNumbers(primaryFile, {
            position: pageNumPosition,
            format: pageNumFormat,
            startNumber: pageNumStart
          });
          finalFileName = `numbered-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultMetadata = {
            Position: pageNumPosition.replace('-', ' '),
            Format: pageNumFormat === 'page_x_of_y' ? 'Page X of Y' : pageNumFormat === 'x_of_y' ? 'X / Y' : 'X',
            'Start Number': pageNumStart
          };
          break;
        }

        case 'watermark-pdf': {
          if (wmType === 'text' && !wmText.trim()) {
            throw new Error('Please enter text for your watermark.');
          }
          if (wmType === 'image' && !wmImageFile) {
            throw new Error('Please select an image file to use as a watermark.');
          }
          const wmRes = await PDFEngine.addWatermark(primaryFile, {
            type: wmType,
            text: wmText,
            imageFile: wmImageFile || undefined,
            opacity: wmOpacity,
            rotation: wmRotation,
            color: wmColor
          });
          finalBlob = wmRes.blob;
          finalFileName = `watermarked-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultMetadata = {
            Type: wmType === 'text' ? 'Text stamp' : 'Image logo watermark',
            ...(wmType === 'text' ? { Text: wmText } : {}),
            Opacity: `${Math.round(wmOpacity * 100)}%`,
            Rotation: `${wmRotation}°`,
            ...(wmRes.note ? { Note: wmRes.note } : {})
          };
          break;
        }

        case 'edit-pdf-metadata': {
          finalBlob = await PDFEngine.editMetadata(primaryFile, {
            title: metaTitle,
            author: metaAuthor,
            subject: metaSubject,
            keywords: metaKeywords
          });
          finalFileName = `metadata-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultMetadata = {
            Title: metaTitle || '(Unset)',
            Author: metaAuthor || '(Unset)',
            Subject: metaSubject || '(Unset)',
            Keywords: metaKeywords || '(None)'
          };
          break;
        }

        case 'flatten-pdf': {
          const flatRes = await PDFEngine.flattenPDF(primaryFile);
          finalBlob = flatRes.blob;
          finalFileName = `flattened-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultMetadata = {
            'Fields Flattened': flatRes.fieldsFlattened,
            Status:
              flatRes.note || 'All interactive annotations and form fields converted to immutable vector paths'
          };
          break;
        }

        case 'sign-pdf': {
          if (!signatureDataUrl) {
            throw new Error('Please draw your signature or select an ink stroke before signing.');
          }
          finalBlob = await PDFEngine.signPDF(primaryFile, signatureDataUrl, {
            targetPage: sigTargetPage,
            position: sigPosition
          });
          finalFileName = `signed-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultMetadata = {
            'Signed Pages': sigTargetPage === 'last' ? 'Last page' : sigTargetPage === 'first' ? 'First page' : 'All pages',
            Placement: sigPosition.replace('-', ' ')
          };
          break;
        }

        case 'resize-pdf-pages': {
          finalBlob = await PDFEngine.resizePDFPages(primaryFile, targetPdfPageSize, targetPdfOrientation);
          finalFileName = `resized-${targetPdfPageSize}-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultMetadata = {
            'Target Dimensions': targetPdfPageSize.toUpperCase(),
            Orientation: targetPdfOrientation
          };
          break;
        }

        case 'crop-pdf': {
          finalBlob = await PDFEngine.cropPDF(primaryFile, {
            top: cropTop,
            bottom: cropBottom,
            left: cropLeft,
            right: cropRight
          });
          finalFileName = `cropped-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultMetadata = {
            'Trim Insets': `Top: ${cropTop}pt, Bottom: ${cropBottom}pt, Left: ${cropLeft}pt, Right: ${cropRight}pt`
          };
          break;
        }

        case 'repair-pdf': {
          const repRes = await PDFEngine.repairPDF(primaryFile);
          finalBlob = repRes.blob;
          finalFileName = `repaired-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultMetadata = {
            'Salvaged Pages': repRes.salvagedPages,
            Diagnostics: repRes.status
          };
          break;
        }

        case 'unlock-pdf': {
          const unlockRes = await PDFEngine.unlockPDF(primaryFile, unlockPassword.trim() || undefined);
          finalBlob = unlockRes.blob;
          finalFileName = `unlocked-${primaryFile.name}`;
          newSize = finalBlob.size;
          resultPageCount = unlockRes.method === 'rasterized' ? unlockRes.pageCount : undefined;
          resultMetadata = { Status: unlockRes.note };
          break;
        }

        // --- CONVERTERS ---
        case 'pdf-to-jpg': {
          const res = await RenderEngine.convertPDFToImages(primaryFile, 'image/jpeg');
          finalBlob = res.blob;
          finalFileName = res.fileName;
          newSize = finalBlob.size;
          break;
        }

        case 'pdf-to-png': {
          const res = await RenderEngine.convertPDFToImages(primaryFile, 'image/png');
          finalBlob = res.blob;
          finalFileName = res.fileName;
          newSize = finalBlob.size;
          break;
        }

        case 'jpg-to-pdf':
        case 'png-to-pdf':
        case 'image-to-pdf': {
          const rawImgs = files.map((f) => f.file);
          finalBlob = await PDFEngine.imagesToPDF(rawImgs, {
            pageSize: imgPdfPageSize,
            orientation: imgPdfOrientation,
            margin: imgPdfMargin
          });
          finalFileName = 'converted-images.pdf';
          newSize = finalBlob.size;
          break;
        }

        case 'pdf-to-word': {
          const wordRes = await ConversionEngine.pdfToWord(primaryFile);
          finalBlob = wordRes.blob;
          finalFileName = wordRes.fileName;
          extractedText = wordRes.textPreview;
          newSize = finalBlob.size;
          break;
        }

        case 'word-to-pdf': {
          finalBlob = await ConversionEngine.textToPDF(primaryFile);
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}.pdf`;
          newSize = finalBlob.size;
          break;
        }

        case 'pdf-to-excel': {
          const excelRes = await ConversionEngine.pdfToExcel(primaryFile);
          finalBlob = excelRes.blob;
          finalFileName = excelRes.fileName;
          newSize = finalBlob.size;
          break;
        }

        case 'excel-to-pdf': {
          finalBlob = await ConversionEngine.excelToPDF(primaryFile);
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}.pdf`;
          newSize = finalBlob.size;
          break;
        }

        case 'powerpoint-to-pdf': {
          finalBlob = await ConversionEngine.presentationToPDF(primaryFile);
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}-slides.pdf`;
          newSize = finalBlob.size;
          break;
        }

        case 'pdf-to-powerpoint': {
          const pptRes = await ConversionEngine.pdfToPowerPoint(primaryFile);
          finalBlob = pptRes.blob;
          finalFileName = pptRes.fileName;
          newSize = finalBlob.size;
          break;
        }

        // --- IMAGE TOOLS ---
        case 'compress-image': {
          const compImg = await ImageEngine.compressImage(primaryFile, imgQuality, imgFormat);
          finalBlob = compImg.blob;
          finalFileName = `compressed-${primaryFile.name.replace(/\.[^/.]+$/, '')}.${compImg.format}`;
          newSize = compImg.newSize;
          reductionPercent = compImg.reductionPercentage;
          break;
        }

        case 'resize-image': {
          const resized = await ImageEngine.resizeImage(primaryFile, imgWidth, imgHeight, imgFormat);
          finalBlob = resized.blob;
          finalFileName = `resized-${imgWidth}x${imgHeight}-${primaryFile.name}`;
          newSize = resized.newSize;
          break;
        }

        case 'jpg-to-png': {
          const c = await ImageEngine.convertFormat(primaryFile, 'image/png');
          finalBlob = c.blob;
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}.png`;
          newSize = c.newSize;
          break;
        }

        case 'png-to-jpg':
        case 'webp-to-jpg': {
          const c = await ImageEngine.convertFormat(primaryFile, 'image/jpeg');
          finalBlob = c.blob;
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}.jpg`;
          newSize = c.newSize;
          break;
        }

        case 'jpg-to-webp':
        case 'png-to-webp': {
          const c = await ImageEngine.convertFormat(primaryFile, 'image/webp');
          finalBlob = c.blob;
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}.webp`;
          newSize = c.newSize;
          reductionPercent = c.reductionPercentage;
          break;
        }

        // --- OCR TOOLS ---
        case 'image-to-text': {
          setStatusMessage('Running character recognition...');
          const ocr = await OCREngine.recognizeImage(primaryFile, (p, msg) => {
            setProgressPercent(Math.round(p * 100));
            setStatusMessage(msg);
          });
          finalBlob = ocr.txtBlob;
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}-ocr.txt`;
          extractedText = ocr.text;
          newSize = finalBlob.size;
          break;
        }

        case 'pdf-to-text':
        case 'text-extractor': {
          setStatusMessage('Decoding text streams...');
          const ext = await OCREngine.extractPDFText(primaryFile, (curr, tot) => {
            setProgressPercent(Math.round((curr / tot) * 90));
          });
          finalBlob = ext.txtBlob;
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}-text.txt`;
          extractedText = ext.text;
          newSize = finalBlob.size;
          break;
        }

        case 'scanned-pdf-ocr': {
          setStatusMessage('Running OCR on scanned pages...');
          const scanned = await OCREngine.recognizeScannedPDF(primaryFile, (p, msg) => {
            setProgressPercent(Math.round(p * 100));
            setStatusMessage(msg);
          });
          finalBlob = scanned.txtBlob;
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}-scanned-ocr.txt`;
          extractedText = scanned.text;
          newSize = finalBlob.size;
          break;
        }

        // --- UTILITY TOOLS ---
        case 'word-counter':
        case 'character-counter': {
          const stats = analyzeText(utilityText);
          effectiveOriginalSize = new Blob([utilityText]).size;

          const reportLines = [
            `${tool.name} Report`,
            `Generated: ${new Date().toLocaleString()}`,
            '',
            `Words: ${stats.words}`,
            `Characters (with spaces): ${stats.characters}`,
            `Characters (no spaces): ${stats.charactersNoSpaces}`,
            `Sentences: ${stats.sentences}`,
            `Paragraphs: ${stats.paragraphs}`,
            `Estimated reading time: ${stats.readingTime}`,
            `Estimated speaking time: ${stats.speakingTime}`,
            '',
            stats.topKeywords.length > 0
              ? `Top keywords: ${stats.topKeywords.map((k) => `${k.word} (${k.count}, ${k.percentage}%)`).join(', ')}`
              : '',
            '',
            '--- Original Text ---',
            utilityText
          ].filter((l) => l !== undefined);

          finalBlob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8;' });
          finalFileName = `${tool.id}-report.txt`;
          newSize = finalBlob.size;
          extractedText = reportLines.slice(0, 10).join('\n');
          resultMetadata = {
            Words: stats.words,
            Characters: stats.characters,
            Sentences: stats.sentences,
            'Reading time': stats.readingTime
          };
          break;
        }

        case 'pdf-page-counter': {
          const info = await PDFEngine.inspectPDF(primaryFile);
          resultPageCount = info.pageCount;
          resultMetadata = {
            Pages: info.pageCount,
            ...(info.title ? { Title: info.title } : {}),
            ...(info.author ? { Author: info.author } : {}),
            ...(info.creator ? { Creator: info.creator } : {}),
            ...(info.producer ? { Producer: info.producer } : {}),
            ...(info.creationDate ? { Created: info.creationDate } : {}),
            ...(info.dimensions ? { Dimensions: `${info.dimensions.width} x ${info.dimensions.height} pt` } : {}),
            ...(info.pdfVersion ? { 'PDF Version': info.pdfVersion } : {}),
            ...(info.keywords ? { Keywords: info.keywords } : {}),
            Encrypted: info.encrypted ? 'Yes (some metadata is hidden)' : 'No'
          };

          const reportLines = [
            `PDF Page Count & Metadata Report`,
            `File: ${primaryFile.name}`,
            '',
            ...Object.entries(resultMetadata).map(([k, v]) => `${k}: ${v}`)
          ];

          finalBlob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8;' });
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}-page-info.txt`;
          newSize = finalBlob.size;
          extractedText = reportLines.join('\n');
          break;
        }

        case 'file-size-checker': {
          const bytes = primaryFile.size;
          resultMetadata = {
            'Exact bytes': formatExactBytes(bytes),
            Kilobytes: `${(bytes / 1024).toFixed(2)} KB`,
            Megabytes: `${(bytes / (1024 * 1024)).toFixed(3)} MB`,
            'Gmail limit (25MB)': bytes <= 25 * 1024 * 1024 ? 'Within limit' : 'Exceeds limit',
            'Outlook limit (20MB)': bytes <= 20 * 1024 * 1024 ? 'Within limit' : 'Exceeds limit'
          };

          const reportLines = [
            `File Size Report`,
            `File: ${primaryFile.name}`,
            '',
            ...Object.entries(resultMetadata).map(([k, v]) => `${k}: ${v}`)
          ];

          finalBlob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8;' });
          finalFileName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}-size-report.txt`;
          newSize = finalBlob.size;
          extractedText = reportLines.join('\n');
          break;
        }

        default: {
          // Fallback generic PDF copy
          finalBlob = new Blob([await primaryFile.arrayBuffer()], { type: primaryFile.type });
          finalFileName = primaryFile.name;
          newSize = finalBlob.size;
        }
      }

      setProcessingState('finalizing');
      setProgressPercent(95);
      setStatusMessage('Generating secure download package...');

      const downloadUrl = URL.createObjectURL(finalBlob);

      setTimeout(() => {
        setProcessingState('completed');
        setProgressPercent(100);
        setStatusMessage('Complete!');

        setResult({
          fileName: finalFileName,
          blob: finalBlob,
          downloadUrl,
          originalSize: effectiveOriginalSize,
          newSize,
          reductionPercentage: reductionPercent,
          extractedText,
          pageCount: resultPageCount,
          metadata: resultMetadata
        });

        // Track job in anonymous audit analytics
        AnalyticsService.trackJob({
          toolSlug: tool.slug,
          toolName: tool.name,
          originalSize: effectiveOriginalSize,
          processedSize: newSize,
          durationMs: Date.now() - startTime,
          status: 'completed'
        });
      }, 300);
    } catch (err: any) {
      console.error('Processing error:', err);
      setProcessingState('error');
      const message =
        err instanceof PDFPasswordError
          ? tool.id === 'unlock-pdf'
            ? err.message + ' Enter it in the password field above and try again.'
            : err.message + ' This tool cannot prompt for a password — use Unlock PDF first, then re-upload the result here.'
          : err.message || 'We could not process this file. Please make sure the file is valid and try again.';
      setErrorMessage(message);

      AnalyticsService.trackJob({
        toolSlug: tool.slug,
        toolName: tool.name,
        originalSize: totalOriginalSize,
        processedSize: 0,
        durationMs: Date.now() - startTime,
        status: 'failed',
        errorMessage: err.message
      });
    }
  };

  const Icon = getToolIcon(tool.iconName);

  // Text analysis for word-counter and character-counter
  const textStats = analyzeText(utilityText);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <button onClick={() => onNavigate('/')} className="hover:text-slate-300 transition-colors">
              Home
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <button
              onClick={() => onNavigate(`/tools?cat=${tool.category}`)}
              className="capitalize hover:text-slate-300 transition-colors"
            >
              {categoryLabel(tool.category)}
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-slate-300">
            {tool.name}
          </li>
        </ol>
      </nav>

      {/* Tool Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-300">
          <Icon className="h-3.5 w-3.5 text-indigo-400" />
          <span className="capitalize">{tool.category} Tool</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          {tool.metaH1}
        </h1>

        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          {tool.detailedDescription}
        </p>
      </div>

      {/* Main Interactive Tool Workplace Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Error message alert */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Notice: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* If result is ready, display ResultCard */}
        {result ? (
          <ResultCard
            result={result}
            onReset={resetState}
          />
        ) : processingState !== 'idle' && processingState !== 'error' ? (
          /* Processing State Visualizer */
          <ProgressBar
            state={processingState}
            progressPercent={progressPercent}
            customMessage={statusMessage}
          />
        ) : (
          /* Tool Configuration & Upload State */
          <div className="space-y-6">
            {/* Special Utility Layout: Word Counter & Character Counter */}
            {['word-counter', 'character-counter'].includes(tool.id) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>Type or paste your text below:</span>
                  {utilityText && (
                    <button
                      onClick={() => setUtilityText('')}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Clear Text
                    </button>
                  )}
                </div>

                <textarea
                  rows={8}
                  value={utilityText}
                  onChange={(e) => setUtilityText(e.target.value)}
                  placeholder="Paste or write your document text here..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-sans"
                />

                {/* Live Statistics Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 text-center">
                    <span className="text-[11px] font-medium text-slate-400">Words</span>
                    <p className="text-xl font-bold text-white mt-0.5">{textStats.words}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 text-center">
                    <span className="text-[11px] font-medium text-slate-400">Characters</span>
                    <p className="text-xl font-bold text-indigo-400 mt-0.5">{textStats.characters}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 text-center">
                    <span className="text-[11px] font-medium text-slate-400">Sentences</span>
                    <p className="text-xl font-bold text-slate-200 mt-0.5">{textStats.sentences}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 text-center">
                    <span className="text-[11px] font-medium text-slate-400">Reading Time</span>
                    <p className="text-xs font-bold text-emerald-400 mt-1.5">{textStats.readingTime}</p>
                  </div>
                </div>

                {/* Additional Metrics */}
                {tool.id === 'word-counter' && textStats.topKeywords.length > 0 && (
                  <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Top Keyword Density:</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {textStats.topKeywords.map((kw) => (
                        <span
                          key={kw.word}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 border border-slate-700/60"
                        >
                          <span className="font-semibold text-indigo-400">{kw.word}</span>: {kw.count} ({kw.percentage}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Character Counter Case Converters */}
                {tool.id === 'character-counter' && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setUtilityText((t) => t.toUpperCase())}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                    >
                      UPPERCASE
                    </button>
                    <button
                      type="button"
                      onClick={() => setUtilityText((t) => t.toLowerCase())}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                    >
                      lowercase
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setUtilityText((t) =>
                          t.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
                        )
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                    >
                      Title Case
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Standard File Upload Area */
              <FileUploader
                tool={tool}
                files={files}
                onFilesChanged={setFiles}
                onError={setErrorMessage}
              />
            )}

            {/* Tool-Specific Options Panel */}
            {files.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tool Configuration
                </h4>

                {/* 1. Split PDF Options */}
                {tool.id === 'split-pdf' && (
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="splitMode"
                          checked={splitMode === 'all_pages'}
                          onChange={() => setSplitMode('all_pages')}
                          className="accent-indigo-600"
                        />
                        Extract All Pages (ZIP bundle)
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="splitMode"
                          checked={splitMode === 'custom_ranges'}
                          onChange={() => setSplitMode('custom_ranges')}
                          className="accent-indigo-600"
                        />
                        Custom Page Ranges
                      </label>
                    </div>

                    {splitMode === 'custom_ranges' && (
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">
                          Enter page ranges (e.g. 1-3, 5):
                        </label>
                        <input
                          type="text"
                          value={splitRange}
                          onChange={(e) => setSplitRange(e.target.value)}
                          placeholder="e.g. 1-2, 4"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Compress PDF Options */}
                {tool.id === 'compress-pdf' && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { id: 'high', label: 'High Compression', desc: 'Maximum size reduction, good quality' },
                      { id: 'recommended', label: 'Recommended', desc: 'Optimal balance of quality & size' },
                      { id: 'low', label: 'Low Compression', desc: 'Minimal compression, best quality' }
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setCompressLevel(opt.id as any)}
                        className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                          compressLevel === opt.id
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              compressLevel === opt.id ? 'bg-indigo-400' : 'bg-slate-700'
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400 leading-snug">{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Image to PDF Layout Options */}
                {['jpg-to-pdf', 'png-to-pdf', 'image-to-pdf'].includes(tool.id) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Page Size</label>
                      <select
                        value={imgPdfPageSize}
                        onChange={(e) => setImgPdfPageSize(e.target.value as any)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="a4">A4 (Standard)</option>
                        <option value="letter">US Letter</option>
                        <option value="fit">Fit to Image</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Orientation</label>
                      <select
                        value={imgPdfOrientation}
                        onChange={(e) => setImgPdfOrientation(e.target.value as any)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Margins</label>
                      <select
                        value={imgPdfMargin}
                        onChange={(e) => setImgPdfMargin(e.target.value as any)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="none">No Margin</option>
                        <option value="small">Small Margin</option>
                        <option value="large">Large Margin</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. Compress Image Options */}
                {tool.id === 'compress-image' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Quality Level: {Math.round(imgQuality * 100)}%</span>
                        <span className="text-indigo-400">
                          {imgQuality < 0.4 ? 'Aggressive' : imgQuality < 0.8 ? 'Balanced' : 'High Quality'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.95"
                        step="0.05"
                        value={imgQuality}
                        onChange={(e) => setImgQuality(parseFloat(e.target.value))}
                        className="mt-2 w-full accent-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">Target Format:</span>
                      {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setImgFormat(fmt)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase ${
                            imgFormat === fmt ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {fmt.split('/')[1]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Resize Image Options */}
                {tool.id === 'resize-image' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-slate-400">Width (pixels)</label>
                        <input
                          type="number"
                          value={imgWidth}
                          onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Height (pixels)</label>
                        <input
                          type="number"
                          value={imgHeight}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockAspect}
                        onChange={(e) => setLockAspect(e.target.checked)}
                        className="rounded accent-indigo-600"
                      />
                      Lock Aspect Ratio ({Math.round(aspectRatio * 100) / 100}:1)
                    </label>
                  </div>
                )}

                {/* 6. PDF Page Counter Metadata Inspection */}
                {tool.id === 'pdf-page-counter' && (
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>File verified: <span className="font-semibold text-white">{files[0]?.name}</span></p>
                    <p>Ready to inspect document properties, page count, and dimensions.</p>
                  </div>
                )}

                {/* 7. File Size Checker Diagnostics */}
                {tool.id === 'file-size-checker' && files[0] && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="rounded-lg bg-slate-900 p-2.5">
                        <span className="text-[10px] text-slate-400">Exact Bytes</span>
                        <p className="text-xs font-mono font-bold text-white">{formatExactBytes(files[0].size)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900 p-2.5">
                        <span className="text-[10px] text-slate-400">Kilobytes</span>
                        <p className="text-xs font-mono font-bold text-white">{(files[0].size / 1024).toFixed(2)} KB</p>
                      </div>
                      <div className="rounded-lg bg-slate-900 p-2.5">
                        <span className="text-[10px] text-slate-400">Megabytes</span>
                        <p className="text-xs font-mono font-bold text-indigo-400">{(files[0].size / (1024 * 1024)).toFixed(3)} MB</p>
                      </div>
                      <div className="rounded-lg bg-slate-900 p-2.5">
                        <span className="text-[10px] text-slate-400">Gmail Limit</span>
                        <p className={`text-xs font-bold ${files[0].size <= 25 * 1024 * 1024 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {files[0].size <= 25 * 1024 * 1024 ? 'Within Limit (25MB)' : 'Exceeds Gmail Limit'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                                {/* 8. Page Number PDF Options */}
                {tool.id === 'page-number-pdf' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Position</label>
                      <select
                        value={pageNumPosition}
                        onChange={(e) => setPageNumPosition(e.target.value as any)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Numbering Format</label>
                      <select
                        value={pageNumFormat}
                        onChange={(e) => setPageNumFormat(e.target.value as any)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="page_x_of_y">Page 1 of N</option>
                        <option value="x_of_y">1 / N</option>
                        <option value="x">1 (Number only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">First Page Number</label>
                      <input
                        type="number"
                        min="1"
                        value={pageNumStart}
                        onChange={(e) => setPageNumStart(parseInt(e.target.value, 10) || 1)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 9. Watermark PDF Options */}
                {tool.id === 'watermark-pdf' && (
                  <div className="space-y-4">
                    <div className="flex gap-4 border-b border-slate-800 pb-3">
                      <button
                        type="button"
                        onClick={() => setWmType('text')}
                        className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                          wmType === 'text' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        Text Stamp
                      </button>
                      <button
                        type="button"
                        onClick={() => setWmType('image')}
                        className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                          wmType === 'image' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        Logo / Image Watermark
                      </button>
                    </div>

                    {wmType === 'text' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400">Watermark Text</label>
                          <input
                            type="text"
                            value={wmText}
                            onChange={(e) => setWmText(e.target.value)}
                            placeholder="e.g. CONFIDENTIAL, DRAFT"
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-400">Stamp Color</label>
                          <div className="mt-1 flex gap-2">
                            {(['gray', 'red', 'blue', 'black'] as const).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setWmColor(c)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                                  wmColor === c ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400">Upload Watermark Image (PNG recommended)</label>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setWmImageFile(e.target.files[0]);
                            }
                          }}
                          className="mt-1 block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
                        />
                        {wmImageFile && (
                          <p className="mt-1 text-[11px] text-emerald-400 font-medium">Loaded: {wmImageFile.name}</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Opacity: {Math.round(wmOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.8"
                          step="0.05"
                          value={wmOpacity}
                          onChange={(e) => setWmOpacity(parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Rotation Angle</span>
                        <div className="flex gap-2">
                          {[0, 45, 90].map((deg) => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => setWmRotation(deg)}
                              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                                wmRotation === deg ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {deg}° {deg === 45 ? '(Diagonal)' : deg === 0 ? '(Horizontal)' : '(Vertical)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. Edit PDF Metadata Options */}
                {tool.id === 'edit-pdf-metadata' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Document Title</label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="e.g. Annual Financial Report"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Author / Creator</label>
                      <input
                        type="text"
                        value={metaAuthor}
                        onChange={(e) => setMetaAuthor(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Subject</label>
                      <input
                        type="text"
                        value={metaSubject}
                        onChange={(e) => setMetaSubject(e.target.value)}
                        placeholder="e.g. Financial Summary"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Keywords (comma-separated)</label>
                      <input
                        type="text"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                        placeholder="e.g. finance, 2026, report"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 11. Flatten PDF Options */}
                {tool.id === 'flatten-pdf' && (
                  <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-slate-300">
                    <FileCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-white">Flatten Form Fields & Annotations</p>
                      <p className="text-slate-400 leading-relaxed">
                        This tool merges all interactive form elements, checkboxes, radio selections, and comments directly into the base PDF vector layer, making them completely immutable and viewable across all devices.
                      </p>
                    </div>
                  </div>
                )}

                {/* 12. Sign PDF Canvas & Placement Options */}
                {tool.id === 'sign-pdf' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-300">Draw Your Signature:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSigPenColor('#1e3a8a')}
                            className={`h-4 w-4 rounded-full bg-blue-900 border ${sigPenColor === '#1e3a8a' ? 'ring-2 ring-indigo-400' : 'border-slate-600'}`}
                            title="Blue ink"
                          />
                          <button
                            type="button"
                            onClick={() => setSigPenColor('#000000')}
                            className={`h-4 w-4 rounded-full bg-black border ${sigPenColor === '#000000' ? 'ring-2 ring-indigo-400' : 'border-slate-600'}`}
                            title="Black ink"
                          />
                          <button
                            type="button"
                            onClick={clearSignatureCanvas}
                            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 ml-2"
                          >
                            <Eraser className="h-3.5 w-3.5" /> Clear
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border-2 border-dashed border-slate-700 bg-white p-1 overflow-hidden shadow-inner cursor-crosshair">
                        <canvas
                          ref={canvasRef}
                          width={440}
                          height={140}
                          className="w-full h-28 touch-none block"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">Sign with mouse, trackpad, or finger on mobile</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400">Stamp Placement</label>
                        <select
                          value={sigPosition}
                          onChange={(e) => setSigPosition(e.target.value as any)}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                        >
                          <option value="bottom-right">Bottom Right (Standard)</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-center">Bottom Center</option>
                          <option value="center">Center of Page</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400">Target Page</label>
                        <select
                          value={sigTargetPage}
                          onChange={(e) => setSigTargetPage(e.target.value as any)}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                        >
                          <option value="last">Last Page (Recommended)</option>
                          <option value="first">First Page</option>
                          <option value="all">Every Page</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 13. Resize PDF Pages Options */}
                {tool.id === 'resize-pdf-pages' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Target Paper Size</label>
                      <select
                        value={targetPdfPageSize}
                        onChange={(e) => setTargetPdfPageSize(e.target.value as any)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="a4">A4 (Standard Global, 210 × 297 mm)</option>
                        <option value="letter">US Letter (8.5 × 11 in)</option>
                        <option value="legal">US Legal (8.5 × 14 in)</option>
                        <option value="a3">A3 (297 × 420 mm)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Page Orientation</label>
                      <select
                        value={targetPdfOrientation}
                        onChange={(e) => setTargetPdfOrientation(e.target.value as any)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                        <option value="match">Match Existing Aspect Ratio</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 14. Crop PDF Pages Options */}
                {tool.id === 'crop-pdf' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Trim Margins (points, 72 pt = 1 inch):</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setCropTop(18); setCropBottom(18); setCropLeft(18); setCropRight(18); }}
                          className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700"
                        >
                          Light (18pt)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCropTop(36); setCropBottom(36); setCropLeft(36); setCropRight(36); }}
                          className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700"
                        >
                          Medium (36pt)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400">Top (pt)</label>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          value={cropTop}
                          onChange={(e) => setCropTop(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Bottom (pt)</label>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          value={cropBottom}
                          onChange={(e) => setCropBottom(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Left (pt)</label>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          value={cropLeft}
                          onChange={(e) => setCropLeft(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Right (pt)</label>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          value={cropRight}
                          onChange={(e) => setCropRight(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 15. Repair PDF Diagnostics */}
                {tool.id === 'repair-pdf' && (
                  <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-slate-300">
                    <Wrench className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-white">Reconstruct Damaged PDF Stream</p>
                      <p className="text-slate-400 leading-relaxed">
                        The repair engine will parse the document using lenient error-recovery mode, rebuild missing cross-reference tables (XREF), salvage readable pages, and output a validated PDF standard document.
                      </p>
                    </div>
                  </div>
                )}

                {/* 16. Unlock PDF Diagnostics */}
                {tool.id === 'unlock-pdf' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-slate-300">
                      <Unlock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold text-white">Clear Document Restrictions</p>
                        <p className="text-slate-400 leading-relaxed">
                          Removes owner restrictions on printing, copying, or editing. If a file merely restricts
                          permissions, the original is rebuilt unencrypted with text intact. If the PDF requires a
                          password just to <em>open</em> it, enter that password below — the result is rebuilt from
                          page images, so text will no longer be selectable.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">
                        Password (only if this PDF asks for one to open)
                      </label>
                      <input
                        type="password"
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        placeholder="Leave blank if the PDF just opens restricted"
                        autoComplete="off"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Page Thumbnail View for Page Manipulation Tools */}
                {loadingPages && pdfPages.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    <p className="text-xs font-medium text-slate-400">Rendering page previews…</p>
                  </div>
                )}
                {pdfPages.length > 0 && (
                  <div className="pt-2">
                    <PageThumbnailGrid
                      pages={pdfPages}
                      mode={
                        tool.id === 'rotate-pdf'
                          ? 'rotate'
                          : tool.id === 'delete-pdf-pages'
                          ? 'delete'
                          : tool.id === 'extract-pdf-pages'
                          ? 'extract'
                          : 'reorder'
                      }
                      onRotatePage={handleRotateSinglePage}
                      onRotateAll={handleRotateAll}
                      onToggleSelect={handleToggleSelectPage}
                      onSelectAll={handleSelectAllPages}
                      onDeselectAll={handleDeselectAllPages}
                      onMovePage={handleMovePage}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Main Action Trigger Button */}
            {(!['word-counter', 'character-counter'].includes(tool.id) || utilityText) && (
              <button
                type="button"
                onClick={handleExecuteProcessing}
                disabled={files.length === 0 && !utilityText}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                <Icon className="h-5 w-5" />
                Process & {tool.name}
              </button>
            )}
          </div>
        )}
      </div>

      {/* SEO Content: How It Works */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-white">
          How to Use {tool.name}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tool.steps.map((st) => (
            <div key={st.step} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                {st.step}
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-white">{st.title}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{st.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-white">Key Features</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tool.features.map((feat, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-indigo-400">{feat.title}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <FAQAccordion faqs={tool.faqs} />

      {/* Related Tools */}
      <RelatedTools
        currentSlug={tool.slug}
        relatedSlugs={tool.relatedToolSlugs}
        onNavigate={(path) => onNavigate(path.startsWith('/') ? path : `/${path}`)}
      />
    </div>
  );
};
