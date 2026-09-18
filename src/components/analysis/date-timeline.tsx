'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { ImportantDate } from '@/types';

interface DateTimelineProps {
  dates: ImportantDate[];
}

export default function DateTimeline({ dates }: DateTimelineProps) {
  // Sort dates somewhat reasonably (this would need more robust parsing in a real app)
  const sortedDates = [...dates].sort((a, b) => {
    // Very simple sort, assumes dates are somewhat parseable
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (isNaN(dateA) || isNaN(dateB)) return 0;
    return dateA - dateB;
  });

  if (!dates || dates.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500">
        No important dates found in this document.
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
      {sortedDates.map((date, idx) => (
        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-950 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
            <Calendar className="h-4 w-4" />
          </div>
          
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="font-semibold text-lg text-slate-900 dark:text-white leading-none">
                    {date.date}
                  </h4>
                  {date.confidence && (
                    <Badge variant="outline" className={
                      date.confidence === 'high' ? 'text-green-600 border-green-200 bg-green-50' :
                      date.confidence === 'medium' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                      'text-red-600 border-red-200 bg-red-50'
                    }>
                      {date.confidence} confidence
                    </Badge>
                  )}
                </div>
                
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{date.label}</div>
                  {date.sourceText && (
                    <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{date.sourceText}&rdquo; {date.page ? `(Page ${date.page})` : ''}</p>
                  )}
                </div>

                {date.confidence === 'low' && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500 mt-2 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Could not confidently determine exact date</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}
