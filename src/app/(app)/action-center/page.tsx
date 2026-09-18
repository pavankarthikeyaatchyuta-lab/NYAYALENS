'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare, List, HelpCircle, FileText, Copy, Download, Clipboard, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { ActionItems } from '@/types';
import { getDemoDocument } from '@/data/demo';

export default function ActionCenterPage() {
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; status?: string }>>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItems | null>(null);
  const [actionCache, setActionCache] = useState<Record<string, ActionItems>>({});
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.length > 0) {
          setDocuments(data);
          setSelectedDocId(data[0].id);
        } else {
          // If no documents exist yet, offer demo document
          const demoDoc = getDemoDocument();
          setDocuments([{ id: demoDoc.id, name: `${demoDoc.name} (Demo)` }]);
          setSelectedDocId(demoDoc.id);
          if (demoDoc.actions) {
            setActionItems(demoDoc.actions);
            setActionCache(prev => ({ ...prev, [demoDoc.id]: demoDoc.actions! }));
          }
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to fetch documents', err);
        const demoDoc = getDemoDocument();
        setDocuments([{ id: demoDoc.id, name: `${demoDoc.name} (Demo)` }]);
        setSelectedDocId(demoDoc.id);
        if (demoDoc.actions) {
          setActionItems(demoDoc.actions);
          setActionCache(prev => ({ ...prev, [demoDoc.id]: demoDoc.actions! }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerate = async () => {
    if (!selectedDocId) return;
    
    // Check client cache first
    if (actionCache[selectedDocId]) {
      setActionItems(actionCache[selectedDocId]);
      return;
    }

    // Handle demo document directly
    if (selectedDocId === 'demo-doc-1') {
      const demo = getDemoDocument();
      if (demo.actions) {
        setActionItems(demo.actions);
        setActionCache(prev => ({ ...prev, [selectedDocId]: demo.actions! }));
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedDocId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate action items');
      }
      
      const data = await response.json();
      setActionItems(data);
      setActionCache(prev => ({ ...prev, [selectedDocId]: data }));
      setCheckedItems({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [id]: checked }));
  };

  const notifyCopied = (label: string) => {
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    notifyCopied('Question copied to clipboard');
  };

  const handleCopyBrief = () => {
    if (!actionItems?.lawyerBrief) return;
    const brief = actionItems.lawyerBrief;
    
    const text = `
MATTER: ${brief.matter}
DOCUMENT TYPE: ${brief.documentType}
PARTIES: ${brief.partiesInvolved.join(' vs ')}

KEY CONCERNS:
${brief.keyConcerns.map(c => `- ${c}`).join('\n')}

RELEVANT CLAUSES:
${brief.relevantClauses.map(c => `- ${c.title} (${c.section}, Page ${c.page}): ${c.concern}`).join('\n')}

IMPORTANT DATES:
${brief.importantDates.map(d => `- ${d.label}: ${d.date}`).join('\n')}

QUESTIONS FOR LAWYER:
${brief.questions.map(q => `- ${q}`).join('\n')}

DOCUMENTS REVIEWED:
${brief.documentsReviewed.map(d => `- ${d}`).join('\n')}

Generated: ${brief.generatedAt}
    `.trim();

    navigator.clipboard.writeText(text);
    notifyCopied('Consultation brief copied to clipboard');
  };

  const handleDownloadBrief = () => {
    if (!actionItems?.lawyerBrief) return;
    const brief = actionItems.lawyerBrief;
    
    const text = `
NYAYALENS — LAWYER CONSULTATION BRIEF
"Understand your rights. Know your next step."

MATTER: ${brief.matter}
DOCUMENT TYPE: ${brief.documentType}
PARTIES: ${brief.partiesInvolved.join(' vs ')}

KEY CONCERNS IDENTIFIED:
${brief.keyConcerns.map(c => `- ${c}`).join('\n')}

RELEVANT CLAUSES:
${brief.relevantClauses.map(c => `- ${c.title} (${c.section}, Page ${c.page}): ${c.concern}`).join('\n')}

IMPORTANT DATES:
${brief.importantDates.map(d => `- ${d.label}: ${d.date}`).join('\n')}

QUESTIONS PREPARED FOR LEGAL COUNSEL:
${brief.questions.map(q => `- ${q}`).join('\n')}

DOCUMENTS REVIEWED:
${brief.documentsReviewed.map(d => `- ${d}`).join('\n')}

Generated on: ${brief.generatedAt}
Notice: NyayaLens provides AI-assisted legal preparation. This brief is intended to facilitate consultation with a qualified legal professional.
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NyayaLens_Brief_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Action Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Transform document analysis into actionable checklists, questions, and a consultation brief.
          </p>
        </div>
      </div>

      {copiedNotification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full md:w-1/2 space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Document</label>
              <Select
                value={selectedDocId}
                onValueChange={(val) => {
                  const newId = val || '';
                  setSelectedDocId(newId);
                  if (actionCache[newId]) {
                    setActionItems(actionCache[newId]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document" />
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
            
            <Button 
              onClick={handleGenerate} 
              disabled={!selectedDocId || loading}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? <Zap className="w-4 h-4 mr-2 animate-pulse" /> : <Zap className="w-4 h-4 mr-2" />}
              Generate Action Items
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!loading && actionItems && (
        <Tabs defaultValue="next-steps" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-100 dark:bg-slate-900 p-1">
            <TabsTrigger value="next-steps" className="flex items-center gap-2 text-xs sm:text-sm">
              <List className="w-4 h-4" /> Next Steps
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckSquare className="w-4 h-4" /> Checklist
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2 text-xs sm:text-sm">
              <HelpCircle className="w-4 h-4" /> Lawyer Questions
            </TabsTrigger>
            <TabsTrigger value="brief" className="flex items-center gap-2 text-xs sm:text-sm">
              <FileText className="w-4 h-4" /> Consultation Brief
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Next Steps */}
          <TabsContent value="next-steps" className="mt-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pragmatic, prioritized measures based on your document&apos;s terms.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionItems.nextSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 pt-0.5 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Checklist */}
          <TabsContent value="checklist" className="mt-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Before Signing Checklist</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Check off items as you verify terms with counterparties or legal counsel.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {actionItems.checklist.map((item) => {
                    const isChecked = checkedItems[item.id] ?? item.checked;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                          isChecked
                            ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                        }`}
                      >
                        <Checkbox
                          id={item.id}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleCheck(item.id, !!checked)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-1">
                          <label
                            htmlFor={item.id}
                            className={`text-sm font-medium cursor-pointer ${
                              isChecked ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.text}
                          </label>
                          {item.category && (
                            <Badge variant="outline" className="text-[10px] ml-2 font-normal">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Questions for Lawyer */}
          <TabsContent value="questions" className="mt-6">
            <div className="grid gap-4">
              {actionItems.questionsForLawyer.map((q, idx) => (
                <Card key={idx} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start">
                    <div className="shrink-0 mt-1">
                      <HelpCircle className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={q.priority === 'high' ? 'destructive' : q.priority === 'medium' ? 'default' : 'secondary'} className="capitalize">
                          {q.priority} Priority
                        </Badge>
                        {q.relatedClause && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Re: {q.relatedClause}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{q.question}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-100 dark:border-slate-800 mt-2">
                        <span className="font-medium text-slate-900 dark:text-white">Context:</span> {q.context}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleCopyText(q.question)} className="shrink-0 text-slate-500 hover:text-indigo-600">
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab 4: Lawyer Consultation Brief */}
          <TabsContent value="brief" className="mt-6">
            <Card className="border-indigo-100 dark:border-indigo-900/40 shadow-xs">
              <CardHeader className="bg-indigo-50/60 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                <div>
                  <CardTitle className="text-indigo-950 dark:text-indigo-300 text-lg">Lawyer Consultation Brief</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Generated: {actionItems.lawyerBrief?.generatedAt}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyBrief} className="bg-white dark:bg-slate-900 text-xs">
                    <Clipboard className="w-3.5 h-3.5 mr-1.5" /> Copy Brief
                  </Button>
                  <Button size="sm" onClick={handleDownloadBrief} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download .txt
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 lg:p-8 space-y-6 bg-white dark:bg-slate-950">
                {actionItems.lawyerBrief && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Matter</h5>
                        <p className="text-slate-900 dark:text-white font-medium text-sm">{actionItems.lawyerBrief.matter}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Document Type</h5>
                        <p className="text-slate-900 dark:text-white font-medium text-sm">{actionItems.lawyerBrief.documentType}</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Parties Involved</h5>
                      <div className="flex flex-wrap items-center gap-2">
                        {actionItems.lawyerBrief.partiesInvolved.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Identified Concerns</h5>
                      <ul className="space-y-1.5 text-sm">
                        {actionItems.lawyerBrief.keyConcerns.map((concern, i) => (
                          <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300">
                            <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Relevant Clauses for Legal Review</h5>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full text-xs sm:text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-semibold w-1/3">Clause / Section</th>
                              <th className="px-4 py-2.5 text-left font-semibold">Identified Issue / Query</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {actionItems.lawyerBrief.relevantClauses.map((clause, i) => (
                              <tr key={i} className="bg-white dark:bg-slate-950">
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white align-top">
                                  {clause.title} <span className="text-xs text-slate-400 font-normal">({clause.section}, Page {clause.page})</span>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 align-top">{clause.concern}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Questions to Ask Legal Counsel</h5>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                          {actionItems.lawyerBrief.questions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Important Deadlines / Dates</h5>
                        <ul className="space-y-1.5">
                          {actionItems.lawyerBrief.importantDates.map((date, i) => (
                            <li key={i} className="flex justify-between text-xs sm:text-sm p-2 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-800">
                              <span className="text-slate-600 dark:text-slate-400">{date.label}</span>
                              <span className="font-semibold text-slate-900 dark:text-white">{date.date}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
