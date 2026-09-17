interface DataUnavailableProps {
  label?: string;
}

export function DataUnavailable({ label = 'Data unavailable' }: DataUnavailableProps) {
  return (
    <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
      <span className="w-2 h-2 rounded-full bg-gray-300" />
      {label}
    </span>
  );
}


