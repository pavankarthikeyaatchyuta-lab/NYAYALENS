// Analysis types for NyayaLens — structured AI output types

import { AttentionLevel, ClauseCategory } from './document';

export interface DocumentAnalysis {
  documentType: string;
  title: string;
  parties: Party[];
  summary: string;
  complexity: 'simple' | 'moderate' | 'complex';
  attentionAreas: AttentionArea[];
  clauses: Clause[];
  obligations: Obligation[];
  dates: ImportantDate[];
  inconsistencies: string[];
  questionsForProfessional: string[];
  nextSteps: string[];
}

export interface Party {
  name: string;
  role: string; // e.g., "Employer", "Employee", "Landlord", "Tenant"
}

export interface AttentionArea {
  id: string;
  title: string;
  description: string;
  category: ClauseCategory;
  attentionLevel: AttentionLevel;
  clauseIds: string[];
}

export interface Clause {
  id: string;
  title: string;
  section: string;
  page: number;
  originalText: string;
  simplifiedExplanation: string;
  whyItMayMatter: string;
  attentionLevel: AttentionLevel;
  category: ClauseCategory;
  questions: string[];
}

export interface Obligation {
  id: string;
  description: string;
  responsibleParty: string;
  timing: string;
  page: number;
  section: string;
}

export interface ImportantDate {
  id: string;
  label: string;
  date: string;
  sourceText: string;
  page: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface ComparisonResult {
  summary: string;
  changes: ComparisonChange[];
  areasWorthReviewing: string[];
}

export interface ComparisonChange {
  id: string;
  area: string;
  category: 'added' | 'removed' | 'changed' | 'potentially-important';
  documentA: string;
  documentB: string;
  explanation: string;
  attentionLevel: AttentionLevel;
}

export interface ActionItems {
  nextSteps: string[];
  checklist: ChecklistItem[];
  questionsForLawyer: QuestionForLawyer[];
  lawyerBrief: LawyerBrief;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: string;
}

export interface QuestionForLawyer {
  id: string;
  question: string;
  context: string;
  relatedClause?: string;
  priority: AttentionLevel;
}

export interface LawyerBrief {
  matter: string;
  documentType: string;
  partiesInvolved: string[];
  keyConcerns: string[];
  relevantClauses: { title: string; section: string; page: number; concern: string }[];
  importantDates: { label: string; date: string }[];
  questions: string[];
  documentsReviewed: string[];
  generatedAt: string;
}
