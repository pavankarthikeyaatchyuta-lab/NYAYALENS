import { NextResponse } from 'next/server';
import { documentStore } from '@/lib/store';
import { generateActions } from '@/lib/ai/actions';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const doc = documentStore.getDocument(documentId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    if (!doc.analysis) {
        return NextResponse.json({ error: 'Document not analyzed yet' }, { status: 400 });
    }

    const actions = await generateActions(doc.name, doc.analysis);
    
    documentStore.updateDocument(documentId, {
      actions
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Actions error:', error);
    return NextResponse.json({ error: 'Failed to generate actions' }, { status: 500 });
  }
}
