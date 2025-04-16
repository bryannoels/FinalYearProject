import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Stock } from '../../../types/Stock';
import { StockPrice } from '../../../types/StockPrice';
import * as d3 from 'd3';
import './stockPriceChart.css';

interface StockPriceChartProps {
  stockData: Stock | null;
}

const StockPriceChart: React.FC<StockPriceChartProps> = ({ stockData }) => {
    if (stockData == null) return null;
    const chartRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 500, height: 300 });
    const [isChartVisible, setIsChartVisible] = useState(false);
    
    const calculateBeta = (): number => {
        if (!stockData?.price || stockData.price.length < 5) return 1.0;
        
        const returns = [];
        for (let i = 1; i < stockData.price.length; i++) {
            returns.push((stockData.price[i].price - stockData.price[i-1].price) / stockData.price[i-1].price);
        }
        
        const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
        const variance = returns.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        const simulatedBeta = 1.0 + (stdDev * 50);
        return Math.max(0.5, Math.min(simulatedBeta, 2.0));
    };
    
    const beta = calculateBeta();

    useLayoutEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth || 450,
                    height: containerRef.current.clientHeight || 300,
                });
            }
        };

        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsChartVisible(true);
            }
        }, { threshold: 0.1 });
        
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        
        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current || !stockData.price || stockData.price.length === 0 || !isChartVisible) return;
    
        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();
    
        const width = dimensions.width;
        const height = dimensions.height;
        const margin = { top: 20, right: 0, bottom: 30, left: 20 };
    
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
            .curve(d3.curveMonotoneX);
    
        const filteredData = stockData.price.filter((d, _i) => {
            const date = new Date(`${d.date}T${d.time}`);
            const minutes = date.getMinutes();
            return minutes % 15 === 0;
        });
    
        const renderAxes = () => {
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .attr("class", "x-axis")
                .attr("color", "var(--primary-light-dark)")
                .call(d3.axisBottom(x).ticks(d3.timeMinute.every(60))) // Change to 30-minute ticks
                .style("opacity", 0)
                .transition()
                .duration(800)
                .style("opacity", 1);
    
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .attr("class", "y-axis")
                .attr("color", "var(--primary-light-dark)")
                .call(d3.axisLeft(y))
                .style("opacity", 0)
                .transition()
                .duration(800)
                .style("opacity", 1);
        };
    
        const renderLine = () => {
            const path = svg.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "#0077b6")
                .attr("stroke-width", 2.5)
                .attr("d", line);
            
            const totalLength = path.node()?.getTotalLength() || 0;
    
            path
                .attr("stroke-dasharray", totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(1500)
                .ease(d3.easePolyOut)
                .attr("stroke-dashoffset", 0);
            
            svg.append("linearGradient")
                .attr("id", "line-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0)
                .attr("y1", y(y.domain()[0]))
                .attr("x2", 0)
                .attr("y2", y(y.domain()[1]))
                .selectAll("stop")
                .data([
                    {offset: "0%", color: "#0077b6"},
                    {offset: "100%", color: "#00b4d8"}
                ])
                .enter().append("stop")
                .attr("offset", d => d.offset)
                .attr("stop-color", d => d.color);
    
            path.attr("stroke", "url(#line-gradient)");
    
            svg.append("path")
                .datum(filteredData)
                .attr("fill", "url(#line-gradient)")
                .attr("fill-opacity", 0.1)
                .attr("d", d3.area<StockPrice>()
                    .x(d => x(new Date(`${d.date}T${d.time}`)))
                    .y0(height - margin.bottom)
                    .y1(d => y(d.price))
                    .curve(d3.curveMonotoneX)
                )
                .style("opacity", 0)
                .transition()
                .duration(1800)
                .style("opacity", 1);
        };
    
        const renderTooltip = () => {
            if (!stockData || !stockData.price) return;
            const tooltip = d3.select(".chart-tooltip");
    
            const verticalLine = svg.append("line")
                .attr("class", "vertical-line")
                .attr("y1", margin.top)
                .attr("y2", height - margin.bottom)
                .style("stroke", "#0077b6")
                .style("stroke-width", "1px")
                .style("opacity", "0");
    
            svg.append("rect")
                .attr("class", "overlay")
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.bottom)
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mousemove", function(event) {
                    const mouseX = d3.pointer(event)[0];
                    const x0 = x.invert(mouseX);
    
                    const bisectDate = d3.bisector((d: StockPrice) => new Date(`${d.date}T${d.time}`)).left;
                    const i = bisectDate(filteredData, x0, 1);
                    const d0 = filteredData[i - 1];
                    const d1 = filteredData[i];
    
                    if (!d0 || !d1) return;
    
                    const d = x0.getTime() - new Date(`${d0.date}T${d0.time}`).getTime() > 
                              new Date(`${d1.date}T${d1.time}`).getTime() - x0.getTime() ? d1 : d0;
    
                    verticalLine
                        .attr("x1", x(new Date(`${d.date}T${d.time}`)))
                        .attr("x2", x(new Date(`${d.date}T${d.time}`)))
                        .style("opacity", "0.7");
    
                    tooltip
                        .style("left", `${event.pageX - 60}px`)
                        .style("top", `${event.pageY - 70}px`)
                        .style("display", "block")
                        .html(`
                            <div class="tooltip-time">${d.time}</div>
                            <div class="tooltip-price">$${d.price.toFixed(2)}</div>
                        `);
                })
                .on("mouseout", function() {
                    verticalLine.style("opacity", "0");
                    tooltip.style("display", "none");
                });
    
            svg.selectAll(".dot")
                .data(filteredData)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", (d: StockPrice) => x(new Date(`${d.date}T${d.time}`)))
                .attr("cy", d => y(d.price))
                .attr("r", 0)
                .attr("fill", "#0077b6")
                .transition()
                .delay((_d, i) => 1500 + (i * (1000 / filteredData.length)))
                .duration(300)
                .attr("r", 3);
        };
    
        const maxPrice = Math.max(...filteredData.map(d => d.price));
        const currentPrice = stockData.info?.price;
        const minPrice = Math.min(...filteredData.map(d => d.price));

        const drawDashedLine = (yValue: d3.NumberValue, color: string, label: string, offsetX: number, offsetY: number, drawLabel: boolean) => {
            const line = svg.append("line")
                .attr("x1", margin.left)
                .attr("y1", y(yValue))
                .attr("x2", margin.left)
                .attr("y2", y(yValue))
                .style("stroke", color)
                .style("stroke-dasharray", ("5, 5"));
                
            line.transition()
                .delay(1200)
                .duration(800)
                .attr("x2", width - margin.right);
    
            if (drawLabel) {
                const text = svg.append("text")
                    .attr("x", width - margin.right - offsetX)
                    .attr("y", y(yValue) - offsetY)
                    .attr("fill", color)
                    .attr("font-size", "12px")
                    .attr("font-weight", "600")
                    .attr("text-anchor", "start")
                    .style("opacity", 0)
                    .text(label);
                    
                text.transition()
                    .delay(1600)
                    .duration(500)
                    .style("opacity", 1);
            }
        };
    
        renderAxes();
        renderLine();
        drawDashedLine(maxPrice, "#2a9d8f", `Max: $${maxPrice.toFixed(2)}`, 100, 8, true);
        drawDashedLine(currentPrice, "#0077b6", `Current: $${currentPrice.toFixed(2)}`, 118, 8, (maxPrice - currentPrice) / (maxPrice - minPrice) * 100 > 10);
        drawDashedLine(minPrice, "#e76f51", `Min: $${minPrice.toFixed(2)}`, 100, -15, true);
        renderTooltip();
    }, [dimensions, isChartVisible]);
    

    const getBetaRiskLevel = (beta: number) => {
        if (beta < 0.8) return { level: 'Low', color: '#2a9d8f' };
        if (beta < 1.2) return { level: 'Average', color: '#e9c46a' };
        return { level: 'High', color: '#e76f51' };
    };
    
    const betaRisk = getBetaRiskLevel(beta);

    return (
        <div className={`stock-chart-container animate-on-scroll ${isChartVisible ? 'visible' : ''}`}>
            <div ref={containerRef} className="stock-details__chart">
                <svg ref={chartRef} />
            </div>
            <div className="chart-tooltip" />
            { stockData.beta &&
                <div className="beta-card">
                    <div className="beta-header">
                        <span className="beta-title">Beta</span>
                        <div className="beta-value" style={{ color: betaRisk.color }}>{beta.toFixed(2)}</div>
                    </div>
                    
                        <div className="beta-description">
                            <div className="risk-level">
                                <span>Volatility:</span>
                                <span className="risk-badge" style={{ backgroundColor: betaRisk.color }}>{betaRisk.level}</span>
                            </div>
                            <p className="beta-explainer">
                                {beta < 1 
                                    ? "Less volatile than the market average." 
                                    : beta > 1 
                                        ? "More volatile than the market average." 
                                        : "Volatility matches the market average."}
                            </p>
                        </div>
                   
                </div>
            }
        </div>
    );
};

export default StockPriceChart;