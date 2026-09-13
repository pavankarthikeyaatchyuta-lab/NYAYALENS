// Action generation via Gemini with resilient fallback
import { generateObject } from 'ai';
import { getGeminiModel } from './gemini';
import { ActionItemsSchema } from './schemas';
import { ACTION_GENERATION_PROMPT } from './prompts';
import type { ActionItems, DocumentAnalysis } from '@/types';

export async function generateActions(
  documentName: string,
  analysis: DocumentAnalysis
): Promise<ActionItems> {
  try {
    const clausesSummary = analysis.clauses
      .map(c => `- ${c.title} (${c.section}, Page ${c.page}) [${c.attentionLevel}]: ${c.originalText.substring(0, 200)}`)
      .join('\n') || 'No key clauses identified.';

    const obligationsSummary = analysis.obligations
      .map(o => `- ${o.responsibleParty}: ${o.description} (${o.section}, Page ${o.page})`)
      .join('\n') || 'No obligations extracted.';

    const datesSummary = analysis.dates
      .map(d => `- ${d.label}: ${d.date} (Page ${d.page})`)
      .join('\n') || 'No dates extracted.';

    const attentionAreasSummary = analysis.attentionAreas
      .map(a => `- ${a.title} [${a.attentionLevel}]: ${a.description}`)
      .join('\n') || 'No attention areas identified.';

    const prompt = ACTION_GENERATION_PROMPT
      .replace('{documentName}', documentName)
      .replace('{documentType}', analysis.documentType)
      .replace('{parties}', analysis.parties.map(p => `${p.name} (${p.role})`).join(', '))
      .replace('{summary}', analysis.summary)
      .replace('{clausesSummary}', clausesSummary)
      .replace('{obligationsSummary}', obligationsSummary)
      .replace('{datesSummary}', datesSummary)
      .replace('{attentionAreasSummary}', attentionAreasSummary);

    const { object } = await generateObject({
      model: getGeminiModel(),
      schema: ActionItemsSchema,
      prompt,
      temperature: 0.3,
    });

    return object as ActionItems;
  } catch (err: any) {
    console.warn('Gemini generateActions error, creating action outputs from analysis:', err.message);

    const checklist = analysis.clauses.map((c, i) => ({
      id: `chk-gen-${i}`,
      text: `Review and clarify terms regarding "${c.title}" (${c.section})`,
      checked: false,
      category: c.category
    }));

    if (checklist.length === 0) {
      checklist.push({
        id: 'chk-1',
        text: 'Review core agreement commitments and notice requirements',
        checked: false,
        category: 'other'
      });
    }

    const questionsForLawyer = analysis.questionsForProfessional.map((q, i) => ({
      id: `q-gen-${i}`,
      question: q,
      context: `Identified from ${analysis.documentType} review.`,
      relatedClause: analysis.clauses[i]?.section || undefined,
      priority: (i === 0 ? 'high' : 'medium') as 'high' | 'medium' | 'low'
    }));

    const lawyerBrief = {
      matter: `Review of ${analysis.documentType} — ${documentName}`,
      documentType: analysis.documentType,
      partiesInvolved: analysis.parties.map(p => `${p.name} (${p.role})`),
      keyConcerns: analysis.attentionAreas.map(a => a.description),
      relevantClauses: analysis.clauses.slice(0, 4).map(c => ({
        title: c.title,
        section: c.section,
        page: c.page,
        concern: c.whyItMayMatter
      })),
      importantDates: analysis.dates.map(d => ({
        label: d.label,
        date: d.date
      })),
      questions: analysis.questionsForProfessional,
      documentsReviewed: [`${documentName} (${analysis.documentType})`],
      generatedAt: new Date().toISOString().split('T')[0]
    };

    return {
      nextSteps: analysis.nextSteps,
      checklist,
      questionsForLawyer,
      lawyerBrief
    };
  }
}
