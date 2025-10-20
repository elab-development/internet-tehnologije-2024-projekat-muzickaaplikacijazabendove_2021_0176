import { Layers, Users as UsersIcon } from 'lucide-react';

export default function AdminTabs({ value, onChange }) {
  return (
    <div className='inline-flex rounded-lg border border-white/10 overflow-hidden'>
      <TabButton
        active={value === 'bands'}
        onClick={() => onChange('bands')}
        icon={<Layers className='h-4 w-4' />}
        label='Bands'
      />
      <TabButton
        active={value === 'users'}
        onClick={() => onChange('users')}
        icon={<UsersIcon className='h-4 w-4' />}
        label='Users'
      />
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 text-sm font-medium inline-flex items-center gap-2 transition',
        active
          ? 'bg-red-600 text-white'
          : 'bg-white/5 text-white/80 hover:bg-white/10',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}
