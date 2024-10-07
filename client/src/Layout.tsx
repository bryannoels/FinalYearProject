import { useState } from 'react'
import { Outlet } from 'react-router-dom';
import Navbar from './pages/navbar/Navbar';
import Banner from './pages/banner/Banner';

const Layout = () => {
  const [login, _setLogin] = useState(false)
  return (
    <div>
      <Navbar />
      { !login && <Banner />}
      <Outlet />
    </div>
  );
};

export default Layout;
