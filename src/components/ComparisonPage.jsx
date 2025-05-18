import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/darkTheme.css';
import '../styles/ComparisonPage.css';

const ComparisonPage = ({ currentUser, token, currentUserTopArtists, currentUserTopTracks }) => {
    const [inputMethod, setInputMethod] = useState('uri'); // 'uri' or 'link'
    const [searchQuery, setSearchQuery] = useState('');
    const [shareableLink, setShareableLink] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [otherUserTopArtists, setOtherUserTopArtists] = useState([]);
    const [otherUserTopTracks, setOtherUserTopTracks] = useState([]);
    const [compatibilityScore, setCompatibilityScore] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Generate a shareable link for the current user
    const generateShareableLink = () => {
        const data = {
            userId: currentUser.id,
            displayName: currentUser.display_name,
            timestamp: new Date().toISOString()
        };
        const encodedData = btoa(JSON.stringify(data));
        const link = `${window.location.origin}/compare?data=${encodedData}`;
        setShareableLink(link);
        navigator.clipboard.writeText(link);
    };

    const extractUserId = (input) => {
        // Try Spotify URI format (spotify:user:username)
        const uriMatch = input.match(/spotify:user:([^:]+)/);
        if (uriMatch) {
            return uriMatch[1];
        }

        // Try web URL format (https://open.spotify.com/user/...)
        const urlMatch = input.match(/open\.spotify\.com\/user\/([^?]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }

        return null;
    };

    const searchUser = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            let userId;

            if (inputMethod === 'uri') {
                // Handle both URI and web URL formats
                userId = extractUserId(searchQuery);
                if (!userId) {
                    setError('Invalid Spotify link. Please use either:\n- Spotify URI (spotify:user:username)\n- Web URL (https://open.spotify.com/user/...)');
                    return;
                }
            } else {
                // Handle shareable link
                try {
                    const urlParams = new URLSearchParams(searchQuery.split('?')[1]);
                    const data = JSON.parse(atob(urlParams.get('data')));
                    userId = data.userId;
                } catch (err) {
                    setError('Invalid shareable link');
                    return;
                }
            }

            // Fetch user profile
            const userRes = await axios.get(`https://api.spotify.com/v1/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userRes.data) {
                setError('User not found');
                return;
            }

            const foundUser = userRes.data;
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
            if (error.response?.status === 403) {
                setError('This user\'s data is private. They need to share their wrapped link with you.');
            } else {
                setError('Error searching for user. Please try again.');
            }
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
        <div className="dark-theme comparison-page">
            {/* Share Section */}
            <div className="card">
                <h2 className="card-title">Share Your Wrapped</h2>
                <p className="text-secondary">
                    Generate a shareable link to let others compare their music taste with yours
                </p>
                <button
                    onClick={generateShareableLink}
                    className="spotify-button"
                    style={{ marginTop: '1rem' }}
                >
                    Generate Shareable Link
                </button>
                {shareableLink && (
                    <div className="shareable-link-container">
                        <p className="text-secondary">Link copied to clipboard!</p>
                        <input
                            type="text"
                            value={shareableLink}
                            readOnly
                            className="spotify-input"
                            onClick={(e) => e.target.select()}
                        />
                    </div>
                )}
            </div>

            {/* Search Section */}
            <div className="card">
                <h2 className="card-title">
                    Compare with Another User
                </h2>

                <div className="input-method-toggle">
                    <button
                        className={`toggle-button ${inputMethod === 'uri' ? 'active' : ''}`}
                        onClick={() => setInputMethod('uri')}
                    >
                        Use Spotify Link
                    </button>
                    <button
                        className={`toggle-button ${inputMethod === 'link' ? 'active' : ''}`}
                        onClick={() => setInputMethod('link')}
                    >
                        Use Shareable Link
                    </button>
                </div>

                <form onSubmit={searchUser} className="search-section">
                    <p className="text-secondary">
                        {inputMethod === 'uri'
                            ? 'Enter a Spotify profile link (URI or web URL)'
                            : 'Paste a shareable wrapped link'}
                    </p>
                    <div className="search-form">
                        <div className="search-input-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={inputMethod === 'uri'
                                    ? 'spotify:user:username or https://open.spotify.com/user/...'
                                    : 'Paste wrapped link here'}
                                className="spotify-input"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="spotify-button"
                        >
                            {isLoading ? 'Searching...' : 'Compare'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="error-message">
                        {error.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                )}
            </div>

            {/* Comparison Results */}
            {otherUser && (
                <div className="card">
                    <div className="comparison-header">
                        {otherUser.images?.[0]?.url && (
                            <img
                                src={otherUser.images[0].url}
                                alt={otherUser.display_name}
                                className="profile-image-small"
                            />
                        )}
                        <div>
                            <h2 className="text-medium">
                                {otherUser.display_name}
                            </h2>
                            {compatibilityScore !== null && (
                                <div className="text-small compatibility-score">
                                    Compatibility Score: {compatibilityScore}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comparison Charts */}
                    <div className="comparison-section">
                        <h3 className="card-subtitle">
                            Top Artists Comparison
                        </h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--spotify-border)" />
                                    <XAxis
                                        dataKey="name"
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
                                        dataKey="currentUser"
                                        name={currentUser?.display_name || 'You'}
                                        fill="var(--spotify-green)"
                                    />
                                    <Bar
                                        dataKey="otherUser"
                                        name={otherUser.display_name}
                                        fill="var(--spotify-green)"
                                        fillOpacity={0.6}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparisonPage; 