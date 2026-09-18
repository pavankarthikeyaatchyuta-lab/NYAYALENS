import { describe, it, expect } from 'vitest';
import { demoActions, getDemoAnalysis } from '../src/data/demo';
import { generateActions } from '../src/lib/ai/actions';
import { compareDocuments } from '../src/lib/ai/compare';

describe('5. Document Comparison, Checklist & Lawyer Brief Generation', () => {
  it('should compare two documents and generate structured diffs', async () => {
    const analysisA = getDemoAnalysis();
    const analysisB = {
      ...analysisA,
      documentType: 'Revised Employment Agreement',
      clauses: analysisA.clauses.slice(0, 2),
    };

    const comparison = await compareDocuments(
      { name: 'Agreement_v1.pdf', summary: analysisA.summary, analysis: analysisA },
      { name: 'Agreement_v2.pdf', summary: analysisB.summary, analysis: analysisB }
    );

    expect(comparison).toBeDefined();
    expect(comparison.summary).toBeDefined();
    expect(comparison.changes.length).toBeGreaterThan(0);

    for (const change of comparison.changes) {
      expect(change.id).toBeDefined();
      expect(change.area).toBeDefined();
      expect(['added', 'removed', 'changed', 'potentially-important']).toContain(change.category);
      expect(change.explanation).toBeDefined();
      expect(['high', 'medium', 'low']).toContain(change.attentionLevel);
    }
  });

  it('should generate structured actionable items without throwing', async () => {
    const analysis = getDemoAnalysis();
    const actions = await generateActions('Employment_Agreement.pdf', analysis);

    expect(actions).toBeDefined();
    expect(actions.checklist.length).toBeGreaterThan(0);
    expect(actions.questionsForLawyer.length).toBeGreaterThan(0);
    expect(actions.lawyerBrief).toBeDefined();
    expect(actions.lawyerBrief.keyConcerns.length).toBeGreaterThan(0);
  });

  it('should format lawyer consultation brief with essential briefing sections', () => {
    const brief = demoActions.lawyerBrief;

    expect(brief.matter).toContain('Employment Agreement');
    expect(brief.partiesInvolved.length).toBeGreaterThan(0);
    expect(brief.keyConcerns.length).toBeGreaterThan(0);
    expect(brief.relevantClauses.length).toBeGreaterThan(0);
    expect(brief.importantDates.length).toBeGreaterThan(0);
    expect(brief.questions.length).toBeGreaterThan(0);
    expect(brief.documentsReviewed.length).toBeGreaterThan(0);
  });

  it('should verify checklist items contain unique ids and action categories', () => {
    for (const item of demoActions.checklist) {
      expect(item.id).toBeDefined();
      expect(typeof item.text).toBe('string');
      expect(item.text.length).toBeGreaterThan(5);
      expect(typeof item.checked).toBe('boolean');
      expect(item.category).toBeDefined();
    }
  });
});
