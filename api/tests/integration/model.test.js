const request = require('supertest');
const axios = require('axios');
const ModelService = require('../../services/modelService');
const app = require('../../app');

jest.mock('axios');
jest.mock('../../services/modelService');

describe('Model Controller', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/models should return model stats and call ModelService', async () => {
    const mockModelStats = {
        name: 'Bitcoin Model',
        MAE: 123.45,
        RMSE: 67.89,
        directionAccuracy: '80%'
    };

    axios.get.mockResolvedValue({ data: mockModelStats });
    ModelService.createOrUpdateModel.mockResolvedValue(true);

    const response = await request(app).get('/api/models/getModel');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockModelStats);

    expect(axios.get).toHaveBeenCalledWith(`${process.env.ML_URI}/model`);
    expect(ModelService.createOrUpdateModel).toHaveBeenCalledWith(mockModelStats);
  });

  it('should return 400 if ML module fails', async () => {
    axios.get.mockRejectedValue(new Error('ML module error'));

    const response = await request(app).get('/api/models/getModel');

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('ML module error');
  });

  it('should return 400 if ModelService fails', async () => {
    const mockModelStats = {
        name: 'Bitcoin Model',
        MAE: 123.45,
        RMSE: 67.89,
        directionAccuracy: '80%'
    };
    axios.get.mockResolvedValue({ data: mockModelStats });
    ModelService.createOrUpdateModel.mockRejectedValue(new Error('DB update failed'));

    const response = await request(app).get('/api/models/getModel');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'DB update failed' });
  });

});
