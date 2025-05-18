import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ComparisonPage = ({ currentUser, token, currentUserTopArtists, currentUserTopTracks }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [otherUserTopArtists, setOtherUserTopArtists] = useState([]);
    const [otherUserTopTracks, setOtherUserTopTracks] = useState([]);
    const [compatibilityScore, setCompatibilityScore] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchUser = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            // Search for user
            const searchRes = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=user&limit=1`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!searchRes.data.users.items.length) {
                setError('User not found');
                return;
            }

            const foundUser = searchRes.data.users.items[0];
            setOtherUser(foundUser);

            // Fetch their top artists and tracks
            const [artistsRes, tracksRes] = await Promise.all([
                axios.get(`https://api.spotify.com/v1/users/${foundUser.id}/top/artists?limit=10&time_range=medium_term`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`https://api.spotify.com/v1/users/${foundUser.id}/top/tracks?limit=10&time_range=medium_term`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setOtherUserTopArtists(artistsRes.data.items);
            setOtherUserTopTracks(tracksRes.data.items);

            // Calculate compatibility score
            const score = calculateCompatibilityScore(
                currentUserTopArtists,
                otherUserTopArtists,
                currentUserTopTracks,
                otherUserTopTracks
            );
            setCompatibilityScore(score);

        } catch (error) {
            console.error('Error searching user:', error);
            setError('Error searching for user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateCompatibilityScore = (user1Artists, user2Artists, user1Tracks, user2Tracks) => {
        // Artist similarity (50% of total score)
        const artistScore = calculateArtistSimilarity(user1Artists, user2Artists);

        // Track similarity (50% of total score)
        const trackScore = calculateTrackSimilarity(user1Tracks, user2Tracks);

        return Math.round((artistScore + trackScore) / 2);
    };

    const calculateArtistSimilarity = (user1Artists, user2Artists) => {
        const user1ArtistIds = new Set(user1Artists.map(artist => artist.id));
        const user2ArtistIds = new Set(user2Artists.map(artist => artist.id));

        // Calculate intersection of artists
        const commonArtists = [...user1ArtistIds].filter(id => user2ArtistIds.has(id));

        // Calculate similarity score (0-100)
        const similarity = (commonArtists.length / Math.max(user1ArtistIds.size, user2ArtistIds.size)) * 100;
        return similarity;
    };

    const calculateTrackSimilarity = (user1Tracks, user2Tracks) => {
        const user1TrackIds = new Set(user1Tracks.map(track => track.id));
        const user2TrackIds = new Set(user2Tracks.map(track => track.id));

        // Calculate intersection of tracks
        const commonTracks = [...user1TrackIds].filter(id => user2TrackIds.has(id));

        // Calculate similarity score (0-100)
        const similarity = (commonTracks.length / Math.max(user1TrackIds.size, user2TrackIds.size)) * 100;
        return similarity;
    };

    const prepareGenreComparisonData = () => {
        const getGenres = (artists) => {
            const genreCount = {};
            artists.forEach(artist => {
                artist.genres.forEach(genre => {
                    genreCount[genre] = (genreCount[genre] || 0) + 1;
                });
            });
            return genreCount;
        };

        const user1Genres = getGenres(currentUserTopArtists);
        const user2Genres = getGenres(otherUserTopArtists);

        // Get all unique genres
        const allGenres = new Set([...Object.keys(user1Genres), ...Object.keys(user2Genres)]);

        // Create comparison data
        return Array.from(allGenres).map(genre => ({
            genre,
            [currentUser.display_name]: user1Genres[genre] || 0,
            [otherUser?.display_name || 'Other User']: user2Genres[genre] || 0
        })).sort((a, b) =>
            (b[currentUser.display_name] + b[otherUser?.display_name || 'Other User']) -
            (a[currentUser.display_name] + a[otherUser?.display_name || 'Other User'])
        ).slice(0, 10); // Top 10 genres
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Compare Music Taste</h2>

            <form onSubmit={searchUser} style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a Spotify user..."
                    style={{
                        padding: '0.5rem',
                        fontSize: '1rem',
                        width: '300px',
                        marginRight: '1rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#1DB954',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {otherUser && compatibilityScore !== null && (
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        marginBottom: '2rem'
                    }}>
                        <h3>Music Taste Compatibility</h3>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            color: compatibilityScore >= 70 ? '#1DB954' :
                                compatibilityScore >= 40 ? '#FFA726' : '#EF5350'
                        }}>
                            {compatibilityScore}%
                        </div>
                        <p style={{ color: '#666' }}>
                            {compatibilityScore >= 70 ? 'Great match! You have very similar music taste!' :
                                compatibilityScore >= 40 ? 'Moderate match. You share some common interests.' :
                                    'Different tastes! But that\'s what makes music interesting!'}
                        </p>
                    </div>

                    <h3>Genre Comparison</h3>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={prepareGenreComparisonData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="genre" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={currentUser.display_name} fill="#1DB954" />
                                <Bar dataKey={otherUser.display_name} fill="#FFA726" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparisonPage; 