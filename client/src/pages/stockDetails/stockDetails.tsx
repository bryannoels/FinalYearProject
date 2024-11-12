import { useState, useEffect, useRef } from 'react';
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
    const [stockPriceData, setStockPriceData] = useState<StockPrice[]>([]);
    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState(null);

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

        fetchStockPriceData();
    }, [symbol]);

    const currentStock: Stock = {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        price: 149.15,
        change: -0.41,
        percentChange: -0.27
    };

    const currentStockDetail: StockDetail = {
        companyName: "Alphabet Inc.",
        currentPrice: "163.24",
        openingPrice: "162.13",
        previousClose: "162.08",
        daysRange: "161.24 - 163.90",
        week52Range: "120.21 - 191.75",
        volume: "15,279,647",
        marketCap: "2.017T",
        peRatio: "23.42",
        eps: "6.97",
        priceSales: "6.26",
        priceBook: "6.68"
    };

    const labels = {
        "Opening Price": currentStockDetail.openingPrice,
        "Previous Close": currentStockDetail.previousClose,
        "Day's Range": currentStockDetail.daysRange,
        "52-Week Range": currentStockDetail.week52Range,
        "Volume": currentStockDetail.volume,
        "Market Cap": currentStockDetail.marketCap,
        "PE Ratio (TTM)": currentStockDetail.peRatio,
        "EPS (TTM)": currentStockDetail.eps,
        "Price/Sales (TTM)": currentStockDetail.priceSales,
        "Price/Book (MRQ)": currentStockDetail.priceBook,
    };

    const currentAnalysis = {
        symbol: "AAPL",
        num_of_analysts: 52,
        num_of_buys: 35,
        percent_buys: 67.3077,
        num_of_holds: 14,
        percent_holds: 26.9231,
        num_of_sells: 3,
        percent_sells: 5.7693,
        last_updated: "2024-11-10T08:09:51.986555+00:00",
        verdict: "buy"
    };

    const forecastData = {
        symbol: "AAPL",
        current_stock_price: 223.77,
        high_target_price: 300,
        median_target_price: 250,
        low_target_price: 184,
        percent_high_price: 34.06622871698619,
        percent_median_price: 11.721857264155155,
        percent_low_price: -17.772713053581807,
        last_updated: "2024-11-12T08:06:38.491440+00:00"
    };  

        useEffect(() => {
            if (!chartRef.current || stockPriceData.length === 0) return;
        
            const parsedStockPriceData = stockPriceData.map(d => ({
                ...d,
                dateTime: new Date(`${d.date}T${d.time}`)
            }));
        
            const svg = d3.select(chartRef.current);
            const width = 450;
            const height = 300;
            const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        
            svg.attr("width", width).attr("height", height);
        
            const x = d3.scaleTime()
                .domain(d3.extent(parsedStockPriceData, d => d.dateTime) as [Date, Date])
                .range([margin.left, width - margin.right]);
        
            const y = d3.scaleLinear()
                .domain([
                    Math.min(...parsedStockPriceData.map(d => d.close)) - 1,
                    Math.max(...parsedStockPriceData.map(d => d.close)) + 1
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
                    .datum(parsedStockPriceData)
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
                    .data(parsedStockPriceData)
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
        
            const maxPrice = Math.max(...parsedStockPriceData.map(d => d.close));
            const currentPrice = parsedStockPriceData[parsedStockPriceData.length-1].close;
            const minPrice = Math.min(...parsedStockPriceData.map(d => d.close));

            drawDashedLine(maxPrice, "green", `Max Price - ${maxPrice.toFixed(2)}`, 100, 8, true);
            drawDashedLine(currentPrice, "blue", `Current Price - ${currentPrice.toFixed(2)}`, 118, 8, (maxPrice - currentPrice) / (maxPrice-minPrice) * 100 > 10);
            drawDashedLine(minPrice, "red", `Min Price - ${minPrice.toFixed(2)}`, 100, -15, true);
        
            renderAxes();
            renderLine();
            renderTooltip();
        
        }, [stockPriceData]);

        const epsData: Eps[] = [
            { Year: 2009, EPS: 0.32 },
            { Year: 2010, EPS: 0.54 },
            { Year: 2011, EPS: 0.99 },
            { Year: 2012, EPS: 1.58 },
            { Year: 2013, EPS: 1.42 },
            { Year: 2014, EPS: 1.61 },
            { Year: 2015, EPS: 2.31 },
            { Year: 2016, EPS: 2.08 },
            { Year: 2017, EPS: 2.3 },
            { Year: 2018, EPS: 2.98 },
            { Year: 2019, EPS: 2.97 },
            { Year: 2020, EPS: 3.28 },
            { Year: 2021, EPS: 5.61 },
            { Year: 2022, EPS: 6.11 },
            { Year: 2023, EPS: -2 }
        ];
        
        useEffect(() => {
            if (!epsChartRef.current || epsData.length === 0) return;
            const epsTooltip = d3.select('.eps-tooltip');
        
            const svg = d3.select(epsChartRef.current);
            const width = 450;
            const height = 300;
            const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        
            svg.attr("width", width).attr("height", height);
        
            const x = d3.scaleBand()
                .domain(epsData.map(d => d.Year.toString()))
                .range([margin.left, width - margin.right])
                .padding(0.1);
        
            const y = d3.scaleLinear()
                .domain([(d3.min(epsData, d => d.EPS) as number)-1, d3.max(epsData, d => d.EPS) as number])
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
                    console.log(event.pageX, event.pageY);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("opacity", 1);
                    epsTooltip.classed('hidden', true);
                });
        }, [epsData]);
        

    return (
        <div className="stock-details">
            <div className="stock-details__top">
                <div className="stock-details__top__head">
                    <button className="stock-details__back" onClick={() => window.history.back()}>
                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                    </button>
                    <div className="stock-details__name">
                        {symbol}
                    </div>
                </div>
                <DashboardItem key={currentStock.symbol} {...currentStock} />
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
            <p className="stock-details__title">Analysts' Recommendation</p>
            <div className="stock-details__recommendation">
                <div className="stock-details__analysis">
                    <div className="stock-detailss__analysis__left">
                        <p className={`stock-detailss__analysis__left__text ${currentAnalysis.verdict}`}>{currentAnalysis.verdict.toUpperCase()}</p>
                    </div>
                    <div className="stock-detailss__analysis__right">
                        <div className="stock-detailss__analysis__buys">
                            <div className="stock-detailss__analysis__value">{currentAnalysis.num_of_buys}</div>
                            <div className="stock-detailss__analysis__text">buys</div>
                        </div>
                        <div className="stock-detailss__analysis__holds">
                            <div className="stock-detailss__analysis__value">{currentAnalysis.num_of_holds}</div>
                            < div className="stock-detailss__analysis__text">holds</div>
                        </div>
                        <div className="stock-detailss__analysis__sells">
                            <div className="stock-detailss__analysis__value">{currentAnalysis.num_of_sells}</div>
                            <div className="stock-detailss__analysis__text">sells</div>
                        </div>
                    </div>
                </div>
                <div className ="stock-details__forecast">
                    <div className = "stock-details__forecast__row">
                        <div className = "stock-details__forecast__label">High Target Price</div>
                        <div className = "stock-details__forecast__right green-rating">
                            <div className = "stock-details__forecast__value">{forecastData.high_target_price}</div>
                            <div className = "stock-details__forecast__percent">({forecastData.percent_high_price.toFixed(1)}%)</div>
                        </div>
                    </div>
                    <div className = "stock-details__forecast__row">
                        <div className = "stock-details__forecast__label">Median Target Price</div>
                        <div className = "stock-details__forecast__right blue-rating">
                            <div className = "stock-details__forecast__value">{forecastData.median_target_price}</div>
                            <div className = "stock-details__forecast__percent">({forecastData.percent_median_price.toFixed(1)}%)</div>
                        </div>
                    </div>
                    <div className = "stock-details__forecast__row">
                        <div className = "stock-details__forecast__label">Low Target Price</div>
                        <div className = "stock-details__forecast__right red-rating">
                            <div className = "stock-details__forecast__value">{forecastData.low_target_price}</div>
                            <div className = "stock-details__forecast__percent">({forecastData.percent_low_price.toFixed(1)}%)</div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="stock-details__title">Earning Per Sharing (EPS)</p>
            <div className="stock-details__eps">
                <svg ref={epsChartRef} />
                <div className="stock-details__eps__table">
                    {epsData.map((item) => (
                        <div className="stock-details__eps__row" key={item.Year}>
                            <div className="stock-details__eps__label">{item.Year}</div>
                            <div className="stock-details__eps__value">{item.EPS}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="eps-tooltip hidden" />
        </div>
    );
};

export default StockDetails;