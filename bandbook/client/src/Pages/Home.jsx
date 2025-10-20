import { Guitar, Star, ListMusic } from 'lucide-react';

export default function Home() {
  return (
    <section className='space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl sm:text-4xl font-bold'>
          Welcome to <span className='text-red-500'>bandbook</span>
        </h1>
        <p className='mt-3 text-white/70 max-w-2xl mx-auto'>
          Explore bands, listen through their repertoire, and build your ideal
          setlist for clubs, weddings, and events.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Feature icon={<Guitar className='h-6 w-6' />} title='Bands'>
          Browse band profiles and discover their style.
        </Feature>
        <Feature icon={<ListMusic className='h-6 w-6' />} title='Repertoires'>
          Preview songs and create your wish list for the gig.
        </Feature>
        <Feature icon={<Star className='h-6 w-6' />} title='Ratings & Reviews'>
          Rate bands and share your experiences.
        </Feature>
      </div>
    </section>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-5 hover:border-red-500/50 transition'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-lg bg-red-600/20 text-red-400'>{icon}</div>
        <h3 className='font-semibold'>{title}</h3>
      </div>
      <p className='mt-2 text-sm text-white/70'>{children}</p>
    </div>
  );
}
