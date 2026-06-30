export default function Register() {
  return (
    <section className='max-w-md mx-auto'>
      <h1 className='text-2xl font-bold'>
        Create your <span className='text-red-500'>bandbook</span> account
      </h1>
      <p className='mt-3 text-white/70'>
        Just a placeholder text — the form is coming up.
      </p>
      <div className='mt-6 rounded-xl border border-white/10 bg-white/5 p-5'>
        <p className='text-sm text-white/70'>
          Backend route: <code className='text-white'>/api/auth/register</code>.
          After registering, we’ll set a JWT httpOnly cookie and the user will
          be signed in.
        </p>
      </div>
    </section>
  );
}