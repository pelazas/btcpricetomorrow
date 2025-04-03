from services.models.xgboost1_model import XGBoostModel
from services.preprocessing.xgboost1_preprocessor import XGBoostPreprocessor

def train_xgboost(data):
    preprocessor = XGBoostPreprocessor()
    processed = preprocessor.transform(data)
    
    X = processed.drop('Tomorrow', axis=1)
    y = processed['Tomorrow']
    
    model = XGBoostModel()
    model.train(X.iloc[:-1], y.iloc[:-1])
    model.save('models/xgboost_model.pkl')
    return model