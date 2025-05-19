import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/darkTheme.css';

const Navbar = ({ onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <nav className="spotify-navbar">
            <div className="nav-content">
                <div className="nav-links">
                    <Link
                        to="/wrapped"
                        className={`nav-link ${location.pathname === '/wrapped' ? 'active' : ''}`}
                    >
                        Your Wrapped
                    </Link>
                    <Link
                        to="/view-data"
                        className={`nav-link ${location.pathname === '/view-data' ? 'active' : ''}`}
                    >
                        View Data
                    </Link>
                    <Link
                        to="/compare"
                        className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}
                    >
                        Compare Taste
                    </Link>
                </div>
                <button
                    onClick={handleLogout}
                    className="spotify-button logout-button"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar; 