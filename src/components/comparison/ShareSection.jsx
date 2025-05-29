import React from 'react';

const ShareSection = ({ onGenerateLink, shareableLink, isLoading }) => {
    return (
        <div className="card">
            <h2 className="card-title">Share Your Wrapped</h2>
            <p className="text-secondary">
                Generate a shareable link to let others compare their music taste with yours
                <br />
                <span className="text-small">(Data from January 1st, 2024 to now)</span>
            </p>
            <button
                onClick={onGenerateLink}
                className="spotify-button"
                style={{ marginTop: '1rem' }}
                disabled={isLoading}
            >
                {isLoading ? 'Generating...' : 'Generate Shareable Link'}
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
    );
};

export default ShareSection; 