from flask import Flask, jsonify
import pandas as pd
import requests
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/predict')
def predict():
    try:
        # Fetch Bitcoin data
        url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart"
        params = {"vs_currency": "usd", "days": "365", "interval": "daily"}
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        # Create DataFrames
        prices = pd.DataFrame(data["prices"], columns=["timestamp", "price"])
        volumes = pd.DataFrame(data["total_volumes"], columns=["timestamp", "volume"])
        market_caps = pd.DataFrame(data["market_caps"], columns=["timestamp", "market_cap"])
        
        # Merge data
        df = pd.merge(pd.merge(prices, volumes, on="timestamp"), market_caps, on="timestamp")

        # Feature engineering
        df['7d_rolling_mean'] = df['price'].rolling(7).mean()
        df['7d_rolling_std'] = df['price'].rolling(7).std()
        df['daily_return'] = df['price'].pct_change() * 100
        last_row = df.iloc[-1].copy()
        
        # Prepare target variable
        df['tomorrow_price'] = df['price'].shift(-1)
        df = df.dropna()

        # Split data
        features = df.drop(columns=['tomorrow_price'])
        target = df['tomorrow_price']
        X_train, X_temp, y_train, y_temp = train_test_split(features, target, test_size=0.4, shuffle=False)
        
        # Train model
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        # Make prediction
        next_day_prediction = model.predict(last_row.values.reshape(1, -1))
        prediction_value = round(next_day_prediction[0], 2)

        return jsonify({'next_day_prediction': prediction_value}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def bitcoin_history():
    return jsonify({'Status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)