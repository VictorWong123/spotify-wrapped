import axios from 'axios';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Log environment variables (will only show in Vercel logs)
console.log('Environment check:', {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
    fullRedirectUri: REDIRECT_URI // Log the full URI for verification
});

export default async function handler(req, res) {
    try {
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

        // Log the full request details for debugging
        console.log('Request details:', {
            method: req.method,
            url: req.url,
            query: req.query,
            headers: req.headers
        });

        // Extract the path from the query parameters (Vercel's routing)
        const { path } = req.query;

        // Handle login request
        if (path === 'login') {
            console.log('Handling login request');
            if (!CLIENT_ID || !REDIRECT_URI) {
                console.error('Missing environment variables:', {
                    hasClientId: !!CLIENT_ID,
                    hasRedirectUri: !!REDIRECT_URI
                });
                throw new Error('Missing required environment variables');
            }

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

            console.log('Redirecting to Spotify auth URL:', authUrl);
            res.redirect(authUrl);
            return;
        }

        // Handle callback request
        if (path === 'callback') {
            console.log('Handling callback request');
            if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
                console.error('Missing environment variables:', {
                    hasClientId: !!CLIENT_ID,
                    hasClientSecret: !!CLIENT_SECRET,
                    hasRedirectUri: !!REDIRECT_URI
                });
                throw new Error('Missing required environment variables');
            }

            const code = req.query.code || null;
            if (!code) {
                console.error('No code provided in callback. Query params:', req.query);
                res.status(400).json({ error: 'No code provided' });
                return;
            }

            try {
                console.log('Processing callback with code');
                const params = new URLSearchParams();
                params.append('grant_type', 'authorization_code');
                params.append('code', code);
                params.append('redirect_uri', REDIRECT_URI);

                console.log('Requesting token from Spotify with params:', {
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI,
                    hasCode: !!code
                });

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

                console.log('Token received successfully');
                const redirectUrl = `https://spotify-wrapped-mu.vercel.app/?access_token=${response.data.access_token}`;
                console.log('Redirecting to app:', redirectUrl);
                res.redirect(redirectUrl);
                return;
            } catch (err) {
                console.error('Token error:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });
                res.status(500).json({
                    error: 'Failed to get tokens',
                    details: err.response?.data || err.message
                });
                return;
            }
        }

        console.log('No matching route found:', {
            url: req.url,
            path: path,
            query: req.query
        });
        res.status(404).json({
            error: 'Not found',
            path: req.url,
            query: req.query
        });
    } catch (error) {
        console.error('Server error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
} 