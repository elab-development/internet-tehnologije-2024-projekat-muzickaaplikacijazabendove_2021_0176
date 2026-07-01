import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api.js';
import { useLoading } from '../context/LoadingContext.jsx';
import BandCard from '../components/BandCard.jsx';

export default function Bands() {
  const { show, hide } = useLoading();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const fetchPage = useCallback(
    async (nextPage = 1) => {
      setError('');
      show();
      try {
        const data = await api(
          `/api/bands?page=${nextPage}&pageSize=${pageSize}`
        );
        if (nextPage === 1) {
          setItems(data.items || []);
        } else {
          setItems((prev) => [...prev, ...(data.items || [])]);
        }
        setPage(data.page || nextPage);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load bands.');
      } finally {
        hide();
      }
    },
    [pageSize, show, hide]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const canLoadMore = page < totalPages;

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

      {canLoadMore && (
        <div className='flex justify-center pt-2'>
          <button
            onClick={() => fetchPage(page + 1)}
            className='inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-500 transition px-4 py-2 font-medium'
          >
            Load more
          </button>
        </div>
      )}

      {!error && items.length === 0 && (
        <div className='text-center text-white/60'>No bands found.</div>
      )}
    </section>
  );
}