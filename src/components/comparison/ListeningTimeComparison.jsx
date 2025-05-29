import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const prepareListeningTimeData = (user1Tracks, user2Tracks, user1Name, user2Name) => {
    const calculateTotalTime = (tracks) => {
        return tracks.reduce((total, track) => total + (track.duration_ms || 0), 0) / (1000 * 60); // Convert to minutes
    };

    const user1Time = calculateTotalTime(user1Tracks);
    const user2Time = calculateTotalTime(user2Tracks);

    return [
        {
            name: 'Listening Time',
            [user1Name]: Math.round(user1Time),
            [user2Name]: Math.round(user2Time),
            total: Math.round(user1Time + user2Time)
        }
    ];
};

const ListeningTimeComparison = ({ currentUser, otherUser, currentUserTopTracks, otherUserTopTracks }) => {
    if (!currentUserTopTracks?.length && !otherUserTopTracks?.length) {
        return null;
    }

    const data = prepareListeningTimeData(
        currentUserTopTracks,
        otherUserTopTracks,
        currentUser.display_name,
        otherUser.display_name
    );

    return (
        <div className="comparison-section">
            <h3 className="card-subtitle">
                Listening Time Comparison
            </h3>
            <div className="chart-container" style={{ height: '100px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--spotify-border)" />
                        <XAxis
                            type="number"
                            stroke="var(--spotify-text-secondary)"
                            tick={{ fill: 'var(--spotify-text-secondary)' }}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            stroke="var(--spotify-text-secondary)"
                            tick={{ fill: 'var(--spotify-text-secondary)' }}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--spotify-light-gray)',
                                border: '1px solid var(--spotify-border)',
                                borderRadius: '4px'
                            }}
                            labelStyle={{ color: 'var(--spotify-text-primary)' }}
                            formatter={(value, name) => [`${value} minutes`, name]}
                        />
                        <Legend />
                        <Bar
                            dataKey={currentUser.display_name}
                            fill="var(--spotify-green)"
                            name={currentUser.display_name}
                            stackId="time"
                        />
                        <Bar
                            dataKey={otherUser.display_name}
                            fill="#e74c3c"
                            name={otherUser.display_name}
                            stackId="time"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <p className="text-secondary">
                    {currentUser.display_name}: {data[0][currentUser.display_name]} minutes
                </p>
                <p className="text-secondary">
                    {otherUser.display_name}: {data[0][otherUser.display_name]} minutes
                </p>
            </div>
            <p className="text-secondary" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                Total listening time based on top tracks
            </p>
        </div>
    );
};

export default ListeningTimeComparison; 