import { StockRatings } from './StockRatings';

export type StockAnalysis = {
    ratings: StockRatings[];
    number_of_buys: number;
    number_of_holds: number;
    number_of_sells: number;
}