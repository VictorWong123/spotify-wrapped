import { useState, useEffect } from 'react';
import axios from 'axios';

const useSpotifyData = (token) => {
    const [topTracks, setTopTracks] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [user, setUser] = useState(null);
    const [trackFeatures, setTrackFeatures] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getCustomTimeRange = () => {
        const startDate = new Date('2024-01-01T00:00:00Z');
        const endDate = new Date();
        return {
            after: Math.floor(startDate.getTime()),
            before: Math.floor(endDate.getTime())
        };
    };

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

                const timeRange = getCustomTimeRange();
                console.log('Using time range:', timeRange);

                // Fetch top tracks with custom time range
                console.log('Fetching top tracks...');
                const tracksRes = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=10&after=${timeRange.after}&before=${timeRange.before}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Top tracks received:', tracksRes.data.items);
                setTopTracks(tracksRes.data.items);

                // Fetch top artists with custom time range
                console.log('Fetching top artists...');
                const artistsRes = await axios.get(`https://api.spotify.com/v1/me/top/artists?limit=10&after=${timeRange.after}&before=${timeRange.before}`, {
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

            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response?.status === 401) {
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

    return {
        user,
        topTracks,
        topArtists,
        trackFeatures,
        error,
        isLoading
    };
};

export default useSpotifyData; 