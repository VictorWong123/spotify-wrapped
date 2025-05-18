import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Visualizations from './components/Visualizations';
import ComparisonPage from './components/ComparisonPage';

const BACKEND_URL = 'http://127.0.0.1:8888';

function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('access_token');
}

function App() {
    const [token, setToken] = useState('');
    const [topTracks, setTopTracks] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [user, setUser] = useState(null);
    const [trackFeatures, setTrackFeatures] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('wrapped'); // 'wrapped' or 'compare'

    useEffect(() => {
        const urlToken = getTokenFromUrl();
        if (urlToken) {
            setToken(urlToken);
            localStorage.setItem('spotify_token', urlToken);
            // Remove access_token from URL
            window.history.replaceState({}, document.title, '/');
        } else {
            const localToken = localStorage.getItem('spotify_token');
            if (localToken) setToken(localToken);
        }
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                console.log('Fetching data...');

                // Fetch user profile
                console.log('Fetching user profile...');
                const userRes = await axios.get('https://api.spotify.com/v1/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(userRes.data);
                console.log('User data:', userRes.data);

                // Fetch top tracks - changed to medium_term (last 6 months)
                console.log('Fetching top tracks...');
                const tracksRes = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Top tracks:', tracksRes.data.items);

                if (!tracksRes.data.items.length) {
                    setError('No recent listening data found. Try listening to some songs and come back!');
                    return;
                }

                setTopTracks(tracksRes.data.items);

                // Fetch track features
                console.log('Fetching track features...');
                try {
                    const trackIds = tracksRes.data.items.map(track => track.id).join(',');
                    const featuresRes = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log('Track features:', featuresRes.data.audio_features);
                    setTrackFeatures(featuresRes.data.audio_features);
                } catch (featuresError) {
                    console.error('Error fetching track features:', featuresError);
                    // Continue without track features - set empty array
                    setTrackFeatures([]);
                }

                // Fetch top artists - changed to medium_term (last 6 months)
                console.log('Fetching top artists...');
                const artistsRes = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Top artists:', artistsRes.data.items);

                if (!artistsRes.data.items.length) {
                    setError('No recent artist data found. Try listening to some songs and come back!');
                    return;
                }

                setTopArtists(artistsRes.data.items);
            } catch (error) {
                console.error('Error fetching data:', error);
                console.error('Error occurred during:', error.config?.url);
                if (error.response?.status === 401) {
                    setToken('');
                    localStorage.removeItem('spotify_token');
                    setError('Session expired. Please log in again.');
                } else if (error.response?.status === 403) {
                    setError(`Permission denied: ${error.config?.url}. Please make sure you've granted all necessary permissions.`);
                } else {
                    setError('Error fetching your Spotify data. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    // Add debug render log
    console.log('Render state:', {
        hasToken: !!token,
        topTracksLength: topTracks.length,
        topArtistsLength: topArtists.length,
        trackFeaturesLength: trackFeatures.length
    });

    const handleLogin = () => {
        window.location = `${BACKEND_URL}/login?show_dialog=true`;
    };

    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('spotify_token');
        setTopTracks([]);
        setTopArtists([]);
        setTrackFeatures([]);
        setUser(null);
    };

    return (
        <div className="App" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
            <h1>Spotify Wrapped (D3 + React)</h1>
            {!token ? (
                <button onClick={handleLogin} style={{ fontSize: 18, padding: '12px 24px', margin: '32px 0' }}>
                    Login with Spotify
                </button>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setCurrentPage('wrapped')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: currentPage === 'wrapped' ? '#1DB954' : '#f5f5f5',
                                    color: currentPage === 'wrapped' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Your Wrapped
                            </button>
                            <button
                                onClick={() => setCurrentPage('compare')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: currentPage === 'compare' ? '#1DB954' : '#f5f5f5',
                                    color: currentPage === 'compare' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Compare Taste
                            </button>
                        </div>
                        <button onClick={handleLogout}>Logout</button>
                    </div>

                    {user && (
                        <div style={{ marginBottom: 24, textAlign: 'center' }}>
                            <h2>Welcome, {user.display_name}!</h2>
                            <img src={user.images?.[0]?.url} alt="avatar" style={{ width: 80, borderRadius: '50%' }} />
                        </div>
                    )}

                    {isLoading ? (
                        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                            <p>Loading your Spotify data...</p>
                        </div>
                    ) : error ? (
                        <div style={{
                            textAlign: 'center',
                            margin: '2rem 0',
                            padding: '1rem',
                            backgroundColor: '#ffebee',
                            borderRadius: '8px',
                            color: '#c62828'
                        }}>
                            <p>{error}</p>
                            {error.includes('No recent') && (
                                <p style={{ marginTop: '1rem' }}>
                                    <a
                                        href="https://open.spotify.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#1DB954', textDecoration: 'underline' }}
                                    >
                                        Open Spotify
                                    </a> and listen to some songs, then come back!
                                </p>
                            )}
                        </div>
                    ) : (
                        currentPage === 'wrapped' ? (
                            topTracks.length > 0 && topArtists.length > 0 && (
                                <Visualizations
                                    topTracks={topTracks}
                                    topArtists={topArtists}
                                    trackFeatures={trackFeatures}
                                    showAudioFeatures={trackFeatures.length > 0}
                                />
                            )
                        ) : (
                            <ComparisonPage
                                currentUser={user}
                                token={token}
                                currentUserTopArtists={topArtists}
                                currentUserTopTracks={topTracks}
                            />
                        )
                    )}
                </>
            )}
        </div>
    );
}

export default App; 