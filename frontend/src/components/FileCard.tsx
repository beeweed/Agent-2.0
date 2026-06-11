interface FileCardProps {
  path: string;
  status: 'created' | 'writing';
  description: string;
}

export function FileCard({ path, status, description }: FileCardProps) {
  const isCreated = status === 'created';
  const filename = path.split('/').pop() || path;

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2a2a2c] hover:bg-[#323234] border cursor-pointer transition-all duration-200 group ${
      isCreated ? 'border-emerald-500/20' : 'border-primary/20 animate-pulse'
    }`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
        isCreated ? 'bg-emerald-500/10' : 'bg-primary/10'
      }`}>
        {isCreated ? (
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{path}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
            isCreated ? 'bg-emerald-500/15 text-emerald-400' : 'bg-primary/15 text-primary animate-pulse'
          }`}>
            {isCreated ? 'created' : 'writing...'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
