const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

console.log('Starting backend server...');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('REDIRECT_URI:', REDIRECT_URI);

app.get('/login', (req, res) => {
    const scope = [
        'user-top-read',
        'user-read-recently-played',
        'user-read-playback-position',
        'user-library-read',
        'user-read-private',
        'user-read-email',
        'user-read-playback-state',
        'user-read-currently-playing'
    ].join(' ');

    const showDialog = req.query.show_dialog === 'true';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
        scope
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}${showDialog ? '&show_dialog=true' : ''}`;

    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    if (!code) return res.status(400).send('No code provided');

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', REDIRECT_URI);

        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization:
                        'Basic ' +
                        Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
                },
            }
        );

        // You can send the tokens to the frontend, or set a cookie, etc.
        res.redirect(
            `http://localhost:3000/?access_token=${response.data.access_token}`
        );
    } catch (err) {
        res.status(500).json({ error: 'Failed to get tokens', details: err.message });
    }
});

// Start the server if this file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app; 