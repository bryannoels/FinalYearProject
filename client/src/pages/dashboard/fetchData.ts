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
    const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-most-active-stocks');
    const data = await response.json();
    return JSON.parse(data);
  };
  