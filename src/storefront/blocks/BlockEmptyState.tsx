interface BlockEmptyStateProps {
  message: string;
}

export function BlockEmptyState({ message }: BlockEmptyStateProps) {
  return (
    <p className="w-full py-6 text-center text-sm text-theme-muted">{message}</p>
  );
}
