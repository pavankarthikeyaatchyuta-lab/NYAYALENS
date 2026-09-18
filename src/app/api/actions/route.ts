import { NextResponse } from 'next/server';
import { documentStore } from '@/lib/store';
import { generateActions } from '@/lib/ai/actions';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';

export const maxDuration = 60;

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`actions:${clientIp}`, { limit: 25, windowMs: 60000 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before generating actions again.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString() },
      }
    );
  }

  try {
    const body = await request.json();
    const { documentId } = body;

    if (!documentId || typeof documentId !== 'string') {
      return NextResponse.json({ error: 'Valid Document ID is required' }, { status: 400 });
    }

    const doc = documentStore.getDocument(documentId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    if (!doc.analysis) {
      return NextResponse.json({ error: 'Document not analyzed yet' }, { status: 400 });
    }

    // Reuse existing action items if already generated (Token & Latency Efficiency)
    if (doc.actions && !body.forceRegenerate) {
      return NextResponse.json(doc.actions);
    }

    const actions = await generateActions(doc.name, doc.analysis);
    
    documentStore.updateDocument(documentId, {
      actions,
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Actions generation error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to generate actionable outputs. Please try again.' }, { status: 500 });
  }
}
