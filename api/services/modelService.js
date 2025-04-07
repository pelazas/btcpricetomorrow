const Model = require('../models/Model')

exports.createOrUpdateModel = async (model) => {
    try {
        // check if there is a model in db with the same model.name
        const existingModel = await Model.findOne({ name: model.name });

        let result;
        //if there is, update it
        if (existingModel) {
            result = await Model.findByIdAndUpdate(
                existingModel._id,
                model,
                { new: true, runValidators: true }
            );
        } else {
            // if there isn't create it
            result = await Model.create(model);
        }
        // return the model
        return result;
    } catch (error) {
        throw new Error(`Error creating/updating model: ${error.message}`);
    }
}