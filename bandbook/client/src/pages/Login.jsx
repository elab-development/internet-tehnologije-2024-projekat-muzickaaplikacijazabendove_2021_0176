export default function Login() {
  return (
    <section className='max-w-md mx-auto'>
      <h1 className='text-2xl font-bold'>
        Sign in to <span className='text-red-500'>bandbook</span>
      </h1>
      <p className='mt-3 text-white/70'>
        A simple placeholder for now — the form comes next.
      </p>
      <div className='mt-6 rounded-xl border border-white/10 bg-white/5 p-5'>
        <p className='text-sm text-white/70'>
          When we connect the backend, this page will call{' '}
          <code className='text-white'>/api/auth/login</code> and receive a JWT
          httpOnly cookie.
        </p>
      </div>
    </section>
  );
}