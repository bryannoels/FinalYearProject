import { StockInfo } from './StockInfo';
import { StockDetail } from './StockDetail';
import { StockPrice } from './StockPrice';
import { Verdict } from './Verdict';
import { Forecast } from './Forecast';
import { StockRatings } from './StockRatings';
import { Eps } from './Eps';

export type Stock = {
    info: StockInfo;
    detail: StockDetail;
    price: StockPrice[];
    verdict: Verdict;
    forecast: Forecast;
    ratings: StockRatings[];
    eps: Eps[];
    growthRate: string;
    bondYield: string;
}