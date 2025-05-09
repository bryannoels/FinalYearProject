import { Eps } from '../../../types/Eps';
import { Dividend } from '../../../types/Dividend';
import { PeRatio } from '../../../types/PeRatio';
import { Stock } from '../../../types/Stock';

export function isEarningsStable(epsData: Eps[] | null, years: number): number {
  if (!epsData || epsData.length === 0) return 0;
  const sortedEpsData = epsData.sort((a, b) => b.Year - a.Year);
  if (sortedEpsData.length < years){
    for (let i = 0; i < sortedEpsData.length; i++) {
      if (sortedEpsData[i].EPS < 0) return 0;
    }
    return 1;
  }
  for (let i = 0; i < years; i++) {
    if (sortedEpsData[i].EPS < 0) return 0;
  }
  return 1;
}

export function isDividendStable(dividendData: Dividend[] | null, years: number): number {
  if (!dividendData || dividendData.length === 0) return 0;
  const sortedDividendData = dividendData.sort((a, b) => b.Year - a.Year);
  if (sortedDividendData.length < years){
    for (let i = 0; i < sortedDividendData.length; i++) {
      if (sortedDividendData[i].Dividend < 0) return 0;
    }
    return 1;
  }
  for (let i = 0; i < years; i++) {
    if (sortedDividendData[i].Dividend < 0) return 0;
  }
  return 1;
}

export function hasEarningsIncreased(epsData: Eps[] | null, investorType: string = "defensive"): number {
  if (!epsData || epsData.length == 0) return -1;
  const sortedEpsData = epsData.sort((a, b) => b.Year - a.Year);

  if (investorType === "defensive") {
    if (sortedEpsData.length < 10) return -1;
    let initialAverage = (sortedEpsData[7].EPS + sortedEpsData[8].EPS + sortedEpsData[9].EPS) / 3;
    let finalAverage = (sortedEpsData[0].EPS + sortedEpsData[1].EPS + sortedEpsData[2].EPS) / 3;
    if (initialAverage <= 0 ) return -1;
    return finalAverage/initialAverage;
  } 
  if (sortedEpsData[sortedEpsData.length-1].EPS < 0) return -1;
  return sortedEpsData[0].EPS/sortedEpsData[sortedEpsData.length-1].EPS;
}

export function threeYearsPeRatio(peRatioData: PeRatio[] | null): number {
  if (!peRatioData || peRatioData.length < 3) return -1;
  const sortedPeData = peRatioData.sort((a, b) => b.Year - a.Year);
  return (sortedPeData[0].PE_Ratio + sortedPeData[1].PE_Ratio + sortedPeData[2].PE_Ratio) / 3;
}

export function priceToAssetRatio(peRatioData: PeRatio[] | null, priceToBook: string | null): number {
  if (!peRatioData || peRatioData.length === 0 || !priceToBook || priceToBook === "Not found") return Infinity;
  return peRatioData.sort((a, b) => b.Year - a.Year)[0].PE_Ratio * parseFloat(priceToBook);
}

export function goodForDefensiveInvestor(stockData: Stock): string {
  let count = 0;
  if (parseFloat(stockData.detail?.totalRevenue ?? "0") >= 100000000) count++;
  if (parseFloat(stockData.detail?.currentRatio ?? "0") >= 2) count++;
  if (isEarningsStable(stockData.eps, 10)) count++;
  if (isDividendStable(stockData.dividends, 20)) count++;
  if (hasEarningsIncreased(stockData.eps, "defensive") >= 4.0/3) count++;
  if (threeYearsPeRatio(stockData.peRatio) <= 15.0) count++;
  if (priceToAssetRatio(stockData.peRatio, stockData.detail?.priceToBook || "Not found") <= 22.5) count++;
  return `${count} out of 7`;
}

export function goodForEnterprisingInvestor(stockData: Stock): string {
  let count = 1;
  if (parseFloat(stockData.detail?.totalRevenue || "0") > 0) count++;
  if (parseFloat(stockData.detail?.currentRatio || "0") >= 1.5) count++;
  if (isEarningsStable(stockData.eps, 5)) count++;
  if (isDividendStable(stockData.dividends, 1)) count++;
  if (hasEarningsIncreased(stockData.eps, "enterprising") >= 1.0) count++;
  if (priceToAssetRatio(stockData.peRatio, stockData.detail?.priceToBook || "Not found") <= 18) count++;
  return `${count} out of 7`;
}
