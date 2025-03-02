import React, { useEffect, useRef } from 'react';
import { Stock } from '../../types/Stock';
import * as d3 from 'd3';

interface EPSChartProps {
  stockData: Stock | null;
}

const EPSChart: React.FC<EPSChartProps> = ({ stockData }) => {
    if (stockData == null || stockData.eps == null || stockData.eps.length === 0) return null;
    const epsChartRef = useRef<SVGSVGElement | null>(null);
    const sortedEps = stockData.eps.sort((a, b) => a.Year - b.Year);

    useEffect(() => {
        if (!epsChartRef.current || stockData == null || sortedEps.length === 0) return;
        const epsTooltip = d3.select('.eps-tooltip');

        const svg = d3.select(epsChartRef.current);
        const width = 350;
        const height = 200;
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };

        svg.attr("width", width).attr("height", height);

        const minimumValue = d3.min(sortedEps, d => d.EPS) as number;
        const maximumValue = d3.max(sortedEps, d => d.EPS) as number;

        const x = d3.scaleTime()
            .domain([new Date(sortedEps[0].Year, 0, 1), new Date(sortedEps[sortedEps.length - 1].Year, 0, 1)])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([minimumValue < 0 ? minimumValue * 1.1 : 0, maximumValue > 0 ? maximumValue : -maximumValue])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const renderAxes = () => {
            const yearsInterval = Math.floor(sortedEps.length/5);
            const tickValues = [];
            const startYear = sortedEps[0].Year;
            const endYear = sortedEps[sortedEps.length - 1].Year;
            for (let year = startYear; year <= endYear; year += yearsInterval) {
                tickValues.push(new Date(year, 0, 1));
            }

            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .attr("color", "var(--primary-light-dark)")
                .call(d3.axisBottom(x).tickValues(tickValues));
            
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .attr("color", "var(--primary-light-dark)")
                .call(d3.axisLeft(y));
        };

        svg.selectAll(".bar")
            .data(sortedEps)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(new Date(d.Year, 0, 1)) as number)
            .attr("y", d => d.EPS < 0 ? y(0) : y(d.EPS))
            .attr("height", d => Math.abs(y(d.EPS) - y(0)))
            .attr("width", (d, i) => {
                const nextX = i < sortedEps.length - 1 ? x(new Date(sortedEps[i + 1].Year, 0, 1)) : x(new Date(d.Year + 1, 0, 1));
                return nextX - x(new Date(d.Year, 0, 1));
            })
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


        renderAxes();
    }, [sortedEps]);

    return (
        <>
            <p className="stock-details__title">Earning Per Sharing (EPS)</p>
            <div className="stock-details__eps">
                <svg ref={epsChartRef} />
                <div className="stock-details__eps__table">
                    {sortedEps.map((item) => (
                        <div className="stock-details__eps__row" key={item.Year}>
                            <div className="stock-details__eps__label">{item.Year}</div>
                            <div className="stock-details__eps__value">{item.EPS}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="eps-tooltip hidden" />
        </>
    );
};

export default EPSChart;
