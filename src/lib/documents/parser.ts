// PDF and document text extraction
import type { DocumentPage } from '@/types';

interface ParsedDocument {
  text: string;
  pages: DocumentPage[];
  pageCount: number;
}

export async function parseDocument(
  buffer: Buffer,
  fileType: string
): Promise<ParsedDocument> {
  switch (fileType) {
    case 'pdf':
      return parsePDF(buffer);
    case 'txt':
      return parsePlainText(buffer);
    case 'docx':
      return parsePlainText(buffer); // Basic fallback — treat as text
    case 'image':
      return parseImageDocument(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

// Ensure DOMMatrix and canvas polyfills for PDF.js in serverless Node and JSDOM environments
function ensurePdfPolyfills() {
  if (typeof globalThis.DOMMatrix === 'undefined') {
    // @ts-expect-error - Polyfill for serverless Node/JSDOM PDF parsing
    globalThis.DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor(init?: string | number[]) {
        if (Array.isArray(init)) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
        }
      }
      transformPoint(point?: { x: number; y: number }) {
        return { x: point?.x ?? 0, y: point?.y ?? 0 };
      }
    };
  }
  if (typeof globalThis.ImageData === 'undefined') {
    // @ts-expect-error - Polyfill for serverless Node/JSDOM PDF parsing
    globalThis.ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
      }
    };
  }
  if (typeof globalThis.Path2D === 'undefined') {
    // @ts-expect-error - Polyfill for serverless Node/JSDOM PDF parsing
    globalThis.Path2D = class Path2D {};
  }
}

async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  ensurePdfPolyfills();

  let pdfModule: Record<string, unknown> | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    pdfModule = require('pdf-parse');
  } catch (loadErr) {
    console.warn('pdf-parse module load error, using native stream extraction fallback:', loadErr instanceof Error ? loadErr.message : 'Unknown');
  }

  if (pdfModule) {
    // Support pdf-parse v2 (class-based)
    // @ts-expect-error - Dynamic version compatibility check
    const PDFParseClass = pdfModule.PDFParse || pdfModule.default?.PDFParse;
    if (PDFParseClass) {
      try {
        const parser = new PDFParseClass({ data: buffer });
        const result = await parser.getText();
        const pages: DocumentPage[] = (result.pages || [])
          .map((p: { text: string; num: number }) => ({
            pageNumber: p.num,
            text: (p.text || '').trim(),
          }))
          .filter((p: DocumentPage) => p.text.length > 0);

        const fullText = (result.text || '').trim() || pages.map(p => p.text).join('\n\n');

        if (pages.length === 0 && fullText.length > 0) {
          pages.push({ pageNumber: 1, text: fullText });
        }

        if (fullText.length > 0) {
          return {
            text: fullText,
            pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }],
            pageCount: result.total || pages.length || 1,
          };
        }
      } catch (parseErr) {
        console.warn('PDFParse class extraction warning:', parseErr instanceof Error ? parseErr.message : 'Unknown');
      }
    }

    // Support pdf-parse v1 (function-based)
    if (typeof pdfModule === 'function') {
      try {
        // @ts-expect-error - Dynamic version compatibility check
        const data = await pdfModule(buffer);
        const fullText: string = (data.text || '').trim();
        const rawPages = fullText.split(/\f/);
        const pages: DocumentPage[] = rawPages
          .map((text: string, index: number) => ({
            pageNumber: index + 1,
            text: text.trim(),
          }))
          .filter((p: DocumentPage) => p.text.length > 0);

        if (pages.length === 0 && fullText.length > 0) {
          pages.push({ pageNumber: 1, text: fullText });
        }

        return {
          text: fullText,
          pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }],
          pageCount: data.numpages || pages.length || 1,
        };
      } catch (fnErr) {
        console.warn('pdf-parse function extraction warning:', fnErr instanceof Error ? fnErr.message : 'Unknown');
      }
    }
  }

  // Resilient text stream regex extraction fallback (for plain/scanned PDFs)
  const rawString = buffer.toString('binary');
  const textMatches: string[] = [];
  const streamRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;
  while ((match = streamRegex.exec(rawString)) !== null) {
    const stringMatches = match[0].match(/\(([^)]+)\)/g);
    if (stringMatches) {
      const clean = stringMatches.map(s => s.slice(1, -1)).join(' ');
      if (clean.trim().length > 0) {
        textMatches.push(clean.trim());
      }
    }
  }

  const fallbackText = textMatches.join('\n\n') || buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
  if (fallbackText.length > 0) {
    return {
      text: fallbackText,
      pages: [{ pageNumber: 1, text: fallbackText }],
      pageCount: 1,
    };
  }

  throw new Error('Could not extract text from PDF document');
}

function parseImageDocument(buffer: Buffer): ParsedDocument {
  const text = `[Scanned Legal Document - Visual Content]\nDocument image encoded (${Math.round(buffer.length / 1024)} KB) for multimodal legal intelligence review.`;
  return {
    text,
    pages: [{ pageNumber: 1, text }],
    pageCount: 1,
  };
}

function parsePlainText(buffer: Buffer): ParsedDocument {
  const text = buffer.toString('utf-8');
  return {
    text,
    pages: [{ pageNumber: 1, text }],
    pageCount: 1,
  };
}

// For image/scanned documents — returns base64 for Gemini multimodal
export function prepareImageForGemini(buffer: Buffer, mimeType: string): {
  base64: string;
  mimeType: string;
} {
  return {
    base64: buffer.toString('base64'),
    mimeType,
  };
}
