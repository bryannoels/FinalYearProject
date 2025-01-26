import { Eps } from '../../../types/Eps';
import { Dividend } from '../../../types/Dividend';
import { PeRatio } from '../../../types/PeRatio';
import { Stock } from '../../../types/Stock';

export function isEarningsStable(epsData: Eps[], years: number = 10): string {
  if (!epsData || epsData.length === 0) return "BAD";
  const sortedEpsData = epsData.sort((a, b) => b.Year - a.Year);
  if (sortedEpsData.length < years) return "BAD";
  for (let i = 0; i < years; i++) {
    if (sortedEpsData[i].EPS < 0) return "BAD";
  }
  return "GOOD";
}

export function isDividendStable(dividendData: Dividend[], years: number = 20): string {
  if (!dividendData || dividendData.length === 0) return "BAD";
  const sortedDividendData = dividendData.sort((a, b) => b.Year - a.Year);
  if (sortedDividendData.length < years) return "BAD";
  for (let i = 1; i < years; i++) {
    if (sortedDividendData[i - 1].Year !== sortedDividendData[i].Year + 1) return "BAD";
  }
  return "GOOD";
}

export function hasEarningsIncreased(epsData: Eps[], investorType: string = "defensive"): string {
  if (!epsData || epsData.length < 10) return "N/A";
  const sortedEpsData = epsData.sort((a, b) => b.Year - a.Year);
  const lastNonZeroEps = [...sortedEpsData].reverse().find(item => item.EPS > 0)?.EPS || 0;
  const initialAverage = investorType === "enterprising" 
    ? lastNonZeroEps 
    : (sortedEpsData[7].EPS + sortedEpsData[8].EPS + sortedEpsData[9].EPS) / 3;
  const finalAverage = investorType === "enterprising" 
    ? sortedEpsData[0].EPS 
    : (sortedEpsData[0].EPS + sortedEpsData[1].EPS + sortedEpsData[2].EPS) / 3;
  return (finalAverage / initialAverage).toFixed(2);
}

export function threeYearsPeRatio(peRatioData: PeRatio[]): string {
  if (!peRatioData || peRatioData.length < 3) return "N/A";
  const sortedPeData = peRatioData.sort((a, b) => b.Year - a.Year);
  return ((sortedPeData[0].PE_Ratio + sortedPeData[1].PE_Ratio + sortedPeData[2].PE_Ratio) / 3).toFixed(2);
}

export function priceToAssetRatio(peRatioData: PeRatio[], priceToBook: string): string {
  if (!peRatioData || peRatioData.length === 0 || priceToBook === "Not found") return "N/A";
  return (peRatioData.sort((a, b) => b.Year - a.Year)[0].PE_Ratio * parseFloat(priceToBook)).toFixed(2);
}

export function goodForDefensiveInvestor(stockData: Stock): string {
  if (parseFloat(stockData.detail?.totalRevenue) < 100000000) return "BAD";
  if (parseFloat(stockData.detail?.currentRatio) < 2) return "BAD";
  if (isEarningsStable(stockData.eps) === "BAD") return "BAD";
  if (isDividendStable(stockData.dividends) === "BAD") return "BAD";
  if (hasEarningsIncreased(stockData.eps) === "N/A" || parseFloat(hasEarningsIncreased(stockData.eps, "defensive")) > 4.0 / 3) return "BAD";
  if (threeYearsPeRatio(stockData.peRatio) === "N/A" || parseFloat(threeYearsPeRatio(stockData.peRatio)) > 15.0) return "BAD";
  if (priceToAssetRatio(stockData.peRatio, stockData.detail?.priceToBook) === "N/A" || parseFloat(priceToAssetRatio(stockData.peRatio, stockData.detail?.priceToBook)) > 22.5) return "BAD";
  return "GOOD";
}

export function goodForEnterprisingInvestor(stockData: Stock): string {
  if (parseFloat(stockData.detail?.totalRevenue) <= 0) return "BAD";
  if (parseFloat(stockData.detail?.currentRatio) < 1.5) return "BAD";
  if (isEarningsStable(stockData.eps, 5) === "BAD") return "BAD";
  if (isDividendStable(stockData.dividends, 1) === "BAD") return "BAD";
  if (hasEarningsIncreased(stockData.eps) === "N/A" || parseFloat(hasEarningsIncreased(stockData.eps, "enterprising")) <= 1) return "BAD";
  if (stockData.detail?.priceToBook === null || parseFloat(stockData.detail?.priceToBook) < 1.2) return "BAD";
  return "GOOD";
}
