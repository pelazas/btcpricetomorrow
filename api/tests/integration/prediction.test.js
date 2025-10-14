const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const axios = require('axios');
const PredictionService = require('../../services/predictionService');
const Email = require('../../models/Email');
const sendEmail = require('../../services/emailService');


jest.mock('axios');
jest.mock('../../services/predictionService');
jest.mock('../../models/Email');
jest.mock('../../services/emailService');

let app;
let mongoServer;

describe('Prediction Controller tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;
    process.env.ML_URI = 'http://fake-ml-service.com';

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app = require('../../app');
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    if (app && app.close) app.close();
  });

  it('GET /api/predictions/makePrediction should fetch prediction, store it, and send emails', async () => {
    axios.get.mockResolvedValue({ data: { next_day_prediction: 101000 } });

    const mockPrediction = { _id: 'mockid', next_day_prediction: 101000 };
    PredictionService.createPrediction.mockResolvedValue(mockPrediction);

    Email.find.mockResolvedValue([
      { email: 'user1@example.com' },
      { email: 'user2@example.com' },
    ]);

    sendEmail.mockResolvedValue(true);

    const response = await request(app).get('/api/predictions/makePrediction');

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockPrediction);

    expect(axios.get).toHaveBeenCalledWith('http://fake-ml-service.com/predict');
    expect(PredictionService.createPrediction).toHaveBeenCalledWith(101000);
    expect(Email.find).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it('should return 400 if ML microservice request fails', async () => {
    axios.get.mockRejectedValue(new Error('ML service down'));

    const response = await request(app).get('/api/predictions/makePrediction');

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('ML service down');
  });

  it('should return 400 if PredictionService.createPrediction fails', async () => {
    axios.get.mockResolvedValue({ data: { next_day_prediction: 42000 } });
    PredictionService.createPrediction.mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/api/predictions/makePrediction');

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('DB error');
  });

  it('should still respond 400 if one email fails to send', async () => {
    axios.get.mockResolvedValue({ data: { next_day_prediction: 42000 } });
    PredictionService.createPrediction.mockResolvedValue({ next_day_prediction: 42000 });
    Email.find.mockResolvedValue([
      { email: 'user1@example.com' },
      { email: 'user2@example.com' },
    ]);

    sendEmail
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('SMTP error'));

    const response = await request(app).get('/api/predictions/makePrediction');

    expect(response.status).toBe(400);

    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it('GET /api/predictions should return today prediction, today price, and last 30 days predictions', async () => {
    const mockPrediction = { next_day_prediction: 42000 };
    const mockTodayPrice = 41000;
    const mock30days = [
      { date: '2025-10-10', prediction: 40000 },
      { date: '2025-10-11', prediction: 40500 },
    ];

    PredictionService.getTodaysPrediction.mockResolvedValue(mockPrediction);
    PredictionService.updateActualPrices.mockResolvedValue(true);
    PredictionService.getTodaysPrice.mockResolvedValue(mockTodayPrice);
    PredictionService.get30daysPredictions.mockResolvedValue(mock30days);

    const response = await request(app).get('/api/predictions/getPrediction');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      prediction: mockPrediction,
      today_price: mockTodayPrice,
      predictions: mock30days
    });

    expect(PredictionService.getTodaysPrediction).toHaveBeenCalled();
    expect(PredictionService.updateActualPrices).toHaveBeenCalled();
    expect(PredictionService.getTodaysPrice).toHaveBeenCalled();
    expect(PredictionService.get30daysPredictions).toHaveBeenCalled();
  });

  // ⚠️ TEST 2: No prediction found
  it('should return 404 if there is no prediction for today', async () => {
    PredictionService.getTodaysPrediction.mockResolvedValue(null);

    const response = await request(app).get('/api/predictions/getPrediction');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No prediction found for today');
  });

  // ⚠️ TEST 3: Handles service errors gracefully
  it('should return 400 if PredictionService throws an error', async () => {
    PredictionService.getTodaysPrediction.mockRejectedValue(new Error('Service failure'));

    const response = await request(app).get('/api/predictions/getPrediction');

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Service failure');
  });
});
