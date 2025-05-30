import React, { useState } from 'react';
import axios from 'axios';
import ShareSection from './comparison/ShareSection';
import SearchSection from './comparison/SearchSection';
import ComparisonHeader from './comparison/ComparisonHeader';
import ListeningTimeComparison from './comparison/ListeningTimeComparison';
import GenreComparison from './comparison/GenreComparison';
import '../styles/darkTheme.css';
import '../styles/ComparisonPage.css';

const ComparisonPage = ({ currentUser, token, currentUserTopArtists, currentUserTopTracks }) => {
    const [inputMethod, setInputMethod] = useState('uri');
    const [searchQuery, setSearchQuery] = useState('');
    const [shareableLink, setShareableLink] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [otherUserTopArtists, setOtherUserTopArtists] = useState([]);
    const [otherUserTopTracks, setOtherUserTopTracks] = useState([]);
    const [compatibilityScore, setCompatibilityScore] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCustomTimeRange = () => {
        const startDate = new Date('2024-01-01T00:00:00Z');
        const endDate = new Date();
        return {
            after: Math.floor(startDate.getTime()),
            before: Math.floor(endDate.getTime())
        };
    };

    const generateShareableLink = async () => {
        try {
            setIsLoading(true);
            const timeRange = getCustomTimeRange();

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
        const uriMatch = input.match(/spotify:user:([^:]+)/);
        if (uriMatch) {
            return uriMatch[1];
        }

        const urlMatch = input.match(/open\.spotify\.com\/user\/([^?]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }

        return null;
    };

    const calculateCompatibilityScore = (user1Artists, user2Artists, user1Tracks, user2Tracks) => {
        if ((!user1Artists.length && !user2Artists.length) && (!user1Tracks.length && !user2Tracks.length)) {
            return null;
        }

        let artistScore = 0;
        let trackScore = 0;
        let totalWeight = 0;

        if (user1Artists.length > 0 && user2Artists.length > 0) {
            artistScore = calculateArtistSimilarity(user1Artists, user2Artists);
            totalWeight += 1;
        }

        if (user1Tracks.length > 0 && user2Tracks.length > 0) {
            trackScore = calculateTrackSimilarity(user1Tracks, user2Tracks);
            totalWeight += 1;
        }

        if (totalWeight === 0) {
            return null;
        }

        return Math.round((artistScore + trackScore) / totalWeight);
    };

    const calculateArtistSimilarity = (user1Artists, user2Artists) => {
        const user1ArtistIds = new Set(user1Artists.map(artist => artist.id));
        const user2ArtistIds = new Set(user2Artists.map(artist => artist.id));
        const commonArtists = [...user1ArtistIds].filter(id => user2ArtistIds.has(id));
        return (commonArtists.length / Math.max(user1ArtistIds.size, user2ArtistIds.size)) * 100;
    };

    const calculateTrackSimilarity = (user1Tracks, user2Tracks) => {
        const user1TrackIds = new Set(user1Tracks.map(track => track.id));
        const user2TrackIds = new Set(user2Tracks.map(track => track.id));
        const commonTracks = [...user1TrackIds].filter(id => user2TrackIds.has(id));
        return (commonTracks.length / Math.max(user1TrackIds.size, user2TrackIds.size)) * 100;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);
        setOtherUser(null);
        setOtherUserTopArtists([]);
        setOtherUserTopTracks([]);
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
                    console.log('Parsing shareable link data...');
                    const urlParams = new URLSearchParams(searchQuery.split('?')[1]);
                    const data = JSON.parse(atob(urlParams.get('data')));
                    console.log('Shareable link data:', {
                        hasUserId: !!data.userId,
                        hasDisplayName: !!data.displayName,
                        topArtistsLength: data.topArtists?.length,
                        topTracksLength: data.topTracks?.length,
                        data: data
                    });

                    if (!data.userId || !data.displayName) {
                        setError('Invalid shareable link: Missing required user information');
                        return;
                    }

                    if ((!data.topArtists || data.topArtists.length === 0) &&
                        (!data.topTracks || data.topTracks.length === 0)) {
                        setError('This wrapped link contains no data to compare. Please generate a new link after listening to some music.');
                        return;
                    }

                    userId = data.userId;
                    setOtherUser({
                        id: data.userId,
                        display_name: data.displayName,
                        images: data.images || []
                    });

                    if (data.topArtists && Array.isArray(data.topArtists)) {
                        console.log('Setting other user top artists:', data.topArtists.length);
                        setOtherUserTopArtists(data.topArtists);
                    } else {
                        console.log('No valid artist data in shareable link');
                        setOtherUserTopArtists([]);
                    }

                    if (data.topTracks && Array.isArray(data.topTracks)) {
                        console.log('Setting other user top tracks:', data.topTracks.length);
                        setOtherUserTopTracks(data.topTracks);
                    } else {
                        console.log('No valid track data in shareable link');
                        setOtherUserTopTracks([]);
                    }

                    const score = calculateCompatibilityScore(
                        currentUserTopArtists,
                        data.topArtists || [],
                        currentUserTopTracks,
                        data.topTracks || []
                    );
                    setCompatibilityScore(score);
                    return;
                } catch (err) {
                    console.error('Error parsing shareable link:', err);
                    setError('Invalid shareable link format');
                    return;
                }
            }

            const userRes = await axios.get(`https://api.spotify.com/v1/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userRes.data) {
                setError('User not found');
                return;
            }

            setOtherUser(userRes.data);
            setError(`To compare with ${userRes.data.display_name}, ask them to:\n1. Go to their Spotify Wrapped\n2. Click "Generate Shareable Link" (this will include their top artists/tracks from Jan 1st, 2024)\n3. Share that link with you`);

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

    return (
        <div className="dark-theme comparison-page">
            <ShareSection
                onGenerateLink={generateShareableLink}
                shareableLink={shareableLink}
                isLoading={isLoading}
            />

            <SearchSection
                inputMethod={inputMethod}
                setInputMethod={setInputMethod}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                isLoading={isLoading}
                error={error}
            />

            {otherUser && (otherUserTopTracks.length > 0 || otherUserTopArtists.length > 0) && (
                <div className="card">
                    <ComparisonHeader
                        currentUser={currentUser}
                        otherUser={otherUser}
                        compatibilityScore={compatibilityScore}
                    />

                    <ListeningTimeComparison
                        currentUser={currentUser}
                        otherUser={otherUser}
                        currentUserTopTracks={currentUserTopTracks}
                        otherUserTopTracks={otherUserTopTracks}
                    />

                    <GenreComparison
                        currentUser={currentUser}
                        otherUser={otherUser}
                        currentUserTopArtists={currentUserTopArtists}
                        otherUserTopArtists={otherUserTopArtists}
                    />
                </div>
            )}
        </div>
    );
};

export default ComparisonPage; 