import { NextResponse } from 'next/server';
import { parseDocument } from '@/lib/documents/parser';
import { documentStore } from '@/lib/store';

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

function getFileType(mimeType: string, extension: string): string {
  if (mimeType === 'application/pdf' || extension === 'pdf') return 'pdf';
  if (mimeType === 'text/plain' || extension === 'txt') return 'txt';
  if (mimeType.includes('wordprocessingml') || extension === 'docx') return 'docx';
  if (mimeType.startsWith('image/')) return 'image';
  return 'txt';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_MIME_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported file type: .${extension}. Supported: PDF, TXT, DOCX, PNG, JPG, WEBP` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const fileType = getFileType(file.type, extension);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse document text
    const parsedDoc = await parseDocument(buffer, fileType);

    // Store document
    documentStore.addDocument({
      id,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for display name
      documentType: 'Unknown', // Will be set after analysis
      fileType,
      content: parsedDoc.text,
      pages: parsedDoc.pages,
      pageCount: parsedDoc.pageCount,
      status: 'processing',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id,
      name: file.name,
      pageCount: parsedDoc.pageCount,
      status: 'processing',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file. Please try a different file.' },
      { status: 500 }
    );
  }
}
