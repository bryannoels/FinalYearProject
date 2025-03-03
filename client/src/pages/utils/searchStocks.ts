export const searchStocks = async (query: string, setStockResult: any) => {
    if (query.length >= 1) {
      try {
        const response = await fetch(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/search/${query}`);
        const result = await response.json();
        setStockResult(result)
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setStockResult([]);
    }
};