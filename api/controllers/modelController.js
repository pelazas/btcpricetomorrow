const axios = require('axios');
const ModelService = require('../services/modelService');


exports.getModel = async (req,res) => {
    try {
        // get stats from the ml module
        const response = await axios.get(`${process.env.ML_URI}/model`);
        // update (or add) the model in the database
        ModelService.createOrUpdateModel(response.data)
        // return model stats
        res.status(200).json(response.data)

    } catch (error){
        res.status(400).json({ error: error.message });
    }
}