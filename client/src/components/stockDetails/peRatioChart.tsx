import React, { useEffect, useRef } from 'react';
import { Stock } from '../../types/Stock';
import * as d3 from 'd3';

interface PeRatioChartProps {
  stockData: Stock | null;
}

const PeRatioChart: React.FC<PeRatioChartProps> = ({ stockData }) => {
    if (stockData == null || stockData.peRatio == null || stockData.peRatio.length === 0) return null;

    const peRatioChartRef = useRef<SVGSVGElement | null>(null);
    const sortedData = stockData.peRatio.sort((a, b) => a.Year - b.Year);

    useEffect(() => {
        if (!peRatioChartRef.current || sortedData.length === 0) return;

        const peRatioTooltip = d3.select('.peRatio-tooltip');
        const svg = d3.select(peRatioChartRef.current);
        const width = 350;
        const height = 200;
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };

        svg.attr("width", width).attr("height", height);

        const minimumValue = d3.min(sortedData, d => d.PE_Ratio) as number;
        const maximumValue = d3.max(sortedData, d => d.PE_Ratio) as number;

        const x = d3.scaleTime()
            .domain([new Date(sortedData[0].Year, 0, 1), new Date(sortedData[sortedData.length - 1].Year, 0, 1)])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([minimumValue < 0 ? minimumValue * 1.1 : 0, maximumValue > 0 ? maximumValue : -maximumValue])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const renderAxes = () => {
            const yearsInterval = Math.floor(sortedData.length/5);
            const tickValues = [];
            const startYear = sortedData[0].Year;
            const endYear = sortedData[sortedData.length - 1].Year;
            for (let year = startYear; year <= endYear; year += yearsInterval) {
                tickValues.push(new Date(year, 0, 1));
            }
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickValues(tickValues));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));
        };

        svg.selectAll(".bar")
            .data(sortedData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(new Date(d.Year, 0, 1)) as number)
            .attr("y", d => d.PE_Ratio < 0 ? y(0) : y(d.PE_Ratio))
            .attr("height", d => Math.abs(y(d.PE_Ratio) - y(0)))
            .attr("width", (d, i) => {
                const nextX = i < sortedData.length - 1 ? x(new Date(sortedData[i + 1].Year, 0, 1)) : x(new Date(d.Year + 1, 0, 1));
                return nextX - x(new Date(d.Year, 0, 1));
            })
            .attr("fill", d => d.PE_Ratio < 0 ? "#FF0000" : "#008000")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("opacity", 0.7);
                peRatioTooltip
                    .attr('data-date', d.Year)
                    .style('left', `${event.pageX - 40}px`)
                    .style('top', `${event.pageY - 80}px`)
                    .classed('hidden', false)
                    .html(`Year: ${d.Year}<br>PE Ratio: ${d.PE_Ratio}`);
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
                peRatioTooltip.classed('hidden', true);
            });

        renderAxes();
    }, [sortedData]);

    return (
        <>
            <p className="stock-details__title">Price to Earnings Ratio (P/E)</p>
            <div className="stock-details__eps">
                <svg ref={peRatioChartRef} />
                <div className="stock-details__eps__table">
                    {sortedData.map((item) => (
                        <div className="stock-details__eps__row" key={item.Year}>
                            <div className="stock-details__eps__label">{item.Year}</div>
                            <div className="stock-details__eps__value">{item.PE_Ratio}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="peRatio-tooltip hidden" />
        </>
    );
};

export default PeRatioChart;
