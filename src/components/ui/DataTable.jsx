import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'Aucune donnée à afficher.',
  onRowClick,
  selectable = false,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  getRowId = (row) => row.id,
}) {
  const colCount = columns.length + (selectable ? 1 : 0);
  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(getRowId(row)));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              {selectable && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onToggleAll?.(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
                    aria-label="Tout sélectionner"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-8 text-center text-neutral-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const rowId = getRowId(row);
                const isSelected = selectable && selectedIds.includes(rowId);
                return (
                  <tr
                    key={rowId || i}
                    className={`border-b border-neutral-100 transition-colors duration-150 ${isSelected ? 'bg-brand-navy/5' : 'hover:bg-neutral-50'} ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleRow?.(rowId)}
                          className="h-4 w-4 rounded border-neutral-300 text-brand-navy focus:ring-brand-navy/30"
                          aria-label="Sélectionner la ligne"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-neutral-700">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 print:hidden">
          <p className="text-sm text-neutral-500">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
              aria-label="Page précédente"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
              aria-label="Page suivante"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
