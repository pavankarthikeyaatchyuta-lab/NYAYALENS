import { documentStore, StoredDocument } from '@/lib/store';
import { createChatStream } from '@/lib/ai/chat';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { checkPromptSafety } from '@/lib/ai/security-guard';
import { verifyCitation } from '@/lib/ai/citations';
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
    const verified = verifyCitation(
      {
        docName: doc.name,
        quote: selectedClause.originalText,
        page: selectedClause.page,
        section: selectedClause.section,
      },
      { text: doc.content, pageCount: doc.pageCount || 1, pages: doc.pages }
    );

    return (
      `**Clause Focus: ${selectedClause.title} (${selectedClause.section}, Page ${selectedClause.page})**\n\n` +
      `Here is the verified text from the document:\n` +
      `> "${selectedClause.originalText}"\n\n` +
      `**Plain-Language Explanation:**\n` +
      `${selectedClause.simplifiedExplanation || 'This clause establishes binding conditions regarding this matter.'}\n\n` +
      `**Why It May Matter:**\n` +
      `- ${selectedClause.whyItMayMatter || 'Could create ongoing obligations or liabilities.'}\n\n` +
      `**Questions to Consider Asking:**\n` +
      `${selectedClause.questions?.map(q => `- "${q}"`).join('\n') || '- Is this clause standard for this jurisdiction?'}\n\n` +
      `*${verified.citationText}*\n\n` +
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
      `\n\n*Source: Grounded in ${doc.name} (Pages 1-${doc.pageCount || 1})*\n\n` +
      `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
    );
  }

  if (lastUserMsg.includes('obligation') || lastUserMsg.includes('duty')) {
    return (
      `**Key Contractual Obligations in "${doc.name}":**\n\n` +
      analysis.obligations.slice(0, 6).map(o =>
        `- **${o.responsibleParty}**: ${o.description} *(${o.section}, Page ${o.page})*`
      ).join('\n') +
      `\n\n*Source: Grounded in ${doc.name} (Pages 1-${doc.pageCount || 1})*\n\n` +
      `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
    );
  }

  if (lastUserMsg.includes('date') || lastUserMsg.includes('deadline')) {
    return (
      `**Key Dates & Milestones in "${doc.name}":**\n\n` +
      analysis.dates.map(d =>
        `- **${d.label}**: ${d.date} (Page ${d.page}) — *Confidence: ${d.confidence}*`
      ).join('\n') +
      `\n\n*Source: Grounded in ${doc.name}*\n\n` +
      `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
    );
  }

  return (
    `**Document Intelligence Summary — ${doc.name}** (${analysis.documentType}):\n\n` +
    `${analysis.summary}\n\n` +
    `**Attention Indicators:**\n` +
    analysis.attentionAreas.slice(0, 3).map(a => `- **${a.title}** [${a.attentionLevel} Attention]: ${a.description}`).join('\n') +
    `\n\n*Source: Grounded in ${doc.name} (Pages 1-${doc.pageCount || 1})*\n\n` +
    `*Disclaimer: AI-assisted legal preparation. Not legal advice.*`
  );
}

export async function POST(request: Request) {
  // 1. Rate Limiting Protection
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`chat:${clientIp}`, { limit: 40, windowMs: 60000 });
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment before sending more messages.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { messages, documentId, selectedClause } = body;

    if (!documentId || typeof documentId !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid Document ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array cannot be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Prompt Injection Defense
    const latestUserMsg = messages[messages.length - 1];
    if (latestUserMsg && latestUserMsg.role === 'user') {
      const safety = checkPromptSafety(latestUserMsg.content);
      if (!safety.isSafe) {
        return new Response(
          `I am programmed to assist strictly with document comprehension and legal context questions. I cannot process instructions attempting to override system behavior, reveal secrets, or bypass safety guidelines.\n\n*Please ask a question about your uploaded document.*`,
          { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      }
    }

    const doc = documentStore.getDocument(documentId);
    if (!doc) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!doc.analysis) {
      return new Response(JSON.stringify({ error: 'Document has not been analyzed yet' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const analysis = doc.analysis;

    // Filter focused clauses: prioritize selectedClause if provided, else top 8 clauses (Token Efficiency Optimization)
    let filteredClauses = analysis.clauses;
    if (selectedClause) {
      filteredClauses = [
        selectedClause,
        ...analysis.clauses.filter(c => c.section !== selectedClause.section).slice(0, 4)
      ];
    } else {
      filteredClauses = analysis.clauses.slice(0, 8);
    }

    // Build focused, token-efficient context instead of sending 100k raw tokens
    const context: ChatContext = {
      documentId: doc.id,
      documentName: doc.name,
      documentSummary: analysis.summary,
      selectedClause: selectedClause || undefined,
      clauses: filteredClauses.map(c => ({
        title: c.title,
        section: c.section,
        page: c.page,
        attentionLevel: c.attentionLevel,
      })),
      obligations: analysis.obligations.slice(0, 6).map(o => ({
        description: o.description,
        responsibleParty: o.responsibleParty,
      })),
      dates: analysis.dates.slice(0, 5).map(d => ({
        label: d.label,
        date: d.date,
      })),
      attentionAreas: analysis.attentionAreas.slice(0, 4).map(a => ({
        title: a.title,
        attentionLevel: a.attentionLevel,
      })),
    };

    // Token-efficient message window: retain only recent turns (max 8 messages)
    const recentMessages = messages.slice(-8);

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        let hasChunks = false;
        try {
          const result = createChatStream(recentMessages, context, (err) => {
            console.warn('Gemini stream error handled by callback:', err.message);
          });
          for await (const chunk of result.textStream) {
            hasChunks = true;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err: unknown) {
          console.warn('Iteration caught stream error:', err instanceof Error ? err.message : 'Unknown');
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
    console.error('Chat endpoint error:', error instanceof Error ? error.message : 'Unknown');
    return new Response(
      JSON.stringify({ error: 'An error occurred while generating the response. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
