import { documentStore, StoredDocument } from '@/lib/store';
import { createChatStream } from '@/lib/ai/chat';
import type { ChatContext, DocumentAnalysis, Clause } from '@/types';

export const maxDuration = 30;

function generateGroundedReply(
  messages: { role: string; content: string }[],
  doc: StoredDocument,
  analysis: DocumentAnalysis,
  selectedClause?: Clause
): string {
  const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase();

  if (selectedClause) {
    return (
      `**Clause Focus: ${selectedClause.title} (${selectedClause.section}, Page ${selectedClause.page})**\n\n` +
      `Here is the exact text from the document:\n` +
      `> "${selectedClause.originalText}"\n\n` +
      `**Plain-Language Explanation:**\n` +
      `${selectedClause.simplifiedExplanation || 'This clause establishes binding conditions regarding this matter.'}\n\n` +
      `**Why It May Matter:**\n` +
      `- ${selectedClause.whyItMayMatter || 'Could create ongoing obligations or liabilities.'}\n\n` +
      `**Questions to Consider Asking:**\n` +
      `${selectedClause.questions?.map(q => `- "${q}"`).join('\n') || '- Is this clause standard for this jurisdiction?'}\n\n` +
      `*Source: ${doc.name} · ${selectedClause.section} · Page ${selectedClause.page}*\n\n` +
      `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
    );
  }

  if (lastUserMsg.includes('review') || lastUserMsg.includes('sign')) {
    const topClauses = analysis.clauses.slice(0, 3);
    return (
      `**Key Areas to Review Before Signing "${doc.name}":**\n\n` +
      topClauses.map((c, i) =>
        `${i + 1}. **${c.title}** (${c.section}, Page ${c.page}):\n` +
        `   ${c.whyItMayMatter}\n` +
        `   *Simplified: ${c.simplifiedExplanation}*`
      ).join('\n\n') +
      `\n\n**Important Deadlines:**\n` +
      analysis.dates.map(d => `- **${d.label}**: ${d.date} (Page ${d.page})`).join('\n') +
      `\n\n**Recommended Clarification Questions:**\n` +
      analysis.questionsForProfessional.slice(0, 2).map(q => `- "${q}"`).join('\n') +
      `\n\n*Sources: ${doc.name} · Pages 1-${doc.pageCount || 1}*\n\n` +
      `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
    );
  }

  if (lastUserMsg.includes('obligation') || lastUserMsg.includes('duty')) {
    return (
      `**Key Contractual Obligations in "${doc.name}":**\n\n` +
      analysis.obligations.slice(0, 6).map(o =>
        `- **${o.responsibleParty}**: ${o.description} *(${o.section}, Page ${o.page})*`
      ).join('\n') +
      `\n\n*Sources: ${doc.name} · Pages 1-${doc.pageCount || 1}*\n\n` +
      `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
    );
  }

  if (lastUserMsg.includes('date') || lastUserMsg.includes('deadline')) {
    return (
      `**Key Dates & Milestones in "${doc.name}":**\n\n` +
      analysis.dates.map(d =>
        `- **${d.label}**: ${d.date} (Page ${d.page}) — *Confidence: ${d.confidence}*`
      ).join('\n') +
      `\n\n*Source: ${doc.name}*\n\n` +
      `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
    );
  }

  return (
    `**Document Intelligence Summary — ${doc.name}** (${analysis.documentType}):\n\n` +
    `${analysis.summary}\n\n` +
    `**Attention Indicators:**\n` +
    analysis.attentionAreas.slice(0, 3).map(a => `- **${a.title}** [${a.attentionLevel} Attention]: ${a.description}`).join('\n') +
    `\n\n*Grounded in: ${doc.name} (Pages 1-${doc.pageCount || 1})*\n\n` +
    `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
  );
}

export async function POST(request: Request) {
  try {
    const { messages, documentId, selectedClause } = await request.json();

    if (!documentId) {
      return new Response('Document ID is required', { status: 400 });
    }

    const doc = documentStore.getDocument(documentId);
    if (!doc) {
      return new Response('Document not found', { status: 404 });
    }

    if (!doc.analysis) {
      return new Response('Document has not been analyzed yet', { status: 400 });
    }

    const analysis = doc.analysis;

    const context: ChatContext = {
      documentId: doc.id,
      documentName: doc.name,
      documentSummary: analysis.summary,
      selectedClause: selectedClause || undefined,
      clauses: analysis.clauses.map(c => ({
        title: c.title,
        section: c.section,
        page: c.page,
        attentionLevel: c.attentionLevel,
      })),
      obligations: analysis.obligations.map(o => ({
        description: o.description,
        responsibleParty: o.responsibleParty,
      })),
      dates: analysis.dates.map(d => ({
        label: d.label,
        date: d.date,
      })),
      attentionAreas: analysis.attentionAreas.map(a => ({
        title: a.title,
        attentionLevel: a.attentionLevel,
      })),
    };

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        let hasChunks = false;
        try {
          const result = createChatStream(messages, context, (err) => {
            console.warn('Gemini stream error handled by callback:', err.message);
          });
          for await (const chunk of result.textStream) {
            hasChunks = true;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err: any) {
          console.warn('Iteration caught stream error:', err.message);
        }

        if (!hasChunks) {
          const fallbackReply = generateGroundedReply(messages, doc, analysis, selectedClause);
          controller.enqueue(encoder.encode(fallbackReply));
        }

        controller.close();
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate chat response';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
