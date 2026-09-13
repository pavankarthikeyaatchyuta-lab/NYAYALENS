'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';
import { Obligation } from '@/types';

interface ObligationsListProps {
  obligations: Obligation[];
}

export default function ObligationsList({ obligations }: ObligationsListProps) {
  // Group obligations by responsible party
  const groupedObligations = obligations.reduce((acc, curr) => {
    if (!acc[curr.responsibleParty]) {
      acc[curr.responsibleParty] = [];
    }
    acc[curr.responsibleParty].push(curr);
    return acc;
  }, {} as Record<string, Obligation[]>);

  if (!obligations || obligations.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500">
        No obligations found in this document.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedObligations).map(([party, partyObligations], idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800 pb-4">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-200">{party}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {partyObligations.map((obligation, oIdx) => (
                <li key={oIdx} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {obligation.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        {obligation.timing && (
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {obligation.timing}
                          </span>
                        )}
                        {(obligation.section || obligation.page) && (
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            {[obligation.section, obligation.page ? `Page ${obligation.page}` : null].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
