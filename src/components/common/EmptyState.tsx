interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No results match the current filters.' }: EmptyStateProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <p className="text-gray-500 text-sm">{message}</p>
      <p className="text-gray-400 text-xs mt-1">
        Try adjusting your filter selections.
      </p>
    </div>
  );
}


