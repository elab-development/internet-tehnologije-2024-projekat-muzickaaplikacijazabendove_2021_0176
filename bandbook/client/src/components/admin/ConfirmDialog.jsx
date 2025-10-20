import { X } from 'lucide-react';

export default function ConfirmDialog({
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onCancel,
  onConfirm,
}) {
  return (
    <div className='fixed inset-0 z-50 grid place-items-center p-4'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onCancel}
      />
      <div className='relative w-full max-w-md rounded-xl border border-white/10 bg-black overflow-hidden'>
        <header className='flex items-center justify-between px-4 py-3 border-b border-white/10'>
          <h3 className='font-semibold'>{title}</h3>
          <button onClick={onCancel} className='p-1 rounded hover:bg-white/10'>
            <X className='h-5 w-5' />
          </button>
        </header>

        <div className='p-4'>
          <p className='text-white/80'>{description}</p>

          <div className='mt-4 flex items-center justify-end gap-2'>
            <button
              onClick={onCancel}
              className='px-4 py-2 rounded-md border border-white/10 hover:bg-white/10'
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={[
                'px-4 py-2 rounded-md font-medium',
                variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-white/10 hover:bg-white/20',
              ].join(' ')}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
