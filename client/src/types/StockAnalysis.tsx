import { StockRatings } from './StockRatings';

export type StockAnalysis = {
    verdict: string;
    number_of_buy: number;
    number_of_hold: number;
    number_of_sell: number;
    ratings: StockRatings[];
}