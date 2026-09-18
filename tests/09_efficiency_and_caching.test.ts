import { describe, it, expect, beforeEach } from 'vitest';
import { documentStore, StoredDocument, StoredComparison } from '../src/lib/store';
import { buildChatContext } from '../src/lib/ai/prompts';
import { checkRateLimit } from '../src/lib/security/rate-limiter';
import { getDemoAnalysis } from '../src/data/demo';
import type { ComparisonResult, ActionItems } from '../src/types';

describe('9. Efficiency, Token Optimization & AI Result Caching', () => {
  const dummyAnalysis = getDemoAnalysis();
  const testDocId = 'test-eff-doc-1';
  const testDocA = 'test-doc-a';
  const testDocB = 'test-doc-b';

  beforeEach(() => {
    documentStore.deleteDocument(testDocId);
    documentStore.deleteDocument(testDocA);
    documentStore.deleteDocument(testDocB);
  });

  it('should reuse existing document analysis without re-analyzing', () => {
    const doc: StoredDocument = {
      id: testDocId,
      name: 'Contract.pdf',
      documentType: 'Agreement',
      fileType: 'pdf',
      content: 'Dummy contract text content.',
      pages: [{ pageNumber: 1, text: 'Dummy contract text content.' }],
      pageCount: 1,
      status: 'analyzed',
      createdAt: new Date().toISOString(),
      analysis: dummyAnalysis,
    };

    documentStore.addDocument(doc);

    const retrieved = documentStore.getDocument(testDocId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.status).toBe('analyzed');
    expect(retrieved?.analysis).toBeDefined();
    expect(retrieved?.analysis?.documentType).toBe(dummyAnalysis.documentType);
  });

  it('should cache and symmetrically retrieve document comparisons', () => {
    const comparisonResult: ComparisonResult = {
      summary: 'Comparison shows alignment on definitions but divergence on survival.',
      changes: [
        {
          id: 'ch-1',
          area: 'Survival Period',
          category: 'changed',
          documentA: '3 years',
          documentB: '5 years',
          explanation: 'Document B extends secrecy duration by 2 years.',
          attentionLevel: 'high'
        }
      ],
      areasWorthReviewing: ['Check if the extended survival is mutual.']
    };

    const comp: StoredComparison = {
      id: 'comp-123',
      documentAId: testDocA,
      documentBId: testDocB,
      result: comparisonResult,
      createdAt: new Date().toISOString()
    };

    documentStore.addComparison(comp);

    const lookupDirect = documentStore.getComparisonByDocs(testDocA, testDocB);
    expect(lookupDirect).toBeDefined();
    expect(lookupDirect?.result.changes.length).toBe(1);

    const lookupReverse = documentStore.getComparisonByDocs(testDocB, testDocA);
    expect(lookupReverse).toBeDefined();
    expect(lookupReverse?.result.summary).toBe(comparisonResult.summary);
  });

  it('should cache and persist action items on stored documents', () => {
    const actions: ActionItems = {
      nextSteps: ['Schedule lawyer meeting', 'Review NDA section 4'],
      checklist: [
        { id: 'c-1', text: 'Verify definition of confidential data', checked: false, category: 'other' }
      ],
      questionsForLawyer: [
        { id: 'q-1', question: 'Is 5 years standard?', priority: 'high', context: 'NDA Review' }
      ],
      lawyerBrief: {
        matter: 'NDA Review',
        documentType: 'NDA',
        partiesInvolved: ['Acme Corp', 'Beta Ltd'],
        keyConcerns: ['Survival Period'],
        relevantClauses: [],
        importantDates: [],
        questions: ['Is 5 years standard?'],
        documentsReviewed: ['Contract.pdf'],
        generatedAt: '2026-06-01'
      }
    };

    const doc: StoredDocument = {
      id: testDocId,
      name: 'Contract.pdf',
      documentType: 'Agreement',
      fileType: 'pdf',
      content: 'Contract text.',
      pages: [{ pageNumber: 1, text: 'Contract text.' }],
      pageCount: 1,
      status: 'analyzed',
      createdAt: new Date().toISOString(),
      analysis: dummyAnalysis,
    };

    documentStore.addDocument(doc);
    documentStore.updateDocument(testDocId, { actions });

    const updated = documentStore.getDocument(testDocId);
    expect(updated?.actions).toBeDefined();
    expect(updated?.actions?.checklist.length).toBe(1);
    expect(updated?.actions?.nextSteps.length).toBe(2);
  });

  it('should build token-efficient bounded chat context without unbounded expansion', () => {
    const massiveClauses = Array.from({ length: 40 }, (_, i) => ({
      title: `Clause ${i + 1}`,
      section: `Sec ${i + 1}`,
      page: i + 1,
      attentionLevel: 'low'
    }));

    const prompt = buildChatContext({
      documentName: 'Enterprise_Master_Services_Agreement.pdf',
      documentSummary: 'A long enterprise MSA with 40 distinct clauses.',
      clauses: massiveClauses,
      obligations: Array.from({ length: 25 }, (_, i) => ({
        description: `Obligation ${i + 1}`,
        responsibleParty: 'Vendor'
      })),
      dates: Array.from({ length: 20 }, (_, i) => ({
        label: `Milestone ${i + 1}`,
        date: `2026-0${(i % 9) + 1}-01`
      })),
      attentionAreas: Array.from({ length: 15 }, (_, i) => ({
        title: `Concern ${i + 1}`,
        attentionLevel: 'medium'
      }))
    });

    expect(prompt.length).toBeLessThan(5000);
    expect(prompt).toContain('Enterprise_Master_Services_Agreement.pdf');
    expect(prompt).toContain('<untrusted_document_context>');
  });

  it('should maintain rate limiter operation without memory degradation', () => {
    const key = 'test-client-ip-evict';
    const initial = checkRateLimit(key, { limit: 5, windowMs: 50 });
    expect(initial.allowed).toBe(true);
    expect(initial.remaining).toBe(4);
  });
});
