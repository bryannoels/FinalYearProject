import { StockInfo } from './StockInfo';
import { StockProfile } from './StockProfile';
import { StockDetail } from './StockDetail';
import { StockPrice } from './StockPrice';
import { Forecast } from './Forecast';
import { StockAnalysis } from './StockAnalysis';
import { Eps } from './Eps';
import { PeRatio } from './PeRatio';
import { Dividend } from './Dividend';

export type Stock = {
    info: StockInfo;
    profile: StockProfile;
    detail: StockDetail;
    price: StockPrice[];
    forecast: Forecast | null;
    analysis: StockAnalysis | null;
    eps: Eps[] | null;
    peRatio: PeRatio[] | null;
    dividends: Dividend[] | null;
    growthRate: string | null;
    bondYield: string | null;
    beta: number | null;
}