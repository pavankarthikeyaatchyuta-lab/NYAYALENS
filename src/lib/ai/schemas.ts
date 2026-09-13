// Zod schemas for structured AI outputs
import { z } from 'zod';

// --- Document Analysis Schema ---

export const PartySchema = z.object({
  name: z.string().describe('Name of the party'),
  role: z.string().describe('Role in the agreement, e.g. Employer, Employee, Landlord, Tenant'),
});

export const AttentionAreaSchema = z.object({
  id: z.string().describe('Unique identifier'),
  title: z.string().describe('Short title of the attention area'),
  description: z.string().describe('Brief description of why this area may deserve attention'),
  category: z.enum([
    'restrictions', 'obligations', 'deadlines', 'financial',
    'termination', 'privacy', 'intellectual-property', 'liability',
    'dispute-resolution', 'other',
  ]).describe('Category of the attention area'),
  attentionLevel: z.enum(['high', 'medium', 'low']).describe('AI-assessed attention level — not a definitive legal risk score'),
  clauseIds: z.array(z.string()).describe('IDs of related clauses'),
});

export const ClauseSchema = z.object({
  id: z.string().describe('Unique identifier for this clause'),
  title: z.string().describe('Short descriptive title'),
  section: z.string().describe('Section number or heading from the document'),
  page: z.number().describe('Page number where this clause appears (1-indexed)'),
  originalText: z.string().describe('The exact text of the clause from the document'),
  simplifiedExplanation: z.string().describe('Plain-language explanation of what this clause means. Use hedging language.'),
  whyItMayMatter: z.string().describe('Why this clause may deserve attention. Use "may", "appears to", "could" language.'),
  attentionLevel: z.enum(['high', 'medium', 'low']).describe('AI attention level, not a legal risk score'),
  category: z.enum([
    'restrictions', 'obligations', 'deadlines', 'financial',
    'termination', 'privacy', 'intellectual-property', 'liability',
    'dispute-resolution', 'other',
  ]),
  questions: z.array(z.string()).describe('Questions the reader may want to consider or ask a professional'),
});

export const ObligationSchema = z.object({
  id: z.string().describe('Unique identifier'),
  description: z.string().describe('Description of the obligation'),
  responsibleParty: z.string().describe('Who bears this obligation'),
  timing: z.string().describe('When this obligation applies, or "Ongoing" if continuous'),
  page: z.number().describe('Page number (1-indexed)'),
  section: z.string().describe('Section reference'),
});

export const ImportantDateSchema = z.object({
  id: z.string().describe('Unique identifier'),
  label: z.string().describe('What this date represents'),
  date: z.string().describe('The date in ISO format or natural language if exact date cannot be determined'),
  sourceText: z.string().describe('The text from the document that mentions this date'),
  page: z.number().describe('Page number (1-indexed)'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence in the date extraction'),
});

export const DocumentAnalysisSchema = z.object({
  documentType: z.string().describe('Type of document, e.g. Employment Agreement, Lease, NDA'),
  title: z.string().describe('Document title or a generated descriptive title'),
  parties: z.array(PartySchema).describe('Parties involved in the document'),
  summary: z.string().describe('2-3 paragraph summary of the document in plain language'),
  complexity: z.enum(['simple', 'moderate', 'complex']).describe('Overall complexity assessment'),
  attentionAreas: z.array(AttentionAreaSchema).describe('Areas that may deserve attention'),
  clauses: z.array(ClauseSchema).describe('Important clauses identified in the document'),
  obligations: z.array(ObligationSchema).describe('Obligations for each party'),
  dates: z.array(ImportantDateSchema).describe('Important dates and deadlines'),
  inconsistencies: z.array(z.string()).describe('Any apparent inconsistencies noticed in the document'),
  questionsForProfessional: z.array(z.string()).describe('Questions the reader may want to ask a legal professional'),
  nextSteps: z.array(z.string()).describe('Suggested next steps for the reader'),
});

// --- Comparison Schema ---

export const ComparisonChangeSchema = z.object({
  id: z.string(),
  area: z.string().describe('What area changed, e.g. Notice Period, IP Clause'),
  category: z.enum(['added', 'removed', 'changed', 'potentially-important']),
  documentA: z.string().describe('Value or description from Document A'),
  documentB: z.string().describe('Value or description from Document B'),
  explanation: z.string().describe('Plain-language explanation of what changed and why it may matter'),
  attentionLevel: z.enum(['high', 'medium', 'low']),
});

export const ComparisonResultSchema = z.object({
  summary: z.string().describe('Overview summary of the comparison'),
  changes: z.array(ComparisonChangeSchema),
  areasWorthReviewing: z.array(z.string()).describe('Key areas worth reviewing further'),
});

// --- Action Items Schema ---

export const ChecklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  checked: z.boolean().default(false),
  category: z.string(),
});

export const QuestionForLawyerSchema = z.object({
  id: z.string(),
  question: z.string(),
  context: z.string().describe('Brief context about why this question matters'),
  relatedClause: z.string().optional().describe('Related clause section if applicable'),
  priority: z.enum(['high', 'medium', 'low']),
});

export const LawyerBriefSchema = z.object({
  matter: z.string().describe('Brief description of the matter'),
  documentType: z.string(),
  partiesInvolved: z.array(z.string()),
  keyConcerns: z.array(z.string()),
  relevantClauses: z.array(z.object({
    title: z.string(),
    section: z.string(),
    page: z.number(),
    concern: z.string(),
  })),
  importantDates: z.array(z.object({
    label: z.string(),
    date: z.string(),
  })),
  questions: z.array(z.string()),
  documentsReviewed: z.array(z.string()),
  generatedAt: z.string(),
});

export const ActionItemsSchema = z.object({
  nextSteps: z.array(z.string()),
  checklist: z.array(ChecklistItemSchema),
  questionsForLawyer: z.array(QuestionForLawyerSchema),
  lawyerBrief: LawyerBriefSchema,
});

// --- Chat Response Schema ---

export const ChatSourceSchema = z.object({
  document: z.string(),
  page: z.number(),
  section: z.string(),
});

export const ChatResponseSchema = z.object({
  answer: z.string().describe('The response to the user question, grounded in document content'),
  sources: z.array(ChatSourceSchema).describe('Document sources referenced in the answer'),
  considerations: z.array(z.string()).describe('Additional considerations the user should be aware of'),
  suggestedQuestions: z.array(z.string()).describe('Follow-up questions the user might want to ask'),
  disclaimer: z.string().describe('Brief reminder that this is AI analysis, not legal advice'),
});
