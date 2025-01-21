import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { useParams } from 'react-router-dom';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import { Stock } from '../../types/Stock';
import { StockPrice } from '../../types/StockPrice';
import { StockRatings } from '../../types/StockRatings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import './StockDetails.css';

const StockDetails = () => {
    const navigate = useNavigate();
    const { symbol } = useParams<{ symbol: string }>();
    const chartRef = useRef<SVGSVGElement | null>(null);
    const epsChartRef = useRef<SVGSVGElement | null>(null);

    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);

    const [stockData, setStockData] = useState<Stock | null>(null);

    const getCachedData = (key: string): Stock | null => {
        const cachedItem = localStorage.getItem(key);
        if (!cachedItem) return null;
        const { data, timestamp } = JSON.parse(cachedItem);
        if (Date.now() - timestamp > 3600000) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    };

    const setCachedData = (key: string, data: Stock) => {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    };

    const fetchData = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data from ${url}`);
        }
        return response.json();
    };

    useEffect(() => {
        const fetchStockDetails = async () => {
            setLoading(true);
            try {
                const cachedStock = getCachedData(`stock_${symbol}`);
                if (cachedStock) {
                    setStockData(cachedStock);
                } else {
                    const stockInfo = await fetchData(`http://localhost:8000/api/stocks/info/${symbol}`);
                    const currentStock = {
                        name: stockInfo.companyName,
                        symbol: symbol as string,
                        price: parseFloat(stockInfo.currentPrice),
                        change: parseFloat(stockInfo.currentPrice) - parseFloat(stockInfo.previousClose),
                        percentChange: ((parseFloat(stockInfo.currentPrice) - parseFloat(stockInfo.previousClose)) / parseFloat(stockInfo.previousClose)) * 100,
                    };

                    const currentStockDetail = {
                        companyName: stockInfo.companyName,
                        currentPrice: stockInfo.currentPrice,
                        openingPrice: stockInfo.openingPrice,
                        previousClose: stockInfo.previousClose,
                        volume: stockInfo.volume,
                        marketCap: stockInfo.marketCap,
                        totalRevenue: stockInfo.totalRevenue,
                        ebitda: stockInfo.ebitda,
                        priceToBook: stockInfo.priceToBook,
                        earningsGrowth: stockInfo.earningsGrowth,
                        revenuePerShare: stockInfo.revenuePerShare,
                        growthRate: stockInfo.growthRate,
                    };

                    const [priceData, verdictData, forecastData, analysisData, epsData, bondYieldData] = await Promise.all([
                        fetchData(`http://localhost:8000/api/stocks/historical/${symbol}`),
                        fetchData(`http://localhost:8000/api/stocks/verdict/${symbol}`),
                        fetchData(`http://localhost:8000/api/stocks/forecast/${symbol}`),
                        fetchData(`http://localhost:8000/api/stocks/analysis/${symbol}`),
                        fetchData(`http://localhost:8000/api/stocks/eps/${symbol}`),
                        fetchData(`http://localhost:8000/api/stocks/aaa-corporate-bond-yield`),
                    ]);

                    const newStockData: Stock = {
                        info: currentStock,
                        detail: currentStockDetail,
                        price: priceData.data,
                        verdict: verdictData,
                        forecast: forecastData,
                        ratings: analysisData.analysis,
                        eps: epsData.EPS_Data,
                        growthRate: stockInfo.growthRate,
                        bondYield: bondYieldData.yield
                    };

                    setStockData(newStockData);
                    setCachedData(`stock_${symbol}`, newStockData);
                }
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching stock data");
            } finally {
                setLoading(false);
            }
        };

        fetchStockDetails();
    }, [symbol]);


    const labels = {
        "Opening Price": stockData?.detail?.openingPrice,
        "Previous Close": stockData?.detail?.previousClose,
        "Volume": stockData?.detail?.volume,
        "Market Cap": stockData?.detail?.marketCap,
        "Total Revenue": stockData?.detail?.totalRevenue,
        "EBITDA": stockData?.detail?.ebitda,
        "Price/Book": stockData?.detail?.priceToBook,
        "Earnings Growth": stockData?.detail?.earningsGrowth,
        "Revenue Per Share": stockData?.detail?.revenuePerShare,
        "Growth Rate": stockData?.detail?.growthRate
    };

    const benjaminGrahamLabels = {
        "Earings Per Share (EPS)": stockData?.eps[stockData?.eps.length - 1]?.EPS,
        "Growth Rate (g)": stockData?.growthRate,
        "AAA Corporate Bond Yield (Y)": stockData?.bondYield
    }

    const benjaminGrahamFormula = "V^* = \\frac{EPS \\times (8.5 + 2g) \\times 4.4}{Y}";

    useEffect(() => {
        if (!chartRef.current || stockData == null || stockData?.price === null || stockData?.price.length === 0) return;

        const svg = d3.select(chartRef.current);
        const width = 450;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };

        svg.attr("width", width).attr("height", height);

        const x = d3.scaleTime()
            .domain(d3.extent(stockData.price, d => new Date(`${d.date}T${d.time}`)) as [Date, Date])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([
                Math.min(...stockData.price.map(d => d.price)) - 1,
                Math.max(...stockData.price.map(d => d.price)) + 1
            ])
            .range([height - margin.bottom, margin.top]);

        const line = d3.line<StockPrice>()
            .x(d => x(new Date(`${d.date}T${d.time}`)))
            .y(d => y(d.price))

        const renderAxes = () => {
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(d3.timeMinute.every(30)));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));
        };

        const renderLine = () => {
            svg.append("path")
                .datum(stockData.price)
                .attr("fill", "none")
                .attr("stroke", "#0033AA")
                .attr("stroke-width", 2)
                .attr("d", line);
        };

        const drawDashedLine = (yValue: d3.NumberValue, color: string, label: string, offsetX: number, offsetY: number, drawLabel: boolean) => {
            svg.append("line")
                .attr("x1", margin.left)
                .attr("y1", y(yValue))
                .attr("x2", width - margin.right)
                .attr("y2", y(yValue))
                .style("stroke", color)
                .style("stroke-dasharray", ("5, 5"));

            if (drawLabel) {
                svg.append("text")
                    .attr("x", width - margin.right - offsetX)
                    .attr("y", y(yValue) - offsetY)
                    .attr("fill", color)
                    .attr("font-size", "12px")
                    .attr("text-anchor", "start")
                    .attr("text-align", "right")
                    .text(label);
            }
        };

        const renderTooltip = () => {
            if (!stockData || !stockData.price) return;
            const tooltip = d3.select(".tooltip");

            svg.selectAll(".dot")
                .data(stockData?.price)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", (d: StockPrice) => x(new Date(`${d.date}T${d.time}`)))
 .attr("cy", d => y(d.price))
                .attr("r", 3)
                .attr("fill", "#0033AA")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 5);
                    tooltip
                        .style("left", `${event.pageX - 60}px`)
                        .style("top", `${event.pageY - 70}px`)
                        .classed("hidden", false)
                        .html(`Time: ${d.time}<br>Price: $${d.price.toFixed(2)}`);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 3);
                    tooltip.classed("hidden", true);
                });
        };

        const maxPrice = Math.max(...stockData.price.map(d => d.price));
        const currentPrice = stockData.price[stockData.price.length - 1].price;
        const minPrice = Math.min(...stockData.price.map(d => d.price));

        drawDashedLine(maxPrice, "green", `Max Price - ${maxPrice.toFixed(2)}`, 100, 8, true);
        drawDashedLine(currentPrice, "blue", `Current Price - ${currentPrice.toFixed(2)}`, 118, 8, (maxPrice - currentPrice) / (maxPrice - minPrice) * 100 > 10);
        drawDashedLine(minPrice, "red", `Min Price - ${minPrice.toFixed(2)}`, 100, -15, true);

        renderAxes();
        renderLine();
        renderTooltip();
    }, [stockData?.price]);

    useEffect(() => {
        if (!epsChartRef.current || stockData == null || stockData.eps.length === 0) return;
        const epsTooltip = d3.select('.eps-tooltip');

        const svg = d3.select(epsChartRef.current);
        const width = 450;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };

        svg.attr("width", width).attr("height", height);

        const minimumValue = d3.min(stockData.eps, d => d.EPS) as number;
        const maximumValue = d3.max(stockData.eps, d => d.EPS) as number;

        const x = d3.scaleBand()
            .domain(stockData.eps.map(d => d.Year.toString()))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([minimumValue < 0 ? minimumValue * 1.1 : 0, maximumValue > 0 ? maximumValue : -maximumValue])
            .nice()
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.selectAll(".bar")
            .data(stockData.eps)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.Year.toString()) as number)
            .attr("y", d => d.EPS < 0 ? y(0) : y(d.EPS))
            .attr("height", d => Math.abs(y(d.EPS) - y(0)))
            .attr("width", x.bandwidth())
            .attr("fill", d => d.EPS < 0 ? "#FF0000" : "#008000")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("opacity", 0.7);
                epsTooltip
                    .attr('data-date', d.Year)
                    .style('left', `${event.pageX - 40}px`)
                    .style('top', `${event.pageY - 80}px`)
                    .classed('hidden', false)
                    .html(`Year: ${d.Year}<br>EPS: ${d.EPS}`);
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
                epsTooltip.classed('hidden', true);
            });
    }, [stockData?.eps]);

    return symbol ? (
        <div className="stock-details">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {stockData?.info ? (
                        <>
                            <div className="stock-details__top">
                                <div className="stock-details__top__head">
                                    <button className="stock-details__back" onClick={() => navigate('/')}>
                                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                                    </button>
                                    <div className="stock-details__name">
                                        {symbol}
                                    </div>
                                </div>
                                <DashboardItem key={symbol} {...stockData?.info} onClick={() => {}} />
                            </div>
                            <div className="stock-details__chart">
                                <svg ref={chartRef} />
                            </div>
                            <div className="tooltip hidden" />
                            <p className="stock-details__title">Valuation Measures</p>
                            <div className="stock-details__table">
                                {Object.entries(labels).map(([label, value]) => (
                                    <div className="stock-details__table__row" key={label}>
                                        <div className="stock-details__table__label">{label}</div>
                                        <div className="stock-details__table__value">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="stock-details-not-found">Stock not found</p>
                    )}
                    {stockData?.verdict || stockData?.forecast ? <p className="stock-details__title">Analysts' Recommendation</p> : null}
                    <div className="stock-details__recommendation">
                        {stockData?.verdict ? (
                            <div className="stock-details__analysis">
                                <div className="stock-detailss__analysis__left">
                                    <p className={`stock-detailss__analysis__left__text ${stockData.verdict.verdict}`}>{stockData.verdict.verdict.toUpperCase()}</p>
                                </div>
                                <div className="stock-detailss__analysis__right">
                                    <div className="stock-detailss__analysis__buys">
                                        <div className="stock-detailss__analysis__value">{stockData.verdict.num_of_buys}</div>
                                        <div className="stock-detailss__analysis__text">buys</div>
                                    </div>
                                    <div className="stock-detailss__analysis__holds">
                                        <div className="stock-detailss__analysis__value">{stockData.verdict.num_of_holds}</div>
                                        <div className="stock-detailss__analysis__text">holds</div>
                                    </div>
                                    <div className="stock-detailss__analysis__sells">
                                        <div className="stock-detailss__analysis__value">{stockData.verdict.num_of_sells}</div>
                                        <div className="stock-detailss__analysis__text">sells</div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        {stockData?.forecast ? (
                            <div className="stock-details__forecast">
                                <div className="stock-details__forecast__row">
                                    <div className="stock-details__forecast__label">High Target Price</div>
                                    <div className="stock-details__forecast__right green-rating">
                                        <div className="stock-details__forecast__value">{stockData.forecast.high_target_price}</div>
                                        <div className="stock-details__forecast__percent">({stockData.forecast.percent_high_price.toFixed(1)}%)</div>
                                    </div>
                                </div>
                                <div className="stock-details__forecast__row">
                                    <div className="stock-details__forecast__label">Median Target Price</div>
                                    <div className="stock-details__forecast__right blue-rating">
                                        <div className="stock-details__forecast__value">{stockData.forecast.median_target_price}</div>
                                        <div className="stock-details__forecast__percent">({stockData.forecast.percent_median_price.toFixed(1)}%)</div>
                                    </div>
                                </div>
                                <div className="stock-details__forecast__row">
                                    <div className="stock-details__forecast__label">Low Target Price</div>
                                    <div className="stock-details__forecast__right red-rating">
                                        <div className="stock-details__forecast__value">{stockData.forecast.low_target_price}</div>
                                        <div className="stock-details__forecast__percent">({stockData.forecast.percent_low_price.toFixed(1)}%)</div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        {
                            stockData?.ratings ?
                            (
                                <>
                                    <hr className = "stock-details__analysts__divider" />
                                    <p className = "stock-details__analysts__rating__title">Analysts' Rating</p>
                                    <div className = "stock-details__analysts-recommendation">
                                        {stockData.ratings.map((item: StockRatings) => {
                                            const ratingClass =
                                            item.Action === 1 ? "green-rating" :
                                            item.Action === 0 ? "blue-rating" :
                                            "red-rating";
                        
                                            return(
                                            <div className="stock-details__analysts__row" key={item.Firm}>
                                                <div className="stock-details__analysts__firm">{item.Firm}</div>
                                                <div className={`stock-details__analysts__rating ${ratingClass}`}>{item.Rating}</div>
                                            </div>
                                        )})}
                                    </div>
                                </>
                            )
                            : null
                        }
                    </div>
                    {stockData?.eps && stockData?.eps.length > 0 ? (
                        <>
                            <p className="stock-details__title">Earning Per Sharing (EPS)</p>
                            <div className="stock-details__eps">
                                <svg ref={epsChartRef} />
                                <div className="stock-details__eps__table">
                                    {stockData.eps.map((item) => (
                                        <div className="stock-details__eps__row" key={item.Year}>
                                            <div className="stock-details__eps__label">{item.Year}</div>
                                            <div className="stock-details__eps__value">{item.EPS}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="eps-tooltip hidden" />
                        </>
                    ) : null}
                    {
                        stockData?.eps && stockData?.eps.length > 0 && stockData.growthRate && stockData.bondYield ?
                        (
                            <>
                                <p className="stock-details__title">Benjamin Graham Formula</p>
                                <div className="stock-details__benjamin-graham">
                                    <BlockMath math={benjaminGrahamFormula} />
                                    {
                                        Object.entries(benjaminGrahamLabels).map(([label, value]) => (
                                        <div className="stock-details__benjamin-graham__row" key={label}>
                                            <div className="stock-details__benjamin-graham__label">{label}</div>
                                            <div className="stock-details__benjamin-graham__value">{value}</div>
                                        </div>
                                    ))}
                                    <div className="stock-details__benjamin-graham__row" key="Intrinsic Value">
                                        <div className="stock-details__benjamin-graham__label bold-text">Intrinsic Value</div>
                                        <div className="stock-details__benjamin-graham__value bold-text">{((stockData.eps[stockData.eps.length - 1]?.EPS * (8.5 + 2 * parseFloat(stockData.growthRate)) * 4.4)/parseFloat(stockData.bondYield)).toFixed(2)}</div>
                                    </div>
                                </div>
                            </>
                        ) : null
                    }
                </>
            )}
        </div>
    ) : null;
};

export default StockDetails;
