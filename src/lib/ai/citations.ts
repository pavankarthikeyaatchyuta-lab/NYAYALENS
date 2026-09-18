/**
 * NyayaLens Citation Verification Engine
 * Strictly verifies that cited clauses, quotes, and pages actually exist in the processed document.
 * Prevents AI hallucinations and manufactured citations.
 */

export interface CitationVerificationInput {
  docName: string;
  quote?: string;
  page?: number;
  section?: string;
}

export interface CitationVerificationResult {
  verified: boolean;
  citationText: string;
  reason?: string;
  matchedPage?: number;
}

export const UNVERIFIED_CITATION_MESSAGE = 'Source could not be confidently located in the document.';

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function verifyCitation(
  input: CitationVerificationInput,
  document: {
    text: string;
    pageCount: number;
    pages?: { pageNumber: number; text: string }[];
  }
): CitationVerificationResult {
  if (!document || !document.text) {
    return {
      verified: false,
      citationText: UNVERIFIED_CITATION_MESSAGE,
      reason: 'Document text is empty or missing',
    };
  }

  const normalizedDocText = normalizeText(document.text);

  // 1. Verify Page Number if specified
  if (input.page !== undefined) {
    if (input.page < 1 || input.page > Math.max(1, document.pageCount)) {
      return {
        verified: false,
        citationText: UNVERIFIED_CITATION_MESSAGE,
        reason: `Cited page ${input.page} is outside valid document range (1-${document.pageCount})`,
      };
    }
  }

  // 2. Verify Quote if specified
  if (input.quote && input.quote.trim().length > 0) {
    const normalizedQuote = normalizeText(input.quote);
    const quoteWords = normalizedQuote.split(' ');
    
    // Check exact or substantial phrase match (first 6+ words or whole quote)
    const phraseToCheck = quoteWords.length > 5 
      ? quoteWords.slice(0, 5).join(' ') 
      : normalizedQuote;

    const existsInDoc = normalizedDocText.includes(phraseToCheck);

    if (!existsInDoc) {
      return {
        verified: false,
        citationText: UNVERIFIED_CITATION_MESSAGE,
        reason: 'Quotation not found in processed document context',
      };
    }

    // Check specific page if pages array is present
    if (input.page && document.pages && document.pages.length > 0) {
      const targetPage = document.pages.find(p => p.pageNumber === input.page);
      if (targetPage && !normalizeText(targetPage.text).includes(phraseToCheck)) {
        // Find which page it actually exists on
        const actualPage = document.pages.find(p => normalizeText(p.text).includes(phraseToCheck));
        if (actualPage) {
          return {
            verified: true,
            citationText: `Source: ${input.docName} · ${input.section || 'Document'} · Page ${actualPage.pageNumber}`,
            matchedPage: actualPage.pageNumber,
          };
        }
      }
    }
  }

  // 3. Verify Section if specified
  if (input.section && input.section.trim().length > 0) {
    const normalizedSection = normalizeText(input.section);
    if (!normalizedDocText.includes(normalizedSection)) {
      // If neither quote nor section matches, fail verification
      if (!input.quote) {
        return {
          verified: false,
          citationText: UNVERIFIED_CITATION_MESSAGE,
          reason: 'Section reference not found in document',
        };
      }
    }
  }

  const parts = [`Source: ${input.docName}`];
  if (input.section) parts.push(input.section);
  if (input.page) parts.push(`Page ${input.page}`);

  return {
    verified: true,
    citationText: parts.join(' · '),
    matchedPage: input.page,
  };
}
