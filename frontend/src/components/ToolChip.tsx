import type { ToolActivity } from '../types';

interface ToolChipProps {
  activity: ToolActivity;
}

export function ToolChip({ activity }: ToolChipProps) {
  return (
    <article className={`tool-chip tool-chip-${activity.status}`} aria-label={`${activity.action}: ${activity.filePath}`}>
      <span className="tool-chip-dot" />
      <span className="tool-chip-action">{activity.action}:</span>
      <code title={activity.filePath}>{activity.filePath || activity.name}</code>
    </article>
  );
}
