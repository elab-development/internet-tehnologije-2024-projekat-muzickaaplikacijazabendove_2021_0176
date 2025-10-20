import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import { useLoading } from '../../context/LoadingContext.jsx';
import UsersTable from './UsersTable.jsx';

const PAGE_SIZE = 10;

export default function UsersManager() {
  const { show, hide } = useLoading();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const fetchPage = useCallback(
    async (nextPage = 1) => {
      setError('');
      show();
      try {
        const params = new URLSearchParams();
        params.set('page', String(nextPage));
        params.set('pageSize', String(PAGE_SIZE));
        const data = await api(`/api/users?${params.toString()}`);
        setItems(data.items || []);
        setPage(data.page || nextPage);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load users.');
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  async function updateRole(userId, role) {
    // optimistic update
    const prev = items;
    setItems((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    try {
      await api(`/api/users/${userId}/role`, {
        method: 'PATCH',
        body: { role },
      });
    } catch (err) {
      // revert on error
      setItems(prev);
      throw err;
    }
  }

  const pagination = useMemo(
    () => buildPageRange(page, totalPages),
    [page, totalPages]
  );

  function goTo(p) {
    if (p < 1 || p > totalPages || p === page) return;
    fetchPage(p);
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <div className='text-white/70 text-sm'>Manage all users and roles.</div>
      </div>

      {error && (
        <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
          {error}
        </p>
      )}

      <div className='rounded-xl border border-white/10 overflow-hidden'>
        <UsersTable items={items} onChangeRole={updateRole} />
      </div>

      {totalPages > 1 && (
        <nav
          className='mt-2 flex items-center justify-center gap-2'
          aria-label='Pagination'
        >
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className={[
              'px-3 py-1.5 rounded-md border text-sm',
              page === 1
                ? 'border-white/10 text-white/40 cursor-not-allowed'
                : 'border-white/10 text-white/80 hover:bg-white/10',
            ].join(' ')}
          >
            Prev
          </button>

          {pagination.map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className='px-2 text-white/50 select-none'
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={[
                  'w-9 h-9 rounded-md border text-sm',
                  p === page
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10',
                ].join(' ')}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className={[
              'px-3 py-1.5 rounded-md border text-sm',
              page === totalPages
                ? 'border-white/10 text-white/40 cursor-not-allowed'
                : 'border-white/10 text-white/80 hover:bg-white/10',
            ].join(' ')}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

function buildPageRange(current, total) {
  const pages = [];
  const delta = 1;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  pages.push(1);
  if (left > 2) pages.push('...');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push('...');
  if (total > 1) pages.push(total);
  return Array.from(new Set(pages.filter(Boolean)));
}
