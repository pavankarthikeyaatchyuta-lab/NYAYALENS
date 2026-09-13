// Chat types for NyayaLens

export interface ChatSource {
  document: string;
  page: number;
  section: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  considerations: string[];
  suggestedQuestions: string[];
  disclaimer: string;
}

export interface ChatContext {
  documentId: string;
  documentName: string;
  documentSummary: string;
  selectedClause?: {
    title: string;
    originalText: string;
    section: string;
    page: number;
  };
  clauses: {
    title: string;
    section: string;
    page: number;
    attentionLevel: string;
  }[];
  obligations: {
    description: string;
    responsibleParty: string;
  }[];
  dates: {
    label: string;
    date: string;
  }[];
  attentionAreas: {
    title: string;
    attentionLevel: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  considerations?: string[];
  suggestedQuestions?: string[];
  createdAt: string;
}
