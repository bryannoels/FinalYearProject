import './LoadingSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <div className="spinner-container">
                <div className="pulse-circle"></div>
                <div className="progress-circle"></div>
                <div className="chart-line">
                    <div className="chart-point"></div>
                </div>
            </div>
            <div className="loading-text">Analyzing market data...</div>
        </div>
    );
};

export default LoadingSpinner;