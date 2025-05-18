import React, { useEffect } from 'react';
import TopTracksChart from './TopTracksChart';
import TopArtistsRadialChart from './TopArtistsRadialChart';
import AudioFeaturesRadarChart from './AudioFeaturesRadarChart';
import TopArtistsTable from './TopArtistsTable';

const Visualizations = ({ user, topTracks, topArtists, trackFeatures, showAudioFeatures }) => {
    useEffect(() => {
        console.log('Visualizations received user:', user);
    }, [user]);

    return (
        <div className="visualizations-container">
            <div className="welcome-header">
                <h1 className="welcome-title">
                    {user?.display_name ? `${user.display_name}'s Wrapped` : 'Your Wrapped'}
                </h1>
            </div>
            <div className="charts-grid">
                <TopTracksChart topTracks={topTracks} />
                <TopArtistsTable topArtists={topArtists} />
                {showAudioFeatures && (
                    <AudioFeaturesRadarChart
                        trackFeatures={trackFeatures}
                        topTracks={topTracks}
                    />
                )}
            </div>
        </div>
    );
};

export default Visualizations; 