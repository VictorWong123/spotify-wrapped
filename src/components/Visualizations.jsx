import React from 'react';
import TopTracksChart from './TopTracksChart';
import TopArtistsRadialChart from './TopArtistsRadialChart';
import AudioFeaturesRadarChart from './AudioFeaturesRadarChart';
import TopArtistsTable from './TopArtistsTable';

const Visualizations = ({ topTracks, topArtists, trackFeatures, showAudioFeatures }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <TopTracksChart topTracks={topTracks} />
            <TopArtistsTable topArtists={topArtists} />

        </div>
    );
};

export default Visualizations; 