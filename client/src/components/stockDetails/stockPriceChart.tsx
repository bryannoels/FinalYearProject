import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Stock } from '../../types/Stock';
import { StockPrice } from '../../types/StockPrice';
import * as d3 from 'd3';


interface StockPriceChartProps {
  stockData: Stock | null;
}

const StockPriceChart: React.FC<StockPriceChartProps> = ({ stockData }) => {
    if (stockData == null) return null;
    const chartRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 450, height: 300 });

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
        if (!chartRef.current || stockData.price === null || stockData.price.length === 0) return;

        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();

        const width = dimensions.width;
        const height = dimensions.height;
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
                .attr("color", "var(--primary-light-dark)")
                .call(d3.axisBottom(x).ticks(d3.timeMinute.every(60)));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .attr("color", "var(--primary-light-dark)")
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
    }, [stockData?.price, dimensions]);

    return (
        <>
            <div ref={containerRef} className="stock-details__chart">
                <svg ref={chartRef} />
            </div>
            <div className="tooltip hidden" />
        </>
    );
};

export default StockPriceChart;
