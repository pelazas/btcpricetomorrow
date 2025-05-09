const axios = require('axios');
const crypto = require('crypto');
const base64url = require('base64url');
const { authConfig, getAccessToken, setAccessToken } = require('./../config/oauth');

// Corrected OAuth function

exports.OAuth = (req, res) => {
  const codeVerifier = base64url(crypto.randomBytes(32));
  
  // Destroy existing session completely
  req.session.destroy(() => {
    req.sessionStore.createSession(req, {}, (err) => {
      req.session.codeVerifier = codeVerifier;
      
      // Force cookie header through Cloudflare
      res.append('Set-Cookie', 
        `connect.sid=${req.sessionID}; ` +
        `Domain=btcpricetomorrow.com; ` +
        `Path=/; ` +
        `Secure; ` +
        `SameSite=None; ` +
        `HttpOnly; ` +
        `Max-Age=86400`
      );

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: authConfig.client_id,
        redirect_uri: authConfig.redirect_uri,
        scope: 'tweet.read tweet.write users.read offline.access',
        code_challenge: base64url(crypto.createHash('sha256').update(codeVerifier).digest()),
        code_challenge_method: 'S256',
        state: 'your_state'
      });
      res.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
    });
  });
};

// Corrected Callback
exports.OAuthCallback = async (req, res) => {
  try {
    // Verify code verifier exists in session
    if (!req.session.codeVerifier) {
      throw new Error('Missing code verifier in session');
    }

    const x_token_url = 'https://api.twitter.com/2/oauth2/token';
    const authHeader = Buffer.from(
      `${authConfig.client_id}:${authConfig.client_secret}`
    ).toString('base64');

    const response = await axios.post(x_token_url, new URLSearchParams({
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: authConfig.redirect_uri,
      code_verifier: req.session.codeVerifier
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      }
    });

    console.log(response.data)
    await setAccessToken({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in
    });

    // Clear the code verifier from session after use
    req.session.codeVerifier = null;
    req.session.save();

    res.send('Authentication successful!');
  } catch (error) {
    console.error('Full error:', error.response?.data || error.message);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
};