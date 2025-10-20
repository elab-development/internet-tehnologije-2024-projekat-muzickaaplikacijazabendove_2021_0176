import { useLoading } from '../context/LoadingContext.jsx';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay() {
  const { count } = useLoading();
  const visible = count > 0;

  if (!visible) return null;

  return (
    <div className='fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <Loader2 className='h-10 w-10 animate-spin text-red-500' />
        <p className='text-sm text-white/80'>Loading…</p>
      </div>
    </div>
  );
}
