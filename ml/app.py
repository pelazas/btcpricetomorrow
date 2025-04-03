from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS

from services.data.data_loader import load_btc_data
from services.preprocessing.xgboost1_preprocessor import XGBoostPreprocessor
from services.models.xgboost1_model import XGBoostModel

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['GET'])
def predict():
    data = load_btc_data()
    X,y,last_row = XGBoostPreprocessor().transform(data)
    model = XGBoostModel()
    model.train(X,y)
    prediction = model.predict(last_row)
    return jsonify({'next_day_prediction': float(prediction[0])})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)