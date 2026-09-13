'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { AttentionArea } from '@/types';
import { ATTENTION_LEVEL_COLORS } from '@/lib/constants';

interface AttentionOverviewProps {
  attentionAreas: AttentionArea[];
}

export default function AttentionOverview({ attentionAreas }: AttentionOverviewProps) {
  const getIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  if (!attentionAreas || attentionAreas.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          Areas That May Deserve Attention
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          AI attention indicators to help you prioritize areas for closer examination or legal discussion.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {attentionAreas.map((area, idx) => (
          <Card key={area.id || idx} className="border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <CardContent className="p-4 flex gap-3.5 items-start">
              <div className="mt-0.5">
                {getIcon(area.attentionLevel)}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm text-slate-900 dark:text-white leading-tight">
                    {area.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 capitalize ${ATTENTION_LEVEL_COLORS[area.attentionLevel]?.badge || ''}`}
                  >
                    {area.attentionLevel} Attention
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {area.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
