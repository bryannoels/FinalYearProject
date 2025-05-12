import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './mobileTabNavigation.css';

interface TabItem {
  name: string;
  path: string;
  icon: string;
  activeIcon: string;
}

const MobileTabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');

  const tabs: TabItem[] = [
    {
      name: 'Home',
      path: '/stocklist',
      icon: '🏠',
      activeIcon: '🏠'
    },
    {
      name: 'Benjamin Graham',
      path: '/benjaminGrahamList',
      icon: '📚',
      activeIcon: '📚'
    },
    {
      name: 'Intrinsic Value',
      path: '/intrinsicValueList',
      icon: '💰',
      activeIcon: '💰'
    },
    {
      name: 'AI',
      path: '/aiRecommendation',
      icon: '🧠',
      activeIcon: '🧠'
    },
  ];
  

  useEffect(() => {
    const currentTab = tabs.find(tab => 
      location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`)
    );
    
    setActiveTab(currentTab?.path || '');
  }, [location.pathname]);

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="mobile-tab-navigation">
      {tabs.map(tab => (
        <div 
          key={tab.path} 
          className={`tab-item ${activeTab === tab.path ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <div className="tab-icon">
            {activeTab === tab.path ? tab.activeIcon : tab.icon}
          </div>
          <div className="tab-label">{tab.name}</div>
          {activeTab === tab.path && <div className="tab-indicator" />}
        </div>
      ))}
      <div className="tab-highlight" style={{
        left: `${tabs.findIndex(tab => tab.path === activeTab) * 25}%`,
        width: '25%'
      }} />
    </div>
  );
};

export default MobileTabNavigation;