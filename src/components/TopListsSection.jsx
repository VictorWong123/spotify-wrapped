import React from 'react';
import TopArtistsTable from './TopArtistsTable';
import TopTracksTable from './TopTracksTable';
import TopTracksChart from './TopTracksChart';

const TopListsSection = ({ topArtists, topTracks }) => {
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

                {/* Top Tracks Chart */}
                <div className="top-list-card">
                    <div className="top-list-header">
                        <h2 className="top-list-title">Track Popularity</h2>
                    </div>
                    <TopTracksChart topTracks={topTracks} />
                </div>
            </div>
        </div>
    );
};

export default TopListsSection; 