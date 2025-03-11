import { BenjaminGrahamStockInfo } from './BenjaminGrahamStockInfo';
import { BenjaminGrahamStockPagination } from './BenjaminGrahamStockPagination';

export type BenjaminGrahamStockList = {
    data: BenjaminGrahamStockInfo[],
    pagination: BenjaminGrahamStockPagination
}