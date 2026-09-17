interface SectionSkeletonProps {
  height?: string;
}

export function SectionSkeleton({ height = 'h-64' }: SectionSkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${height}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}


