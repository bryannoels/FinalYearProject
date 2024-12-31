import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './pages/navbar/Navbar';
import _Banner from './pages/banner/Banner';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
      window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Layout = () => {
  const [_login, _setLogin] = useState(false);
  
  return (
    <div>
      <ScrollToTop />
      <Navbar />
      {/* {!_login && <_Banner />} */}
      <Outlet />
    </div>
  );
};

export default Layout;
