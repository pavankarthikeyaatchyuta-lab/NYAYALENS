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
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse');

  const data = await pdfParse(buffer);
  const fullText: string = data.text;

  // Attempt to split by page breaks (pdf-parse uses form feed characters)
  const rawPages = fullText.split(/\f/);
  const pages: DocumentPage[] = rawPages
    .map((text: string, index: number) => ({
      pageNumber: index + 1,
      text: text.trim(),
    }))
    .filter((p: DocumentPage) => p.text.length > 0);

  // If no page breaks found, treat as single page
  if (pages.length === 0) {
    pages.push({ pageNumber: 1, text: fullText.trim() });
  }

  return {
    text: fullText,
    pages,
    pageCount: data.numpages || pages.length,
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
