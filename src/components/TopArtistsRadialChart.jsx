import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TopArtistsRadialChart = ({ topArtists }) => {
    const chartRef = useRef();

    useEffect(() => {
        if (!topArtists?.length) return;

        // Clear previous visualization
        d3.select(chartRef.current).selectAll('*').remove();

        // Responsive width
        const container = chartRef.current;
        const containerWidth = container.offsetWidth || 400;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = Math.max(containerWidth - margin.left - margin.right, 250);
        const height = 400 - margin.top - margin.bottom;
        const radius = Math.min(width, height) / 2;

        // Prepare data
        const artistData = topArtists.map(artist => ({
            name: artist.name,
            popularity: artist.popularity,
            followers: artist.followers.total
        }));

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

        // Create scales
        const angle = d3.scalePoint()
            .domain(artistData.map(d => d.name))
            .range([0, 2 * Math.PI]);

        const r = d3.scaleLinear()
            .domain([0, d3.max(artistData, d => d.popularity)])
            .range([0, radius]);

        // Create line generator
        const line = d3.lineRadial()
            .angle(d => angle(d.name))
            .radius(d => r(d.popularity));

        // Add the path
        svg.append('path')
            .datum(artistData)
            .attr('fill', 'none')
            .attr('stroke', '#1DB954')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add artist names
        svg.selectAll('text')
            .data(artistData)
            .enter()
            .append('text')
            .attr('x', d => r(d.popularity) * Math.cos(angle(d.name) - Math.PI / 2))
            .attr('y', d => r(d.popularity) * Math.sin(angle(d.name) - Math.PI / 2))
            .text(d => d.name)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#fff')
            .append('title')
            .text(d => `${d.name}\nPopularity: ${d.popularity}\nFollowers: ${d.followers.toLocaleString()}`);

    }, [topArtists]);

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
            <h2>Top Artists Radial View</h2>
            <div ref={chartRef} style={{ minHeight: '400px', width: '100%' }}></div>
        </div>
    );
};

export default TopArtistsRadialChart; 