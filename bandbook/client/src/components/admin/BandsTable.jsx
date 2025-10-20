import { Pencil, Trash2, Youtube } from 'lucide-react';
import avatarPlaceholder from '../../assets/avatar-placeholder.png';

export default function BandsTable({ items, onEdit, onDelete }) {
  return (
    <div className='w-full overflow-auto max-h-[70vh] rounded-xl border border-white/10'>
      <table className='min-w-[900px] text-sm'>
        <thead className='bg-black/70 backdrop-blur sticky top-0 z-10 border-b border-white/10'>
          <tr className='text-left text-white/60'>
            <Th>Band</Th>
            <Th>Category</Th>
            <Th>Members</Th>
            <Th>Channel</Th>
            <Th>Created</Th>
            <Th className='text-right pr-4'>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id} className='border-b border-white/5 hover:bg-white/5'>
              <Td>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-md overflow-hidden border border-white/10 shrink-0'>
                    <img
                      src={b.avatarUrl || avatarPlaceholder}
                      alt={b.name || 'Band'}
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <div className='min-w-0'>
                    <div className='font-medium text-white truncate'>
                      {b.name || '—'}
                    </div>
                  </div>
                </div>
              </Td>

              <Td className='capitalize whitespace-nowrap'>
                {b.category || '—'}
              </Td>
              <Td className='whitespace-nowrap'>
                {Array.isArray(b.members) ? b.members.length : '—'}
              </Td>

              <Td className='whitespace-nowrap'>
                {b.channelId ? (
                  <a
                    href={`https://www.youtube.com/channel/${b.channelId}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 hover:text-red-400 transition'
                    title='Open YouTube channel'
                  >
                    <Youtube className='h-4 w-4 text-red-500' />
                  </a>
                ) : (
                  '—'
                )}
              </Td>

              <Td className='whitespace-nowrap'>
                {new Date(b.createdAt).toLocaleDateString()}
              </Td>

              <Td className='text-right pr-4 whitespace-nowrap'>
                <div className='inline-flex items-center gap-2'>
                  <button
                    onClick={() => onEdit?.(b)}
                    className='px-2 py-1 rounded-md border border-white/10 hover:bg-white/10 inline-flex items-center gap-1'
                    title='Edit'
                  >
                    <Pencil className='h-4 w-4' /> Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(b)}
                    className='px-2 py-1 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 inline-flex items-center gap-1'
                    title='Delete'
                  >
                    <Trash2 className='h-4 w-4' /> Delete
                  </button>
                </div>
              </Td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <Td colSpan={6} className='py-8 text-center text-white/60'>
                No bands found.
              </Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '', colSpan }) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
