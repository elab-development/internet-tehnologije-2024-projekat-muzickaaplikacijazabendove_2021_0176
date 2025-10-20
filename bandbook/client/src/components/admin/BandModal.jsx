import { useEffect, useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { api } from '../../lib/api.js';
import avatarPlaceholder from '../../assets/avatar-placeholder.png';
import { useLoading } from '../../context/LoadingContext.jsx';

export default function BandModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial?.id);
  const { show, hide } = useLoading();

  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [channelId, setChannelId] = useState(initial?.channelId || '');
  const [membersText, setMembersText] = useState(
    Array.isArray(initial?.members) ? initial.members.join('\n') : ''
  );

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initial?.avatarUrl || '');

  const [error, setError] = useState('');
  const inputFileRef = useRef(null);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function parseMembers() {
    const lines = membersText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const bodyMembers = parseMembers();

    try {
      show();

      if (avatarFile) {
        const fd = new FormData();
        fd.set('name', name);
        fd.set('description', description);
        fd.set('channelId', channelId);
        if (category) fd.set('category', category);
        bodyMembers.forEach((m) => fd.append('members', m));
        fd.append('avatar', avatarFile);

        if (isEdit) {
          await api(`/api/bands/${initial.id}`, { method: 'PATCH', body: fd });
        } else {
          await api('/api/bands', { method: 'POST', body: fd });
        }
      } else {
        const body = {
          name,
          description,
          channelId,
          category: category || undefined,
          members: bodyMembers,
        };
        if (isEdit) {
          await api(`/api/bands/${initial.id}`, {
            method: 'PATCH',
            body,
          });
        } else {
          await api('/api/bands', { method: 'POST', body });
        }
      }

      await onSaved?.();
    } catch (err) {
      setError(err.message || 'Failed to save band.');
    } finally {
      hide();
    }
  }

  function clearAvatar() {
    setAvatarFile(null);
    setAvatarPreview(initial?.avatarUrl || '');
    if (inputFileRef.current) inputFileRef.current.value = '';
  }

  return (
    <div className='fixed inset-0 z-50 grid place-items-center p-4'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative w-full max-w-2xl rounded-xl border border-white/10 bg-black overflow-hidden'>
        <header className='flex items-center justify-between px-4 py-3 border-b border-white/10'>
          <h3 className='font-semibold'>
            {isEdit ? 'Edit band' : 'Create band'}
          </h3>
          <button onClick={onClose} className='p-1 rounded hover:bg-white/10'>
            <X className='h-5 w-5' />
          </button>
        </header>

        <form onSubmit={handleSubmit} className='p-4 grid gap-4'>
          {error && (
            <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2'>
              {error}
            </p>
          )}

          {/* Avatar */}
          <div className='flex items-center gap-4'>
            <div className='h-20 w-20 rounded-md overflow-hidden border border-white/10 bg-white/5'>
              <img
                src={avatarPreview || initial?.avatarUrl || avatarPlaceholder}
                alt='Avatar preview'
                className='h-full w-full object-cover'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label className='inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 hover:bg-white/10 cursor-pointer'>
                <Upload className='h-4 w-4' />
                <span className='text-sm'>Upload avatar</span>
                <input
                  ref={inputFileRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </label>
              {avatarPreview && (
                <button
                  type='button'
                  onClick={clearAvatar}
                  className='text-sm px-3 py-2 rounded-md border border-white/10 hover:bg-white/10'
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Field label='Name'>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full rounded-md bg-black border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-red-500'
              />
            </Field>
            <Field label='Category'>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder='e.g. pop-rock'
                className='w-full rounded-md bg-black border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-red-500'
              />
            </Field>
          </div>

          <Field label='Description'>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full rounded-md bg-black border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-red-500'
            />
          </Field>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Field label='YouTube Channel ID'>
              <input
                required
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder='e.g. UCDPM_n1atn2ijUwHd0NNRQw'
                className='w-full rounded-md bg-black border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-red-500'
              />
            </Field>

            <Field label='Members (one per line)'>
              <textarea
                rows={3}
                value={membersText}
                onChange={(e) => setMembersText(e.target.value)}
                placeholder='John Doe (vocals)\nJane Doe (guitar)'
                className='w-full rounded-md bg-black border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-red-500'
              />
            </Field>
          </div>

          <div className='flex items-center justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 rounded-md border border-white/10 hover:bg-white/10'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 font-medium'
            >
              {isEdit ? 'Save changes' : 'Create band'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className='block'>
      <span className='text-sm text-white/80'>{label}</span>
      <div className='mt-1'>{children}</div>
    </label>
  );
}
