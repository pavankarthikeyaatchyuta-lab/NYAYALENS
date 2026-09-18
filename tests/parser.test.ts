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

  it('should throw descriptive error for unsupported formats', async () => {
    const buffer = Buffer.from('binary data', 'utf-8');
    await expect(parseDocument(buffer, 'unsupported_extension')).rejects.toThrow(
      'Unsupported file type'
    );
  });
});
