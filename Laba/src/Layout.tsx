import { Outlet } from 'react-router-dom';
import Navbar from './pages/navbar/Navbar';

const Layout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Layout;
