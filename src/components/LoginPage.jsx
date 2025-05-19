import React from 'react';

const LoginPage = ({ onLogin }) => {
    return (
        <div className="login-container">
            <h1 className="text-large">Spotify Wrapped</h1>
            <button
                onClick={onLogin}
                className="spotify-button login-button"
            >
                Login with Spotify
            </button>
        </div>
    );
};

export default LoginPage; 