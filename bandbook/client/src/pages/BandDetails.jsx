import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLoading } from '../context/LoadingContext.jsx';
import { Users, Youtube, Tag, ArrowLeft } from 'lucide-react';
import avatarPlaceholder from '../assets/avatar-placeholder.png';

export default function BandDetails() {
  const { id } = useParams();
  const { show, hide } = useLoading();
  const [band, setBand] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError('');
      show();
      try {
        const { band } = await api(`/api/bands/${id}`);
        if (mounted) setBand(band);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load band.');
      } finally {
        hide();
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, show, hide]);

  if (error) {
    return (
      <section className='space-y-4'>
        <Link
          to='/bands'
          className='inline-flex items-center gap-2 text-white/80 hover:text-white'
        >
          <ArrowLeft className='h-4 w-4' /> Back to bands
        </Link>
        <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
          {error}
        </p>
      </section>
    );
  }

  if (!band) return null;

  const {
    name,
    description,
    members = [],
    channelId,
    avatarUrl,
    category,
    createdAt,
  } = band;
  const channelHref = channelId
    ? `https://www.youtube.com/channel/${channelId}`
    : null;

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Link
          to='/bands'
          className='inline-flex items-center gap-2 text-white/80 hover:text-white'
        >
          <ArrowLeft className='h-4 w-4' /> Back to bands
        </Link>
      </div>

      {/* Cover */}
      <div className='rounded-xl overflow-hidden border border-white/10'>
        <img
          src={avatarUrl || avatarPlaceholder}
          alt={`${name || 'Band'} cover`}
          className='w-full h-56 sm:h-72 object-cover'
        />
      </div>

      {/* Header */}
      <header className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <h1 className='text-3xl sm:text-4xl font-bold'>
            {name || 'Untitled band'}
          </h1>

          <div className='mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80'>
            {category && (
              <span className='inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/30 px-2 py-0.5 text-xs'>
                <Tag className='h-3.5 w-3.5 text-red-400' />
                <span className='capitalize'>{category}</span>
              </span>
            )}
            {createdAt && (
              <span className='text-white/60 text-xs'>
                Added on {new Date(createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {channelHref && (
          <a
            href={channelHref}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 hover:bg-white/10 transition text-sm'
            title='Open YouTube channel'
          >
            <Youtube className='h-4 w-4 text-red-500' />
            View channel
          </a>
        )}
      </header>

      {/* Description */}
      <div className='prose prose-invert max-w-none'>
        <p className='text-white/80'>
          {description || 'No description provided.'}
        </p>
      </div>

      {/* Members */}
      <section>
        <h2 className='text-lg font-semibold flex items-center gap-2'>
          <Users className='h-5 w-5 text-red-400' />
          Members
        </h2>
        {Array.isArray(members) && members.length > 0 ? (
          <ul className='mt-2 grid gap-2 sm:grid-cols-2'>
            {members.map((m, i) => (
              <li
                key={i}
                className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm'
              >
                {m}
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-2 text-sm text-white/60'>No members listed.</p>
        )}
      </section>
    </section>
  );
}