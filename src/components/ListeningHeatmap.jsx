import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListeningHeatmap = ({ token }) => {
    const [playHistory, setPlayHistory] = useState([]);
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get start of current year
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const startTimestamp = Math.floor(startOfYear.getTime());

    useEffect(() => {
        const fetchPlayHistory = async () => {
            try {
                setIsLoading(true);
                setError(null);

                let allPlays = [];
                let nextUrl = `https://api.spotify.com/v1/me/player/recently-played?limit=50&after=${startTimestamp}`;

                while (nextUrl && allPlays.length < 1000) {
                    const response = await axios.get(nextUrl, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const newPlays = response.data.items;
                    allPlays = [...allPlays, ...newPlays];
                    nextUrl = response.data.next;
                }

                setPlayHistory(allPlays);
            } catch (err) {
                console.error('Error fetching play history:', err);
                setError('Could not load listening activity');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchPlayHistory();
        }
    }, [token]);

    const getActivityData = () => {
        if (!playHistory.length) return {};

        const activityData = {};

        playHistory.forEach(play => {
            const playedAt = new Date(play.played_at);
            const dateKey = playedAt.toISOString().split('T')[0]; // YYYY-MM-DD
            // Assuming each play is about 3 minutes on average
            const minutesPerPlay = 3;
            activityData[dateKey] = (activityData[dateKey] || 0) + minutesPerPlay;
        });

        return activityData;
    };

    const getMaxActivity = (data) => {
        return Math.max(...Object.values(data), 1);
    };

    const getIntensityLevel = (minutes) => {
        if (minutes === 0) return 0;
        if (minutes <= 30) return 1;
        if (minutes <= 60) return 2;
        if (minutes <= 90) return 3;
        return 4; // 91+ minutes
    };

    const getLegendColors = () => {
        return [
            { value: 0, label: 'No activity', color: 'var(--heatmap-level-0)' },
            { value: 30, label: '1-30 min', color: 'var(--heatmap-level-1)' },
            { value: 60, label: '31-60 min', color: 'var(--heatmap-level-2)' },
            { value: 90, label: '61-90 min', color: 'var(--heatmap-level-3)' },
            { value: 91, label: '91+ min', color: 'var(--heatmap-level-4)' }
        ];
    };

    const renderHeatmap = () => {
        const data = getActivityData();
        const maxActivity = getMaxActivity(data);
        const today = new Date();

        // For year view, start from January 1st of current year
        const startDate = viewMode === 'year'
            ? new Date(today.getFullYear(), 0, 1) // January 1st
            : new Date(today);

        if (viewMode === 'month') {
            const daysInView = 30;
            startDate.setDate(today.getDate() - daysInView + 1);
        }

        // Create array of all days in the view period
        const days = [];
        const daysInView = viewMode === 'month' ? 30 : 365;

        for (let i = 0; i < daysInView; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            days.push({
                date: date,
                count: data[dateKey] || 0,
                isToday: date.toDateString() === today.toDateString(),
                dayOfWeek: date.getDay(),
                month: date.getMonth()
            });
        }

        // For year view, organize by months in a grid
        if (viewMode === 'year') {
            // Initialize months array with empty arrays
            const months = Array(12).fill().map(() => []);

            // Fill each month with its days
            days.forEach(day => {
                if (day.month >= 0 && day.month < 12) {
                    months[day.month].push(day);
                }
            });

            // Create month labels
            const monthLabels = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];

            return (
                <div className="heatmap-wrapper year-view">
                    <div className="year-grid">
                        {months.map((monthDays, monthIndex) => {
                            // Get the first day of the month to determine padding
                            const firstDay = monthDays[0]?.dayOfWeek || 0;
                            const padding = Array(firstDay).fill(null);

                            // Ensure we have exactly 7 cells per row
                            const totalCells = padding.length + monthDays.length;
                            const remainingCells = 7 - (totalCells % 7);
                            const endPadding = remainingCells === 7 ? [] : Array(remainingCells).fill(null);

                            return (
                                <div key={monthIndex} className="month-container">
                                    <div className="month-label">{monthLabels[monthIndex]}</div>
                                    <div className="month-grid">
                                        {[...padding, ...monthDays, ...endPadding].map((day, dayIndex) => (
                                            day ? (
                                                <div
                                                    key={day.date.toISOString()}
                                                    className={`heatmap-cell ${day.isToday ? 'today' : ''}`}
                                                    title={`${day.date.toLocaleDateString()}: ${day.count} minutes`}
                                                    data-intensity={getIntensityLevel(day.count)}
                                                />
                                            ) : (
                                                <div key={`empty-${dayIndex}`} className="heatmap-cell empty" />
                                            )
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="heatmap-legend">
                        {getLegendColors().map(({ value, label, color }) => (
                            <div key={label} className="legend-item">
                                <div
                                    className="legend-color"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="legend-label">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Month view render
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let displayDays = [...days];
        if (viewMode === 'month') {
            const firstDay = days[0].dayOfWeek;
            const padding = Array(firstDay).fill(null);
            displayDays = [...padding, ...days];
        }

        return (
            <div className="heatmap-wrapper">
                <div className="day-labels">
                    {dayLabels.map(day => (
                        <div key={day} className="day-label">{day}</div>
                    ))}
                </div>
                <div
                    className="heatmap-grid"
                    style={{
                        gridTemplateColumns: `repeat(7, 1fr)`,
                        gridTemplateRows: `repeat(${Math.ceil(displayDays.length / 7)}, 1fr)`
                    }}
                >
                    {displayDays.map((day, index) => (
                        day ? (
                            <div
                                key={day.date.toISOString()}
                                className={`heatmap-cell ${day.isToday ? 'today' : ''}`}
                                title={`${day.date.toLocaleDateString()}: ${day.count} minutes`}
                                data-intensity={getIntensityLevel(day.count)}
                            />
                        ) : (
                            <div key={`empty-${index}`} className="heatmap-cell empty" />
                        )
                    ))}
                </div>
                <div className="heatmap-legend">
                    {getLegendColors().map(({ value, label, color }) => (
                        <div key={label} className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: color }}
                            />
                            <span className="legend-label">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="heatmap-container">
                <div className="loading-message">Loading listening activity...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="heatmap-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="heatmap-container">
            <div className="heatmap-header">
                <h2>Listening Activity</h2>
                <div className="view-controls">
                    <button
                        className={`view-button ${viewMode === 'month' ? 'active' : ''}`}
                        onClick={() => setViewMode('month')}
                    >
                        Last 30 Days
                    </button>
                    <button
                        className={`view-button ${viewMode === 'year' ? 'active' : ''}`}
                        onClick={() => setViewMode('year')}
                    >
                        This Year
                    </button>
                </div>
            </div>
            <div className="heatmap-content">
                {renderHeatmap()}
            </div>
        </div>
    );
};

export default ListeningHeatmap; 