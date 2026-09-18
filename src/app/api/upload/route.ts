import { NextResponse } from 'next/server';
import { parseDocument } from '@/lib/documents/parser';
import { documentStore } from '@/lib/store';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { sanitizeContractText } from '@/lib/ai/security-guard';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'docx', 'png', 'jpg', 'jpeg', 'webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function sanitizeFileName(name: string): string {
  // Strip paths, null bytes, and malicious script characters
  const baseName = name.replace(/^.*[\\/]/, '').replace(/\0/g, '');
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getFileType(mimeType: string, extension: string): string {
  if (mimeType === 'application/pdf' || extension === 'pdf') return 'pdf';
  if (mimeType === 'text/plain' || extension === 'txt') return 'txt';
  if (mimeType.includes('wordprocessingml') || extension === 'docx') return 'docx';
  if (mimeType.startsWith('image/')) return 'image';
  return 'txt';
}

export async function POST(request: Request) {
  // 1. Rate Limiting Protection
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`upload:${clientIp}`, { limit: 20, windowMs: 60000 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before uploading another document.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString() },
      }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty. Please upload a document with readable content.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeFileName(file.name);
    const extension = sanitizedName.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_MIME_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported file type: .${extension}. Supported: PDF, TXT, DOCX, PNG, JPG, WEBP` },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const fileType = getFileType(file.type, extension);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse document text
    const parsedDoc = await parseDocument(buffer, fileType);

    const cleanText = sanitizeContractText(parsedDoc.text);
    if (!cleanText || cleanText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document contains no extractable or readable text content.' },
        { status: 400 }
      );
    }

    const cleanPages = parsedDoc.pages.map(p => ({
      ...p,
      text: sanitizeContractText(p.text),
    }));

    // Store document
    documentStore.addDocument({
      id,
      name: sanitizedName.replace(/\.[^/.]+$/, ''), // Remove extension for display name
      documentType: 'Unknown',
      fileType,
      content: cleanText,
      pages: cleanPages,
      pageCount: parsedDoc.pageCount || 1,
      status: 'processing',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id,
      name: sanitizedName,
      pageCount: parsedDoc.pageCount || 1,
      status: 'processing',
    });
  } catch (error) {
    // Never expose stack trace or sensitive internals to the user
    console.error('Upload processing error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to process file. Please ensure the document is valid and uncorrupted.' },
      { status: 500 }
    );
  }
}
