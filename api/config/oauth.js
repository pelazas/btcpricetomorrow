const { default: axios } = require('axios');
const AuthToken = require('../models/AuthToken');
require('dotenv').config();

const authConfig = {
  client_id: process.env.X_CLIENT_ID,
  client_secret: process.env.X_CLIENT_SECRET,
  redirect_uri: process.env.X_REDIRECT_URI
};

let tokenCache = null;

async function setAccessToken(data) {
  tokenCache = null; // Clear cache
  const existingToken = await AuthToken.findOne();

  const newToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };

  if (existingToken) {
    await AuthToken.findByIdAndUpdate(existingToken._id, newToken);
  } else {
    await AuthToken.create(newToken);
  }
}

async function getAccessToken() {
  // ✅ Just get from cache or DB — no refresh logic here
  if (tokenCache) return tokenCache;

  const tokenDoc = await AuthToken.findOne();
  tokenCache = tokenDoc;
  return tokenDoc;
}

async function refreshToken() {
  const tokenDoc = await AuthToken.findOne(); // ✅ Avoid recursion
  if (!tokenDoc) throw new Error('No token available');

  const response = await axios.post(
    'https://api.twitter.com/2/oauth2/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenDoc.refreshToken
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${authConfig.client_id}:${authConfig.client_secret}`).toString('base64')}`
      }
    }
  );

  await setAccessToken(response.data);
  return response.data.access_token;
}

async function getValidToken() {
  const tokenDoc = await getAccessToken();

  if (!tokenDoc) {
    throw new Error('No X token available');
  }

  // 🕒 Refresh if token expires in less than 24 hours (1 day = 86,400,000 ms)
  if (tokenDoc.expiresAt - Date.now() < 24 * 60 * 60 * 1000) {
    const newAccessToken = await refreshToken();
    return newAccessToken;
  }

  return tokenDoc.accessToken;
}

module.exports = { authConfig, setAccessToken, getValidToken };
