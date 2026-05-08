import pandas as pd
import numpy as np

# Simulate 10,000 readings (approx. 14 hours of data at 5s intervals)
samples = 10000
time = np.linspace(0, 500, samples)

# Base voltage 230V with slight 50Hz-style oscillation and random noise
voltage = 230 + 3 * np.sin(time) + np.random.normal(0, 0.8, samples)

# Inject 15 "Grid Stress" events (Overvoltage anomalies)
for _ in range(15):
    idx = np.random.randint(100, samples-100)
    voltage[idx:idx+20] += np.random.uniform(20, 35) 

df = pd.DataFrame({'voltage': voltage})
df.to_csv('grid_telemetry.csv', index=False)
print("SUCCESS: grid_telemetry.csv generated with 10,000 rows.")