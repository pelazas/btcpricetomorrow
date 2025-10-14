// tests/integration/newsletter.test.js
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Email = require('../../models/Email'); // adjust path
const app = require('../../app'); // your Express app
const axios = require('axios');
const { getTodaysPrediction, getTodaysPrice } = require('../../services/predictionService');
const { getValidToken } = require('../../config/oauth');

jest.mock('axios');
jest.mock('../../services/predictionService');
jest.mock('../../config/oauth');
jest.mock('../../models/Email');

describe('Newsletter Controller', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    if (app && app.close) app.close();
  });

  it('POST /api/newsletter should subscribe successfully', async () => {
    const mockEmail = { email: 'user@example.com', save: jest.fn().mockResolvedValue(true) };

    Email.findOne.mockResolvedValue(null); // email does not exist
    Email.mockImplementation(() => mockEmail); // new Email instance

    const response = await request(app)
      .post('/api/newsletter/add')
      .send({ email: 'user@example.com' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });

    expect(Email.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
    expect(mockEmail.save).toHaveBeenCalled();
  });

  // ⚠️ TEST 2: Missing email
  it('should return 400 if email is not provided', async () => {
    const response = await request(app)
      .post('/api/newsletter/add')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'Email is required'
    });
  });

  // ⚠️ TEST 3: Email already subscribed
  it('should return 400 if email is already subscribed', async () => {
    Email.findOne.mockResolvedValue({ email: 'user@example.com' }); // already exists

    const response = await request(app)
      .post('/api/newsletter/add')
      .send({ email: 'user@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'Email already subscribed'
    });

    expect(Email.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
  });

  // ⚠️ TEST 4: Handle database error
  it('should return 500 if save fails', async () => {
    const mockEmail = { email: 'user2@example.com', save: jest.fn().mockRejectedValue(new Error('DB error')) };

    Email.findOne.mockResolvedValue(null);
    Email.mockImplementation(() => mockEmail);

    const response = await request(app)
      .post('/api/newsletter/add')
      .send({ email: 'user2@example.com' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: 'Error subscribing to newsletter: DB error'
    });
  });

  it('POST /api/newsletter/remove should unsubscribe successfully', async () => {
    const mockDeletedEmail = { email: 'user@example.com' };
    Email.findOneAndDelete.mockResolvedValue(mockDeletedEmail);

    const response = await request(app)
      .post('/api/newsletter/remove')
      .send({ email: 'user@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

    expect(Email.findOneAndDelete).toHaveBeenCalledWith({ email: 'user@example.com' });
  });

  it('should return 400 if email is not provided', async () => {
    const response = await request(app)
      .post('/api/newsletter/remove')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'Email is required'
    });
  });

  // ⚠️ TEST 3: Email not found in database
  it('should return 404 if email is not in the database', async () => {
    Email.findOneAndDelete.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/newsletter/remove')
      .send({ email: 'notfound@example.com' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: 'Email is not in the database'
    });

    expect(Email.findOneAndDelete).toHaveBeenCalledWith({ email: 'notfound@example.com' });
  });

  it('should return 500 if findOneAndDelete throws an error', async () => {
    Email.findOneAndDelete.mockRejectedValue(new Error('DB error'));

    const response = await request(app)
      .post('/api/newsletter/remove')
      .send({ email: 'user@example.com' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: 'Error unsubscribing from newsletter: DB error'
    });
  });

  it('POST /api/tweet should create a tweet with prediction', async () => {
    const mockToken = 'mock_access_token';
    const mockPrediction = { next_day_prediction: 42000 };
    const mockActualPrice = 41000;
    const mockTwitterResponse = { data: { id: '123', text: 'Tweet sent!' } };

    getValidToken.mockResolvedValue(mockToken);
    getTodaysPrediction.mockResolvedValue(mockPrediction);
    getTodaysPrice.mockResolvedValue(mockActualPrice);
    axios.post.mockResolvedValue(mockTwitterResponse);

    const response = await request(app).get('/api/newsletter/createPost');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTwitterResponse.data);

    expect(getValidToken).toHaveBeenCalled();
    expect(getTodaysPrediction).toHaveBeenCalled();
    expect(getTodaysPrice).toHaveBeenCalled();

    expect(axios.post).toHaveBeenCalledWith(
      'https://api.twitter.com/2/tweets',
      expect.objectContaining({
        text: expect.stringContaining('Bitcoin Price Prediction')
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should return 500 if Twitter API fails', async () => {
    getValidToken.mockResolvedValue('mock_access_token');
    getTodaysPrediction.mockResolvedValue({ next_day_prediction: 42000 });
    getTodaysPrice.mockResolvedValue(41000);
    axios.post.mockRejectedValue(new Error('Twitter API error'));

    const response = await request(app).get('/api/newsletter/createPost');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Tweet failed' });
  });

  it('should return 500 if getValidToken or prediction service fails', async () => {
    getValidToken.mockRejectedValue(new Error('Token failure'));

    const response = await request(app).get('/api/newsletter/createPost');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Tweet failed' });
  });

});
