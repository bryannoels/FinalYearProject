import React, { useEffect, useRef, useState } from 'react';
import { Stock } from '../../../types/Stock';
import * as d3 from 'd3';
import './epsChart.css';

interface EPSChartProps {
    stockData: Stock | null;
}

const EPSChart: React.FC<EPSChartProps> = ({ stockData }) => {
    if (stockData == null || stockData.eps == null || stockData.eps.length === 0) return null;
    
    const epsChartRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isChartVisible, setIsChartVisible] = useState(false);
    const sortedEps = stockData.eps.sort((a, b) => a.Year - b.Year);
    
    // Calculate EPS statistics
    const epsValues = sortedEps.map(item => item.EPS);
    const epsStats = {
        mean: parseFloat((epsValues.reduce((sum, val) => sum + val, 0) / epsValues.length).toFixed(2)),
        median: parseFloat(d3.median(epsValues)?.toFixed(2) || "0"),
        variance: parseFloat(d3.variance(epsValues)?.toFixed(2) || "0"),
        stdDev: parseFloat(d3.deviation(epsValues)?.toFixed(2) || "0"),
        trend: sortedEps.length > 1 
            ? sortedEps[sortedEps.length-1].EPS > sortedEps[sortedEps.length-2].EPS 
                ? "positive" 
                : sortedEps[sortedEps.length-1].EPS < sortedEps[sortedEps.length-2].EPS 
                    ? "negative" 
                    : "neutral"
            : "neutral"
    };
    
    // Get the trend message
    const getTrendMessage = () => {
        if (sortedEps.length <= 1) return "Not enough data for trend analysis";
        
        const lastEps = sortedEps[sortedEps.length-1].EPS;
        const prevEps = sortedEps[sortedEps.length-2].EPS;
        const percentChange = ((lastEps - prevEps) / Math.abs(prevEps) * 100).toFixed(1);
        
        if (lastEps > prevEps) {
            return `EPS increased by ${percentChange}% from previous year`;
        } else if (lastEps < prevEps) {
            return `EPS decreased by ${Math.abs(parseFloat(percentChange))}% from previous year`;
        } else {
            return "EPS remained unchanged from previous year";
        }
    };

    // Intersection Observer for scroll animation
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsChartVisible(true);
            }
        }, { threshold: 0.2 });
        
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        
        return () => {
            observer.disconnect();
        };
    }, []);

    // D3 chart creation
    useEffect(() => {
        if (!epsChartRef.current || sortedEps.length === 0 || !isChartVisible) return;
        
        const epsTooltip = d3.select('.eps-tooltip');
        const svg = d3.select(epsChartRef.current);
        svg.selectAll("*").remove();
        
        const width = 300;
        const height = 200;
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };

        svg.attr("width", width).attr("height", height);

        const minimumValue = d3.min(sortedEps, d => d.EPS) as number;
        const maximumValue = d3.max(sortedEps, d => d.EPS) as number;

        const x = d3.scaleTime()
            .domain([new Date(sortedEps[0].Year, 0, 1), new Date(sortedEps[sortedEps.length - 1].Year, 0, 1)])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([minimumValue < 0 ? minimumValue * 1.1 : 0, maximumValue > 0 ? maximumValue * 1.1 : -maximumValue * 0.1])
            .nice()
            .range([height - margin.bottom, margin.top]);


        // Horizontal zero line if needed
        if (minimumValue < 0) {
            svg.append("line")
                .attr("x1", margin.left)
                .attr("y1", y(0))
                .attr("x2", width - margin.right)
                .attr("y2", y(0))
                .attr("stroke", "#999")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "3,3")
                .style("opacity", 0)
                .transition()
                .duration(800)
                .style("opacity", 1);
        }

        // Render the axes with animation
        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .attr("class", "x-axis")
            .attr("color", "var(--primary-light-dark)")
            .style("opacity", 0);

        const yearsInterval = Math.ceil(sortedEps.length / 5);
        const tickValues = [];
        const startYear = sortedEps[0].Year;
        const endYear = sortedEps[sortedEps.length - 1].Year;
        for (let year = startYear; year <= endYear; year += yearsInterval) {
            tickValues.push(new Date(year, 0, 1));
        }

        xAxis.call(d3.axisBottom(x).tickValues(tickValues))
            .transition()
            .duration(800)
            .style("opacity", 1);
        
        const yAxis = svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("class", "y-axis")
            .attr("color", "var(--primary-light-dark)")
            .style("opacity", 0);
            
        yAxis.call(d3.axisLeft(y))
            .transition()
            .duration(800)
            .style("opacity", 1);

        // Create bars with staggered animation
        svg.selectAll(".bar")
            .data(sortedEps)
            .enter().append("rect")
            .attr("class", d => `bar ${d.EPS >= 0 ? 'positive' : 'negative'}`)
            .attr("x", d => x(new Date(d.Year, 0, 1)) as number - 5)
            .attr("y", d => d.EPS < 0 ? y(0) : y(d.EPS))
            .attr("height", d => Math.abs(y(d.EPS) - y(0)))
            .attr("width", (d, i) => {
                const nextX = i < sortedEps.length - 1 ? 
                    x(new Date(sortedEps[i + 1].Year, 0, 1)) as number : 
                    x(new Date(d.Year + 1, 0, 1)) as number;
                return Math.min(30, nextX - (x(new Date(d.Year, 0, 1)) as number));
            })
            .attr("fill", d => d.EPS < 0 ? "#FF0000" : "#008000")
            .attr("rx", 3) // Rounded corners
            .attr("ry", 3)
            .style("transform-origin", d => `${x(new Date(d.Year, 0, 1))}px ${d.EPS < 0 ? y(0) : y(d.EPS)}px`)
            .style("transform", "scaleY(0)")
            .style("opacity", 0.8)
            .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(200).attr("opacity", 1);
                epsTooltip
                    .classed('hidden', false)
                    .style('left', `${event.pageX - 40}px`)
                    .style('top', `${event.pageY - 80}px`)
                    .html(`
                        <div class="tooltip-year">${d.Year}</div>
                        <div class="tooltip-eps ${d.EPS < 0 ? 'negative' : ''}">${d.EPS.toFixed(2)}</div>
                    `);
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(200).attr("opacity", 0.8);
                epsTooltip.classed('hidden', true);
            });

        // Animate bars with a staggered delay
        svg.selectAll(".bar")
            .transition()
            .delay((_d, i) => i * 100)
            .duration(800)
            .style("transform", "scaleY(1)");

        // Add mean line
        if (epsStats.mean !== 0) {
            svg.append("line")
                .attr("x1", margin.left)
                .attr("y1", y(epsStats.mean))
                .attr("x2", margin.left)
                .attr("y2", y(epsStats.mean))
                .attr("stroke", "#0077b6")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5")
                .transition()
                .delay(sortedEps.length * 100 + 200)
                .duration(800)
                .attr("x2", width - margin.right);
                
            svg.append("text")
                .attr("x", width - margin.right - 5)
                .attr("y", y(epsStats.mean) - 5)
                .attr("text-anchor", "end")
                .attr("font-size", "10px")
                .attr("fill", "#0077b6")
                .text(`Mean: ${epsStats.mean.toFixed(2)}`)
                .style("opacity", 0)
                .transition()
                .delay(sortedEps.length * 100 + 800)
                .duration(400)
                .style("opacity", 1);
        }
    }, [sortedEps, isChartVisible, epsStats.mean]);

    return (
        <div ref={containerRef} className={`eps-chart-container ${isChartVisible ? 'visible' : ''}`}>
            <p className="stock-details__title">Earnings Per Share (EPS)</p>
            <div className="stock-details__eps">
                <svg ref={epsChartRef} />
                <div className="stock-details__eps__table">
                    {sortedEps.map((item) => (
                        <div className="stock-details__eps__row" key={item.Year}>
                            <div className="stock-details__eps__label">{item.Year}</div>
                            <div className={`stock-details__eps__value ${item.EPS >= 0 ? 'positive' : 'negative'}`}>
                                {item.EPS.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="eps-stats-card">
                <div className="eps-stats-header">
                    <div className="eps-stats-title">EPS Statistics</div>
                </div>
                <div className="eps-stats-grid">
                    <div className="eps-stat-item">
                        <div className="eps-stat-label">Mean</div>
                        <div className="eps-stat-value">{epsStats.mean.toFixed(2)}</div>
                    </div>
                    <div className="eps-stat-item">
                        <div className="eps-stat-label">Median</div>
                        <div className="eps-stat-value">{epsStats.median.toFixed(2)}</div>
                    </div>
                    <div className="eps-stat-item">
                        <div className="eps-stat-label">Variance</div>
                        <div className="eps-stat-value">{epsStats.variance.toFixed(2)}</div>
                    </div>
                    <div className="eps-stat-item">
                        <div className="eps-stat-label">Std Deviation</div>
                        <div className="eps-stat-value">{epsStats.stdDev.toFixed(2)}</div>
                    </div>
                </div>
                <div className={`eps-trend-indicator eps-trend-${epsStats.trend}`}>
                    {getTrendMessage()}
                </div>
            </div>
            
            <div className="eps-tooltip hidden" />
        </div>
    );
};

export default EPSChart;