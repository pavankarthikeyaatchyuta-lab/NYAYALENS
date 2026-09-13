'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, FileText, AlertTriangle, Lightbulb } from 'lucide-react';
import { Clause } from '@/types';
import { ATTENTION_LEVEL_COLORS, CLAUSE_CATEGORY_LABELS, SHORT_DISCLAIMER } from '@/lib/constants';

interface ClauseDetailSheetProps {
  clause: Clause;
  open: boolean;
  onClose: () => void;
}

export default function ClauseDetailSheet({ clause, open, onClose }: ClauseDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md md:max-w-xl lg:max-w-2xl overflow-hidden flex flex-col p-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <SheetHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {CLAUSE_CATEGORY_LABELS[clause.category] || clause.category}
              </Badge>
              <Badge variant="outline" className={ATTENTION_LEVEL_COLORS[clause.attentionLevel]?.badge || 'bg-slate-100'}>
                {clause.attentionLevel} Attention
              </Badge>
              <span className="text-xs text-slate-500 ml-auto flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1 text-slate-400" />
                Page {clause.page} · {clause.section}
              </span>
            </div>
            <SheetTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {clause.title}
            </SheetTitle>
          </SheetHeader>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 pb-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                <Lightbulb className="h-4 w-4" />
                Plain-Language Explanation
              </h3>
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg p-4">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base">
                  {clause.simplifiedExplanation || "No simplified explanation available."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                Why it may matter
              </h3>
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-lg p-4">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                  {clause.whyItMayMatter}
                </p>
              </div>
            </div>

            {clause.questions && clause.questions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Questions to Consider Asking
                </h3>
                <ul className="space-y-2">
                  {clause.questions.map((q, idx) => (
                    <li key={idx} className="flex gap-2 text-slate-700 dark:text-slate-300 text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-indigo-500 shrink-0">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-slate-500 uppercase tracking-wider">
                <FileText className="h-4 w-4" />
                Original Legal Text
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-800">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {clause.originalText}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] text-slate-400 text-center">
              {SHORT_DISCLAIMER}
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
