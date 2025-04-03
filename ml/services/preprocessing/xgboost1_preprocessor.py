import pandas as pd

class XGBoostPreprocessor:
    def __init__(self):
        self.features = None
        
    def transform(self, df):
        df = df.copy()
        for lag in [1, 2, 3]:
            df[f'Lag{lag}'] = df['Close'].shift(lag)
        df['Tomorrow'] = df['Close'].shift(-1)
        df = self._add_technical_indicators(df)
        X = df.drop(columns=['Tomorrow'])
        y = df['Tomorrow']
        valid_indices = X.dropna().index
        X = X.loc[valid_indices].copy()
        y = y.loc[valid_indices].copy()

        last_row = X.iloc[[-1]].copy()

        X = X.iloc[:-1].copy()
        y = y.iloc[:-1].copy()

        return X,y,last_row
    
    def _add_technical_indicators(self, df):
        # RSI
        delta = df['Close'].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        df['RSI'] = 100 - (100 / (1 + gain.rolling(14).mean() / loss.rolling(14).mean()))

        # MACD
        ema12 = df['Close'].ewm(span=12).mean()
        ema26 = df['Close'].ewm(span=26).mean()
        df['MACD'] = ema12 - ema26

        df['Rolling_Mean_7'] = df['Close'].rolling(7).mean()
        df['Rolling_Mean_30'] = df['Close'].rolling(30).mean()
        df['Rolling_Std_7'] = df['Close'].rolling(7).std()
        df['Daily_Range'] = df['High'] - df['Low']
        df['Momentum_7'] = df['Close'] - df['Close'].shift(7)
        df['Volume_Change'] = df['Volume'].pct_change()
        # ... (your existing code)
        return df