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
    const [comparisonData, setComparisonData] = useState([]);

    // Add function to get custom time range
    const getCustomTimeRange = () => {
        const startDate = new Date('2024-01-01T00:00:00Z');
        const endDate = new Date();
        return {
            after: Math.floor(startDate.getTime()),
            before: Math.floor(endDate.getTime())
        };
    };

    // Update generateShareableLink to include time range
    const generateShareableLink = async () => {
        try {
            setIsLoading(true);
            const timeRange = getCustomTimeRange();

            // Fetch current user's top artists and tracks for the custom time range
            const [artistsRes, tracksRes] = await Promise.all([
                axios.get(`https://api.spotify.com/v1/me/top/artists?limit=10&after=${timeRange.after}&before=${timeRange.before}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=10&after=${timeRange.after}&before=${timeRange.before}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const data = {
                userId: currentUser.id,
                displayName: currentUser.display_name,
                images: currentUser.images,
                topArtists: artistsRes.data.items,
                topTracks: tracksRes.data.items,
                timeRange: timeRange,
                timestamp: new Date().toISOString()
            };
            const encodedData = btoa(JSON.stringify(data));
            const link = `${window.location.origin}/compare?data=${encodedData}`;
            setShareableLink(link);
            navigator.clipboard.writeText(link);
        } catch (error) {
            console.error('Error generating shareable link:', error);
            setError('Error generating shareable link. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
        setOtherUser(null);
        setOtherUserTopArtists([]);
        setOtherUserTopTracks([]);
        setComparisonData([]);
        setCompatibilityScore(null);

        try {
            let userId;

            if (inputMethod === 'uri') {
                userId = extractUserId(searchQuery);
                if (!userId) {
                    setError('Invalid Spotify link. Please use either:\n- Spotify URI (spotify:user:username)\n- Web URL (https://open.spotify.com/user/...)');
                    return;
                }
            } else {
                try {
                    const urlParams = new URLSearchParams(searchQuery.split('?')[1]);
                    const data = JSON.parse(atob(urlParams.get('data')));
                    userId = data.userId;

                    // If it's a shareable link, we already have their data
                    if (data.topArtists && data.topTracks) {
                        setOtherUser({
                            id: data.userId,
                            display_name: data.displayName,
                            images: data.images || []
                        });
                        setOtherUserTopArtists(data.topArtists);
                        setOtherUserTopTracks(data.topTracks);

                        // Prepare comparison data
                        const artistComparisonData = prepareArtistComparisonData(currentUserTopArtists, data.topArtists);
                        setComparisonData(artistComparisonData);

                        // Calculate compatibility score
                        const score = calculateCompatibilityScore(
                            currentUserTopArtists,
                            data.topArtists,
                            currentUserTopTracks,
                            data.topTracks
                        );
                        setCompatibilityScore(score);
                        return;
                    }
                } catch (err) {
                    setError('Invalid shareable link');
                    return;
                }
            }

            // For URI/web URL, we can only fetch the user's profile
            const userRes = await axios.get(`https://api.spotify.com/v1/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userRes.data) {
                setError('User not found');
                return;
            }

            const foundUser = userRes.data;
            setOtherUser(foundUser);

            // Show message about sharing wrapped with time range info
            setError(`To compare with ${foundUser.display_name}, ask them to:\n1. Go to their Spotify Wrapped\n2. Click "Generate Shareable Link" (this will include their top artists/tracks from Jan 1st, 2024)\n3. Share that link with you`);

        } catch (error) {
            console.error('Error searching user:', error);
            if (error.response?.status === 403) {
                setError('This user\'s data is private. They need to share their wrapped link with you.');
            } else if (error.response?.status === 401) {
                setError('Your session has expired. Please refresh the page and try again.');
            } else if (error.response?.status === 404) {
                setError('User not found. Please check the profile link and try again.');
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

    const prepareArtistComparisonData = (user1Artists, user2Artists) => {
        // Get all unique artists from both users
        const allArtists = new Set([
            ...user1Artists.map(a => a.name),
            ...user2Artists.map(a => a.name)
        ]);

        // Create comparison data
        return Array.from(allArtists).map(artistName => {
            const user1Artist = user1Artists.find(a => a.name === artistName);
            const user2Artist = user2Artists.find(a => a.name === artistName);

            return {
                name: artistName,
                currentUser: user1Artist ? 10 - user1Artists.indexOf(user1Artist) : 0,
                otherUser: user2Artist ? 10 - user2Artists.indexOf(user2Artist) : 0
            };
        }).sort((a, b) =>
            (b.currentUser + b.otherUser) - (a.currentUser + a.otherUser)
        ).slice(0, 10); // Top 10 artists
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
                    <br />
                    <span className="text-small">(Data from January 1st, 2024 to now)</span>
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
            {otherUser && comparisonData.length > 0 && (
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
                        <div className="chart-container" style={{ height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--spotify-border)" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--spotify-text-secondary)"
                                        tick={{ fill: 'var(--spotify-text-secondary)' }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
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