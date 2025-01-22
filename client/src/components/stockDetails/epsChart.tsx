import React, {useEffect, useRef} from 'react';
import { Stock } from '../../types/Stock';
import * as d3 from 'd3';

interface EPSChartProps {
  stockData: Stock | null;
}

const EPSChart: React.FC<EPSChartProps> = ({ stockData }) => {
    if (stockData == null || stockData.eps == null || stockData.eps.length === 0) return null;
    const epsChartRef = useRef<SVGSVGElement | null>(null);

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

    return (
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
    );
};

export default EPSChart;
