import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Music2, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import avatarPlaceholder from '../assets/avatar-placeholder.png';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, authenticated, unauthenticated, logout, status } = useAuth();

  const linkBase =
    'block px-3 py-2 rounded-md text-sm font-medium transition hover:bg-red-600/20 hover:text-red-400';
  const active = 'text-red-400';

  function closeMobile() {
    setOpen(false);
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      closeMobile();
    }
  }

  const isAdmin = authenticated && user?.role === 'ADMIN';

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='flex items-center justify-between h-16'>
          <Link to='/' className='flex items-center gap-2'>
            <Music2 className='h-6 w-6 text-red-500' />
            <span className='text-lg font-semibold'>
              <span className='text-white'>band</span>
              <span className='text-red-500'>book</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className='hidden md:flex items-center gap-1'>
            <NavLink
              to='/'
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to='/bands'
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ''}`
              }
            >
              Bands
            </NavLink>

            {isAdmin && (
              <NavLink
                to='/admin'
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? active : ''}`
                }
              >
                Admin Dashboard
              </NavLink>
            )}

            {unauthenticated && (
              <>
                <NavLink
                  to='/login'
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? active : ''}`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to='/register'
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? active : ''}`
                  }
                >
                  Register
                </NavLink>
              </>
            )}

            {authenticated && (
              <div className='flex items-center gap-3 pl-2 ml-2 border-l border-white/10'>
                <Link to='/account' className='focus:outline-none'>
                  <UserChip name={user?.name} avatarUrl={user?.avatarUrl} />
                </Link>
                <button
                  onClick={handleLogout}
                  className='inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition'
                  title='Logout'
                >
                  <LogOut className='h-4 w-4' />
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className='md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 focus:outline-none'
            onClick={() => setOpen((v) => !v)}
            aria-label='Toggle menu'
          >
            {open ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className='md:hidden border-t border-white/10 bg-black'>
          <div className='px-4 py-3 space-y-1'>
            <NavLink
              to='/'
              end
              onClick={closeMobile}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to='/bands'
              end
              onClick={closeMobile}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ''}`
              }
            >
              Bands
            </NavLink>

            {isAdmin && (
              <NavLink
                to='/admin'
                onClick={closeMobile}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? active : ''}`
                }
              >
                Admin Dashboard
              </NavLink>
            )}

            {unauthenticated && (
              <>
                <NavLink
                  to='/login'
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? active : ''}`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to='/register'
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? active : ''}`
                  }
                >
                  Register
                </NavLink>
              </>
            )}

            {authenticated && (
              <div className='pt-2 mt-2 border-t border-white/10'>
                <Link
                  to='/account'
                  onClick={closeMobile}
                  className='flex items-center gap-3 px-2 py-2'
                >
                  <UserChip name={user?.name} avatarUrl={user?.avatarUrl} />
                  <div className='text-sm text-white/80'>
                    <div className='font-medium'>{user?.name || 'User'}</div>
                    <div className='text-white/60'>{user?.email}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className='w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition inline-flex items-center gap-2'
                >
                  <LogOut className='h-4 w-4' />
                  Logout
                </button>
              </div>
            )}

            {status === 'loading' && (
              <div className='px-3 py-2 text-sm text-white/60'>
                Checking session…
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function UserChip({ name, avatarUrl }) {
  const src = avatarUrl || avatarPlaceholder;
  return (
    <div className='flex items-center gap-2'>
      <div className='h-8 w-8 rounded-full bg-white/10 overflow-hidden border border-white/10'>
        <img
          src={src}
          alt={name || 'User avatar'}
          className='h-full w-full object-cover'
        />
      </div>
      <span className='hidden sm:block text-sm text-white/90 max-w-[14ch] truncate'>
        {name || 'User'}
      </span>
    </div>
  );
}
