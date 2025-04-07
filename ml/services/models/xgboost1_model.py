import xgboost as xgb
import joblib
from flask import jsonify


class XGBoostModel:
    def __init__(self):
        self.model = xgb.XGBRegressor(
            booster='gbtree',
            max_depth=3,
            objective='reg:squarederror',
            n_estimators=200,
            learning_rate=0.11,
            eval_metric='rmse'
        )
        print(self.model)
        
    def train(self, X, y):
        self.model.fit(X, y)
    
    def predict(self, last_row):
        return self.model.predict(last_row)
        
    def save(self, path):
        joblib.dump(self.model, path)
        
    @classmethod
    def load(cls, path):
        model = cls()
        model.model = joblib.load(path)
        return model
    
    def description(self):
        return jsonify({'name': 'XGBoost', 'MAE':770.85, 'RMSE': 1235.01, 'directionAccuracy': '53.92%'})