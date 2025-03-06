import { CurrentMarket } from '../currentMarket/currentMarket';
import './BenjaminGrahamList.css';

function BenjaminGrahamList() {

  return (
    <div className="benjamin-graham-list">
      <div className="dashboard__market__container">
          <p className="market__title">Benjamin Graham</p>
          <div className="market__search-box">
          </div>
      </div>
      {/* <CurrentMarket /> */}
    </div>
  );
}

export default BenjaminGrahamList;
