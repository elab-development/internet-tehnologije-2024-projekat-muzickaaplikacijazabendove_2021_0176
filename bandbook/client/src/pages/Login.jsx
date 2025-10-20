import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <section className='max-w-md mx-auto'>
      <h1 className='text-2xl font-bold'>Sign in</h1>
      <p className='mt-2 text-white/70'>
        Welcome back to <span className='text-red-500'>bandbook</span>.
      </p>

      <form
        onSubmit={onSubmit}
        className='mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-5'
      >
        {error && (
          <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
            {error}
          </p>
        )}

        <div className='space-y-2'>
          <label className='text-sm text-white/80'>Email</label>
          <input
            type='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full rounded-md bg-black border border-white/10 px-3 py-2 outline-none focus:border-red-500'
            placeholder='name@mail.com'
            autoComplete='email'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm text-white/80'>Password</label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full rounded-md bg-black border border-white/10 px-3 py-2 pr-10 outline-none focus:border-red-500'
              placeholder='••••••••'
              autoComplete='current-password'
            />
            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              className='absolute inset-y-0 right-0 px-3 inline-flex items-center text-white/70 hover:text-white'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className='h-5 w-5' />
              ) : (
                <Eye className='h-5 w-5' />
              )}
            </button>
          </div>
        </div>

        <button
          type='submit'
          className='w-full inline-flex items-center justify-center gap-2 rounded-md bg-red-600 hover:bg-red-500 transition px-4 py-2 font-medium'
        >
          <LogIn className='h-4 w-4' />
          Sign in
        </button>

        <p className='text-sm text-white/70'>
          New here?{' '}
          <Link
            to='/register'
            className='text-red-400 hover:text-red-300 underline underline-offset-2'
          >
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
}
