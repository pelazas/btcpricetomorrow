// tests/unit/modelService.test.js
const Model = require('../../models/Model');
const ModelService = require('../../services/modelService');

jest.mock('../../models/Model');

describe('ModelService - createOrUpdateModel', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the model if it already exists', async () => {
    const existingModel = { _id: '123', name: 'Bitcoin Model' };
    const newModelData = { name: 'Bitcoin Model', MAE: 100, RMSE: 50, directionAccuracy: '80%' };
    const updatedModel = { ...newModelData, _id: '123' };

    Model.findOne.mockResolvedValue(existingModel);
    Model.findByIdAndUpdate.mockResolvedValue(updatedModel);

    const result = await ModelService.createOrUpdateModel(newModelData);

    expect(Model.findOne).toHaveBeenCalledWith({ name: newModelData.name });
    expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
      existingModel._id,
      newModelData,
      { new: true, runValidators: true }
    );
    expect(result).toEqual(updatedModel);
  });

  it('should create the model if it does not exist', async () => {
    const newModelData = { name: 'Bitcoin Model', MAE: 100, RMSE: 50, directionAccuracy: '80%' };
    const createdModel = { ...newModelData, _id: '456' };

    Model.findOne.mockResolvedValue(null);
    Model.create.mockResolvedValue(createdModel);

    const result = await ModelService.createOrUpdateModel(newModelData);

    expect(Model.findOne).toHaveBeenCalledWith({ name: newModelData.name });
    expect(Model.create).toHaveBeenCalledWith(newModelData);
    expect(result).toEqual(createdModel);
  });

  it('should throw an error if something fails', async () => {
    const newModelData = { name: 'Bitcoin Model', MAE: 100, RMSE: 50, directionAccuracy: '80%' };

    Model.findOne.mockRejectedValue(new Error('DB error'));

    await expect(ModelService.createOrUpdateModel(newModelData))
      .rejects
      .toThrow('Error creating/updating model: DB error');
  });

});
