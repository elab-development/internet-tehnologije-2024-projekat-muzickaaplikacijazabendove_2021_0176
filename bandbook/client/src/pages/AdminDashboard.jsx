export default function AdminDashboard() {
  return (
    <section className='space-y-4'>
      <header>
        <h1 className='text-3xl sm:text-4xl font-bold'>
          Admin <span className='text-red-500'>Dashboard</span>
        </h1>
        <p className='mt-2 text-white/70'>
          Manage bands, users, and platform settings (coming soon).
        </p>
      </header>

      <div className='rounded-xl border border-white/10 bg-white/5 p-6'>
        <p className='text-white/80'>
          This is a placeholder admin area. We’ll add management tools here
          next.
        </p>
      </div>
    </section>
  );
}