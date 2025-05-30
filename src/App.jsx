import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ComparisonPage from './components/ComparisonPage';
import ViewData from './components/ViewData';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import ErrorDisplay from './components/ErrorDisplay';
import useSpotifyData from './hooks/useSpotifyData';
import './styles/darkTheme.css';
import './App.css';

const BACKEND_URL = 'https://spotify-wrapped-mu.vercel.app/api';

function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    return token;
}

function App() {
    const [token, setToken] = useState('');
    const { user, topTracks, topArtists, trackFeatures, error, isLoading } = useSpotifyData(token);

    useEffect(() => {
        const urlToken = getTokenFromUrl();
        if (urlToken) {
            setToken(urlToken);
            localStorage.setItem('spotify_token', urlToken);
            // Remove access_token from URL
            window.history.replaceState({}, document.title, '/');
        } else {
            const localToken = localStorage.getItem('spotify_token');
            if (localToken) {
                setToken(localToken);
            }
        }
    }, []);

    const handleLogin = () => {
        const loginUrl = `${BACKEND_URL}/server?path=login&show_dialog=true`;
        window.location.href = loginUrl;
    };

    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('spotify_token');
    };

    return (
        <Router>
            <div className="App dark-theme">
                {!token ? (
                    <LoginPage onLogin={handleLogin} />
                ) : (
                    <>
                        <Navbar onLogout={handleLogout} />
                        <div className="main-content">
                            {isLoading ? (
                                <div className="loading-message">
                                    Loading your Spotify data...
                                </div>
                            ) : error ? (
                                <ErrorDisplay error={error} />
                            ) : (
                                <Routes>
                                    <Route
                                        path="/wrapped"
                                        element={
                                            <Dashboard
                                                currentUser={user}
                                                topArtists={topArtists}
                                                topTracks={topTracks}
                                                token={token}
                                                trackFeatures={trackFeatures}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/view-data"
                                        element={
                                            <ViewData
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