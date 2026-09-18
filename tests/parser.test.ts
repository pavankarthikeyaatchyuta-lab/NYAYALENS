import { describe, it, expect } from 'vitest';
import { parseDocument } from '../src/lib/documents/parser';

describe('Document Parser Utility', () => {
  it('should extract plain text from text buffers accurately', async () => {
    const rawText = 'THIS EMPLOYMENT AGREEMENT is entered into as of January 1, 2026.';
    const buffer = Buffer.from(rawText, 'utf-8');

    const result = await parseDocument(buffer, 'txt');
    expect(result.text).toBe(rawText);
    expect(result.pageCount).toBeGreaterThanOrEqual(1);
    expect(result.pages[0].text).toBe(rawText);
  });

  it('should handle multi-line contract text formats', async () => {
    const mdContent = '# Residential Lease Agreement\n\nSection 1: Monthly Rent is INR 45,000.';
    const buffer = Buffer.from(mdContent, 'utf-8');

    const result = await parseDocument(buffer, 'txt');
    expect(result.text).toContain('Residential Lease Agreement');
    expect(result.text).toContain('INR 45,000');
  });

  it('should parse PDF documents using PDFParse v2 and extract pages', async () => {
    const minimalPdf = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 100 700 Td (Hello NyayaLens Legal Assistant) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n307\n%%EOF';
    const buffer = Buffer.from(minimalPdf);

    const result = await parseDocument(buffer, 'pdf');
    expect(result.text).toContain('Hello NyayaLens Legal Assistant');
    expect(result.pageCount).toBeGreaterThanOrEqual(1);
    expect(result.pages.length).toBeGreaterThanOrEqual(1);
  });

  it('should parse image document buffers without errors', async () => {
    const imageBuffer = Buffer.from('fake-image-bytes');
    const result = await parseDocument(imageBuffer, 'image');

    expect(result.text).toContain('[Scanned Legal Document');
    expect(result.pageCount).toBe(1);
    expect(result.pages[0].pageNumber).toBe(1);
  });

  it('should throw descriptive error for unsupported formats', async () => {
    const buffer = Buffer.from('binary data', 'utf-8');
    await expect(parseDocument(buffer, 'unsupported_extension')).rejects.toThrow(
      'Unsupported file type'
    );
  });
});
