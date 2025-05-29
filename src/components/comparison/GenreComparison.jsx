import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const prepareGenreData = (user1Artists, user2Artists, user1Name, user2Name) => {
    const getGenres = (artists) => {
        const genreCount = {};
        artists.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });
        return genreCount;
    };

    const user1Genres = getGenres(user1Artists);
    const user2Genres = getGenres(user2Artists);
    const allGenres = new Set([...Object.keys(user1Genres), ...Object.keys(user2Genres)]);

    // Stacked bar data
    const barData = Array.from(allGenres)
        .map(genre => ({
            genre,
            [user1Name]: user1Genres[genre] || 0,
            [user2Name]: user2Genres[genre] || 0,
            total: (user1Genres[genre] || 0) + (user2Genres[genre] || 0)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    // Radar chart data
    const maxValue = Math.max(
        ...Object.values(user1Genres),
        ...Object.values(user2Genres)
    );

    const radarData = Array.from(allGenres)
        .map(genre => ({
            genre,
            [user1Name]: ((user1Genres[genre] || 0) / maxValue) * 100,
            [user2Name]: ((user2Genres[genre] || 0) / maxValue) * 100
        }))
        .sort((a, b) =>
            (b[user1Name] + b[user2Name]) -
            (a[user1Name] + a[user2Name])
        )
        .slice(0, 8);

    return { barData, radarData };
};

const GenreComparison = ({ currentUser, otherUser, currentUserTopArtists, otherUserTopArtists }) => {
    console.log('GenreComparison props:', {
        currentUserTopArtistsLength: currentUserTopArtists?.length,
        otherUserTopArtistsLength: otherUserTopArtists?.length,
        currentUserTopArtists: currentUserTopArtists,
        otherUserTopArtists: otherUserTopArtists
    });

    if (!currentUserTopArtists?.length || !otherUserTopArtists?.length) {
        console.log('GenreComparison: Not enough artist data to display');
        return (
            <div className="comparison-section">
                <h3 className="card-subtitle">Genre Comparison</h3>
                <p className="text-secondary" style={{ textAlign: 'center' }}>
                    {!currentUserTopArtists?.length && !otherUserTopArtists?.length
                        ? 'No artist data available for comparison'
                        : !currentUserTopArtists?.length
                            ? 'Your artist data is not available'
                            : 'Other user\'s artist data is not available'}
                </p>
            </div>
        );
    }

    const { barData, radarData } = prepareGenreData(
        currentUserTopArtists,
        otherUserTopArtists,
        currentUser.display_name,
        otherUser.display_name
    );

    return (
        <div className="comparison-section">
            <h3 className="card-subtitle">Genre Comparison</h3>

            {/* Stacked Bar Chart */}
            <div className="chart-container" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={barData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--spotify-border)" />
                        <XAxis
                            type="number"
                            stroke="var(--spotify-text-secondary)"
                            tick={{ fill: 'var(--spotify-text-secondary)' }}
                        />
                        <YAxis
                            type="category"
                            dataKey="genre"
                            stroke="var(--spotify-text-secondary)"
                            tick={{ fill: 'var(--spotify-text-secondary)' }}
                            width={150}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--spotify-light-gray)',
                                border: '1px solid var(--spotify-border)',
                                borderRadius: '4px'
                            }}
                            labelStyle={{ color: 'var(--spotify-text-primary)' }}
                            formatter={(value, name) => [`${value} artists`, name]}
                        />
                        <Legend />
                        <Bar
                            dataKey={currentUser.display_name}
                            fill="var(--spotify-green)"
                            name={currentUser.display_name}
                            stackId="genre"
                        />
                        <Bar
                            dataKey={otherUser.display_name}
                            fill="#e74c3c"
                            name={otherUser.display_name}
                            stackId="genre"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="chart-container" style={{ height: '400px', marginTop: '2rem' }}>
                <h4 className="card-subtitle" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    Genre Distribution
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                        data={radarData}
                        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                    >
                        <PolarGrid stroke="var(--spotify-border)" />
                        <PolarAngleAxis
                            dataKey="genre"
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
                            name={currentUser.display_name}
                            dataKey={currentUser.display_name}
                            stroke="var(--spotify-green)"
                            fill="var(--spotify-green)"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name={otherUser.display_name}
                            dataKey={otherUser.display_name}
                            stroke="#e74c3c"
                            fill="#e74c3c"
                            fillOpacity={0.3}
                        />
                        <Legend />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--spotify-light-gray)',
                                border: '1px solid var(--spotify-border)',
                                borderRadius: '4px'
                            }}
                            labelStyle={{ color: 'var(--spotify-text-primary)' }}
                            formatter={(value) => [`${Math.round(value)}%`, '']}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-secondary" style={{ textAlign: 'center', marginTop: '1rem' }}>
                Top genres based on artist popularity
            </p>
        </div>
    );
};

export default GenreComparison; 