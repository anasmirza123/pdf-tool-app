import { ToolDefinition } from '../types';

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bin', '.app', '.com', '.msi',
  '.scr', '.pif', '.application', '.gadget', '.vbs', '.js', '.jse',
  '.ws', '.wsf', '.wsc', '.wsh', '.ps1', '.ps1xml', '.ps2', '.msh',
  '.jar', '.py', '.php', '.pl', '.cgi'
]);

export interface ValidationResult {
  valid: boolean;
  errorMessage?: string;
}

export function validateUploadedFiles(files: File[], tool: ToolDefinition): ValidationResult {
  if (!files || files.length === 0) {
    return { valid: false, errorMessage: 'Please select a file to continue.' };
  }

  if (files.length > tool.maxFiles) {
    return {
      valid: false,
      errorMessage: `You can upload up to ${tool.maxFiles} file${tool.maxFiles > 1 ? 's' : ''} at a time for this tool.`
    };
  }

  const maxBytes = tool.maxFileSizeMB * 1024 * 1024;

  for (const file of files) {
    // 1. Dangerous extension guard
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return {
        valid: false,
        errorMessage: 'Executable or script files are not allowed for security reasons.'
      };
    }

    // 2. File size guard
    if (file.size > maxBytes) {
      return {
        valid: false,
        errorMessage: `"${file.name}" exceeds the maximum allowed file size of ${tool.maxFileSizeMB} MB.`
      };
    }

    // 3. Accepted file type guard (if tool specifies constraints and not wildcard)
    if (!tool.acceptedFileTypes.includes('*')) {
      const allowedExts = tool.acceptedFileTypes.map((t) => t.toLowerCase());
      const hasValidExt = allowedExts.includes(ext);

      // Check MIME type match
      const hasValidMime =
        tool.acceptedMimeTypes.includes('*') ||
        tool.acceptedMimeTypes.some((mime) => {
          if (mime.endsWith('/*')) {
            const prefix = mime.split('/')[0];
            return file.type.startsWith(prefix);
          }
          return file.type === mime;
        });

      if (!hasValidExt && !hasValidMime) {
        return {
          valid: false,
          errorMessage: `"${file.name}" is an unsupported file format. Please upload a valid ${tool.acceptedFileTypes.join(', ')} file.`
        };
      }
    }
  }

  return { valid: true };
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Known binary file signatures ("magic numbers"), checked against the file's actual
// first bytes. Extension and browser-reported MIME type (checked above) are just labels
// supplied by the OS/browser and are trivial to spoof by renaming a file; this reads the
// real header bytes so a renamed/disguised file is caught before it reaches the engines.
// Plain-text formats (.txt, .csv, .tsv, .md, .json) have no fixed signature and are
// intentionally not checked here — they can't carry an executable payload either way.
const SIGNATURES: Record<string, { bytes: Array<number | null>; offset?: number; label: string }[]> = {
  '.pdf': [{ bytes: [0x25, 0x50, 0x44, 0x46, 0x2d], label: 'PDF (%PDF-)' }], // %PDF-
  '.png': [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], label: 'PNG' }],
  '.jpg': [{ bytes: [0xff, 0xd8, 0xff], label: 'JPEG' }],
  '.jpeg': [{ bytes: [0xff, 0xd8, 0xff], label: 'JPEG' }],
  '.webp': [
    { bytes: [0x52, 0x49, 0x46, 0x46], label: 'RIFF' }, // 'RIFF' at offset 0
    { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8, label: 'WEBP' } // 'WEBP' at offset 8
  ],
  // .docx/.xlsx are ZIP containers (Office Open XML); all valid ZIP signatures start with 'PK'
  '.docx': [{ bytes: [0x50, 0x4b], label: 'ZIP/OOXML (PK)' }],
  '.xlsx': [{ bytes: [0x50, 0x4b], label: 'ZIP/OOXML (PK)' }]
};

async function readHeaderBytes(file: File, length: number): Promise<Uint8Array> {
  const buffer = await file.slice(0, length).arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Verify that each file's real header bytes match what its extension claims to be.
 * This is a best-effort content check — it is not a substitute for the engines'
 * own format-specific error handling, but it catches an obviously mismatched or
 * disguised file (e.g. a renamed .exe) before any processing is attempted.
 */
export async function validateFileSignatures(files: File[]): Promise<ValidationResult> {
  for (const file of files) {
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    const candidates = SIGNATURES[ext];
    if (!candidates || candidates.length === 0) continue; // no known signature to check (e.g. plain text)
    if (file.size < 4) {
      return { valid: false, errorMessage: `"${file.name}" is empty or too small to be a valid ${ext} file.` };
    }

    const maxOffset = Math.max(...candidates.map((c) => (c.offset || 0) + c.bytes.length));
    let header: Uint8Array;
    try {
      header = await readHeaderBytes(file, maxOffset);
    } catch {
      continue; // if we can't read it here, let the actual engine report the real error
    }

    const matchesAny = candidates.some((sig) => {
      const start = sig.offset || 0;
      if (header.length < start + sig.bytes.length) return false;
      return sig.bytes.every((b, i) => b === null || header[start + i] === b);
    });

    if (!matchesAny) {
      return {
        valid: false,
        errorMessage: `"${file.name}" has a .${ext.slice(1)} extension, but its contents don't match a real ${ext} file. Please check the file and try again.`
      };
    }
  }

  return { valid: true };
}
