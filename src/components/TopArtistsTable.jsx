import React from 'react';

const TopArtistsTable = ({ topArtists }) => {
    // Get top 5 artists
    const topFiveArtists = topArtists.slice(0, 5);

    return (
        <div style={{
            border: '1px solid var(--spotify-border)',
            padding: '1rem',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '600px',
            backgroundColor: 'var(--spotify-light-gray)',
            boxSizing: 'border-box'
        }}>
            <h2>Your Top 5 Artists</h2>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '1rem'
            }}>
                {topFiveArtists.map((artist, index) => (
                    <div
                        key={artist.id}
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
                            backgroundColor: '#1DB954',
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
                            <div style={{ fontWeight: 'bold' }}>{artist.name}</div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#666',
                                display: 'flex',
                                gap: '1rem'
                            }}>
                                <span>Popularity: {artist.popularity}%</span>
                                <span>Followers: {artist.followers.total.toLocaleString()}</span>
                            </div>
                        </div>
                        {artist.images?.[0]?.url && (
                            <img
                                src={artist.images[0].url}
                                alt={artist.name}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
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

export default TopArtistsTable; 