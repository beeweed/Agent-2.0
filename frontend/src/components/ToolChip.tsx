import type { ToolActivity } from '../types';

interface ToolChipProps {
  activity: ToolActivity;
}

export function ToolChip({ activity }: ToolChipProps) {
  return (
    <div className="rounded-xl bg-[#2d2d2f] border border-border/30 overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{activity.action}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">{activity.status}</span>
        <span className="text-xs text-muted-foreground truncate ml-auto">{activity.filePath || activity.name}</span>
      </div>
    </div>
  );
}
