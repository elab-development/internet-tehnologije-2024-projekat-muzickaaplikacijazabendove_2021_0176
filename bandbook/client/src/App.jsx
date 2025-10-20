import { Routes, Route } from 'react-router-dom';


import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Account from './pages/Account.jsx';


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />


        <Route path='/login' element={<Login />} />

        <Route path='/account' element={<Account />} />

      </Route>
    </Routes>
  );
}
