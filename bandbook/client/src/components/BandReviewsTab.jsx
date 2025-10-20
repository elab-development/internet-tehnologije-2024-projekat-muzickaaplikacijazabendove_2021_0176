import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useLoading } from '../context/LoadingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import avatarPlaceholder from '../assets/avatar-placeholder.png';

const PAGE_SIZE = 6;

export default function BandReviewsTab({ bandId, onSummary }) {
  const { show, hide } = useLoading();
  const { authenticated } = useAuth();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [message, setMessage] = useState('');

  const fetchPage = useCallback(
    async (p = 1) => {
      setError('');
      show();
      try {
        const params = new URLSearchParams({
          page: String(p),
          pageSize: String(PAGE_SIZE),
        });
        const data = await api(
          `/api/bands/${bandId}/reviews?` + params.toString()
        );
        setItems(data.items || []);
        setPage(data.page || p);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load reviews.');
      } finally {
        hide();
      }
    },
    [bandId, show, hide]
  );

  const computeSummary = useCallback(async () => {
    try {
      let p = 1;
      let all = [];
      while (true) {
        const params = new URLSearchParams({
          page: String(p),
          pageSize: '100',
        });
        const data = await api(
          `/api/bands/${bandId}/reviews?` + params.toString()
        );
        const batch = data.items || [];
        all = all.concat(batch);
        if (batch.length < 100) break;
        p += 1;
      }
      const ratings = all
        .map((r) => Number(r.rating))
        .filter((n) => Number.isFinite(n));
      const count = ratings.length;
      const avg = count ? ratings.reduce((a, b) => a + b, 0) / count : 0;
      onSummary?.({ avg, count });
    } catch {
      onSummary?.({ avg: 0, count: 0 });
    }
  }, [bandId]);

  useEffect(() => {
    fetchPage(1);
    computeSummary();
  }, [fetchPage, computeSummary]);

  async function submitReview(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      show();
      await api(`/api/bands/${bandId}/reviews`, {
        method: 'POST',
        body: { rating: myRating, comment: myComment },
      });
      setMessage('Your review has been submitted.');
      setMyComment('');
      await fetchPage(1);
      await computeSummary();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      hide();
    }
  }

  const pages = useMemo(
    () => buildPageRange(page, totalPages),
    [page, totalPages]
  );

  return (
    <div className='space-y-4'>
      {authenticated && (
        <form
          onSubmit={submitReview}
          className='rounded-xl border border-white/10 bg-white/5 p-4 space-y-3'
        >
          <div className='flex flex-wrap items-center gap-3'>
            <label className='text-sm text-white/80'>Your rating</label>
            <select
              value={myRating}
              onChange={(e) => setMyRating(Number(e.target.value))}
              className='rounded-md bg-black border border-white/10 px-2 py-1 text-sm focus:outline-none focus:border-red-500'
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <label className='block'>
            <span className='text-sm text-white/80'>Your review</span>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              rows={3}
              className='mt-1 w-full rounded-md bg-black border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-red-500'
              placeholder='Share your thoughts...'
            />
          </label>
          <div className='flex items-center justify-end'>
            <button className='px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 font-medium'>
              Submit
            </button>
          </div>
          {message && <p className='text-sm text-green-400'>{message}</p>}
          {error && <p className='text-sm text-red-400'>{error}</p>}
        </form>
      )}

      {!authenticated && (
        <p className='text-sm text-white/60'>Log in to post a review.</p>
      )}

      <ul className='grid gap-3'>
        {items.map((r) => {
          const avatar = r.user?.avatarUrl || avatarPlaceholder;
          return (
            <li
              key={r.id}
              className='rounded-xl border border-white/10 bg-white/5 p-3'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3 min-w-0'>
                  <img
                    src={avatar}
                    alt={r.user?.name || 'User'}
                    className='h-8 w-8 rounded-full object-cover border border-white/10'
                  />
                  <div className='min-w-0'>
                    <div className='text-sm font-medium truncate'>
                      {r.user?.name || 'User'}
                    </div>
                    <div className='text-xs text-white/60'>
                      {new Date(r.createdAt).toLocaleDateString()} • Rating{' '}
                      {r.rating}/5
                    </div>
                  </div>
                </div>
              </div>
              {r.comment && (
                <p className='mt-2 text-sm text-white/80 whitespace-pre-wrap'>
                  {r.comment}
                </p>
              )}
            </li>
          );
        })}
        {items.length === 0 && (
          <li className='text-white/60 text-sm'>No reviews yet.</li>
        )}
      </ul>

      {totalPages > 1 && (
        <nav className='flex items-center justify-center gap-2'>
          <button
            onClick={() => fetchPage(page - 1)}
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
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`e-${i}`} className='px-2 text-white/50'>
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => fetchPage(p)}
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
            onClick={() => fetchPage(page + 1)}
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
