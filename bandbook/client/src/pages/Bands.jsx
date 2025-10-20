import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../lib/api.js';
import { useLoading } from '../context/LoadingContext.jsx';
import BandCard from '../components/BandCard.jsx';
import { Search, X } from 'lucide-react';

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
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const dynamic = Array.from(
      new Set(
        (items || []).map((b) => (b.category || '').trim()).filter(Boolean)
      )
    );
    return Array.from(new Set([...PRESET_CATEGORIES, ...dynamic]));
  }, [items]);

  const fetchPage = useCallback(
    async (nextPage = 1, category = selectedCategory, q = query) => {
      setError('');
      show();
      try {
        const search = new URLSearchParams();
        search.set('page', String(nextPage));
        search.set('pageSize', String(pageSize));
        if (category) search.set('category', category);
        if (q) search.set('q', q);

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
    [pageSize, selectedCategory, query, show, hide]
  );

  // initial + whenever category or query changes
  useEffect(() => {
    fetchPage(1, selectedCategory, query);
  }, [fetchPage, selectedCategory, query]);

  function goTo(p) {
    if (p < 1 || p > totalPages || p === page) return;
    fetchPage(p);
  }

  function clearSearch() {
    setQuery('');
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

      {/* Search + Category filters */}
      <div className='flex flex-col items-center gap-3'>
        {/* Search bar  */}
        <div className='w-full max-w-xl relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search bands (name, description)…'
            className='w-full pl-10 pr-10 py-2 rounded-md bg-black border border-white/10 text-sm outline-none focus:border-red-500'
          />
          {query && (
            <button
              onClick={clearSearch}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10'
              aria-label='Clear search'
              title='Clear search'
            >
              <X className='h-4 w-4 text-white/70' />
            </button>
          )}
        </div>

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
