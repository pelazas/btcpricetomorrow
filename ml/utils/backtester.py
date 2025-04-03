import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def backtest(X, y, model, train_window=50):
    predictions = []
    actuals = []
    correct_directions = []

    for i in range(train_window, len(X)):
        print(f"Backtesting iteration: {i-train_window}/{len(X)-train_window-1}", end='\r')

        X_train = X.iloc[i-train_window:i]
        y_train = y.iloc[i-train_window:i]

        X_test = X.iloc[i:i+1]
        y_test = y.iloc[i:i+1]

        model.fit(X_train, y_train)
        pred = model.predict(X_test)[0]
        actual = y_test.iloc[0]

        if len(actuals) > 0:
            prev_actual = actuals[-1]
        else:
            prev_actual = y_train.iloc[-1]

        pred_direction = np.sign(pred - prev_actual)
        true_direction = np.sign(actual - prev_actual)

        correct_directions.append(pred_direction == true_direction)
        predictions.append(pred)
        actuals.append(actual)

    # Calculate metrics
    mae = mean_absolute_error(actuals, predictions)
    rmse = np.sqrt(mean_squared_error(actuals, predictions))
    direction_accuracy = np.mean(correct_directions)

    return mae, rmse, predictions, actuals, direction_accuracy