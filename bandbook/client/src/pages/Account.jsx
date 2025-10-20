import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Upload, X, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoading } from '../context/LoadingContext.jsx';
import { api } from '../lib/api.js';
import avatarPlaceholder from '../assets/avatar-placeholder.png';

export default function Account() {
  const { user, status, authenticated, setUser, refresh } = useAuth();
  const { show, hide } = useLoading();

  // gate: if not logged in, send to login (once status resolved)
  if (status !== 'loading' && !authenticated) {
    return <Navigate to='/login' replace />;
  }

  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);

  // favorites state
  const [favorites, setFavorites] = useState([]); // [{ id, bandId, trackIds:[], band: { id, name, avatarUrl } }]
  const [favError, setFavError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setAvatarPreview(user?.avatarUrl || '');
    setAvatarFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [user?.id, user?.name, user?.avatarUrl]);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // load favorites on mount (only if logged in)
  useEffect(() => {
    let mounted = true;
    async function loadFavs() {
      if (!authenticated) return;
      setFavError('');
      try {
        show();
        const data = await api('/api/favorites');
        if (mounted) setFavorites(data.items || []);
      } catch (err) {
        if (mounted) setFavError(err.message || 'Failed to load favorites.');
      } finally {
        hide();
      }
    }
    loadFavs();
    return () => {
      mounted = false;
    };
  }, [authenticated, show, hide]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      show();

      if (avatarFile) {
        const fd = new FormData();
        fd.set('name', name);
        fd.append('avatar', avatarFile);
        const { user: updated } = await api('/api/users/me', {
          method: 'PATCH',
          body: fd,
        });
        if (typeof setUser === 'function') setUser(updated);
        else if (typeof refresh === 'function') await refresh();
        setSuccess('Profile updated.');
      } else {
        const body = { name };
        const { user: updated } = await api('/api/users/me', {
          method: 'PATCH',
          body,
        });
        if (typeof setUser === 'function') setUser(updated);
        else if (typeof refresh === 'function') await refresh();
        setSuccess('Profile updated.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      hide();
    }
  }

  async function handleRemoveAvatar() {
    setError('');
    setSuccess('');
    setAvatarFile(null);
    setAvatarPreview('');
    if (inputRef.current) inputRef.current.value = '';
    try {
      show();
      // send empty avatarUrl -> backend will set null
      const { user: updated } = await api('/api/users/me', {
        method: 'PATCH',
        body: { avatarUrl: '' },
      });
      if (typeof setUser === 'function') setUser(updated);
      else if (typeof refresh === 'function') await refresh();
      setSuccess('Avatar removed.');
    } catch (err) {
      setError(err.message || 'Failed to remove avatar.');
    } finally {
      hide();
    }
  }

  // Remove a single track from favorites (PATCH remove)
  async function removeFavorite(bandId, trackId) {
    setFavError('');
    try {
      show();
      await api(`/api/bands/${bandId}/favorite/tracks`, {
        method: 'PATCH',
        body: { remove: [String(trackId)] },
      });
      // optimistic update
      setFavorites((prev) =>
        prev
          .map((f) =>
            f.bandId === bandId
              ? {
                  ...f,
                  trackIds: (f.trackIds || []).filter(
                    (t) => String(t) !== String(trackId)
                  ),
                }
              : f
          )
          .filter((f) => (f.trackIds || []).length > 0)
      );
    } catch (err) {
      setFavError(err.message || 'Failed to remove from favorites.');
    } finally {
      hide();
    }
  }

  return (
    <section className='space-y-8'>
      <header>
        <h1 className='text-3xl sm:text-4xl font-bold'>
          Your <span className='text-red-500'>Account</span>
        </h1>
        <p className='mt-2 text-white/70'>
          View and update your profile details.
        </p>
      </header>

      {/* Profile card */}
      <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
        <form onSubmit={handleSubmit} className='grid gap-6 max-w-2xl'>
          {(error || success) && (
            <div>
              {error && (
                <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
                  {error}
                </p>
              )}
              {success && (
                <p className='text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded px-3 py-2'>
                  {success}
                </p>
              )}
            </div>
          )}

          {/* Avatar row */}
          <div className='flex items-center gap-4'>
            <div className='h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-white/5'>
              <img
                src={avatarPreview || user?.avatarUrl || avatarPlaceholder}
                alt={user?.name || 'User avatar'}
                className='h-full w-full object-cover'
              />
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <label className='inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 hover:bg-white/10 cursor-pointer'>
                <Upload className='h-4 w-4' />
                <span className='text-sm'>Upload new photo</span>
                <input
                  ref={inputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </label>

              {(avatarPreview || user?.avatarUrl) && (
                <button
                  type='button'
                  onClick={handleRemoveAvatar}
                  className='inline-flex items-center gap-1 text-sm px-3 py-2 rounded-md border border-white/10 hover:bg-white/10'
                >
                  <X className='h-4 w-4' />
                  Remove avatar
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <label className='block'>
            <span className='text-sm text-white/80'>Full name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='mt-1 w-full rounded-md bg-black border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-red-500'
              placeholder='Your name'
            />
          </label>

          {/* Readonly email */}
          <label className='block'>
            <span className='text-sm text-white/80'>Email</span>
            <input
              value={user?.email || ''}
              disabled
              className='mt-1 w-full rounded-md bg-black/50 border border-white/10 px-3 py-2 text-sm text-white/70'
            />
          </label>

          <div className='flex items-center justify-end gap-2'>
            <button
              type='submit'
              className='px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 font-medium'
            >
              Save changes
            </button>
          </div>
        </form>
      </div>

      {/* Favorites */}
      <section className='space-y-4'>
        <header className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>
            Your <span className='text-red-500'>Favorites</span>
          </h2>
          {favError && (
            <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-1'>
              {favError}
            </p>
          )}
        </header>

        {favorites.length === 0 ? (
          <p className='text-white/60 text-sm'>
            You have no favorite songs yet.
          </p>
        ) : (
          <div className='space-y-6'>
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className='rounded-xl border border-white/10 bg-white/5'
              >
                <div className='flex items-center gap-3 p-4 border-b border-white/10'>
                  <div className='h-10 w-10 rounded-md overflow-hidden border border-white/10'>
                    <img
                      src={fav.band?.avatarUrl || avatarPlaceholder}
                      alt={fav.band?.name || 'Band'}
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <div className='min-w-0'>
                    <div className='font-medium truncate'>
                      {fav.band?.name || 'Band'}
                    </div>
                    <div className='text-xs text-white/60'>
                      {Array.isArray(fav.trackIds)
                        ? `${fav.trackIds.length} saved ${
                            fav.trackIds.length === 1 ? 'song' : 'songs'
                          }`
                        : '0 saved songs'}
                    </div>
                  </div>
                </div>

                {/* Tracks grid */}
                <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4'>
                  {(fav.trackIds || []).map((tid) => (
                    <li
                      key={tid}
                      className='rounded-lg border border-white/10 bg-black/40 overflow-hidden flex'
                    >
                      <div className='w-28 h-20 shrink-0 bg-white/5 border-r border-white/10'>
                        <img
                          src={`https://img.youtube.com/vi/${tid}/hqdefault.jpg`}
                          alt='Track thumbnail'
                          className='w-full h-full object-cover'
                          loading='lazy'
                        />
                      </div>
                      <div className='flex-1 p-3 min-w-0'>
                        <div className='text-sm font-medium truncate'>
                          {tid}
                        </div>
                        <div className='mt-1 flex items-center gap-2 text-xs'>
                          <a
                            href={`https://www.youtube.com/watch?v=${tid}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 hover:text-red-400'
                            title='Open on YouTube'
                          >
                            <ExternalLink className='h-3.5 w-3.5' />
                            Watch
                          </a>
                          <button
                            onClick={() => removeFavorite(fav.bandId, tid)}
                            className='inline-flex items-center gap-1 text-red-400 hover:text-red-300 ml-auto'
                            title='Remove from favorites'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
