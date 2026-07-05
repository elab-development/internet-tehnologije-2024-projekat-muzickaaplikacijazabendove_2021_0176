import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Bands from './pages/Bands.jsx';
import BandDetails from './pages/BandDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/bands' element={<Bands />} />
        <Route path='/bands/:id' element={<BandDetails />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/account' element={<Account />} />
        <Route path='/admin' element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}