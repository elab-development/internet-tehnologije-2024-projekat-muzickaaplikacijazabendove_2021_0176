import { useEffect, useState, useCallback } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { fetchChannelVideos } from '../lib/youtube.js';
import { api } from '../lib/api.js';
import { useLoading } from '../context/LoadingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PAGE_SIZE = 6;

export default function BandSongsTab({ bandId, channelId }) {
  const { show, hide } = useLoading();
  const { authenticated } = useAuth();

  const [videos, setVideos] = useState([]);
  const [nextToken, setNextToken] = useState('');
  const [prevToken, setPrevToken] = useState('');
  const [error, setError] = useState('');
  const [favSet, setFavSet] = useState(new Set());

  const loadFavorites = useCallback(async () => {
    try {
      const { favorite } = await api(`/api/bands/${bandId}/favorite`);
      const ids = Array.isArray(favorite?.trackIds)
        ? favorite.trackIds.map(String)
        : [];
      setFavSet(new Set(ids));
    } catch {
      // ignore if none
      setFavSet(new Set());
    }
  }, [bandId]);

  const loadVideos = useCallback(
    async (pageToken = '') => {
      setError('');
      show();
      try {
        const data = await fetchChannelVideos(channelId, {
          pageToken,
          pageSize: PAGE_SIZE,
        });
        setVideos(data.items);
        setNextToken(data.nextPageToken || '');
        setPrevToken(data.prevPageToken || '');
      } catch (err) {
        setError(err.message || 'Failed to load videos.');
      } finally {
        hide();
      }
    },
    [channelId, show, hide]
  );

  useEffect(() => {
    if (!channelId) return;
    loadVideos('');
    loadFavorites();
  }, [channelId, loadVideos, loadFavorites]);

  async function toggleFavorite(videoId) {
    if (!authenticated) return alert('Please log in to use favorites.');
    const isFav = favSet.has(videoId);
    const next = new Set(favSet);
    if (isFav) next.delete(videoId);
    else next.add(videoId);
    setFavSet(next);

    try {
      if (isFav) {
        await api(`/api/bands/${bandId}/favorite/tracks`, {
          method: 'PATCH',
          body: { remove: [videoId] },
        });
      } else {
        await api(`/api/bands/${bandId}/favorite/tracks`, {
          method: 'PATCH',
          body: { add: [videoId] },
        });
      }
    } catch (err) {
      setFavSet(favSet);
      alert(err.message || 'Failed to update favorites.');
    }
  }

  return (
    <div className='space-y-4'>
      {error && (
        <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
          {error}
        </p>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {videos.map((v) => (
          <VideoCard
            key={v.id}
            v={v}
            favorite={favSet.has(v.videoId)}
            onToggle={() => toggleFavorite(v.videoId)}
          />
        ))}
        {videos.length === 0 && (
          <div className='col-span-full text-center text-white/60'>
            No videos found for this channel.
          </div>
        )}
      </div>

      <div className='flex justify-center gap-2'>
        <button
          onClick={() => loadVideos(prevToken)}
          disabled={!prevToken}
          className={[
            'px-3 py-1.5 rounded-md border text-sm',
            !prevToken
              ? 'border-white/10 text-white/40 cursor-not-allowed'
              : 'border-white/10 text-white/80 hover:bg-white/10',
          ].join(' ')}
        >
          Prev
        </button>
        <button
          onClick={() => loadVideos(nextToken)}
          disabled={!nextToken}
          className={[
            'px-3 py-1.5 rounded-md border text-sm',
            !nextToken
              ? 'border-white/10 text-white/40 cursor-not-allowed'
              : 'border-white/10 text-white/80 hover:bg-white/10',
          ].join(' ')}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function VideoCard({ v, favorite, onToggle }) {
  const url = `https://www.youtube.com/watch?v=${v.videoId}`;
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 overflow-hidden'>
      <div className='h-40 w-full overflow-hidden border-b border-white/10'>
        <img
          src={v.thumbnail}
          alt={v.title}
          className='h-full w-full object-cover'
        />
      </div>
      <div className='p-3'>
        <h3 className='text-sm font-semibold line-clamp-2'>{v.title}</h3>
        <div className='mt-2 flex items-center justify-between text-xs text-white/60'>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1 hover:text-red-400'
          >
            <ExternalLink className='h-3.5 w-3.5' />
            Watch
          </a>
          <button
            onClick={onToggle}
            className={[
              'inline-flex items-center gap-1 px-2 py-1 rounded-md border',
              favorite
                ? 'border-red-500/40 text-red-400 bg-red-500/10'
                : 'border-white/10 text-white/80 hover:bg-white/10',
            ].join(' ')}
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className='h-4 w-4' />
            {favorite ? 'Favorited' : 'Favorite'}
          </button>
        </div>
      </div>
    </div>
  );
}
