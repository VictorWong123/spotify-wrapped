import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TopTracksChart = ({ topTracks }) => {
    const chartRef = useRef();

    useEffect(() => {
        if (!topTracks?.length) return;

        // Clear previous visualization
        d3.select(chartRef.current).selectAll('*').remove();

        // Responsive width
        const container = chartRef.current;
        const containerWidth = container.offsetWidth || 600;
        const margin = { top: 20, right: 30, bottom: 90, left: 60 };
        const width = Math.max(containerWidth - margin.left - margin.right, 300);
        const height = 400 - margin.top - margin.bottom;

        // Prepare data
        const trackData = topTracks.map(track => ({
            name: track.name,
            popularity: track.popularity,
            artist: track.artists[0].name
        }));

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        const x = d3.scaleBand()
            .range([0, width])
            .domain(trackData.map(d => d.name))
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');

        svg.append('g')
            .call(d3.axisLeft(y));

        // Add bars
        svg.selectAll('rect')
            .data(trackData)
            .enter()
            .append('rect')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.popularity))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.popularity))
            .attr('fill', '#1DB954') // Spotify green
            .append('title')
            .text(d => `${d.name} by ${d.artist}\nPopularity: ${d.popularity}`);

    }, [topTracks]);

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
            <h2>Top Tracks Popularity</h2>
            <div ref={chartRef} style={{ minHeight: '400px', width: '100%' }}></div>
        </div>
    );
};

export default TopTracksChart; 