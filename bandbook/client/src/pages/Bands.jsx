import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../lib/api.js';
import { useLoading } from '../context/LoadingContext.jsx';
import BandCard from '../components/BandCard.jsx';

const PRESET_CATEGORIES = [
  'pop-rock',
  'alternative rock',
  'pop',
  'indie rock',
  'funk rock',
  'art rock',
];

export default function Bands() {
  const { show, hide } = useLoading();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = useMemo(() => {
    const dynamic = Array.from(
      new Set(
        (items || []).map((b) => (b.category || '').trim()).filter(Boolean)
      )
    );
    return Array.from(new Set([...PRESET_CATEGORIES, ...dynamic]));
  }, [items]);

  const fetchPage = useCallback(
    async (nextPage = 1, category = selectedCategory) => {
      setError('');
      show();
      try {
        const search = new URLSearchParams();
        search.set('page', String(nextPage));
        search.set('pageSize', String(pageSize));
        if (category) search.set('category', category);

        const data = await api(`/api/bands?${search.toString()}`);
        setItems(data.items || []);
        setPage(data.page || nextPage);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load bands.');
      } finally {
        hide();
      }
    },
    [pageSize, selectedCategory, show, hide]
  );

  // initial load + whenever category changes
  useEffect(() => {
    fetchPage(1, selectedCategory);
  }, [fetchPage, selectedCategory]);

  function goTo(p) {
    if (p < 1 || p > totalPages || p === page) return;
    fetchPage(p);
  }

  return (
    <section className='space-y-6'>
      <header className='text-center'>
        <h1 className='text-3xl sm:text-4xl font-bold'>
          Explore <span className='text-red-500'>bands</span>
        </h1>
        <p className='mt-2 text-white/70'>
          Browse all public band profiles available on bandbook.
        </p>
      </header>

      {/* Category filters */}
      <div className='flex flex-wrap items-center justify-center gap-2'>
        <FilterPill
          label='All'
          active={!selectedCategory}
          onClick={() => setSelectedCategory('')}
        />
        {categories.map((cat) => (
          <FilterPill
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </div>

      {error && (
        <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
          {error}
        </p>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {items.map((band) => (
          <BandCard key={band.id} band={band} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination current={page} total={totalPages} onChange={goTo} />
      )}

      {!error && items.length === 0 && (
        <div className='text-center text-white/60'>No bands found.</div>
      )}
    </section>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full text-sm transition border',
        active
          ? 'bg-red-600 border-red-500 text-white'
          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white',
      ].join(' ')}
    >
      <span className='capitalize'>{label}</span>
    </button>
  );
}

function Pagination({ current, total, onChange }) {
  // build a compact page range (1 … n)
  const pages = buildPageRange(current, total);

  return (
    <nav
      className='mt-4 flex items-center justify-center gap-2'
      aria-label='Pagination'
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={[
          'px-3 py-1.5 rounded-md border text-sm',
          current === 1
            ? 'border-white/10 text-white/40 cursor-not-allowed'
            : 'border-white/10 text-white/80 hover:bg-white/10',
        ].join(' ')}
      >
        Prev
      </button>

      {pages.map((p, i) =>
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
            onClick={() => onChange(p)}
            className={[
              'w-9 h-9 rounded-md border text-sm',
              p === current
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10',
            ].join(' ')}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={[
          'px-3 py-1.5 rounded-md border text-sm',
          current === total
            ? 'border-white/10 text-white/40 cursor-not-allowed'
            : 'border-white/10 text-white/80 hover:bg-white/10',
        ].join(' ')}
      >
        Next
      </button>
    </nav>
  );
}

function buildPageRange(current, total) {
  const pages = [];
  const delta = 1; // how many neighbors to show around current

  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  pages.push(1);
  if (left > 2) pages.push('...');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push('...');
  if (total > 1) pages.push(total);

  return Array.from(new Set(pages.filter(Boolean)));
}