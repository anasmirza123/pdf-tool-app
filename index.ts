export type ToolCategory = 'pdf' | 'converter' | 'image' | 'ocr' | 'utilities';

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolFeature {
  title: string;
  description: string;
}

export interface ToolDefinition {
  id: string;
  slug: string; // e.g. "merge-pdf"
  name: string;
  category: ToolCategory;
  shortDescription: string;
  detailedDescription: string;
  iconName: string;
  popular?: boolean;
  acceptedFileTypes: string[]; // e.g. [".pdf"], [".jpg", ".png", ".webp"]
  acceptedMimeTypes: string[];
  maxFiles: number;
  maxFileSizeMB: number;
  seoTitle: string;
  seoDescription: string;
  features: ToolFeature[];
  steps: ToolStep[];
  faqs: ToolFAQ[];
  relatedToolSlugs: string[];
  metaH1: string;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  pageCount?: number;
}

export type ProcessingState = 'idle' | 'uploading' | 'analyzing' | 'processing' | 'finalizing' | 'completed' | 'error';

export interface ProcessedResult {
  fileName: string;
  blob: Blob;
  downloadUrl: string;
  originalSize: number;
  newSize: number;
  reductionPercentage?: number;
  pageCount?: number;
  extractedText?: string;
  metadata?: Record<string, string | number>;
  zipItemsCount?: number;
}

export interface PDFPageInfo {
  pageNumber: number; // 1-indexed
  rotation: number; // 0, 90, 180, 270
  selected: boolean;
  thumbnailUrl?: string;
}

export interface ToolUsageStat {
  toolId: string;
  toolName: string;
  count: number;
  bytesProcessed: number;
  successCount: number;
  failCount: number;
  lastUsed: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  content: string[];
  relatedToolSlug: string;
}
