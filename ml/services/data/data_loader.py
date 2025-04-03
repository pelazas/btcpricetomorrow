import yfinance as yf

def load_btc_data():
    btc = yf.Ticker('BTC-USD').history(period='max')
    return btc.drop(['Dividends', 'Stock Splits'], axis=1)