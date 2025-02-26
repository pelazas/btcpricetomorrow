from flask import Flask, jsonify
import requests
import pandas as pd
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

def get_bitcoin_data(days=365):
    url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart"
    params = {
        'vs_currency': 'usd',
        'days': days,
        'interval': 'daily'
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        prices = data.get('prices', [])
        
        formatted_data = [{
            'date': datetime.fromtimestamp(price[0]/1000).strftime('%Y-%m-%d'),
            'price': price[1]
        } for price in prices]
        
        return formatted_data
    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        return None

@app.route('/')
def bitcoin_history():
    data = get_bitcoin_data(days=365)
    if data:
        return jsonify({
            'bitcoin_prices': data,
            'status': 'success',
            'entries': len(data)
        }), 200
    else:
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch Bitcoin data'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)