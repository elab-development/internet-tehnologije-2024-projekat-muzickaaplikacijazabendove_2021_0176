import { Shield, ShieldAlert } from 'lucide-react';
import avatarPlaceholder from '../../assets/avatar-placeholder.png';
import { useAuth } from '../../context/AuthContext.jsx';
import { useState } from 'react';

export default function UsersTable({ items, onChangeRole }) {
  const { user: me } = useAuth();
  const myId = me?.id;

  return (
    <div className='w-full overflow-auto max-h-[70vh]'>
      <table className='min-w-[720px] text-sm table-fixed'>
        <thead className='bg-black/70 backdrop-blur sticky top-0 z-10 border-b border-white/10'>
          <tr className='text-left text-white/60'>
            <Th className='w-[340px]'>User</Th>
            <Th className='w-[180px] hidden md:table-cell'>Role</Th>
            <Th className='w-[200px]'>Email</Th>
            <Th className='w-[120px]'>Created</Th>
          </tr>
        </thead>

        <tbody>
          {items.map((u) => (
            <UserRow key={u.id} u={u} meId={myId} onChangeRole={onChangeRole} />
          ))}

          {items.length === 0 && (
            <tr>
              <Td colSpan={4} className='py-8 text-center text-white/60'>
                No users found.
              </Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ u, meId, onChangeRole }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const isMe = meId === u.id;

  async function handleRoleChange(e) {
    const next = e.target.value;
    setError('');
    setPending(true);
    try {
      await onChangeRole?.(u.id, next);
    } catch (err) {
      setError(err.message || 'Failed to update role');
    } finally {
      setPending(false);
    }
  }

  return (
    <tr className='border-b border-white/5 hover:bg-white/5'>
      {/* User */}
      <Td className='w-[340px]'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='h-10 w-10 rounded-full overflow-hidden border border-white/10 shrink-0'>
              <img
                src={u.avatarUrl || avatarPlaceholder}
                alt={u.name || 'User'}
                className='h-full w-full object-cover'
              />
            </div>
            <div className='min-w-0'>
              <div className='font-medium text-white truncate'>
                {u.name || '—'}
              </div>
              <div className='text-white/60 truncate max-w-[28ch]'>
                {u.email || '—'}
              </div>
            </div>
          </div>

          {/* Mobile role select */}
          <div className='md:hidden shrink-0'>
            <RoleSelect
              value={u.role}
              disabled={pending || isMe}
              onChange={handleRoleChange}
            />
          </div>
        </div>

        {error && <div className='mt-1 text-xs text-red-400'>{error}</div>}
      </Td>

      {/* Role (md+) */}
      <Td className='w-[180px] hidden md:table-cell'>
        <div className='flex items-center gap-2'>
          <RoleSelect
            value={u.role}
            disabled={pending || isMe}
            onChange={handleRoleChange}
          />
          {u.role === 'ADMIN' ? (
            <Shield className='h-4 w-4 text-red-400' title='Admin' />
          ) : (
            <ShieldAlert className='h-4 w-4 text-white/40' title='User' />
          )}
        </div>
      </Td>

      {/* Email */}
      <Td className='truncate w-[200px]'>{u.email}</Td>

      {/* Created */}
      <Td className='w-[120px] whitespace-nowrap'>
        {new Date(u.createdAt).toLocaleDateString()}
      </Td>
    </tr>
  );
}

function RoleSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={[
        'text-sm rounded-md bg-black border px-2 py-1 focus:outline-none',
        disabled
          ? 'border-white/10 text-white/40'
          : 'border-white/10 text-white/80 focus:border-red-500',
      ].join(' ')}
    >
      <option value='USER'>USER</option>
      <option value='ADMIN'>ADMIN</option>
    </select>
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
