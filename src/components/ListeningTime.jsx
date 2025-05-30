import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListeningTime = ({ token, topTracks }) => {
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playHistory, setPlayHistory] = useState([]);

    useEffect(() => {
        const fetchListeningTime = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Get start of current year
                const startOfYear = new Date(new Date().getFullYear(), 0, 1);
                const startTimestamp = Math.floor(startOfYear.getTime());

                // Fetch all recent plays since start of year
                let allPlays = [];
                let nextUrl = `https://api.spotify.com/v1/me/player/recently-played?limit=50&after=${startTimestamp}`;

                // Keep fetching until we have all plays or hit a reasonable limit
                while (nextUrl && allPlays.length < 1000) {
                    const response = await axios.get(nextUrl, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const newPlays = response.data.items;
                    allPlays = [...allPlays, ...newPlays];

                    // Get next page URL if it exists
                    nextUrl = response.data.next;
                }

                setPlayHistory(allPlays);

                // Calculate total minutes from actual play history
                const totalMs = allPlays.reduce((acc, play) => {
                    return acc + (play.track.duration_ms || 0);
                }, 0);

                const minutes = Math.round(totalMs / (1000 * 60));
                setTotalMinutes(minutes);

            } catch (err) {
                console.error('Error fetching listening time:', err);
                setError('Could not calculate listening time');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchListeningTime();
        }
    }, [token]);

    if (isLoading) {
        return (
            <div className="listening-time">
                <div className="text-secondary">Calculating your listening time...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="listening-time">
                <div className="text-secondary">{error}</div>
            </div>
        );
    }

    return (
        <div className="listening-time">
            <div className="listening-message">
                In {new Date().getFullYear()} you listened to{' '}
                <span className="listening-minutes">{totalMinutes.toLocaleString()}</span>
                {' '}minutes of music
            </div>
        </div>
    );
};

export default ListeningTime; 