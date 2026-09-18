'use client';

import React, { useState, useEffect } from 'react';
import { ChatPanel } from '@/components/chat/chat-panel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [documents, setDocuments] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        setDocuments(data);
        if (data.length > 0) {
          setSelectedDocId(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to fetch documents', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chat with Document</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Ask questions about your uploaded legal documents.
          </p>
        </div>
        
        {documents.length > 0 && (
          <div className="w-full sm:w-64">
            <Select value={selectedDocId} onValueChange={(val) => setSelectedDocId(val || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {documents.map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center border rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border rounded-lg bg-slate-50 dark:bg-slate-900/50 text-center p-6">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No documents found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
              Upload a document from the dashboard to start chatting with it.
            </p>
            <Link href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors">
              Go to Dashboard
            </Link>
          </div>
        ) : selectedDoc ? (
          <ChatPanel 
            documentId={selectedDoc.id} 
            documentName={selectedDoc.name} 
          />
        ) : (
          <div className="h-full flex items-center justify-center border rounded-lg bg-slate-50 dark:bg-slate-900/50 text-center p-6 text-slate-500">
            Please select a document to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
