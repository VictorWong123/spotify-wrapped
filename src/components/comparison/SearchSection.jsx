import React from 'react';

const SearchSection = ({
    inputMethod,
    setInputMethod,
    searchQuery,
    setSearchQuery,
    onSearch,
    isLoading,
    error
}) => {
    return (
        <div className="card">
            <h2 className="card-title">
                Compare with Another User
            </h2>

            <div className="input-method-toggle">
                <button
                    className={`toggle-button ${inputMethod === 'uri' ? 'active' : ''}`}
                    onClick={() => setInputMethod('uri')}
                >
                    Use Spotify Link
                </button>
                <button
                    className={`toggle-button ${inputMethod === 'link' ? 'active' : ''}`}
                    onClick={() => setInputMethod('link')}
                >
                    Use Shareable Link
                </button>
            </div>

            <form onSubmit={onSearch} className="search-section">
                <p className="text-secondary">
                    {inputMethod === 'uri'
                        ? 'Enter a Spotify profile link (URI or web URL)'
                        : 'Paste a shareable wrapped link'}
                </p>
                <div className="search-form">
                    <div className="search-input-container">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={inputMethod === 'uri'
                                ? 'spotify:user:username or https://open.spotify.com/user/...'
                                : 'Paste wrapped link here'}
                            className="spotify-input"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !searchQuery.trim()}
                        className="spotify-button"
                    >
                        {isLoading ? 'Searching...' : 'Compare'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="error-message">
                    {error.split('\n').map((line, i) => (
                        <p key={i} style={{ margin: '0.5rem 0' }}>{line}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchSection; 