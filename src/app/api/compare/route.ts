import { NextResponse } from 'next/server';
import { documentStore } from '@/lib/store';
import { compareDocuments } from '@/lib/ai/compare';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';

export const maxDuration = 60;

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`compare:${clientIp}`, { limit: 20, windowMs: 60000 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before running another comparison.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString() },
      }
    );
  }

  try {
    const body = await request.json();
    const { documentAId, documentBId } = body;

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
    console.error('Comparison error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Failed to compare documents. Please try again.' },
      { status: 500 }
    );
  }
}
