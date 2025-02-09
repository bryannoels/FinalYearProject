export const createStockObject = (stockData: any) => ({
    name: stockData['Company Name'] || 'Unknown Company',
    symbol: stockData['Symbol'] || 'N/A',
    price: parseFloat(stockData['Price']) || 0,
    change: parseFloat(stockData['Change']?.replace(/[+,%]/g, '')) || 0,
    percentChange: parseFloat(stockData['Change%']?.replace(/[+,%]/g, '')) || 0,
  });
  