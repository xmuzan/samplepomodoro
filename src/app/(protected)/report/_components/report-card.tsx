
'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserStats } from "@/lib/stats";

export interface ReportAction {
  id: string;
  title: string;
  description: string;
  impact: number;
  stat: keyof Pick<UserStats, 'hp' | 'mp'>;
}

interface ReportCardProps {
  action: ReportAction;
  onReport: (action: ReportAction) => void;
}

export function ReportCard({ action, onReport }: ReportCardProps) {
  const isNegative = action.impact < 0;
  const isHp = action.stat === 'hp';

  const borderColorClass = isHp 
    ? (isNegative ? 'border-red-500/30 hover:border-red-500/60' : 'border-green-500/30 hover:border-green-500/60')
    : (isNegative ? 'border-blue-500/30 hover:border-blue-500/60' : 'border-sky-500/30 hover:border-sky-500/60');
  
  const textColorClass = isHp
    ? (isNegative ? 'text-red-400' : 'text-green-400')
    : (isNegative ? 'text-blue-400' : 'text-sky-400');

  return (
    <div className={cn(
      "flex flex-col rounded-lg border bg-card/50 p-4 transition-colors",
      borderColorClass
    )}>
      <h3 className="font-bold text-lg text-foreground">{action.title}</h3>
      <p className="text-sm text-muted-foreground flex-grow mt-1 mb-4">{action.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className={cn("font-mono font-bold text-xl", textColorClass)}>
          {action.impact > 0 ? '+' : ''}{action.impact}% {action.stat.toUpperCase()}
        </span>
        <Button size="sm" variant="outline" onClick={() => onReport(action)}>
          Rapor Et
        </Button>
      </div>
    </div>
  );
}
