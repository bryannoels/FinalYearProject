const TabButton: React.FC<{
    label: string;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  }> = ({ label, activeTab, setActiveTab }) => {
    return (
      <button
        className={`stock-details__tab ${activeTab === label.toLowerCase() ? 'active' : ''}`}
        onClick={() => setActiveTab(label.toLowerCase())}
      >
        {label}
      </button>
    );
  };
  
export default TabButton;
  