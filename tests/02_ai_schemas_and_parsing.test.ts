import { describe, it, expect } from 'vitest';
import {
  DocumentAnalysisSchema,
  ClauseSchema,
  ObligationSchema,
  ImportantDateSchema,
  AttentionAreaSchema,
  ComparisonResultSchema,
  LawyerBriefSchema,
  ChecklistItemSchema,
} from '../src/lib/ai/schemas';

describe('2. AI Schemas & Structured Gemini Response Validation', () => {
  const sampleValidAnalysis = {
    documentType: 'Employment Agreement',
    title: 'Executive Employment Agreement',
    parties: [
      { name: 'Acme Corp', role: 'Employer' },
      { name: 'Jane Doe', role: 'Executive' },
    ],
    summary: 'Executive agreement detailing duties, compensation, and restrictions.',
    complexity: 'moderate' as const,
    attentionAreas: [
      {
        id: 'att-1',
        title: 'Non-compete duration',
        description: '24-month restriction after departure may deserve legal review.',
        category: 'restrictions' as const,
        attentionLevel: 'high' as const,
        clauseIds: ['c-1'],
      },
    ],
    clauses: [
      {
        id: 'c-1',
        title: 'Post-Termination Covenant',
        section: 'Section 8.2',
        page: 3,
        originalText: 'The Executive shall not engage in any competing venture for 24 months.',
        simplifiedExplanation: 'You cannot work for a competitor for 2 years after leaving.',
        whyItMayMatter: 'This may restrict your future employment opportunities.',
        attentionLevel: 'high' as const,
        category: 'restrictions' as const,
        questions: ['Is a 24-month non-compete enforceable in this jurisdiction?'],
      },
    ],
    obligations: [
      {
        id: 'ob-1',
        description: 'Give 60 days advance written notice before resignation.',
        responsibleParty: 'Executive',
        timing: 'Prior to departure',
        page: 4,
        section: 'Section 10.1',
      },
    ],
    dates: [
      {
        id: 'd-1',
        label: 'Effective Date',
        date: '2027-02-01',
        sourceText: 'Effective as of February 1, 2027',
        page: 1,
        confidence: 'high' as const,
      },
    ],
    inconsistencies: [],
    questionsForProfessional: [
      'Does Section 27 of the Indian Contract Act void this non-compete?',
    ],
    nextSteps: [
      'Seek legal advice regarding the post-employment non-compete covenant.',
    ],
  };

  it('should successfully parse a valid complete DocumentAnalysis', () => {
    const result = DocumentAnalysisSchema.safeParse(sampleValidAnalysis);
    expect(result.success).toBe(true);
  });

  it('should reject AI output when critical fields are missing', () => {
    const missingSummary = {
      ...sampleValidAnalysis,
      summary: undefined,
    };
    const res1 = DocumentAnalysisSchema.safeParse(missingSummary);
    expect(res1.success).toBe(false);

    const missingClauses = {
      ...sampleValidAnalysis,
      clauses: undefined,
    };
    const res2 = DocumentAnalysisSchema.safeParse(missingClauses);
    expect(res2.success).toBe(false);
  });

  it('should reject invalid attention level enums (e.g. "critical", "danger")', () => {
    const invalidAttentionLevel = {
      id: 'c-invalid',
      title: 'Invalid',
      section: '1',
      page: 1,
      originalText: 'Text',
      simplifiedExplanation: 'Explanation',
      whyItMayMatter: 'Why',
      attentionLevel: 'extreme_danger', // invalid
      category: 'restrictions' as const,
      questions: [],
    };

    const res = ClauseSchema.safeParse(invalidAttentionLevel);
    expect(res.success).toBe(false);
  });

  it('should validate structured ComparisonResultSchema', () => {
    const validComparison = {
      summary: 'Revision 2 reduces the notice period but expands intellectual property assignment.',
      changes: [
        {
          id: 'ch-1',
          area: 'Notice Period',
          category: 'changed' as const,
          documentA: '90 days notice',
          documentB: '30 days notice',
          explanation: 'Allows faster exit flexibility for both parties.',
          attentionLevel: 'medium' as const,
        },
      ],
      areasWorthReviewing: ['Notice period adjustment', 'Scope of IP assignment'],
    };

    const res = ComparisonResultSchema.safeParse(validComparison);
    expect(res.success).toBe(true);
  });

  it('should validate Checklist and LawyerBrief schemas', () => {
    const validChecklist = {
      id: 'chk-1',
      text: 'Confirm compensation and bonus calculation formula with HR',
      checked: false,
      category: 'Compensation',
    };
    expect(ChecklistItemSchema.safeParse(validChecklist).success).toBe(true);

    const validBrief = {
      matter: 'Employment Agreement Review',
      documentType: 'Employment Agreement',
      partiesInvolved: ['Acme Corp', 'Jane Doe'],
      keyConcerns: ['24-month non-compete clause', 'Broad IP ownership'],
      relevantClauses: [
        {
          title: 'Non-Compete',
          section: 'Section 8.2',
          page: 3,
          concern: 'Restraint of trade across all tech ventures',
        },
      ],
      importantDates: [
        { label: 'Start Date', date: '2027-02-01' },
      ],
      questions: [
        'How can we narrow the non-compete to specific direct competitors?',
      ],
      documentsReviewed: ['Employment_Agreement.pdf (5 pages)'],
      generatedAt: new Date().toISOString(),
    };
    expect(LawyerBriefSchema.safeParse(validBrief).success).toBe(true);
  });

  it('should validate standalone Obligation, ImportantDate, and AttentionArea schemas', () => {
    const ob = ObligationSchema.safeParse({
      id: 'ob-test',
      description: 'Pay taxes',
      responsibleParty: 'Tenant',
      timing: 'Monthly',
      page: 1,
      section: 'Sec 2',
    });
    expect(ob.success).toBe(true);

    const dt = ImportantDateSchema.safeParse({
      id: 'dt-test',
      label: 'Renewal',
      date: '2028-01-01',
      sourceText: 'Renews on 2028-01-01',
      page: 2,
      confidence: 'high',
    });
    expect(dt.success).toBe(true);

    const att = AttentionAreaSchema.safeParse({
      id: 'att-test',
      title: 'Liability Cap',
      description: 'Zero liability clause',
      category: 'liability',
      attentionLevel: 'high',
      clauseIds: ['c-1'],
    });
    expect(att.success).toBe(true);
  });
});
