import React from 'react';

const getMoodTags = (avgValence, avgEnergy, avgDanceability) => {
    const tags = [];
    if (avgValence > 0.6) tags.push('Upbeat');
    if (avgValence < 0.4) tags.push('Moody');
    if (avgDanceability > 0.6) tags.push('Dancey');
    if (avgEnergy < 0.4) tags.push('Chill');
    if (avgEnergy > 0.7) tags.push('Energetic');
    return tags;
};

const MoodAnalysis = ({ trackFeatures }) => {
    if (!trackFeatures || trackFeatures.length === 0) {
        return (
            <div>
                <h2 className="top-list-title">Mood Analysis</h2>
                <p className="text-secondary">Not enough data to analyze mood.</p>
            </div>
        );
    }

    const avgValence = trackFeatures.reduce((sum, t) => sum + (t.valence || 0), 0) / trackFeatures.length;
    const avgEnergy = trackFeatures.reduce((sum, t) => sum + (t.energy || 0), 0) / trackFeatures.length;
    const avgDanceability = trackFeatures.reduce((sum, t) => sum + (t.danceability || 0), 0) / trackFeatures.length;
    const tags = getMoodTags(avgValence, avgEnergy, avgDanceability);

    return (
        <div>
            <h2 className="top-list-title">Mood Analysis</h2>
            <p className="text-secondary">
                Your top tracks are mostly:
                {tags.length > 0 ? (
                    <span style={{ marginLeft: 8, fontWeight: 600 }}>
                        {tags.join(', ')}
                    </span>
                ) : (
                    <span style={{ marginLeft: 8 }}>Balanced</span>
                )}
            </p>
            <div style={{ marginTop: 12 }}>
                <div style={{ color: 'var(--spotify-text-secondary)' }}>
                    <strong>Valence (Happiness):</strong> {(avgValence * 100).toFixed(0)}%
                </div>
                <div style={{ color: 'var(--spotify-text-secondary)' }}>
                    <strong>Energy:</strong> {(avgEnergy * 100).toFixed(0)}%
                </div>
                <div style={{ color: 'var(--spotify-text-secondary)' }}>
                    <strong>Danceability:</strong> {(avgDanceability * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

export default MoodAnalysis; 