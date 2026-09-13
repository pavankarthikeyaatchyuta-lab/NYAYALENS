import { NextResponse } from 'next/server';
import { documentStore } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = documentStore.getDocument(id);

  if (!document) {
    return new NextResponse('Document not found', { status: 404 });
  }

  return NextResponse.json(document);
}
