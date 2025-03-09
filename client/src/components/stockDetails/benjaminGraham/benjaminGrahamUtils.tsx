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
  if (!epsData || epsData.length == 0) return 0;
  const sortedEpsData = epsData.sort((a, b) => b.Year - a.Year);

  if (investorType === "defensive") {
    let initialAverage = (sortedEpsData[7].EPS + sortedEpsData[8].EPS + sortedEpsData[9].EPS) / 3;
    let finalAverage = (sortedEpsData[0].EPS + sortedEpsData[1].EPS + sortedEpsData[2].EPS) / 3;
    if (initialAverage > 0 && finalAverage/initialAverage >= 4.0/3) return 1;
    return 0;
  } 
  if (sortedEpsData[sortedEpsData.length-1].EPS > 0 && sortedEpsData[0].EPS/sortedEpsData[-1].EPS >= 1) return 1;
  return 0;
}

export function threeYearsPeRatio(peRatioData: PeRatio[] | null): number {
  if (!peRatioData || peRatioData.length < 3) return 0
  const sortedPeData = peRatioData.sort((a, b) => b.Year - a.Year);
  if ((sortedPeData[0].PE_Ratio + sortedPeData[1].PE_Ratio + sortedPeData[2].PE_Ratio) / 3 >= 15.0) return 1;
  return 0;
}

export function priceToAssetRatio(peRatioData: PeRatio[] | null, priceToBook: string | null, threshold: number): number {
  if (!peRatioData || peRatioData.length === 0 || !priceToBook || priceToBook === "Not found") return 0;
  return (peRatioData.sort((a, b) => b.Year - a.Year)[0].PE_Ratio * parseFloat(priceToBook)) <= threshold ? 1 : 0;
}

export function goodForDefensiveInvestor(stockData: Stock): string {
  let count = 0;
  if (parseFloat(stockData.detail?.totalRevenue ?? "0") >= 100000000) count++;
  if (parseFloat(stockData.detail?.currentRatio ?? "0") >= 2) count++;
  if (isEarningsStable(stockData.eps, 10)) count++;
  if (isDividendStable(stockData.dividends, 20)) count++;
  if (hasEarningsIncreased(stockData.eps, "defensive")) count++;
  if (threeYearsPeRatio(stockData.peRatio)) count++;
  if (priceToAssetRatio(stockData.peRatio, stockData.detail?.priceToBook, 22.5)) count++;
  return `${count} out of 7`;
}

export function goodForEnterprisingInvestor(stockData: Stock): string {
  let count = 0;
  if (parseFloat(stockData.detail?.totalRevenue) >= 0) count++;
  if (parseFloat(stockData.detail?.currentRatio) >= 1.5) count++;
  if (isEarningsStable(stockData.eps, 5)) count++;
  if (isDividendStable(stockData.dividends, 1)) count++;
  if (hasEarningsIncreased(stockData.eps, "enterprising")) count++;
  if (priceToAssetRatio(stockData.peRatio, stockData.detail?.priceToBook, 18)) count++;
  return `${count} out of 7`;
}
