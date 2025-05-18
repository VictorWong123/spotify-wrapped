import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import ComparisonPage from './components/ComparisonPage';
import './styles/darkTheme.css';
import './App.css';

const BACKEND_URL = 'http://127.0.0.1:8888';

function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('access_token');
}

// Navbar component
const Navbar = ({ onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <nav className="spotify-navbar">
            <div className="nav-content">
                <div className="nav-links">
                    <Link
                        to="/wrapped"
                        className={`nav-link ${location.pathname === '/wrapped' ? 'active' : ''}`}
                    >
                        Your Wrapped
                    </Link>
                    <Link
                        to="/compare"
                        className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}
                    >
                        Compare Taste
                    </Link>
                </div>
                <button
                    onClick={handleLogout}
                    className="spotify-button logout-button"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

// Main App component
function App() {
    const [token, setToken] = useState('');
    const [topTracks, setTopTracks] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [user, setUser] = useState(null);
    const [trackFeatures, setTrackFeatures] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
                console.log('Starting data fetch...');

                // Fetch user profile first
                console.log('Fetching user profile...');
                const userRes = await axios.get('https://api.spotify.com/v1/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('User profile received:', userRes.data);
                setUser(userRes.data);

                // Fetch top tracks
                console.log('Fetching top tracks...');
                const tracksRes = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Top tracks received:', tracksRes.data.items);
                setTopTracks(tracksRes.data.items);

                // Fetch top artists
                console.log('Fetching top artists...');
                const artistsRes = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Top artists received:', artistsRes.data.items);
                setTopArtists(artistsRes.data.items);

                // Fetch track features if we have tracks
                if (tracksRes.data.items.length > 0) {
                    console.log('Fetching track features...');
                    try {
                        const trackIds = tracksRes.data.items.map(track => track.id).join(',');
                        const featuresRes = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        console.log('Track features received:', featuresRes.data.audio_features);
                        setTrackFeatures(featuresRes.data.audio_features);
                    } catch (featuresError) {
                        console.error('Error fetching track features:', featuresError);
                        setTrackFeatures([]);
                    }
                }

                // Log final state
                console.log('Data fetch complete. State:', {
                    user: userRes.data,
                    topTracks: tracksRes.data.items,
                    topArtists: artistsRes.data.items,
                    trackFeatures: trackFeatures
                });

            } catch (error) {
                console.error('Error fetching data:', error);
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

    // Debug render log
    useEffect(() => {
        console.log('App render state:', {
            hasToken: !!token,
            user: user,
            topTracksLength: topTracks.length,
            topArtistsLength: topArtists.length,
            trackFeaturesLength: trackFeatures.length,
            isLoading: isLoading,
            error: error
        });
    }, [token, user, topTracks, topArtists, trackFeatures, isLoading, error]);

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
        <Router>
            <div className="App dark-theme">
                {!token ? (
                    <div className="login-container">
                        <h1 className="text-large">Spotify Wrapped</h1>
                        <button
                            onClick={handleLogin}
                            className="spotify-button login-button"
                        >
                            Login with Spotify
                        </button>
                    </div>
                ) : (
                    <>
                        <Navbar onLogout={handleLogout} />
                        <div className="main-content">
                            {isLoading ? (
                                <div className="loading-message">
                                    Loading your Spotify data...
                                </div>
                            ) : error ? (
                                <div className="error-message">
                                    <p>{error}</p>
                                    {error.includes('No recent') && (
                                        <p>
                                            <a
                                                href="https://open.spotify.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="spotify-link"
                                            >
                                                Open Spotify
                                            </a> and listen to some songs, then come back!
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <Routes>
                                    <Route
                                        path="/wrapped"
                                        element={
                                            <Dashboard
                                                currentUser={user}
                                                topArtists={topArtists}
                                                topTracks={topTracks}
                                                recentlyPlayed={[]}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/compare"
                                        element={
                                            <ComparisonPage
                                                currentUser={user}
                                                token={token}
                                                currentUserTopArtists={topArtists}
                                                currentUserTopTracks={topTracks}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/"
                                        element={
                                            <Navigate to="/wrapped" replace />
                                        }
                                    />
                                </Routes>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Router>
    );
}

export default App; 