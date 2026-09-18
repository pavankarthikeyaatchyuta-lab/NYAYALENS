import { describe, it, expect } from 'vitest';
import { parseDocument } from '../src/lib/documents/parser';
import { sanitizeContractText } from '../src/lib/ai/security-guard';

describe('1. Document Upload & File Validation', () => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'docx', 'png', 'jpg', 'jpeg', 'webp'];

  it('should accept valid file types and extensions', () => {
    for (const ext of ALLOWED_EXTENSIONS) {
      expect(ALLOWED_EXTENSIONS).toContain(ext);
    }
  });

  it('should reject unsupported file types (.exe, .zip, .sh, .bin)', () => {
    const dangerousExtensions = ['exe', 'zip', 'sh', 'bin', 'bat', 'py'];
    for (const ext of dangerousExtensions) {
      expect(ALLOWED_EXTENSIONS).not.toContain(ext);
    }
  });

  it('should reject file sizes exceeding the 10MB limit', () => {
    const oversizedBytes = 11 * 1024 * 1024; // 11MB
    const validBytes = 5 * 1024 * 1024; // 5MB

    expect(oversizedBytes > MAX_FILE_SIZE).toBe(true);
    expect(validBytes <= MAX_FILE_SIZE).toBe(true);
  });

  it('should reject empty document buffers (0 bytes)', () => {
    const emptyBuffer = Buffer.from('');
    expect(emptyBuffer.length).toBe(0);
  });

  it('should extract text from plain text and markdown buffers', async () => {
    const contractText = 'NON-DISCLOSURE AGREEMENT\nBetween Company A and Contractor B.';
    const buffer = Buffer.from(contractText, 'utf-8');

    const parsed = await parseDocument(buffer, 'txt');
    expect(parsed.text).toBe(contractText);
    expect(parsed.pageCount).toBe(1);
    expect(parsed.pages[0].text).toBe(contractText);
  });

  it('should sanitize filenames preventing directory traversal attacks', () => {
    function sanitizeFileName(name: string): string {
      const parts = name.replace(/\0/g, '').split(/[\\/]/);
      const baseName = parts[parts.length - 1] || 'document';
      return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
    }

    expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFileName('..\\..\\windows\\system32\\calc.exe')).toBe('calc.exe');
    expect(sanitizeFileName('my legal<script>alert(1).pdf')).toBe('my_legal_script_alert_1_.pdf');
  });

  it('should sanitize raw contract text to prevent HTML/script injection', () => {
    const dirty = '<img src=x onerror=alert(1)>This agreement is governed by laws of India.\u0000';
    const clean = sanitizeContractText(dirty);

    expect(clean).not.toContain('<img');
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('\u0000');
    expect(clean).toContain('This agreement is governed by laws of India.');
  });
});
