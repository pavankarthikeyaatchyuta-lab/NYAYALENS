// In-memory store for when Supabase is not configured
// This allows the app to function in demo/standalone mode

import type { DocumentAnalysis, ActionItems, ComparisonResult } from '@/types';
import { getDemoDocument } from '@/data/demo';

export interface StoredDocument {
  id: string;
  name: string;
  documentType: string;
  fileType: string;
  content: string;
  pages: { pageNumber: number; text: string }[];
  pageCount: number;
  status: 'uploading' | 'processing' | 'analyzed' | 'error';
  createdAt: string;
  analyzedAt?: string;
  analysis?: DocumentAnalysis;
  actions?: ActionItems;
}

export interface StoredComparison {
  id: string;
  documentAId: string;
  documentBId: string;
  result: ComparisonResult;
  createdAt: string;
}

// Simple in-memory store (persists for server lifetime, not across restarts)
// For hackathon demo purposes
class DocumentStore {
  private documents: Map<string, StoredDocument> = new Map();
  private comparisons: Map<string, StoredComparison> = new Map();
  private chatHistory: Map<string, { role: string; content: string }[]> = new Map();
  private seeded = false;

  private seedDemoIfEmpty(): void {
    if (!this.seeded && this.documents.size === 0) {
      this.seeded = true;
      try {
        const demoDoc = getDemoDocument();
        this.documents.set(demoDoc.id, demoDoc);
      } catch (err) {
        console.error('Failed to seed demo document', err);
      }
    }
  }

  // Documents
  addDocument(doc: StoredDocument): void {
    this.seedDemoIfEmpty();
    this.documents.set(doc.id, doc);
  }

  getDocument(id: string): StoredDocument | undefined {
    this.seedDemoIfEmpty();
    if (id === 'demo' || id === 'demo-doc-1') {
      return this.documents.get('demo-doc-1') || getDemoDocument();
    }
    return this.documents.get(id);
  }

  getAllDocuments(): StoredDocument[] {
    this.seedDemoIfEmpty();
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateDocument(id: string, updates: Partial<StoredDocument>): void {
    this.seedDemoIfEmpty();
    const doc = this.documents.get(id);
    if (doc) {
      this.documents.set(id, { ...doc, ...updates });
    }
  }

  deleteDocument(id: string): void {
    this.documents.delete(id);
  }

  // Comparisons
  addComparison(comp: StoredComparison): void {
    this.comparisons.set(comp.id, comp);
  }

  getComparison(id: string): StoredComparison | undefined {
    return this.comparisons.get(id);
  }

  // Chat history
  getChatHistory(documentId: string): { role: string; content: string }[] {
    return this.chatHistory.get(documentId) || [];
  }

  addChatMessage(documentId: string, message: { role: string; content: string }): void {
    const history = this.chatHistory.get(documentId) || [];
    history.push(message);
    this.chatHistory.set(documentId, history);
  }

  clearChatHistory(documentId: string): void {
    this.chatHistory.delete(documentId);
  }
}

// Singleton instance
export const documentStore = new DocumentStore();
