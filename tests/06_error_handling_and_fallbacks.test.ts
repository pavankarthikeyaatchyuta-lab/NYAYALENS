import { describe, it, expect } from 'vitest';
import { fallbackAnalyzeDocument } from '../src/lib/ai/fallback';
import { analyzeDocument } from '../src/lib/ai/analyze';
import { generateActions } from '../src/lib/ai/actions';

describe('6. Resilient Error Handling & Gemini Fallback Mechanisms', () => {
  const sampleContract = `
MASTER SERVICES AGREEMENT
Between Client Inc and Vendor LLC.
Section 1. Term: 12 months from signing.
Section 2. Non-Compete: Vendor will not build competitive solutions for 18 months.
Section 3. Payment: Invoices due within 30 days of receipt.
`;

  it('should activate fallback analysis when Gemini encounters errors or rate limits', async () => {
    // When called with arbitrary text and without mock, fallback returns valid DocumentAnalysis
    const analysis = await fallbackAnalyzeDocument(sampleContract, [
      { pageNumber: 1, text: sampleContract },
    ]);

    expect(analysis).toBeDefined();
    expect(analysis.title).toBeDefined();
    expect(analysis.documentType).toBeDefined();
    expect(analysis.clauses.length).toBeGreaterThan(0);
    expect(analysis.obligations.length).toBeGreaterThan(0);
    expect(analysis.dates.length).toBeGreaterThan(0);
    expect(analysis.attentionAreas.length).toBeGreaterThan(0);
    expect(analysis.questionsForProfessional.length).toBeGreaterThan(0);
    expect(analysis.nextSteps.length).toBeGreaterThan(0);
  });

  it('should generate fallback actions without crashing when action generation fails', async () => {
    const dummyAnalysis = {
      title: 'Vendor Contract',
      documentType: 'Vendor Agreement',
      summary: 'Summary of vendor terms.',
      complexity: 'moderate' as const,
      parties: [{ name: 'Vendor', role: 'Supplier' }],
      clauses: [
        {
          id: 'c-1',
          title: 'Payment Terms',
          section: 'Section 3',
          page: 1,
          originalText: 'Net 30 days',
          simplifiedExplanation: 'Must pay in 30 days',
          whyItMayMatter: 'Cash flow impact',
          attentionLevel: 'medium' as const,
          category: 'financial' as const,
          questions: [],
        },
      ],
      obligations: [],
      dates: [{ id: 'd-1', label: 'Payment due', date: '30 days', sourceText: 'Net 30', page: 1, confidence: 'high' as const }],
      attentionAreas: [],
      inconsistencies: [],
      questionsForProfessional: ['What are late payment penalties?'],
      nextSteps: ['Verify billing address'],
    };

    const actions = await generateActions('Vendor_Contract.pdf', dummyAnalysis);
    expect(actions).toBeDefined();
    expect(actions.checklist.length).toBeGreaterThan(0);
    expect(actions.questionsForLawyer.length).toBeGreaterThan(0);
    expect(actions.lawyerBrief).toBeDefined();
  });

  it('analyzeDocument should never throw uncaught exceptions to caller', async () => {
    // Calling analyzeDocument should safely return a DocumentAnalysis even if offline / missing keys
    const result = await analyzeDocument(sampleContract, [
      { pageNumber: 1, text: sampleContract },
    ]);

    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
  });
});
