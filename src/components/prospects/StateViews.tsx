import { AlertTriangle, SearchX } from 'lucide-react';

export function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="space-y-3" data-testid="prospects-loading">
      <span className="sr-only">Loading prospects…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 motion-reduce:animate-none dark:border-slate-700 dark:bg-slate-800">
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ onClear, filters, yoursOnly }: { onClear: () => void; filters: string[]; yoursOnly: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800" data-testid="empty-state">
      <SearchX className="mx-auto h-8 w-8 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">No prospects match</h3>
      {filters.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Active filters:</p>
          <ul className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
            {filters.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Try a different search or prospect type.</p>
      )}
      {yoursOnly && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Status, source, confidence and next-action filters show your prospects only, never sample data.</p>
      )}
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        Clear all filters
      </button>
    </div>
  );
}

export function NoDataState({ onAdd, onShowSample }: { onAdd?: () => void; onShowSample?: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white">No prospects yet</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Add a real prospect to start. {onShowSample ? 'Sample data is hidden, not deleted.' : ''}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {onAdd && (
          <button type="button" onClick={onAdd} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
            Add prospect
          </button>
        )}
        {onShowSample && (
          <button type="button" onClick={onShowSample} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700">
            Show sample data
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-700 dark:text-red-300" aria-hidden="true" />
      <h3 className="mt-3 font-semibold text-red-900 dark:text-red-100">Something went wrong</h3>
      <p className="mt-1 text-sm text-red-800 dark:text-red-200">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
      )}
    </div>
  );
}
