import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Music2, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkBase =
    'block px-3 py-2 rounded-md text-sm font-medium transition hover:bg-red-600/20 hover:text-red-400';
  const active = 'text-red-400';

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
          </nav>

          <button
            className='md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 focus:outline-none'
            onClick={() => setOpen((v) => !v)}
            aria-label='Toggle menu'
          >
            {open ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </div>
      </div>

      {open && (
        <div className='md:hidden border-t border-white/10 bg-black'>
          <div className='px-4 py-3 space-y-1'>
            <NavLink
              to='/'
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to='/login'
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ''}`
              }
            >
              Login
            </NavLink>
            <NavLink
              to='/register'
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : ''}`
              }
            >
              Register
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}