import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler

# 1. Load and Normalize Data
df = pd.read_csv('grid_telemetry.csv')
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(df)

# 2. Create Look-Back Windows
X, y = [], []
for i in range(10, len(scaled_data)):
    X.append(scaled_data[i-10:i, 0])
    y.append(scaled_data[i, 0])

X, y = np.array(X), np.array(y)
X = np.reshape(X, (X.shape[0], X.shape[1], 1))

# 3. Build LSTM Model
model = tf.keras.Sequential([
    tf.keras.layers.LSTM(64, return_sequences=True, input_shape=(10, 1)),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.LSTM(32),
    tf.keras.layers.Dense(1)
])

model.compile(optimizer='adam', loss='mse')
print("STARTING TRAINING...")
model.fit(X, y, epochs=15, batch_size=32, verbose=1)

# 4. Save as a standard Keras file (Safe on Windows)
model.save('ecoedge_model.h5')
print("SUCCESS: Model saved as ecoedge_model.h5")