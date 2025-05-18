import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/darkTheme.css';
import '../styles/Dashboard.css';

const Dashboard = ({ currentUser, topArtists, topTracks, recentlyPlayed }) => {
    const getUniqueGenres = () => {
        const genres = new Set();
        topArtists?.forEach(artist => {
            artist.genres.forEach(genre => genres.add(genre));
        });
        return Array.from(genres);
    };

    const prepareGenreData = () => {
        const genreCount = {};
        topArtists?.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });
        return Object.entries(genreCount)
            .map(([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    };

    return (
        <div className="dark-theme dashboard-page">
            {/* User Profile Section */}
            <div className="card flex-container flex-start">
                {/* Current User Profile */}
                <div style={{ flex: '0 0 300px' }}>
                    <h1 className="text-large">
                        {currentUser?.display_name || 'Your Profile'}
                    </h1>
                    {currentUser?.images?.[0]?.url && (
                        <img
                            src={currentUser.images[0].url}
                            alt={currentUser.display_name}
                            className="profile-image"
                        />
                    )}
                </div>

                {/* Top Artists */}
                <div style={{ flex: '1' }}>
                    <h2 className="card-subtitle">
                        Your Top Artists
                    </h2>
                    <div className="grid-container">
                        {topArtists?.slice(0, 5).map((artist) => (
                            <div key={artist.id} className="artist-card">
                                {artist.images?.[0]?.url && (
                                    <img
                                        src={artist.images[0].url}
                                        alt={artist.name}
                                        className="artist-image"
                                    />
                                )}
                                <h3 className="artist-name">
                                    {artist.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
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
                    <div className="stat-value">{recentlyPlayed?.length || 0}</div>
                    <div className="stat-label">Recently Played</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{getUniqueGenres().length}</div>
                    <div className="stat-label">Unique Genres</div>
                </div>
            </div>

            {/* Top Artists and Tracks */}
            <div className="top-lists">
                {/* Top Artists */}
                <div className="top-list-card">
                    <div className="top-list-header">
                        <h2 className="top-list-title">Top Artists</h2>
                    </div>
                    {topArtists?.slice(0, 5).map((artist, index) => (
                        <div key={artist.id} className="top-list-item">
                            <div className="item-rank">{index + 1}</div>
                            {artist.images?.[0]?.url && (
                                <img
                                    src={artist.images[0].url}
                                    alt={artist.name}
                                    className="item-image"
                                />
                            )}
                            <div className="item-info">
                                <div className="item-name">{artist.name}</div>
                                <div className="item-details">
                                    {artist.genres.slice(0, 2).join(', ')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Top Tracks */}
                <div className="top-list-card">
                    <div className="top-list-header">
                        <h2 className="top-list-title">Top Tracks</h2>
                    </div>
                    {topTracks?.slice(0, 5).map((track, index) => (
                        <div key={track.id} className="top-list-item">
                            <div className="item-rank">{index + 1}</div>
                            {track.album?.images?.[0]?.url && (
                                <img
                                    src={track.album.images[0].url}
                                    alt={track.name}
                                    className="item-image"
                                />
                            )}
                            <div className="item-info">
                                <div className="item-name">{track.name}</div>
                                <div className="item-details">
                                    {track.artists.map(artist => artist.name).join(', ')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Genre Distribution */}
            <div className="genre-section">
                <h2 className="card-title">Genre Distribution</h2>
                <div className="genre-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={prepareGenreData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--spotify-border)" />
                            <XAxis
                                dataKey="genre"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                stroke="var(--spotify-text-secondary)"
                                tick={{ fill: 'var(--spotify-text-secondary)' }}
                            />
                            <YAxis
                                stroke="var(--spotify-text-secondary)"
                                tick={{ fill: 'var(--spotify-text-secondary)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--spotify-light-gray)',
                                    border: '1px solid var(--spotify-border)',
                                    borderRadius: '4px'
                                }}
                                labelStyle={{ color: 'var(--spotify-text-primary)' }}
                            />
                            <Legend />
                            <Bar
                                dataKey="count"
                                name="Number of Artists"
                                fill="var(--spotify-green)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recently Played */}
            <div className="top-list-card">
                <div className="top-list-header">
                    <h2 className="top-list-title">Recently Played</h2>
                </div>
                {recentlyPlayed?.slice(0, 5).map((item, index) => (
                    <div key={item.track.id} className="top-list-item">
                        <div className="item-rank">{index + 1}</div>
                        {item.track.album?.images?.[0]?.url && (
                            <img
                                src={item.track.album.images[0].url}
                                alt={item.track.name}
                                className="item-image"
                            />
                        )}
                        <div className="item-info">
                            <div className="item-name">{item.track.name}</div>
                            <div className="item-details">
                                {item.track.artists.map(artist => artist.name).join(', ')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard; 