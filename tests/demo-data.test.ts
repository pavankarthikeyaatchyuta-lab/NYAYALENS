import { describe, it, expect } from 'vitest';
import { demoText, demoAnalysis, demoActions, getDemoDocument, getDemoAnalysis } from '../src/data/demo';

describe('Demo Dataset and Fallback Integrity', () => {
  it('should provide complete demo document structure', () => {
    const doc = getDemoDocument();
    expect(doc).toBeDefined();
    expect(doc.id).toBe('demo-doc-1');
    expect(doc.name).toBe('Employment_Agreement_Ravi_Sharma');
    expect(doc.documentType).toBe('Employment Agreement');
    expect(doc.pages.length).toBe(3);
    expect(doc.content).toContain('EMPLOYMENT AGREEMENT');
  });

  it('should provide rich legal analysis with all required fields', () => {
    const analysis = getDemoAnalysis();
    expect(analysis).toBeDefined();
    expect(analysis.clauses.length).toBeGreaterThan(0);
    expect(analysis.obligations.length).toBeGreaterThan(0);
    expect(analysis.dates.length).toBeGreaterThan(0);
    expect(analysis.attentionAreas.length).toBeGreaterThan(0);
    expect(analysis.questionsForProfessional.length).toBeGreaterThan(0);
    expect(analysis.nextSteps.length).toBeGreaterThan(0);
  });

  it('should provide actionable lawyer brief and checklist items', () => {
    expect(demoActions).toBeDefined();
    expect(demoActions.checklist.length).toBeGreaterThan(0);
    expect(demoActions.questionsForLawyer.length).toBeGreaterThan(0);
    expect(demoActions.lawyerBrief).toBeDefined();
    expect(demoActions.lawyerBrief.keyConcerns.length).toBeGreaterThan(0);
  });
});
