'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { GitCompare, ArrowRight, Plus, Minus, RefreshCw, AlertTriangle } from 'lucide-react';
import { ComparisonResult } from '@/types';
import { ATTENTION_LEVEL_COLORS } from '@/lib/constants';

export default function ComparePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [docAId, setDocAId] = useState<string>('');
  const [docBId, setDocBId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        if (data.length >= 2) {
          setDocAId(data[0].id);
          setDocBId(data[1].id);
        } else if (data.length === 1) {
          setDocAId(data[0].id);
        }
        setFetchingDocs(false);
      })
      .catch(err => {
        console.error('Failed to fetch documents', err);
        setFetchingDocs(false);
      });
  }, []);

  const handleCompare = async () => {
    if (!docAId || !docBId) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIdA: docAId, documentIdB: docBId }),
      });
      
      if (!response.ok) {
        throw new Error('Comparison failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during comparison');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Added': return <Plus className="w-4 h-4 text-green-500" />;
      case 'Removed': return <Minus className="w-4 h-4 text-red-500" />;
      case 'Changed': return <RefreshCw className="w-4 h-4 text-amber-500" />;
      case 'Potentially Important': return <AlertTriangle className="w-4 h-4 text-purple-500" />;
      default: return <RefreshCw className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Added': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'Removed': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'Changed': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'Potentially Important': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  if (fetchingDocs) {
    return (
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
          <GitCompare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Compare Documents</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Select two versions of a document to analyze their differences.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {documents.length < 2 ? (
            <div className="text-center py-8 text-slate-500">
              <p>You need at least two documents to perform a comparison.</p>
              <p className="text-sm mt-2">Please upload more documents from the dashboard.</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="w-full md:w-2/5 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Document A (Original)</label>
                <Select value={docAId} onValueChange={(val) => setDocAId(val || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select original document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map(doc => (
                      <SelectItem key={doc.id} value={doc.id} disabled={doc.id === docBId}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="hidden md:flex pb-2 px-2 items-center justify-center">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className="w-full md:w-2/5 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Document B (Revised)</label>
                <Select value={docBId} onValueChange={(val) => setDocBId(val || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revised document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map(doc => (
                      <SelectItem key={doc.id} value={doc.id} disabled={doc.id === docAId}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleCompare} 
                disabled={!docAId || !docBId || loading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <GitCompare className="w-4 h-4 mr-2" />}
                Compare
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
              <CardTitle>Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-700 dark:text-slate-300">{result.summary}</p>
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-4">Detailed Changes</h3>
          
          <div className="space-y-4">
            {result.changes.map((change, index) => (
              <Card key={index} className="overflow-hidden border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b bg-slate-50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(change.category)}
                    <h4 className="font-semibold text-slate-900 dark:text-white">{change.area}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getCategoryBadgeClass(change.category)}>
                      {change.category}
                    </Badge>
                    <Badge variant="outline" className={ATTENTION_LEVEL_COLORS[change.attentionLevel]?.badge || 'bg-slate-100 text-slate-800'}>
                      {change.attentionLevel} Priority
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                    <div className="p-4 bg-red-50/50 dark:bg-red-950/20">
                      <h5 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Original</h5>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-through opacity-70">{change.documentA || 'None'}</p>
                    </div>
                    <div className="p-4 bg-green-50/50 dark:bg-green-950/20">
                      <h5 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">Revised</h5>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{change.documentB || 'None'}</p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Impact & Explanation</h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{change.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {result.areasWorthReviewing && result.areasWorthReviewing.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-4">Areas Worth Reviewing</h3>
              <Card>
                <CardContent className="p-6">
                  <ul className="list-disc pl-5 space-y-2">
                    {result.areasWorthReviewing.map((area, idx) => (
                      <li key={idx} className="text-slate-700 dark:text-slate-300">{area}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
