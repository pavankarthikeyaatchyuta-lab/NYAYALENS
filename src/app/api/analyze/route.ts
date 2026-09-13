import { NextResponse } from 'next/server';
import { documentStore } from '@/lib/store';
import { analyzeDocument } from '@/lib/ai/analyze';

export const maxDuration = 60;

export async function POST(request: Request) {
  let documentId: string | undefined;

  try {
    const body = await request.json();
    documentId = body.documentId;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const doc = documentStore.getDocument(documentId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!doc.content) {
      return NextResponse.json({ error: 'Document has no text content' }, { status: 400 });
    }

    const analysis = await analyzeDocument(doc.content, doc.pages);

    documentStore.updateDocument(documentId, {
      analysis,
      documentType: analysis.documentType,
      status: 'analyzed',
      analyzedAt: new Date().toISOString(),
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);

    if (documentId) {
      documentStore.updateDocument(documentId, { status: 'error' });
    }

    const message = error instanceof Error ? error.message : 'Failed to analyze document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
