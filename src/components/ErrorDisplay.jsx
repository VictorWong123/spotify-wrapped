import React from 'react';

const ErrorDisplay = ({ error }) => {
    return (
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
    );
};

export default ErrorDisplay; 