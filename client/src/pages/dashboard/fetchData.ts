import { getCachedData, setCachedData } from '../../components/utils/utils'

export const fetchPortfolioData = async (authToken: string) => {
    const payload = { method: 'getPortfolio' };
    const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  
    const result = await response.json();
    return result.data;
  };

  export const fetchStockData = async () => {
      const cacheKey = 'most_active_stocks';
      const cachedData = getCachedData(cacheKey);
  
      if (cachedData) {
          return cachedData;
      } else {
          try {
              const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-most-active-stocks');
              const data = await response.json();
              const parsedData = JSON.parse(data);
  
              setCachedData(cacheKey, parsedData);
              return parsedData;
          } catch (error) {
              console.error('Error fetching stock data:', error);
              throw new Error('An error occurred while fetching stock data');
          }
      }
  };
  
  