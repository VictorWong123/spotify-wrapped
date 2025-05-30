import React from 'react';
import TopArtistsTable from './TopArtistsTable';
import TopTracksTable from './TopTracksTable';
import AudioFeaturesRadarChart from './AudioFeaturesRadarChart';
import MoodAnalysis from './MoodAnalysis';

const TopListsSection = ({ topArtists, topTracks, trackFeatures }) => {
    return (
        <div className="top-lists">
            {/* Top Artists Table */}
            <div className="top-list-card">
                <div className="top-list-header">
                    <h2 className="top-list-title">Top Artists</h2>
                </div>
                <TopArtistsTable topArtists={topArtists} />
            </div>

            {/* Top Tracks Section */}
            <div className="top-tracks-section">
                {/* Top Tracks Table */}
                <div className="top-list-card">
                    <div className="top-list-header">
                        <h2 className="top-list-title">Top Tracks</h2>
                    </div>
                    <TopTracksTable topTracks={topTracks} />
                </div>
            </div>

            {/* Audio Features Radar Chart */}
            <div className="top-list-card">
                <AudioFeaturesRadarChart trackFeatures={trackFeatures} topTracks={topTracks} />
            </div>

            {/* Mood Analysis */}
            <div className="top-list-card">
                <MoodAnalysis trackFeatures={trackFeatures} />
            </div>
        </div>
    );
};

export default TopListsSection; 