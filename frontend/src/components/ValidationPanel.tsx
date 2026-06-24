import type { ValidationPanel } from '../types/pipeline';

interface ValidationPanelProps {
  validation: ValidationPanel;
}

export function ValidationPanelView({ validation }: ValidationPanelProps) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-slate-800">Validation Panel</h2>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <IssueList
          title="Errors"
          items={validation.errors}
          emptyText="No errors"
          color="rose"
        />
        <IssueList
          title="Warnings"
          items={validation.warnings}
          emptyText="No warnings"
          color="amber"
        />
        <IssueList
          title="Repairs"
          items={validation.repairs}
          emptyText="No repairs"
          color="emerald"
        />
      </div>
    </div>
  );
}

function IssueList({
  title,
  items,
  emptyText,
  color,
}: {
  title: string;
  items: unknown[];
  emptyText: string;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    rose: 'bg-rose-50 border-rose-200',
    amber: 'bg-amber-50 border-amber-200',
    emerald: 'bg-emerald-50 border-emerald-200',
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-600 mb-2">
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyText}</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item, i) => (
            <li
              key={i}
              className={`text-xs p-2 rounded border ${bgMap[color]}`}
            >
              <pre className="whitespace-pre-wrap break-words">
                {formatItem(item)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatItem(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    if (obj.message) return String(obj.message);
    if (obj.description) return String(obj.description);
    return JSON.stringify(item, null, 2);
  }
  return String(item);
}
