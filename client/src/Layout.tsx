import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './pages/navbar/Navbar';
import _Banner from './pages/banner/Banner';
import MobileTabNavigation from './components/mobileTabNavigation/mobileTabNavigation';
import { AuthProvider } from './context/AuthContext';
import './styles.css';

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
    <AuthProvider>
      <div>
        <ScrollToTop />
        <Navbar />
        {/* {!_login && <_Banner />} */}
        <Outlet />
        <MobileTabNavigation />
      </div>
    </AuthProvider>
  );
};

export default Layout;
