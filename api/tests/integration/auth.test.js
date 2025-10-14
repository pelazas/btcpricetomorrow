// tests/integration/auth.test.js
const request = require('supertest');
const axios = require('axios');
const { setAccessToken } = require('../../config/oauth');
const app = require('../../app'); // your Express app

jest.mock('axios');
jest.mock('../../config/oauth', () => ({
  authConfig: {
    client_id: 'mock_client_id',
    client_secret: 'mock_client_secret',
    redirect_uri: 'http://localhost/callback'
  },
  setAccessToken: jest.fn()
}));

describe('Auth Controller', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- TEST 1: OAuth redirect generates a URL ---
  it('GET /api/auth should redirect to Twitter OAuth', async () => {
    const response = await request(app).get('/api/auth');

    expect(response.status).toBe(302); // redirect
    expect(response.header.location).toContain('https://twitter.com/i/oauth2/authorize');
    expect(response.header.location).toContain('response_type=code');
    expect(response.header.location).toContain('client_id=mock_client_id');
    expect(response.header.location).toContain('redirect_uri=http%3A%2F%2Flocalhost%2Fcallback');
    expect(response.header.location).toContain('scope=tweet.read+tweet.write+users.read+offline.access');
  });

  // --- TEST 2: OAuthCallback success ---
  it('GET /api/auth/callback should exchange code and store token', async () => {
    const mockCode = 'mock_code';
    const mockState = 'mock_state';
    const mockAccessTokenData = { access_token: 'mock_token' };

    // Add state entry to simulate previous OAuth
    const { codeVerifiers } = require('../../controllers/authController');
    codeVerifiers.set(mockState, { codeVerifier: 'mock_verifier', expires: Date.now() + 10000 });

    axios.post.mockResolvedValue({ data: mockAccessTokenData });

    const response = await request(app)
      .get('/api/auth/callback')
      .query({ code: mockCode, state: mockState });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Authentication successful!');
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.twitter.com/2/oauth2/token',
      expect.any(URLSearchParams),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic'),
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      })
    );
    expect(setAccessToken).toHaveBeenCalledWith(mockAccessTokenData);
    // state should be removed after success
    expect(codeVerifiers.has(mockState)).toBe(false);
  });

  // --- TEST 3: OAuthCallback missing code/state ---
  it('should return 500 if code or state missing', async () => {
    const response = await request(app)
      .get('/api/auth/callback')
      .query({});

    expect(response.status).toBe(500);
    expect(response.text).toContain('Authentication failed: Missing code or state');
  });

  // --- TEST 4: OAuthCallback expired state ---
  it('should return 500 if state is expired', async () => {
    const mockState = 'expired_state';
    const codeVerifiers = new Map();
    codeVerifiers.set(mockState, { codeVerifier: 'mock_verifier', expires: Date.now() - 1000 });

    const response = await request(app)
      .get('/api/auth/callback')
      .query({ code: 'any_code', state: mockState });

    expect(response.status).toBe(500);
    expect(response.text).toContain('Authentication failed: Invalid state or expired code verifier');
  });

  // --- TEST 5: OAuthCallback token exchange fails ---
  it('should return 500 if axios.post fails', async () => {
    const mockState = 'fail_state';
    const { codeVerifiers } = require('../../controllers/authController');
    codeVerifiers.set(mockState, { codeVerifier: 'mock_verifier', expires: Date.now() + 1000 });

    axios.post.mockRejectedValue(new Error('Token exchange failed'));

    const response = await request(app)
      .get('/api/auth/callback')
      .query({ code: 'any_code', state: mockState });

    expect(response.status).toBe(500);
    expect(response.text).toContain('Authentication failed: Token exchange failed');
  });

});
