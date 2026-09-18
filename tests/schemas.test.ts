import { describe, it, expect } from 'vitest';
import {
  DocumentAnalysisSchema,
  ComparisonResultSchema,
  ClauseSchema,
  ObligationSchema,
} from '../src/lib/ai/schemas';

describe('Zod AI Schemas', () => {
  it('should validate a complete legal analysis output', () => {
    const validAnalysis = {
      title: 'Founder Employment Agreement',
      documentType: 'Employment Agreement',
      parties: [
        { name: 'TechCorp Inc.', role: 'Employer' },
        { name: 'Ravi Sharma', role: 'Employee' },
      ],
      summary: 'Executive summary of agreement explaining key terms in plain language.',
      complexity: 'moderate' as const,
      attentionAreas: [
        {
          id: 'att-1',
          title: 'Overly Broad IP Assignment',
          description: 'Assigns rights to work produced outside business hours.',
          category: 'intellectual-property' as const,
          attentionLevel: 'high' as const,
          clauseIds: ['c-1'],
        },
      ],
      clauses: [
        {
          id: 'c-1',
          title: 'Non-Compete',
          section: 'Section 6.1',
          page: 2,
          originalText: 'The employee shall not engage in competing businesses for 24 months.',
          simplifiedExplanation: 'You cannot work for or build a competitor for two years after leaving.',
          whyItMayMatter: 'Section 27 of Indian Contract Act may limit enforceability, but disputes can cause delay.',
          attentionLevel: 'high' as const,
          category: 'restrictions' as const,
          questions: ['Is the non-compete restriction enforceable?'],
        },
      ],
      obligations: [
        {
          id: 'ob-1',
          description: 'Deliver notice 60 days in advance.',
          responsibleParty: 'Employee',
          timing: '60 days prior to departure',
          page: 2,
          section: 'Section 7.2',
        },
      ],
      dates: [
        {
          id: 'd-1',
          label: 'Start Date',
          date: '2027-01-01',
          sourceText: 'Commences on January 1, 2027',
          page: 1,
          confidence: 'high' as const,
        },
      ],
      inconsistencies: [],
      questionsForProfessional: [
        'Is the post-termination 24-month non-compete enforceable under Section 27?',
      ],
      nextSteps: [
        'Discuss IP clause carve-outs with employer.',
      ],
    };

    const parsed = DocumentAnalysisSchema.safeParse(validAnalysis);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid attention levels in ClauseSchema', () => {
    const invalidClause = {
      id: 'c-x',
      title: 'Invalid Clause',
      section: 'Section 1',
      page: 1,
      originalText: 'Text',
      simplifiedExplanation: 'Explanation',
      whyItMayMatter: 'Matter',
      attentionLevel: 'critical_danger', // invalid enum
      category: 'restrictions' as const,
      questions: [],
    };

    const parsed = ClauseSchema.safeParse(invalidClause);
    expect(parsed.success).toBe(false);
  });

  it('should validate comparison schema', () => {
    const validComparison = {
      summary: 'v2 introduces stricter IP terms but reduces notice period.',
      changes: [
        {
          id: 'ch-1',
          area: 'Termination Notice',
          category: 'changed' as const,
          documentA: '90 days notice',
          documentB: '30 days notice',
          explanation: 'Reduces lock-in duration.',
          attentionLevel: 'medium' as const,
        },
      ],
      areasWorthReviewing: ['Notice period reduction', 'IP assignment broadening'],
    };

    const parsed = ComparisonResultSchema.safeParse(validComparison);
    expect(parsed.success).toBe(true);
  });

  it('should validate obligation schema fields correctly', () => {
    const validObligation = {
      id: 'ob-2',
      description: 'Pay monthly rent on or before 5th of each month',
      responsibleParty: 'Tenant',
      timing: 'Monthly by 5th',
      page: 1,
      section: 'Clause 3',
    };

    const parsed = ObligationSchema.safeParse(validObligation);
    expect(parsed.success).toBe(true);
  });
});
