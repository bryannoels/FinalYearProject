import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { useParams } from 'react-router-dom';
import DashboardItem from '../../components/dashboardItem/dashboardItem';
import { Stock } from '../../types/stocks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './StockDetails.css';

type StockDetail = {
    companyName: string;
    currentPrice: string;
    openingPrice: string;
    previousClose: string;
    daysRange: string;
    week52Range: string;
    volume: string;
    marketCap: string;
    peRatio: string;
    eps: string;
    priceSales: string;
    priceBook: string;
};

interface StockPrice {
    date: string;
    time: string;
    close: number;
}

interface Eps{
    Year: number;
    EPS: number;
}

const StockDetails = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const chartRef = useRef<SVGSVGElement | null>(null);
    const epsChartRef = useRef<SVGSVGElement | null>(null);
    const [currentStock, setCurrentStock] = useState<Stock | null>(null);
    const [currentStockDetail, setCurrentStockDetail] = useState<StockDetail | null>(null);
    const [stockPriceData, setStockPriceData] = useState<StockPrice[]>([]);
    const [currentAnalysis, setCurrentAnalysis] = useState<any | null>(null);
    const [forecastData, setForecastData] = useState<any | null>(null);
    const [epsData, setEpsData] = useState<Eps[]>([]);
    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchStockData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/stocks/info/${symbol}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCurrentStock({
                    name: data.companyName,
                    symbol: symbol as string,
                    price: parseFloat(data.currentPrice),
                    change: parseFloat(data.currentPrice)-parseFloat(data.previousClose),
                    percentChange: (parseFloat(data.currentPrice)-parseFloat(data.previousClose))/parseFloat(data.previousClose)*100
                });
                setCurrentStockDetail({
                    companyName: data.companyName,
                    currentPrice: data.currentPrice,
                    openingPrice: data.openingPrice,
                    previousClose: data.previousClose,
                    daysRange: data.daysRange,
                    week52Range: data.week52Range,
                    volume: data.volume,
                    marketCap: data.marketCap,
                    peRatio: data.peRatio,
                    eps: data.eps,
                    priceSales: data.pricePerSales,
                    priceBook: data.pricePerBook
                });
            } catch (error: any) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, [symbol]);

    useEffect(() => {
        const fetchStockPriceData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/stocks/historical/${symbol}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setStockPriceData(data.prices);
            } catch (error: any) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAnalysisData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/stocks/verdict/${symbol}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCurrentAnalysis(data);
            } catch (error: any) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }

        const fetchForecastData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/stocks/forecast/${symbol}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setForecastData(data);
            } catch (error: any) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }

        const fetchEpsData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/stocks/eps/${symbol}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setEpsData(data.EPS_Data);
            } catch (error: any) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }

        fetchStockPriceData();
        fetchAnalysisData();
        fetchForecastData();
        fetchEpsData();
    }, [currentStock]);

    const labels = {
        "Opening Price": currentStockDetail?.openingPrice,
        "Previous Close": currentStockDetail?.previousClose,
        "Day's Range": currentStockDetail?.daysRange,
        "52-Week Range": currentStockDetail?.week52Range,
        "Volume": currentStockDetail?.volume,
        "Market Cap": currentStockDetail?.marketCap,
        "PE Ratio (TTM)": currentStockDetail?.peRatio,
        "EPS (TTM)": currentStockDetail?.eps,
        "Price/Sales (TTM)": currentStockDetail?.priceSales,
        "Price/Book (MRQ)": currentStockDetail?.priceBook,
    };

        useEffect(() => {
            if (!chartRef.current || stockPriceData === null || stockPriceData.length === 0) return;
        
            const svg = d3.select(chartRef.current);
            const width = 450;
            const height = 300;
            const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        
            svg.attr("width", width).attr("height", height);
        
            const x = d3.scaleTime()
                .domain(d3.extent(stockPriceData, d => new Date(`${d.date}T${d.time}`)) as [Date, Date])
                .range([margin.left, width - margin.right]);
        
            const y = d3.scaleLinear()
                .domain([
                    Math.min(...stockPriceData.map(d => d.close)) - 1,
                    Math.max(...stockPriceData.map(d => d.close)) + 1
                ])
                .range([height - margin.bottom, margin.top]);
        
            const line = d3.line<StockPrice>()
                .x(d => x(new Date(`${d.date}T${d.time}`)))
                .y(d => y(d.close))
                .curve(d3.curveMonotoneX);
        
            const renderAxes = () => {
                svg.append("g")
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(x));
        
                svg.append("g")
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(d3.axisLeft(y));
            };
        
            const renderLine = () => {
                svg.append("path")
                    .datum(stockPriceData)
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

                if (drawLabel){
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
                const tooltip = d3.select(".tooltip");
        
                svg.selectAll(".dot")
                    .data(stockPriceData)
                    .enter().append("circle")
                    .attr("class", "dot")
                    .attr("cx", (d: StockPrice) => x(new Date(`${d.date}T${d.time}`)))
                    .attr("cy", d => y(d.close))
                    .attr("r", 3)
                    .attr("fill", "#0033AA")
                    .on("mouseover", function (event, d) {
                        d3.select(this).attr("r", 5);
                        tooltip
                            .style("left", `${event.pageX - 60}px`)
                            .style("top", `${event.pageY - 70}px`)
                            .classed("hidden", false)
                            .html(`Time: ${d.time}<br>Price: $${d.close.toFixed(2)}`);
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("r", 3);
                        tooltip.classed("hidden", true);
                    });
            };
        
            const maxPrice = Math.max(...stockPriceData.map(d => d.close));
            const currentPrice = stockPriceData[stockPriceData.length-1].close;
            const minPrice = Math.min(...stockPriceData.map(d => d.close));

            drawDashedLine(maxPrice, "green", `Max Price - ${maxPrice.toFixed(2)}`, 100, 8, true);
            drawDashedLine(currentPrice, "blue", `Current Price - ${currentPrice.toFixed(2)}`, 118, 8, (maxPrice - currentPrice) / (maxPrice-minPrice) * 100 > 10);
            drawDashedLine(minPrice, "red", `Min Price - ${minPrice.toFixed(2)}`, 100, -15, true);
        
            renderAxes();
            renderLine();
            renderTooltip();
        
        }, [stockPriceData]);
        
        useEffect(() => {
            if (!epsChartRef.current || epsData.length === 0) return;
            const epsTooltip = d3.select('.eps-tooltip');
        
            const svg = d3.select(epsChartRef.current);
            const width = 450;
            const height = 300;
            const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        
            svg.attr("width", width).attr("height", height);

            const minimumValue = d3.min(epsData, d => d.EPS) as number;
            const maximumValue = d3.max(epsData, d => d.EPS) as number;
        
            const x = d3.scaleBand()
                .domain(epsData.map(d => d.Year.toString()))
                .range([margin.left, width - margin.right])
                .padding(0.1);
        
            const y = d3.scaleLinear()
                .domain([minimumValue < 0 ? minimumValue * 1.1 : 0, maximumValue])
                .nice()
                .range([height - margin.bottom, margin.top]);
        
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x));
        
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));
        
            svg.selectAll(".bar")
                .data(epsData)
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
        }, [epsData]);
        

    return symbol ? (
        <div className="stock-details">
            {
                currentStock
                ? (
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
                            <DashboardItem key={symbol} {...currentStock} onClick={() => {}}/>
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
                ):
                <p className="stock-details-not-found">Stock not found</p>
            }
            {
                currentAnalysis || forecastData
                ? <p className="stock-details__title">Analysts' Recommendation</p>
                : null
            }
            <div className="stock-details__recommendation">
                {
                    currentAnalysis
                    ? (
                        <div className="stock-details__analysis">
                            <div className="stock-detailss__analysis__left">
                                <p className={`stock-detailss__analysis__left__text ${currentAnalysis?.verdict}`}>{currentAnalysis?.verdict.toUpperCase()}</p>
                            </div>
                            <div className="stock-detailss__analysis__right">
                                <div className="stock-detailss__analysis__buys">
                                    <div className="stock-detailss__analysis__value">{currentAnalysis?.num_of_buys}</div>
                                    <div className="stock-detailss__analysis__text">buys</div>
                                </div>
                                <div className="stock-detailss__analysis__holds">
                                    <div className="stock-detailss__analysis__value">{currentAnalysis?.num_of_holds}</div>
                                    < div className="stock-detailss__analysis__text">holds</div>
                                </div>
                                <div className="stock-detailss__analysis__sells">
                                    <div className="stock-detailss__analysis__value">{currentAnalysis?.num_of_sells}</div>
                                    <div className="stock-detailss__analysis__text">sells</div>
                                </div>
                            </div>
                        </div>
                    )
                    : null
                    
                }
                {
                    forecastData
                    ? (
                        <div className ="stock-details__forecast">
                            <div className = "stock-details__forecast__row">
                                <div className = "stock-details__forecast__label">High Target Price</div>
                                <div className = "stock-details__forecast__right green-rating">
                                    <div className = "stock-details__forecast__value">{forecastData?.high_target_price}</div>
                                    <div className = "stock-details__forecast__percent">({forecastData?.percent_high_price.toFixed(1)}%)</div>
                                </div>
                            </div>
                            <div className = "stock-details__forecast__row">
                                <div className = "stock-details__forecast__label">Median Target Price</div>
                                <div className = "stock-details__forecast__right blue-rating">
                                    <div className = "stock-details__forecast__value">{forecastData?.median_target_price}</div>
                                    <div className = "stock-details__forecast__percent">({forecastData?.percent_median_price.toFixed(1)}%)</div>
                                </div>
                            </div>
                            <div className = "stock-details__forecast__row">
                                <div className = "stock-details__forecast__label">Low Target Price</div>
                                <div className = "stock-details__forecast__right red-rating">
                                    <div className = "stock-details__forecast__value">{forecastData?.low_target_price}</div>
                                    <div className = "stock-details__forecast__percent">({forecastData?.percent_low_price.toFixed(1)}%)</div>
                                </div>
                            </div>
                        </div>
                    )
                    : null
                } 
            </div>
            {
                epsData?.length > 0
                ? (
                <>
                    <p className="stock-details__title">Earning Per Sharing (EPS)</p>
                    <div className="stock-details__eps">
                        <svg ref={epsChartRef} />
                        <div className="stock-details__eps__table">
                            {epsData?.map((item) => (
                                <div className="stock-details__eps__row" key={item.Year}>
                                    <div className="stock-details__eps__label">{item.Year}</div>
                                    <div className="stock-details__eps__value">{item.EPS}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="eps-tooltip hidden" />
                </>
                )
                : null
            }            
        </div>
    ) : null;
};

export default StockDetails;