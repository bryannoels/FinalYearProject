import { Portfolio } from '../portfolio/portfolio';
import { CurrentMarket } from '../currentMarket/currentMarket';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <Portfolio />
      <CurrentMarket />
    </div>
  );
}

export default Dashboard;
