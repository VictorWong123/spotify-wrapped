import React from 'react';

const TopTracksTable = ({ topTracks }) => {
    // Get top 5 tracks
    const topFiveTracks = topTracks?.slice(0, 5) || [];

    return (
        <div style={{
            border: '1px solid var(--spotify-border)',
            padding: '1rem',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '600px'
        }}>
            <h2>Your Top 5 Tracks</h2>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '1rem'
            }}>
                {topFiveTracks.map((track, index) => (
                    <div
                        key={track.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.5rem',
                            backgroundColor: index % 2 === 0 ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
                            borderRadius: '4px'
                        }}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'var(--spotify-green)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--spotify-text-primary)' }}>
                                {track.name}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: 'var(--spotify-text-secondary)',
                                display: 'flex',
                                gap: '1rem'
                            }}>
                                <span>Artist: {track.artists.map(artist => artist.name).join(', ')}</span>
                                <span>Popularity: {track.popularity}%</span>
                            </div>
                        </div>
                        {track.album?.images?.[0]?.url && (
                            <img
                                src={track.album.images[0].url}
                                alt={track.name}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '4px',
                                    objectFit: 'cover'
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopTracksTable; 