import { useFilterStore } from '@/store/filterStore';

export function Breadcrumbs() {
  const breadcrumbs = useFilterStore((s) => s.breadcrumbs);
  const popBreadcrumb = useFilterStore((s) => s.popBreadcrumb);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-1">
            {index > 0 && (
              <span className="text-gray-400">/</span>
            )}
            {index < breadcrumbs.length - 1 ? (
              <button
                onClick={() => {
                  // Pop back to this level
                  const popsNeeded = breadcrumbs.length - 1 - index;
                  for (let i = 0; i < popsNeeded; i++) {
                    popBreadcrumb();
                  }
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-gray-700 font-medium">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}


