import React from 'react';
import UserProfileCard from './UserProfileCard';
import StatsOverview from './StatsOverview';
import TopListsSection from './TopListsSection';
import ListeningHeatmap from './ListeningHeatmap';
import FunFacts from './FunFacts';
import '../styles/darkTheme.css';
import '../styles/Dashboard.css';

const Dashboard = ({ currentUser, topArtists, topTracks, token, trackFeatures }) => {
    return (
        <div className="dashboard-page">
            <UserProfileCard
                currentUser={currentUser}
                token={token}
                topTracks={topTracks}
            />

            <ListeningHeatmap token={token} />

            <FunFacts
                topArtists={topArtists}
                topTracks={topTracks}
                trackFeatures={trackFeatures}
            />

            <TopListsSection
                topArtists={topArtists}
                topTracks={topTracks}
                trackFeatures={trackFeatures}
            />
        </div>
    );
};

export default Dashboard; 