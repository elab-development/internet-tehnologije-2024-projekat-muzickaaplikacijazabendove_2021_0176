import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='border-t border-white/10 bg-black'>
      <div className='mx-auto max-w-6xl px-4 py-8 text-sm text-white/70 flex flex-col sm:flex-row items-center justify-between gap-3'>
        <p className='text-center sm:text-left'>
          © {new Date().getFullYear()} <span className='text-white'>band</span>
          <span className='text-red-500'>book</span>. All rights reserved.
        </p>
        <p className='inline-flex items-center gap-2'>
          Built with
          <Heart className='h-4 w-4 text-red-500' />
          music
        </p>
      </div>
    </footer>
  );
}
