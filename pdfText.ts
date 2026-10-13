import type { PDFFont } from 'pdf-lib';

/**
 * pdf-lib's built-in fonts (Helvetica etc.) only cover the WinAnsi character set.
 * Drawing anything else (tabs, arrows, emoji, Arabic/Urdu/CJK text, zero-width
 * spaces …) makes pdf-lib throw, which used to abort the whole conversion.
 *
 * This helper maps what can be mapped, drops invisible characters, and replaces
 * the rest with "?" while reporting which characters were lost so the UI can
 * tell the user instead of failing or silently corrupting the output.
 */

// Characters that are invisible or harmful in a PDF text run.
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u00AD\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g;

// Readable ASCII stand-ins for common symbols that WinAnsi lacks.
const TRANSLITERATIONS: Array<[RegExp, string]> = [
  [/\t/g, '    '],
  [/[\u2190\u21D0]/g, '<-'],
  [/[\u2192\u21D2]/g, '->'],
  [/\u2194/g, '<->'],
  [/[\u2010\u2011\u2012\u2212]/g, '-'],
  [/\u2015/g, '\u2014'],
  [/\u2032/g, "'"],
  [/\u2033/g, '"'],
  [/[\u2264]/g, '<='],
  [/[\u2265]/g, '>='],
  [/\u2260/g, '!='],
  [/[\u2713\u2714]/g, 'v'],
  [/[\u2715\u2716]/g, 'x'],
  [/[\u25CF\u25CB\u25AA\u25A0\u25E6\u2023]/g, '\u2022'],
  [/\u00A0/g, ' '],
  [/\u2007|\u2009|\u200A|\u202F|\u2002|\u2003|\u2004|\u2005|\u2006|\u2008/g, ' ']
];

export interface SafeTextResult {
  text: string;
  /** Unique characters that could not be drawn and were replaced with "?". */
  unsupported: string[];
}

export interface WinAnsiSanitizer {
  sanitize: (input: string) => string;
  /** Unique characters replaced with "?" across every sanitize() call so far. */
  unsupported: () => string[];
}

export function createWinAnsiSanitizer(font: PDFFont): WinAnsiSanitizer {
  const encodable = new Map<string, boolean>();
  const lost = new Set<string>();

  const canEncode = (ch: string): boolean => {
    const cached = encodable.get(ch);
    if (cached !== undefined) return cached;
    let ok = true;
    try {
      font.encodeText(ch);
    } catch {
      ok = false;
    }
    encodable.set(ch, ok);
    return ok;
  };

  const mapChar = (ch: string): string => {
    if (canEncode(ch)) return ch;
    // Try stripping accents (e.g. "ā" -> "a") before giving up.
    const base = ch.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    if (base && base !== ch && Array.from(base).every(canEncode)) return base;
    lost.add(ch);
    return '?';
  };

  const sanitize = (input: string): string => {
    let text = input.replace(INVISIBLE, '');
    for (const [pattern, replacement] of TRANSLITERATIONS) {
      text = text.replace(pattern, replacement);
    }
    let out = '';
    for (const ch of text) {
      out += ch === '\n' || ch === '\r' ? ch : mapChar(ch);
    }
    return out;
  };

  return { sanitize, unsupported: () => Array.from(lost) };
}

/** Convenience wrapper for one-off strings. */
export function toWinAnsiSafe(font: PDFFont, input: string): SafeTextResult {
  const s = createWinAnsiSanitizer(font);
  const text = s.sanitize(input);
  return { text, unsupported: s.unsupported() };
}

/** Short human-readable note about characters that were replaced, or null. */
export function describeUnsupported(chars: string[]): string | null {
  if (chars.length === 0) return null;
  const shown = chars.slice(0, 8).join(' ');
  const more = chars.length > 8 ? ` and ${chars.length - 8} more` : '';
  return `Some characters (${shown}${more}) are outside the built-in PDF font and were replaced with "?". Latin-script text is fully supported.`;
}

/**
 * Word-wrap a single line of text to `maxWidth`, hard-breaking words that are
 * wider than the whole line (long URLs, base64, etc.) so nothing runs off the page.
 * Always returns at least one (possibly empty) line.
 */
export function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (text.trim() === '') return [''];

  const lines: string[] = [];
  let current = '';

  const pushHardBroken = (word: string) => {
    let chunk = '';
    for (const ch of word) {
      if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk += ch;
      }
    }
    return chunk;
  };

  for (const word of text.split(' ')) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
    } else {
      current = pushHardBroken(word);
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}
