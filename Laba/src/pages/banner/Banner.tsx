import { Link } from 'react-router-dom';
import './Banner.css'

function Banner() {
  return (
    <div className = "banner">
      <p className = "banner__heading">Boost Your Portfolio</p>
      <p className = "banner__subheading">Leverage on machine learning prediction to make better investment decisions</p>
      <Link to = "/login">
            <button className="banner__button">Register Now</button>
      </Link>
    </div>
  )
}

export default Banner
