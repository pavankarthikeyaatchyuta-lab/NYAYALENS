'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Clause } from '@/types';
import { ATTENTION_LEVEL_COLORS, CLAUSE_CATEGORY_LABELS } from '@/lib/constants';
import ClauseDetailSheet from './clause-detail-sheet';

interface ClauseCardProps {
  clause: Clause;
  onAskAI: (clause: Clause) => void;
  onViewDetails?: (clause: Clause) => void;
}

export default function ClauseCard({ clause, onAskAI, onViewDetails }: ClauseCardProps) {
  const [showSimple, setShowSimple] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {CLAUSE_CATEGORY_LABELS[clause.category] || clause.category}
                </Badge>
                <Badge variant="outline" className={ATTENTION_LEVEL_COLORS[clause.attentionLevel]?.badge || 'bg-slate-100'}>
                  {clause.attentionLevel} Attention
                </Badge>
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{clause.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Source: Page {clause.page} · {clause.section}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-500">
              Why it may matter
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {clause.whyItMayMatter}
            </p>
          </div>

          {showSimple && clause.simplifiedExplanation && (
            <div className="p-4 border-l-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-lg">
              <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1">
                Plain-Language Explanation
              </h4>
              <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
                {clause.simplifiedExplanation}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowSimple(!showSimple)} className="text-xs h-8">
              {showSimple ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
              {showSimple ? 'Hide Simple Text' : 'Explain Simply'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAskAI(clause)} className="text-xs h-8 text-indigo-600 hover:text-indigo-700">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Ask AI
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSheetOpen(true);
                if (onViewDetails) onViewDetails(clause);
              }}
              className="text-xs h-8 ml-auto"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </Card>
      
      <ClauseDetailSheet 
        clause={clause} 
        open={sheetOpen} 
        onClose={() => setSheetOpen(false)} 
      />
    </>
  );
}
