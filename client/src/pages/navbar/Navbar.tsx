import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import labaLogo from '../../assets/LabaLogo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Navbar.css'

function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [ isUserMenuOpen, setIsUserMenuOpen ] = useState<boolean>(false);
  
  const expandUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  }

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  }
  
  return (
      <nav className="navbar">
        <Link to="/" className="navbar__logo">
          <img src={labaLogo} alt="labaLogo" className = "navbar__icon" />
          <p className = "navbar__company_name">LABA</p>
        </Link>
        <div className = "navbar__menu">
          <FontAwesomeIcon icon={faSearch} aria-hidden="true" className="navbar__search"/>
          {isAuthenticated ? (
            <>
              <FontAwesomeIcon icon={faCircleUser} className="navbar__user" onClick={expandUserMenu}/>
              {isUserMenuOpen && (
                <div className="navbar__user__dropdown">
                  <button className="navbar__user__dropdown-item" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login">
              <button className="navbar__button">Log in</button>
            </Link>
          )}
        </div>
      </nav>
  )
}

export default Navbar;
