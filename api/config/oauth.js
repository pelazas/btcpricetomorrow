const authConfig = {
    client_id: process.env.X_CLIENT_ID,
    client_secret: process.env.X_CLIENT_SECRET,
    redirect_uri: 'http://localhost:8000/api/auth/callback'
};

// move to db
let accessToken = null

const setAccessToken = (a) => {
    accessToken = a;
}

const getAccessToken = () => {
    return accessToken
}

module.exports = {authConfig, setAccessToken, getAccessToken}