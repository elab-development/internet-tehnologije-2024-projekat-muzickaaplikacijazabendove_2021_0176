import { Users, Youtube, Music2 } from 'lucide-react';
import avatarPlaceholder from '../assets/avatar-placeholder.png';

export default function BandCard({ band }) {
  const { name, description, members = [], channelId, avatarUrl } = band || {};

  const channelHref = channelId
    ? `https://www.youtube.com/channel/${channelId}`
    : null;

  return (
    <div className='group rounded-xl border border-white/10 bg-white/5 hover:border-red-500/50 transition overflow-hidden'>
      <div className='w-full h-40 sm:h-48 bg-white/5 border-b border-white/10 overflow-hidden'>
        <img
          src={avatarUrl || avatarPlaceholder}
          alt={`${name || 'Band'} avatar`}
          className='h-full w-full object-cover'
        />
      </div>

      <div className='p-4'>
        <h3 className='font-semibold truncate'>{name || 'Untitled band'}</h3>

        <p className='mt-2 text-sm text-white/70 line-clamp-3'>
          {description || 'No description provided.'}
        </p>

        <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70'>
          <span className='inline-flex items-center gap-1'>
            <Users className='h-4 w-4 text-red-400' />
            {Array.isArray(members)
              ? `${members.length} member${members.length === 1 ? '' : 's'}`
              : '—'}
          </span>

          {Array.isArray(members) && members.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {members.slice(0, 4).map((m, i) => (
                <span
                  key={i}
                  className='rounded-md border border-white/10 bg-black/30 px-2 py-0.5'
                >
                  {m}
                </span>
              ))}
              {members.length > 4 && (
                <span className='text-white/50'>+{members.length - 4}</span>
              )}
            </div>
          )}

          {channelId && (
            <a
              href={channelHref}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 ml-auto hover:text-red-400 transition'
              aria-label='Open YouTube channel'
              title='Open YouTube channel'
            >
              <Youtube className='h-4 w-4 text-red-500' />
              <code className='text-white/80'>{channelId}</code>
            </a>
          )}
        </div>
      </div>

      <div className='border-t border-white/10 px-4 py-3 text-xs text-white/60 flex items-center gap-2'>
        <Music2 className='h-4 w-4' />
        Public band profile
      </div>
    </div>
  );
}