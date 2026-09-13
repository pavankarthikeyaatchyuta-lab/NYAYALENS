import { NextResponse } from 'next/server';
import { documentStore } from '@/lib/store';

export async function GET() {
  const documents = documentStore.getAllDocuments();

  const formattedDocuments = documents.map(doc => {
    let highAttentionCount = 0;
    let totalAttentionCount = 0;

    if (doc.analysis) {
      const allClauses = doc.analysis.clauses || [];
      totalAttentionCount = allClauses.length;
      highAttentionCount = allClauses.filter(c => c.attentionLevel === 'high').length;
    }

    return {
      id: doc.id,
      name: doc.name,
      documentType: doc.documentType,
      fileType: doc.fileType,
      pageCount: doc.pageCount,
      status: doc.status,
      createdAt: doc.createdAt,
      analyzedAt: doc.analyzedAt,
      highAttentionCount,
      totalAttentionCount,
    };
  });

  return NextResponse.json(formattedDocuments);
}
