import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const AudioFeaturesRadarChart = ({ trackFeatures, topTracks }) => {
    const chartRef = useRef();

    useEffect(() => {
        if (!trackFeatures?.length || !topTracks?.length) return;

        // Clear previous visualization
        d3.select(chartRef.current).selectAll('*').remove();

        // Prepare data
        const featuresData = trackFeatures.map((feature, index) => ({
            ...feature,
            name: topTracks[index].name
        }));

        // Set up dimensions
        const margin = { top: 20, right: 30, bottom: 90, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

        // Define features to show
        const features = ['danceability', 'energy', 'valence', 'acousticness', 'instrumentalness'];

        // Create scales
        const angle = d3.scalePoint()
            .domain(features)
            .range([0, 2 * Math.PI]);

        const r = d3.scaleLinear()
            .domain([0, 1])
            .range([0, Math.min(width, height) / 2]);

        // Create line generator
        const line = d3.lineRadial()
            .angle((d, i) => angle(features[i]))
            .radius(d => r(d));

        // Add paths for each track
        svg.selectAll('path')
            .data(featuresData)
            .enter()
            .append('path')
            .attr('d', d => line(features.map(f => d[f])))
            .attr('fill', 'none')
            .attr('stroke', '#1DB954')
            .attr('stroke-width', 2)
            .append('title')
            .text(d => `${d.name}\n${features.map(f => `${f}: ${(d[f] * 100).toFixed(1)}%`).join('\n')}`);

        // Add feature labels
        svg.selectAll('.feature-label')
            .data(features)
            .enter()
            .append('text')
            .attr('class', 'feature-label')
            .attr('x', d => r(1.1) * Math.cos(angle(d) - Math.PI / 2))
            .attr('y', d => r(1.1) * Math.sin(angle(d) - Math.PI / 2))
            .text(d => d)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#fff');

        // Add concentric circles for reference
        const circles = [0.2, 0.4, 0.6, 0.8, 1];
        svg.selectAll('.circle')
            .data(circles)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', d => r(d))
            .attr('fill', 'none')
            .attr('stroke', '#666')
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '2,2');

    }, [trackFeatures, topTracks]);

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h2>Audio Features Radar</h2>
            <div ref={chartRef} style={{ minHeight: '400px' }}></div>
        </div>
    );
};

export default AudioFeaturesRadarChart; 