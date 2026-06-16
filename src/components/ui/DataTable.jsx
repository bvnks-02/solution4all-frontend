import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'Aucune donnée à afficher.',
  onRowClick,
}) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
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
                <td colSpan={columns.length} className="px-4 py-8 text-center text-neutral-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-neutral-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
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
