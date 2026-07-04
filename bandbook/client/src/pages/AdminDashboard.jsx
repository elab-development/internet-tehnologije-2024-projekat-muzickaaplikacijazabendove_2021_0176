import { useState } from 'react';
import AdminTabs from '../components/admin/AdminTabs.jsx';
import BandsManager from '../components/admin/BandsManager.jsx';

export default function AdminDashboard() {
  const [tab, setTab] = useState('bands');

  return (
    <section className='space-y-6'>
      <header className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-3xl sm:text-4xl font-bold'>
            Admin <span className='text-red-500'>Dashboard</span>
          </h1>
          <p className='mt-2 text-white/70'>Manage bands and users.</p>
        </div>
        <AdminTabs value={tab} onChange={setTab} />
      </header>

      {tab === 'bands' ? <BandsManager /> : <UsersPlaceholder />}
    </section>
  );
}

function UsersPlaceholder() {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
      <p className='text-white/80'>Users management coming soon.</p>
    </div>
  );
}