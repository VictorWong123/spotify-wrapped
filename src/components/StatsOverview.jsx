import React from 'react';

const StatsOverview = ({ topArtists, topTracks }) => {
    const getUniqueGenres = () => {
        const genres = new Set();
        topArtists?.forEach(artist => {
            artist.genres.forEach(genre => genres.add(genre));
        });
        return Array.from(genres);
    };

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-value">{topArtists?.length || 0}</div>
                <div className="stat-label">Top Artists</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{topTracks?.length || 0}</div>
                <div className="stat-label">Top Tracks</div>
            </div>
            <div className="stat-card">
                <div className="stat-value">{getUniqueGenres().length}</div>
                <div className="stat-label">Unique Genres</div>
            </div>
        </div>
    );
};

export default StatsOverview; 