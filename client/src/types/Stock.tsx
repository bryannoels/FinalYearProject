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
    forecast: Forecast;
    analysis: StockAnalysis;
    eps: Eps[];
    peRatio: PeRatio[];
    dividends: Dividend[];
    growthRate: string;
    bondYield: string;
}