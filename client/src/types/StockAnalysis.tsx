import { StockRatings } from './StockRatings';

export type StockAnalysis = {
    verdict: string;
    num_of_buys: number;
    num_of_holds: number;
    num_of_sells: number;
    ratings: StockRatings[];
}