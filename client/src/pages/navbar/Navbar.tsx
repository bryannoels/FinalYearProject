import labaLogo from '../../assets/LabaLogo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Navbar.css'

function Navbar() {
  return (
      <nav className="navbar">
        <Link to="/" className="navbar__logo">
          <img src={labaLogo} alt="labaLogo" className = "navbar__icon" />
          <p className = "navbar__company_name">LABA</p>
        </Link>
        <div className = "navbar__menu">
          <FontAwesomeIcon icon={faSearch} aria-hidden="true" className="navbar__search"/>
          <Link to="/login">
            <button className="navbar__button">Log in</button>
          </Link>
        </div>
      </nav>
  )
}

export default Navbar;
