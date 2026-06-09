interface ThinkingIndicatorProps {
  text: string;
}

export function ThinkingIndicator({ text }: ThinkingIndicatorProps) {
  if (!text) return null;
  return <span className="shimmer-text" aria-live="polite">{text}</span>;
}
