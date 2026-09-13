'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  FileText,
  AlertTriangle,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { getDemoDocument, getDemoAnalysis } from '@/data/demo';
import type { DocumentAnalysis, Clause } from '@/types';
import type { StoredDocument } from '@/lib/store';
import AttentionOverview from '@/components/analysis/attention-overview';
import ClauseCard from '@/components/analysis/clause-card';
import ClauseDetailSheet from '@/components/analysis/clause-detail-sheet';
import ObligationsList from '@/components/analysis/obligations-list';
import DateTimeline from '@/components/analysis/date-timeline';
import { ChatPanel } from '@/components/chat/chat-panel';

export default function DocumentAnalysisPage() {
  const params = useParams();
  const id = params.id as string;

  const [document, setDocument] = useState<StoredDocument | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClause, setSelectedClause] = useState<Clause | undefined>(undefined);
  const [detailClause, setDetailClause] = useState<Clause | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Check if it's the demo document or test ID
      if (id === 'demo' || id === 'demo-doc-1') {
        const demoDoc = getDemoDocument();
        setDocument(demoDoc);
        setAnalysis(demoDoc.analysis || getDemoAnalysis());
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/documents/${id}`);
        if (res.ok) {
          const doc = await res.json();
          setDocument(doc);
          if (doc.analysis) {
            setAnalysis(doc.analysis);
          }
        } else {
          // Fallback to demo document
          const demoDoc = getDemoDocument();
          setDocument(demoDoc);
          setAnalysis(demoDoc.analysis || getDemoAnalysis());
        }
      } catch {
        const demoDoc = getDemoDocument();
        setDocument(demoDoc);
        setAnalysis(demoDoc.analysis || getDemoAnalysis());
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading || !document || !analysis) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-[600px] lg:col-span-3 rounded-xl" />
          <Skeleton className="h-[600px] lg:col-span-5 rounded-xl" />
          <Skeleton className="h-[600px] lg:col-span-4 rounded-xl" />
        </div>
      </div>
    );
  }

  const highAttentionCount = analysis.attentionAreas.filter(a => a.attentionLevel === 'high').length;
  const mediumAttentionCount = analysis.attentionAreas.filter(a => a.attentionLevel === 'medium').length;
  const lowAttentionCount = analysis.attentionAreas.filter(a => a.attentionLevel === 'low').length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Three Panel Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0">
        
        {/* LEFT PANEL - Overview (3 cols) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto pr-1">
          <Card className="border-slate-200 dark:border-slate-800 shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{document.documentType || analysis.documentType}</span>
              </div>
              <CardTitle className="text-lg font-bold leading-snug text-slate-900 dark:text-white">
                {document.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Pages</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{document.pageCount || 1}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Complexity</span>
                <Badge variant="outline" className="capitalize text-xs">
                  {analysis.complexity}
                </Badge>
              </div>

              {/* Attention Indicators */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Attention Areas
                </h4>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-2 rounded-lg">
                    <div className="font-bold text-red-600 dark:text-red-400 text-base">{highAttentionCount}</div>
                    <div className="text-[10px] text-red-700 dark:text-red-300 font-medium">High</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-2 rounded-lg">
                    <div className="font-bold text-amber-600 dark:text-amber-400 text-base">{mediumAttentionCount}</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Medium</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-2 rounded-lg">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-base">{lowAttentionCount}</div>
                    <div className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Low</div>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  Parties Identified
                </h4>
                <div className="space-y-1.5">
                  {analysis.parties.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate mr-2" title={p.name}>{p.name}</span>
                      <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">{p.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Link */}
              <div className="pt-3">
                <Link href="/action-center" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                    Go to Action Center <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER PANEL - Analysis Workspace (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <TabsList className="w-full justify-start h-10 bg-transparent p-0 gap-4">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 h-full data-[state=active]:shadow-none text-xs sm:text-sm font-medium"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="clauses"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 h-full data-[state=active]:shadow-none text-xs sm:text-sm font-medium"
                >
                  Clauses ({analysis.clauses.length})
                </TabsTrigger>
                <TabsTrigger
                  value="obligations"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 h-full data-[state=active]:shadow-none text-xs sm:text-sm font-medium"
                >
                  Obligations ({analysis.obligations.length})
                </TabsTrigger>
                <TabsTrigger
                  value="dates"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 h-full data-[state=active]:shadow-none text-xs sm:text-sm font-medium"
                >
                  Dates ({analysis.dates.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* Tab 1: Overview */}
              <TabsContent value="overview" className="m-0 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      Document Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {analysis.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Attention Overview */}
                <AttentionOverview attentionAreas={analysis.attentionAreas} />

                {/* Inconsistencies if any */}
                {analysis.inconsistencies && analysis.inconsistencies.length > 0 && (
                  <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Noticed Inconsistencies or Discrepancies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.inconsistencies.map((item, i) => (
                          <li key={i} className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2">
                            <span className="font-bold text-amber-600 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Tab 2: Clauses */}
              <TabsContent value="clauses" className="m-0 space-y-4">
                {analysis.clauses.map((clause, idx) => (
                  <ClauseCard 
                    key={clause.id || idx} 
                    clause={clause} 
                    onAskAI={(c) => setSelectedClause(c)} 
                    onViewDetails={(c) => setDetailClause(c)} 
                  />
                ))}
              </TabsContent>
              
              {/* Tab 3: Obligations */}
              <TabsContent value="obligations" className="m-0">
                <ObligationsList obligations={analysis.obligations} />
              </TabsContent>
              
              {/* Tab 4: Dates */}
              <TabsContent value="dates" className="m-0">
                <DateTimeline dates={analysis.dates} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* RIGHT PANEL - Grounded Nyaya AI Chatbot (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
          <ChatPanel
            documentId={id}
            documentName={document.name}
            analysis={analysis}
            selectedClause={selectedClause}
            onClearSelectedClause={() => setSelectedClause(undefined)}
          />
        </div>
      </div>

      {/* Detail Sheet modal */}
      {detailClause && (
        <ClauseDetailSheet
          clause={detailClause}
          open={!!detailClause}
          onClose={() => setDetailClause(null)}
        />
      )}
    </div>
  );
}
