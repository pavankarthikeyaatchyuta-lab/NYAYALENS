import { NextResponse } from 'next/server';
import { documentStore } from '@/lib/store';
import { compareDocuments } from '@/lib/ai/compare';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { documentAId, documentBId } = await request.json();

    if (!documentAId || !documentBId) {
      return NextResponse.json({ error: 'Both document IDs are required' }, { status: 400 });
    }

    const docA = documentStore.getDocument(documentAId);
    const docB = documentStore.getDocument(documentBId);

    if (!docA || !docB) {
      return NextResponse.json({ error: 'One or both documents not found' }, { status: 404 });
    }

    if (!docA.analysis || !docB.analysis) {
      return NextResponse.json(
        { error: 'Both documents must be analyzed before comparison' },
        { status: 400 }
      );
    }

    const comparison = await compareDocuments(
      { name: docA.name, summary: docA.analysis.summary, analysis: docA.analysis },
      { name: docB.name, summary: docB.analysis.summary, analysis: docB.analysis }
    );

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Comparison error:', error);
    const message = error instanceof Error ? error.message : 'Failed to compare documents';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
