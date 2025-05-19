import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/darkTheme.css';
import '../styles/ViewData.css';

const ViewData = ({ currentUser, topArtists, topTracks, recentlyPlayed }) => {
    const [genreData, setGenreData] = useState([]);

    useEffect(() => {
        // Prepare genre data when component mounts or when topArtists changes
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

        setGenreData(prepareGenreData());
    }, [topArtists]);

    return (
        <div className="view-data-page">
            <div className="page-header">
                <h1 className="text-large">Your Music Data</h1>
                <p className="text-secondary">Detailed view of your listening habits</p>
            </div>

            {/* Genre Distribution */}
            <div className="card">
                <h2 className="card-title">Genre Distribution</h2>
                <p className="text-secondary">
                    Your top genres based on your favorite artists
                </p>
                <div className="genre-chart">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={genreData}
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
            <div className="card">
                <h2 className="card-title">Recently Played</h2>
                <p className="text-secondary">
                    Your most recently played tracks
                </p>
                <div className="recently-played-list">
                    {recentlyPlayed?.slice(0, 10).map((item, index) => (
                        <div key={item.track.id} className="track-item">
                            <div className="track-rank">{index + 1}</div>
                            {item.track.album?.images?.[0]?.url && (
                                <img
                                    src={item.track.album.images[0].url}
                                    alt={item.track.name}
                                    className="track-image"
                                />
                            )}
                            <div className="track-info">
                                <div className="track-name">{item.track.name}</div>
                                <div className="track-artist">
                                    {item.track.artists.map(artist => artist.name).join(', ')}
                                </div>
                            </div>
                            <div className="track-album">
                                {item.track.album.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ViewData; 