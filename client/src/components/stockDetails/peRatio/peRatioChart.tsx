import React, { useEffect, useRef, useState } from "react";
import { Stock } from "../../../types/Stock";
import * as d3 from "d3";
import "./peRatioChart.css";

interface PERatioChartProps {
  stockData: Stock;
}

const PERatioChart: React.FC<PERatioChartProps> = ({ stockData }) => {
    if (stockData == null || stockData.peRatio == null || stockData.peRatio.length === 0) return null;

    const peRatioChartRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isChartVisible, setIsChartVisible] = useState(false);
    const sortedData = stockData.peRatio.sort((a, b) => a.Year - b.Year);
    
    // Calculate P/E ratio statistics
    const peValues = sortedData.map(item => item.PE_Ratio);
    const currentPE = sortedData[sortedData.length - 1].PE_Ratio;
    const peStats = {
        min: Math.min(...peValues),
        max: Math.max(...peValues),
        avg: parseFloat((peValues.reduce((sum, val) => sum + val, 0) / peValues.length).toFixed(2)),
        median: parseFloat(d3.median(peValues)?.toFixed(2) || "0"),
        variance: parseFloat(d3.variance(peValues)?.toFixed(2) || "0"),
        stdDev: parseFloat(d3.deviation(peValues)?.toFixed(2) || "0"),
        current: currentPE
    };
    
    // Classify P/E ratio
    const classifyPE = (pe: number): { category: string, message: string } => {
        if (pe < 0) {
            return { 
                category: "negative", 
                message: "Negative P/E ratios often indicate that the company is currently unprofitable." 
            };
        } else if (pe < 10) {
            return { 
                category: "low", 
                message: "Low P/E ratio may indicate the stock is undervalued or the company has slow growth prospects." 
            };
        } else if (pe < 25) {
            return { 
                category: "medium", 
                message: "This P/E ratio is in a moderate range, suggesting reasonable valuation relative to earnings." 
            };
        } else {
            return { 
                category: "high", 
                message: "High P/E ratio may indicate investors expect high growth in the future or the stock might be overvalued." 
            };
        }
    };
    
    const currentPEClass = classifyPE(currentPE).category;
    const currentPEMessage = classifyPE(currentPE).message;
    
    // Calculate position for range indicator
    const calculateRangePosition = (value: number): string => {
        const min = peStats.min;
        const max = peStats.max;
        const range = max - min;
        const percentage = ((value - min) / range) * 100;
        return `${Math.max(0, Math.min(100, percentage))}%`;
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

    useEffect(() => {
        if (!peRatioChartRef.current || sortedData.length === 0 || !isChartVisible) return;
        
        const peRatioTooltip = d3.select('.peRatio-tooltip');
        const svg = d3.select(peRatioChartRef.current);
        svg.selectAll("*").remove();
        
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
            .domain([minimumValue < 0 ? minimumValue * 1.1 : 0, maximumValue > 0 ? maximumValue * 1.1 : -maximumValue * 0.1])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const colorScale = d3.scaleLinear<string>()
            .domain([minimumValue < 0 ? minimumValue : 0, 0, maximumValue > 0 ? maximumValue : 0])
            .range(["#e63946", "#ddd", "#2a9d8f"])
            .clamp(true);

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

        const yearsInterval = Math.ceil(sortedData.length / 5);
        const tickValues = [];
        const startYear = sortedData[0].Year;
        const endYear = sortedData[sortedData.length - 1].Year;
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
            .data(sortedData)
            .enter().append("rect")
            .attr("class", d => `bar ${d.PE_Ratio >= 0 ? 'positive' : 'negative'}`)
            .attr("x", d => x(new Date(d.Year, 0, 1)) as number - 5)
            .attr("y", d => d.PE_Ratio < 0 ? y(0) : y(d.PE_Ratio))
            .attr("height", d => Math.abs(y(d.PE_Ratio) - y(0)))
            .attr("width", (d, i) => {
                const nextX = i < sortedData.length - 1 ? 
                    x(new Date(sortedData[i + 1].Year, 0, 1)) as number : 
                    x(new Date(d.Year + 1, 0, 1)) as number;
                return Math.min(30, nextX - (x(new Date(d.Year, 0, 1)) as number));
            })
            .attr("fill", d => d.PE_Ratio < 0 ? "#FF0000" : "#008000")
            .attr("rx", 3) // Rounded corners
            .attr("ry", 3)
            .style("transform-origin", d => `${x(new Date(d.Year, 0, 1))}px ${d.PE_Ratio < 0 ? y(0) : y(d.PE_Ratio)}px`)
            .style("transform", "scaleY(0)")
            .style("opacity", 0.8)
            .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(200).attr("opacity", 1);
                peRatioTooltip
                    .classed('hidden', false)
                    .style('left', `${event.pageX - 40}px`)
                    .style('top', `${event.pageY - 80}px`)
                    .html(`
                        <div class="tooltip-year">${d.Year}</div>
                        <div class="tooltip-pe ${d.PE_Ratio < 0 ? 'negative' : ''}">${d.PE_Ratio.toFixed(2)}</div>
                    `);
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(200).attr("opacity", 0.8);
                peRatioTooltip.classed('hidden', true);
            });

        // Animate bars with a staggered delay
        svg.selectAll(".bar")
            .transition()
            .delay((d, i) => i * 100)
            .duration(800)
            .style("transform", "scaleY(1)");

        // Add mean line
        if (peStats.avg !== 0) {
            svg.append("line")
                .attr("x1", margin.left)
                .attr("y1", y(peStats.avg))
                .attr("x2", margin.left)
                .attr("y2", y(peStats.avg))
                .attr("stroke", "#0077b6")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5")
                .transition()
                .delay(sortedData.length * 100 + 200)
                .duration(800)
                .attr("x2", width - margin.right);
                
            svg.append("text")
                .attr("x", width - margin.right - 5)
                .attr("y", y(peStats.avg) - 5)
                .attr("text-anchor", "end")
                .attr("font-size", "10px")
                .attr("fill", "#0077b6")
                .text(`Mean: ${peStats.avg.toFixed(2)}`)
                .style("opacity", 0)
                .transition()
                .delay(sortedData.length * 100 + 800)
                .duration(400)
                .style("opacity", 1);
        }
    }, [sortedData, isChartVisible, peStats.avg]);

  return (
    <div ref={containerRef} className={`pe-chart-container ${isChartVisible ? 'visible' : ''}`}>
        <p className="stock-details__title">PE Ratio</p>
        <div className="stock-details__pe">
            <svg ref={peRatioChartRef} />
            <div className="stock-details__pe__table">
                {sortedData.map((item) => (
                    <div className="stock-details__pe__row" key={item.Year}>
                        <div className="stock-details__pe__label">{item.Year}</div>
                        <div className={`stock-details__pe__value ${item.PE_Ratio >= 0 ? 'positive' : 'negative'}`}>
                            {item.PE_Ratio.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="pe-interpretation-card">
            <div className="pe-card-header">
                <div className="pe-card-title">PE Ratio Statistics</div>
            </div>
            <div className="pe-stats-grid">
                <div className="pe-stat-item">
                    <div className="pe-stat-label">Max</div>
                    <div className="pe-stat-value">{peStats.max.toFixed(2)}</div>
                </div>
                <div className="pe-stat-item">
                    <div className="pe-stat-label">Min</div>
                    <div className="pe-stat-value">{peStats.min.toFixed(2)}</div>
                </div>
                <div className="pe-stat-item">
                    <div className="pe-stat-label">Mean</div>
                    <div className="pe-stat-value">{peStats.avg.toFixed(2)}</div>
                </div>
                <div className="pe-stat-item">
                    <div className="pe-stat-label">Median</div>
                    <div className="pe-stat-value">{peStats.median.toFixed(2)}</div>
                </div>
                <div className="pe-stat-item">
                    <div className="pe-stat-label">Variance</div>
                    <div className="pe-stat-value">{peStats.variance.toFixed(2)}</div>
                </div>
                <div className="pe-stat-item">
                    <div className="pe-stat-label">Std Deviation</div>
                    <div className="pe-stat-value">{peStats.stdDev.toFixed(2)}</div>
                </div>
            </div>
            <div className={`pe-interpretation ${currentPEClass}`}>
                {currentPEMessage}
            </div>
        </div>
        
        <div className="pe-tooltip hidden" />
    </div>
  );
};

export default PERatioChart;
