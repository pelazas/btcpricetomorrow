// tests/unit/predictionService.test.js
const Prediction = require('../../models/Prediction');
const PredictionService = require('../../services/predictionService');
const axios = require('axios');

jest.mock('../../models/Prediction');
jest.mock('axios');

describe('PredictionService', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- createPrediction ---
  it('should create a new prediction', async () => {
    const mockPrediction = { _id: '123', next_day_prediction: 42000 };
    Prediction.create.mockResolvedValue(mockPrediction);

    const result = await PredictionService.createPrediction(42000);

    expect(Prediction.create).toHaveBeenCalledWith({ next_day_prediction: 42000 });
    expect(result).toEqual(mockPrediction);
  });

  // --- getTodaysPrediction ---
  it('should return the latest prediction', async () => {
    const mockPrediction = { _id: '234', next_day_prediction: 43000 };
    Prediction.findOne.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockPrediction) });

    const result = await PredictionService.getTodaysPrediction();

    expect(Prediction.findOne).toHaveBeenCalled();
    expect(result).toEqual(mockPrediction);
  });

  // --- getTodaysPrice ---
  it('should fetch today\'s price from CoinGecko', async () => {
    const mockPrice = 45000;
    axios.get.mockResolvedValue({ data: { market_data: { current_price: { usd: mockPrice } } } });

    const result = await PredictionService.getTodaysPrice();

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('api.coingecko.com'));
    expect(result).toBe(mockPrice);
  });

  it('should throw if CoinGecko API fails', async () => {
    axios.get.mockRejectedValue(new Error('API error'));

    await expect(PredictionService.getTodaysPrice()).rejects.toThrow('API error');
  });

  // --- updateActualPrices ---
  it('should update actual prices for old predictions', async () => {
    const oldPredictions = [
      { _id: '1', date: new Date('2025-01-01'), save: jest.fn() },
      { _id: '2', date: new Date('2025-01-02'), save: jest.fn() }
    ];

    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(oldPredictions) })
    });

    axios.get.mockResolvedValue({ data: { market_data: { current_price: { usd: 42000 } } } });

    await PredictionService.updateActualPrices();

    expect(Prediction.find).toHaveBeenCalled();
    expect(oldPredictions[0].actual_price).toBe(42000);
    expect(oldPredictions[0].save).toHaveBeenCalled();
  });

  // --- get30daysPredictions ---
  it('should return last 30 predictions', async () => {
    const mockPredictions = Array(30).fill({ next_day_prediction: 42000 });
    Prediction.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(mockPredictions) })
    });

    const result = await PredictionService.get30daysPredictions();

    expect(Prediction.find).toHaveBeenCalled();
    expect(result).toEqual(mockPredictions);
  });

});
