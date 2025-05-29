const axios = require('axios');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { path } = req.query;

    if (path === 'login') {
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
        return;
    }

    if (path === 'callback') {
        const code = req.query.code || null;
        if (!code) {
            res.status(400).json({ error: 'No code provided' });
            return;
        }

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

            res.redirect(
                `https://spotify-wrapped-mu.vercel.app/?access_token=${response.data.access_token}`
            );
        } catch (err) {
            console.error('Token error:', err.response?.data || err.message);
            res.status(500).json({
                error: 'Failed to get tokens',
                details: err.response?.data || err.message
            });
        }
        return;
    }

    res.status(404).json({ error: 'Not found' });
}; 