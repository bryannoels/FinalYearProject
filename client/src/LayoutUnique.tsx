import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import _Banner from './pages/banner/Banner';
import { AuthProvider } from './context/AuthContext';

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
        <Outlet />
      </div>
    </AuthProvider>
  );
};

export default Layout;
