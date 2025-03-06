export const createStockObject = (stockData: any) => ({
    name: stockData['Company Name'] || 'Unknown Company',
    symbol: stockData['Symbol'] || 'N/A',
    price: parseFloat(stockData['Price']) || 0,
    change: parseFloat(stockData['Change']?.replace(/[+,%]/g, '')) || 0,
    percentChange: parseFloat(stockData['Change%']?.replace(/[+,%]/g, '')) || 0,
  });

export const formatCategoryName = (category: string): string => {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
