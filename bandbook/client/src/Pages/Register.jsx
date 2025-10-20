import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ImagePlus, RefreshCw, UserPlus, Eye, EyeOff } from 'lucide-react';
import avatarPlaceholder from '../assets/avatar-placeholder.png'; // adjust extension if needed

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarPlaceholder);

  // live preview for selected file
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(avatarPlaceholder);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function onPickAvatar() {
    fileInputRef.current?.click();
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
        file.type
      )
    ) {
      setError('Please select a PNG, JPEG, WEBP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB (matches backend)
      setError('Image must be ≤ 5 MB.');
      return;
    }
    setError('');
    setAvatarFile(file);
  }

  function resetAvatar() {
    setAvatarFile(null);
    setAvatarPreview(avatarPlaceholder);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      // If user picked an image, use FormData (multipart); otherwise JSON
      if (avatarFile) {
        const fd = new FormData();
        fd.append('name', name);
        fd.append('email', email.toLowerCase().trim());
        fd.append('password', password);
        fd.append('avatar', avatarFile); // backend expects "avatar"
        await register(fd);
      } else {
        await register({ name, email: email.toLowerCase().trim(), password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  }

  return (
    <section className='max-w-md mx-auto'>
      <h1 className='text-2xl font-bold'>Create account</h1>
      <p className='mt-2 text-white/70'>
        Join <span className='text-red-500'>bandbook</span> and start curating
        your perfect setlist.
      </p>

      <form
        onSubmit={onSubmit}
        className='mt-6 space-y-5 rounded-xl border border-white/10 bg-white/5 p-5'
      >
        {error && (
          <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
            {error}
          </p>
        )}

        {/* Avatar picker */}
        <div className='flex items-center gap-4'>
          <button
            type='button'
            onClick={onPickAvatar}
            className='relative h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-white/5 grid place-items-center hover:border-red-500/60 focus:outline-none'
            title='Change avatar'
          >
            <img
              src={avatarPreview}
              alt='Avatar preview'
              className='h-full w-full object-cover'
            />
            {!avatarFile && (
              <div className='absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition grid place-items-center'>
                <ImagePlus className='h-5 w-5 text-white/90' />
              </div>
            )}
          </button>

          <div className='text-sm'>
            <p className='font-medium'>Profile picture</p>
            <p className='text-white/60'>
              PNG, JPG, WEBP, or GIF — up to 5 MB.
            </p>
            {avatarFile && (
              <button
                type='button'
                onClick={resetAvatar}
                className='mt-2 inline-flex items-center gap-2 text-white/80 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition'
              >
                <RefreshCw className='h-4 w-4' />
                Reset to placeholder
              </button>
            )}
          </div>

          {/* hidden input */}
          <input
            ref={fileInputRef}
            type='file'
            accept='image/png,image/jpeg,image/webp,image/gif'
            className='hidden'
            onChange={onFileChange}
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm text-white/80'>Name</label>
          <input
            type='text'
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full rounded-md bg-black border border-white/10 px-3 py-2 outline-none focus:border-red-500'
            placeholder='Name Surname'
            autoComplete='name'
          />
        </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full rounded-md bg-black border border-white/10 px-3 py-2 pr-10 outline-none focus:border-red-500'
              placeholder='••••••••'
              autoComplete='new-password'
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
          <UserPlus className='h-4 w-4' />
          Create account
        </button>

        <p className='text-sm text-white/70'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-red-400 hover:text-red-300 underline underline-offset-2'
          >
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
}
