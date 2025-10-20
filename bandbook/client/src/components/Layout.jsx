import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  return (
    <div className='min-h-screen bg-black text-white flex flex-col'>
      <Navbar />
      <main className='flex-1'>
        <div className='mx-auto w-full max-w-6xl px-4 py-10'>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
