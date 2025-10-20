import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import { useLoading } from '../../context/LoadingContext.jsx';
import BandsTable from './BandsTable.jsx';
import BandModal from './BandModal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { Plus, SortDesc } from 'lucide-react';

const PAGE_SIZE = 10;

export default function BandsManager() {
  const { show, hide } = useLoading();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('new');
  const [error, setError] = useState('');

  // modal state
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null); // band object or null

  // delete confirm
  const [toDelete, setToDelete] = useState(null);

  const fetchPage = useCallback(
    async (nextPage = 1, nextSort = sort) => {
      setError('');
      show();
      try {
        const params = new URLSearchParams();
        params.set('page', String(nextPage));
        params.set('pageSize', String(PAGE_SIZE));
        if (nextSort) params.set('sort', nextSort);
        const data = await api(`/api/bands?${params.toString()}`);
        setItems(data.items || []);
        setPage(data.page || nextPage);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load bands.');
      } finally {
        hide();
      }
    },
    [sort, show, hide]
  );

  useEffect(() => {
    fetchPage(1, sort);
  }, [fetchPage, sort]);

  function goTo(p) {
    if (p < 1 || p > totalPages || p === page) return;
    fetchPage(p, sort);
  }

  function openCreate() {
    setEditing(null);
    setOpenModal(true);
  }

  function openEdit(band) {
    setEditing(band);
    setOpenModal(true);
  }

  async function handleDeleteConfirmed() {
    if (!toDelete) return;
    show();
    try {
      await api(`/api/bands/${toDelete.id}`, { method: 'DELETE' });
      setToDelete(null);
      // refresh current page (adjust if we deleted last item on last page)
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      await fetchPage(nextPage, sort);
    } catch (err) {
      setError(err.message || 'Failed to delete band.');
    } finally {
      hide();
    }
  }

  const pagination = useMemo(
    () => buildPageRange(page, totalPages),
    [page, totalPages]
  );

  return (
    <div className='space-y-4'>
      {/* Controls */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='text-white/70 text-sm'>
          Manage all bands. Create, edit, or delete entries.
        </div>

        <div className='flex items-center gap-3'>
          <div className='inline-flex items-center gap-2'>
            <SortDesc className='h-4 w-4 text-white/70' />
            <label className='text-sm text-white/80'>Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className='text-sm rounded-md bg-black border border-white/10 px-2 py-1 focus:outline-none focus:border-red-500'
            >
              <option value='new'>Newest first</option>
              <option value='name-asc'>Name A→Z</option>
              <option value='name-desc'>Name Z→A</option>
            </select>
          </div>

          <button
            onClick={openCreate}
            className='inline-flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-500 transition px-3 py-2 text-sm font-medium'
          >
            <Plus className='h-4 w-4' />
            Create band
          </button>
        </div>
      </div>

      {error && (
        <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
          {error}
        </p>
      )}

      {/* Table */}
      <div className='rounded-xl border border-white/10 overflow-hidden'>
        <BandsTable
          items={items}
          onEdit={openEdit}
          onDelete={(band) => setToDelete(band)}
        />
      </div>

      {/* Pagination */}
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

      {/* Create/Edit modal */}
      {openModal && (
        <BandModal
          initial={editing}
          onClose={() => setOpenModal(false)}
          onSaved={async () => {
            setOpenModal(false);
            await fetchPage(page, sort);
          }}
        />
      )}

      {/* Delete confirm */}
      {toDelete && (
        <ConfirmDialog
          title='Delete band'
          description={`Are you sure you want to delete "${toDelete.name}"? This action cannot be undone.`}
          confirmText='Delete'
          variant='destructive'
          onCancel={() => setToDelete(null)}
          onConfirm={handleDeleteConfirmed}
        />
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
