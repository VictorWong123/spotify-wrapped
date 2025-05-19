import React, { useMemo } from 'react';

// Simple seeded random number generator
const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const FunFacts = ({ topArtists, topTracks, trackFeatures }) => {
    const funFacts = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

        const facts = [];

        // 1. Most Popular Track (based on actual popularity score)
        if (topTracks?.length > 0) {
            const mostPopular = topTracks.reduce((max, track) =>
                track.popularity > max.popularity ? track : max, topTracks[0]);
            facts.push({
                title: "Your Most Popular Track of " + currentYear,
                description: `'${mostPopular.name}' was your highest-rated track this year with a popularity score of ${mostPopular.popularity}/100!`,
                icon: "🎵"
            });
        }

        // 2. Top Artist (based on actual ranking)
        if (topArtists?.length > 0) {
            const topArtist = topArtists[0];
            facts.push({
                title: "Your #1 Artist of " + currentYear,
                description: `${topArtist.name} was your most-listened artist this year!`,
                icon: "👑"
            });
        }

        // 3. Genre Diversity (based on actual genres)
        if (topArtists?.length > 0) {
            const uniqueGenres = new Set();
            topArtists.forEach(artist => artist.genres.forEach(genre => uniqueGenres.add(genre)));
            const genreCount = uniqueGenres.size;
            const genreLevel = genreCount > 20 ? "Master" : genreCount > 15 ? "Expert" : genreCount > 10 ? "Enthusiast" : "Explorer";
            facts.push({
                title: "Genre Explorer of " + currentYear,
                description: `You're a ${genreLevel} with ${genreCount} unique genres in your rotation!`,
                icon: "🎼"
            });
        }

        // 4. Oldest Track (based on actual release dates)
        if (topTracks?.length > 0) {
            const oldestTrack = topTracks.reduce((oldest, track) => {
                const trackDate = new Date(track.album.release_date);
                return (!oldest || trackDate < oldest.date) ? { track, date: trackDate } : oldest;
            }, null);

            if (oldestTrack) {
                const year = oldestTrack.date.getFullYear();
                facts.push({
                    title: "Throwback of " + currentYear,
                    description: `'${oldestTrack.track.name}' (${year}) was the oldest track in your top songs!`,
                    icon: "⏰"
                });
            }
        }

        // 5. Newest Track (based on actual release dates)
        if (topTracks?.length > 0) {
            const newestTrack = topTracks.reduce((newest, track) => {
                const trackDate = new Date(track.album.release_date);
                return (!newest || trackDate > newest.date) ? { track, date: trackDate } : newest;
            }, null);

            if (newestTrack) {
                const year = newestTrack.date.getFullYear();
                facts.push({
                    title: "Fresh Pick of " + currentYear,
                    description: `'${newestTrack.track.name}' (${year}) was the newest track in your top songs!`,
                    icon: "✨"
                });
            }
        }

        // 6. Mood Analysis (based on actual track features)
        if (trackFeatures?.length > 0) {
            const avgValence = trackFeatures.reduce((sum, track) => sum + (track.valence || 0), 0) / trackFeatures.length;
            const avgEnergy = trackFeatures.reduce((sum, track) => sum + (track.energy || 0), 0) / trackFeatures.length;
            const avgDanceability = trackFeatures.reduce((sum, track) => sum + (track.danceability || 0), 0) / trackFeatures.length;

            const mood = [];
            if (avgValence > 0.6) mood.push("upbeat");
            if (avgValence < 0.4) mood.push("moody");
            if (avgDanceability > 0.6) mood.push("dancey");
            if (avgEnergy < 0.4) mood.push("chill");

            facts.push({
                title: "Your Musical Vibe of " + currentYear,
                description: `Based on your top tracks, your music taste is ${mood.join(", ")}!`,
                icon: "🎭"
            });
        }

        // 7. Musical Personality (based on actual track features)
        if (trackFeatures?.length > 0) {
            const avgEnergy = trackFeatures.reduce((sum, track) => sum + (track.energy || 0), 0) / trackFeatures.length;
            const avgTempo = trackFeatures.reduce((sum, track) => sum + (track.tempo || 0), 0) / trackFeatures.length;
            const avgInstrumentalness = trackFeatures.reduce((sum, track) => sum + (track.instrumentalness || 0), 0) / trackFeatures.length;
            const avgDanceability = trackFeatures.reduce((sum, track) => sum + (track.danceability || 0), 0) / trackFeatures.length;
            const avgValence = trackFeatures.reduce((sum, track) => sum + (track.valence || 0), 0) / trackFeatures.length;

            let personality;
            if (avgEnergy > 0.8 && avgTempo > 120) personality = "The Headbanger";
            else if (avgEnergy > 0.7 && avgDanceability > 0.7) personality = "The Bopper";
            else if (avgInstrumentalness > 0.5) personality = "The Explorer";
            else if (avgValence > 0.7 && avgEnergy < 0.5) personality = "The Romantic";
            else personality = "The Eclectic";

            facts.push({
                title: "Musical Personality of " + currentYear,
                description: `Based on your top tracks' features, you're ${personality}!`,
                icon: "🎯"
            });
        }

        // 8. Average Tempo (based on actual track features)
        if (trackFeatures?.length > 0) {
            const avgTempo = Math.round(trackFeatures.reduce((sum, track) => sum + (track.tempo || 0), 0) / trackFeatures.length);
            const tempoType = avgTempo > 120 ? "upbeat" : avgTempo > 100 ? "moderate" : "chill";
            facts.push({
                title: "Your Musical Beat of " + currentYear,
                description: `Your top tracks average ${avgTempo} BPM — that's a ${tempoType} groove!`,
                icon: "💓"
            });
        }

        // Select 3 facts using seeded random
        const selectedFacts = [];
        const availableIndices = [...Array(facts.length).keys()];

        for (let i = 0; i < 3 && availableIndices.length > 0; i++) {
            const randomIndex = Math.floor(seededRandom(seed + 9 + i) * availableIndices.length);
            const factIndex = availableIndices.splice(randomIndex, 1)[0];
            selectedFacts.push(facts[factIndex]);
        }

        return selectedFacts;
    }, [topArtists, topTracks, trackFeatures]);

    return (
        <div className="fun-facts-grid">
            {funFacts.map((fact, index) => (
                <div key={index} className="fun-fact-card">
                    <div className="fun-fact-icon">{fact.icon}</div>
                    <h3 className="fun-fact-title">{fact.title}</h3>
                    <p className="fun-fact-description">{fact.description}</p>
                </div>
            ))}
        </div>
    );
};

export default FunFacts; 