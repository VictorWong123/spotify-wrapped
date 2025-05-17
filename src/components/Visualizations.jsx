import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Visualizations = ({ topTracks, topArtists }) => {
    const tracksRef = useRef();
    const artistsRef = useRef();

    console.log('Visualizations component props:', {
        topTracksLength: topTracks?.length,
        topArtistsLength: topArtists?.length
    });

    useEffect(() => {
        console.log('Visualizations useEffect triggered');
        if (!topTracks?.length || !topArtists?.length) {
            console.log('Missing data, returning early');
            return;
        }

        console.log('Creating visualizations...');
        // Clear previous visualizations
        d3.select(tracksRef.current).selectAll('*').remove();
        d3.select(artistsRef.current).selectAll('*').remove();

        // Create bar chart for top tracks
        const trackData = topTracks.map(track => ({
            name: track.name,
            popularity: track.popularity,
            artist: track.artists[0].name
        }));

        const trackMargin = { top: 20, right: 30, bottom: 90, left: 60 };
        const trackWidth = 600 - trackMargin.left - trackMargin.right;
        const trackHeight = 400 - trackMargin.top - trackMargin.bottom;

        const trackSvg = d3.select(tracksRef.current)
            .append('svg')
            .attr('width', trackWidth + trackMargin.left + trackMargin.right)
            .attr('height', trackHeight + trackMargin.top + trackMargin.bottom)
            .append('g')
            .attr('transform', `translate(${trackMargin.left},${trackMargin.top})`);

        const x = d3.scaleBand()
            .range([0, trackWidth])
            .domain(trackData.map(d => d.name))
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([trackHeight, 0]);

        trackSvg.append('g')
            .attr('transform', `translate(0,${trackHeight})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');

        trackSvg.append('g')
            .call(d3.axisLeft(y));

        trackSvg.selectAll('rect')
            .data(trackData)
            .enter()
            .append('rect')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.popularity))
            .attr('width', x.bandwidth())
            .attr('height', d => trackHeight - y(d.popularity))
            .attr('fill', '#1DB954') // Spotify green
            .append('title')
            .text(d => `${d.name} by ${d.artist}\nPopularity: ${d.popularity}`);

        // Create radial chart for top artists
        const artistData = topArtists.map(artist => ({
            name: artist.name,
            popularity: artist.popularity,
            followers: artist.followers.total
        }));

        const artistMargin = { top: 20, right: 20, bottom: 20, left: 20 };
        const artistWidth = 400 - artistMargin.left - artistMargin.right;
        const artistHeight = 400 - artistMargin.top - artistMargin.bottom;
        const radius = Math.min(artistWidth, artistHeight) / 2;

        const artistSvg = d3.select(artistsRef.current)
            .append('svg')
            .attr('width', artistWidth + artistMargin.left + artistMargin.right)
            .attr('height', artistHeight + artistMargin.top + artistMargin.bottom)
            .append('g')
            .attr('transform', `translate(${artistWidth / 2 + artistMargin.left},${artistHeight / 2 + artistMargin.top})`);

        const angle = d3.scalePoint()
            .domain(artistData.map(d => d.name))
            .range([0, 2 * Math.PI]);

        const r = d3.scaleLinear()
            .domain([0, d3.max(artistData, d => d.popularity)])
            .range([0, radius]);

        const line = d3.lineRadial()
            .angle(d => angle(d.name))
            .radius(d => r(d.popularity));

        artistSvg.append('path')
            .datum(artistData)
            .attr('fill', 'none')
            .attr('stroke', '#1DB954')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add artist names
        artistSvg.selectAll('text')
            .data(artistData)
            .enter()
            .append('text')
            .attr('x', d => r(d.popularity) * Math.cos(angle(d.name) - Math.PI / 2))
            .attr('y', d => r(d.popularity) * Math.sin(angle(d.name) - Math.PI / 2))
            .text(d => d.name)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#fff');

    }, [topTracks, topArtists]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h2>Top Tracks Popularity</h2>
                <div ref={tracksRef} style={{ minHeight: '400px' }}></div>
            </div>
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h2>Top Artists Radial View</h2>
                <div ref={artistsRef} style={{ minHeight: '400px' }}></div>
            </div>
        </div>
    );
};

export default Visualizations; 