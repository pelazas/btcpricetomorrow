const crypto = require('crypto');
const base64url = require('base64url');
const axios = require('axios')
const { authConfig, setAccessToken } = require('./../config/oauth');

// In-memory store with expiration
const codeVerifiers = new Map();

exports.OAuth = (req, res) => {
    // Generate state and code verifier
    const state = base64url(crypto.randomBytes(32));
    const codeVerifier = base64url(crypto.randomBytes(32));

    // Store with 10-minute expiration
    codeVerifiers.set(state, {
        codeVerifier,
        expires: Date.now() + 600000
    });

    // Cleanup old entries
    cleanupCodeVerifiers();

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: authConfig.client_id,
        redirect_uri: authConfig.redirect_uri,
        scope: 'tweet.read tweet.write users.read offline.access',
        code_challenge: base64url(crypto.createHash('sha256').update(codeVerifier).digest()),
        code_challenge_method: 'S256',
        state: state
    });

    res.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
};

exports.OAuthCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) throw new Error('Missing code or state');

        // Retrieve and validate code verifier
        const entry = codeVerifiers.get(state);
        if (!entry || Date.now() > entry.expires) {
            throw new Error('Invalid state or expired code verifier');
        }
        codeVerifiers.delete(state);

        // Token exchange
        const authHeader = Buffer.from(
            `${authConfig.client_id}:${authConfig.client_secret}`
        ).toString('base64');

        const response = await axios.post(
            'https://api.twitter.com/2/oauth2/token',
            new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                redirect_uri: authConfig.redirect_uri,
                code_verifier: entry.codeVerifier
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`
                }
            }
        );

        await setAccessToken(response.data);
        res.send('Authentication successful!');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send(`Authentication failed: ${error.message}`);
    }
};

// Cleanup function
function cleanupCodeVerifiers() {
    const now = Date.now();
    for (const [state, entry] of codeVerifiers) {
        if (now > entry.expires) codeVerifiers.delete(state);
    }
}