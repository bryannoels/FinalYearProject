import labaLogo from '../../assets/LabaLogo.png'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className = "dashboard">
      <img src={labaLogo} className="logo" alt="Laba logo" />
      <h1>Dashboard Page</h1>
    </div>
  )
}

export default Dashboard
