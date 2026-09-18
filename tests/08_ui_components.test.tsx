import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClauseCard from '../src/components/analysis/clause-card';
import AttentionOverview from '../src/components/analysis/attention-overview';
import type { Clause, AttentionArea } from '../src/types';

describe('8. Important UI Components & Accessibility Interaction', () => {
  const dummyClause: Clause = {
    id: 'test-c1',
    title: 'Intellectual Property Assignment',
    section: 'Section 5.1',
    page: 2,
    originalText: 'All inventions made during employment belong exclusively to Company.',
    simplifiedExplanation: 'Any code or product you build while employed here is owned by the company.',
    whyItMayMatter: 'May include projects you work on in your own personal spare time.',
    attentionLevel: 'high',
    category: 'intellectual-property',
    questions: ['Does this cover weekend side projects?'],
  };

  const dummyAttentionAreas: AttentionArea[] = [
    {
      id: 'att-1',
      title: 'Broad IP Assignment',
      description: 'May capture inventions created outside business hours.',
      category: 'intellectual-property',
      attentionLevel: 'high',
      clauseIds: ['test-c1'],
    },
    {
      id: 'att-2',
      title: 'Notice Period',
      description: 'Requires 60 days advance notice before resignation.',
      category: 'obligations',
      attentionLevel: 'medium',
      clauseIds: [],
    },
  ];

  it('should render ClauseCard with title, category, and accessible attention badge', () => {
    const handleAskAI = vi.fn();
    render(<ClauseCard clause={dummyClause} onAskAI={handleAskAI} />);

    expect(screen.getByText('Intellectual Property Assignment')).toBeDefined();
    expect(screen.getByText('Source: Page 2 · Section 5.1')).toBeDefined();
    expect(screen.getByText(/high attention/i)).toBeDefined();
  });

  it('should expand plain-language explanation and update aria-expanded on button click', () => {
    const handleAskAI = vi.fn();
    render(<ClauseCard clause={dummyClause} onAskAI={handleAskAI} />);

    const explainButton = screen.getByRole('button', { name: /explain intellectual property assignment in simple language/i });
    expect(explainButton.getAttribute('aria-expanded')).toBe('false');

    // Click button to expand
    fireEvent.click(explainButton);

    expect(explainButton.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Plain-Language Explanation')).toBeDefined();
    expect(screen.getByText(dummyClause.simplifiedExplanation!)).toBeDefined();
  });

  it('should call onAskAI callback with selected clause when Ask AI button is clicked', () => {
    const handleAskAI = vi.fn();
    render(<ClauseCard clause={dummyClause} onAskAI={handleAskAI} />);

    const askAIButton = screen.getByRole('button', { name: /ask ai about intellectual property assignment/i });
    fireEvent.click(askAIButton);

    expect(handleAskAI).toHaveBeenCalledWith(dummyClause);
  });

  it('should render AttentionOverview with both icons and textual attention indicators', () => {
    render(<AttentionOverview attentionAreas={dummyAttentionAreas} />);

    expect(screen.getByText('Areas That May Deserve Attention')).toBeDefined();
    expect(screen.getByText('Broad IP Assignment')).toBeDefined();
    expect(screen.getByText('Notice Period')).toBeDefined();
    expect(screen.getByText('high Attention')).toBeDefined();
    expect(screen.getByText('medium Attention')).toBeDefined();
  });
});
