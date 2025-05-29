import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import '../styles/darkTheme.css';
import '../styles/ViewData.css';

const COLORS = ['#1DB954', '#1ed760', '#1fdf64', '#20e768', '#21ef6c'];

const ViewData = ({ currentUser, topArtists, topTracks, recentlyPlayed, token }) => {
    const [genreData, setGenreData] = useState([]);
    const [audioFeatures, setAudioFeatures] = useState(null);
    const [listeningTimeData, setListeningTimeData] = useState([]);
    const [trackDetails, setTrackDetails] = useState([]);
    const [artistDetails, setArtistDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
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

        const fetchAudioFeatures = async () => {
            if (!topTracks?.length) return;

            try {
                setIsLoading(true);
                const trackIds = topTracks.slice(0, 10).map(track => track.id);
                const response = await axios.get(
                    `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Calculate average audio features
                const features = response.data.audio_features.reduce((acc, track) => {
                    if (!track) return acc;
                    Object.keys(track).forEach(key => {
                        if (typeof track[key] === 'number') {
                            acc[key] = (acc[key] || 0) + track[key];
                        }
                    });
                    return acc;
                }, {});

                // Calculate averages
                const count = response.data.audio_features.filter(Boolean).length;
                Object.keys(features).forEach(key => {
                    features[key] = features[key] / count;
                });

                setAudioFeatures(features);
            } catch (error) {
                console.error('Error fetching audio features:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const prepareListeningTimeData = () => {
            if (!recentlyPlayed?.length) return [];

            const timeData = recentlyPlayed.reduce((acc, item) => {
                const date = new Date(item.played_at);
                const hour = date.getHours();
                const day = date.getDay();

                // Initialize if not exists
                if (!acc.hours[hour]) acc.hours[hour] = 0;
                if (!acc.days[day]) acc.days[day] = 0;

                acc.hours[hour]++;
                acc.days[day]++;
                return acc;
            }, { hours: {}, days: {} });

            const hoursData = Object.entries(timeData.hours)
                .map(([hour, count]) => ({
                    time: `${hour}:00`,
                    count
                }))
                .sort((a, b) => parseInt(a.time) - parseInt(b.time));

            const daysData = Object.entries(timeData.days)
                .map(([day, count]) => ({
                    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
                    count
                }));

            return { hoursData, daysData };
        };

        const prepareTrackDetails = () => {
            return topTracks?.slice(0, 10).map(track => ({
                name: track.name,
                popularity: track.popularity,
                duration: Math.round(track.duration_ms / 1000 / 60), // Convert to minutes
                releaseDate: new Date(track.album.release_date).getFullYear(),
                artists: track.artists.map(artist => artist.name).join(', ')
            }));
        };

        const prepareArtistDetails = () => {
            return topArtists?.slice(0, 10).map(artist => ({
                name: artist.name,
                popularity: artist.popularity,
                genres: artist.genres.slice(0, 3).join(', '),
                followers: Math.round(artist.followers.total / 1000) + 'K'
            }));
        };

        setGenreData(prepareGenreData());
        fetchAudioFeatures();
        setListeningTimeData(prepareListeningTimeData());
        setTrackDetails(prepareTrackDetails());
        setArtistDetails(prepareArtistDetails());
    }, [topArtists, topTracks, recentlyPlayed, token]);

    const renderAudioFeatures = () => {
        if (!audioFeatures) return null;

        const radarData = [
            { name: 'Danceability', value: audioFeatures.danceability * 100 },
            { name: 'Energy', value: audioFeatures.energy * 100 },
            { name: 'Valence', value: audioFeatures.valence * 100 },
            { name: 'Acousticness', value: audioFeatures.acousticness * 100 },
            { name: 'Instrumentalness', value: audioFeatures.instrumentalness * 100 },
            { name: 'Liveness', value: audioFeatures.liveness * 100 },
            { name: 'Speechiness', value: audioFeatures.speechiness * 100 }
        ];

        return (
            <div className="card">
                <h2 className="card-title">Audio Features Analysis</h2>
                <p className="text-secondary">
                    Musical characteristics of your top tracks
                </p>
                <div className="chart-container" style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="var(--spotify-border)" />
                            <PolarAngleAxis
                                dataKey="name"
                                stroke="var(--spotify-text-secondary)"
                                tick={{ fill: 'var(--spotify-text-secondary)' }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                stroke="var(--spotify-text-secondary)"
                                tick={{ fill: 'var(--spotify-text-secondary)' }}
                            />
                            <Radar
                                name="Features"
                                dataKey="value"
                                stroke="var(--spotify-green)"
                                fill="var(--spotify-green)"
                                fillOpacity={0.3}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--spotify-light-gray)',
                                    border: '1px solid var(--spotify-border)',
                                    borderRadius: '4px'
                                }}
                                formatter={(value) => [`${Math.round(value)}%`, '']}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderListeningTime = () => {
        if (!listeningTimeData.hoursData?.length) return null;

        return (
            <div className="card">
                <h2 className="card-title">Listening Time Analysis</h2>
                <p className="text-secondary">
                    When you listen to music
                </p>
                <div className="chart-container" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={listeningTimeData.hoursData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--spotify-border)" />
                            <XAxis
                                dataKey="time"
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
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="var(--spotify-green)"
                                name="Tracks Played"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-container" style={{ height: 300, marginTop: '2rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={listeningTimeData.daysData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--spotify-border)" />
                            <XAxis
                                dataKey="day"
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
                            />
                            <Bar
                                dataKey="count"
                                fill="var(--spotify-green)"
                                name="Tracks Played"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderTrackDetails = () => {
        if (!trackDetails?.length) return null;

        return (
            <div className="card">
                <h2 className="card-title">Top Tracks Details</h2>
                <p className="text-secondary">
                    Detailed information about your favorite tracks
                </p>
                <div className="track-details-list">
                    {trackDetails.map((track, index) => (
                        <div key={index} className="track-detail-item">
                            <div className="track-rank">{index + 1}</div>
                            <div className="track-info">
                                <div className="track-name">{track.name}</div>
                                <div className="track-artist">{track.artists}</div>
                            </div>
                            <div className="track-metrics">
                                <div className="metric">
                                    <span className="metric-label">Popularity</span>
                                    <span className="metric-value">{track.popularity}%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Duration</span>
                                    <span className="metric-value">{track.duration} min</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Released</span>
                                    <span className="metric-value">{track.releaseDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderArtistDetails = () => {
        if (!artistDetails?.length) return null;

        return (
            <div className="card">
                <h2 className="card-title">Top Artists Details</h2>
                <p className="text-secondary">
                    Detailed information about your favorite artists
                </p>
                <div className="artist-details-list">
                    {artistDetails.map((artist, index) => (
                        <div key={index} className="artist-detail-item">
                            <div className="artist-rank">{index + 1}</div>
                            <div className="artist-info">
                                <div className="artist-name">{artist.name}</div>
                                <div className="artist-genres">{artist.genres}</div>
                            </div>
                            <div className="artist-metrics">
                                <div className="metric">
                                    <span className="metric-label">Popularity</span>
                                    <span className="metric-value">{artist.popularity}%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Followers</span>
                                    <span className="metric-value">{artist.followers}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

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
                <div className="chart-container" style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
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
                            />
                            <Bar
                                dataKey="count"
                                name="Number of Artists"
                                fill="var(--spotify-green)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {renderAudioFeatures()}
            {renderListeningTime()}
            {renderTrackDetails()}
            {renderArtistDetails()}

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