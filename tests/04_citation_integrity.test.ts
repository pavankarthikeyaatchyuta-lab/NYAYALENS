import { describe, it, expect } from 'vitest';
import { verifyCitation, UNVERIFIED_CITATION_MESSAGE } from '../src/lib/ai/citations';

describe('4. Citation Integrity & Grounding Verification', () => {
  const documentFixture = {
    text: `COMMERCIAL LEASE AGREEMENT
Page 1:
This Commercial Lease Agreement is executed on 15 March 2026.
Clause 1. Term: The lease shall be for a duration of 36 calendar months.

Page 2:
Clause 5. Indemnity: The Tenant agrees to indemnify and hold harmless the Landlord from all liabilities.
Clause 6. Security Deposit: A refundable deposit of INR 5,00,000 shall be maintained throughout the lease term.`,
    pageCount: 2,
    pages: [
      {
        pageNumber: 1,
        text: 'This Commercial Lease Agreement is executed on 15 March 2026. Clause 1. Term: The lease shall be for a duration of 36 calendar months.',
      },
      {
        pageNumber: 2,
        text: 'Clause 5. Indemnity: The Tenant agrees to indemnify and hold harmless the Landlord from all liabilities. Clause 6. Security Deposit: A refundable deposit of INR 5,00,000.',
      },
    ],
  };

  it('should verify genuine quotes found in the document text', () => {
    const result = verifyCitation(
      {
        docName: 'Commercial_Lease.pdf',
        quote: 'The lease shall be for a duration of 36 calendar months',
        page: 1,
        section: 'Clause 1',
      },
      documentFixture
    );

    expect(result.verified).toBe(true);
    expect(result.citationText).toContain('Commercial_Lease.pdf');
    expect(result.citationText).toContain('Clause 1');
    expect(result.citationText).toContain('Page 1');
  });

  it('should reject fabricated quotations not present in the document', () => {
    const result = verifyCitation(
      {
        docName: 'Commercial_Lease.pdf',
        quote: 'The tenant is entitled to automatic 50% rent reduction during economic downturns',
        page: 1,
        section: 'Clause 1',
      },
      documentFixture
    );

    expect(result.verified).toBe(false);
    expect(result.citationText).toBe(UNVERIFIED_CITATION_MESSAGE);
  });

  it('should reject citations with page numbers out of document bounds', () => {
    const result = verifyCitation(
      {
        docName: 'Commercial_Lease.pdf',
        page: 99, // document only has 2 pages
        section: 'Clause 1',
      },
      documentFixture
    );

    expect(result.verified).toBe(false);
    expect(result.citationText).toBe(UNVERIFIED_CITATION_MESSAGE);
  });

  it('should correct citations if quote exists on a different page than cited', () => {
    const result = verifyCitation(
      {
        docName: 'Commercial_Lease.pdf',
        quote: 'The Tenant agrees to indemnify and hold harmless',
        page: 1, // Actually on page 2!
        section: 'Clause 5',
      },
      documentFixture
    );

    expect(result.verified).toBe(true);
    expect(result.matchedPage).toBe(2);
    expect(result.citationText).toContain('Page 2');
  });

  it('should handle empty or null document text safely without throwing', () => {
    const result = verifyCitation(
      {
        docName: 'Empty.pdf',
        quote: 'Some quote',
        page: 1,
      },
      { text: '', pageCount: 0 }
    );

    expect(result.verified).toBe(false);
    expect(result.citationText).toBe(UNVERIFIED_CITATION_MESSAGE);
  });
});
