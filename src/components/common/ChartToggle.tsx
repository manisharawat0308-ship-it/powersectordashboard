interface ChartToggleProps {
  options: { id: string; label: string; icon?: string }[];
  active: string;
  onChange: (id: string) => void;
}

export function ChartToggle({ options, active, onChange }: ChartToggleProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={active === option.id ? 'chart-toggle-active' : 'chart-toggle-inactive'}
        >
          {option.icon && <span className="mr-1">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}


