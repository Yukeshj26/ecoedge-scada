import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

export function usePredictor() {
  const [model, setModel] = useState(null);

  useEffect(() => {
    async function loadBrain() {
      try {
        // Loads the files you just moved to the public folder
        const loadedModel = await tf.loadLayersModel('/model/model.json');
        setModel(loadedModel);
        console.log("[ML ENGINE] LSTM Model Loaded Successfully");
      } catch (e) {
        console.error("[ML ENGINE] Failed to load model", e);
      }
    }
    loadBrain();
  }, []);

  const predictNext = (historyArray) => {
    if (!model || historyArray.length < 10) return null;

    // 1. NORMALIZE: Must match the bounds of your Wokwi hardware
    const MIN_VOLT = 180;
    const MAX_VOLT = 260;
    const normalized = historyArray.map(v => (v - MIN_VOLT) / (MAX_VOLT - MIN_VOLT));

    // 2. TENSOR CONVERSION: Shape [batch, timesteps, features] -> [1, 10, 1]
    const inputTensor = tf.tensor3d(normalized, [1, 10, 1]);

    // 3. INFERENCE
    const prediction = model.predict(inputTensor);
    const normResult = prediction.dataSync()[0];

    // 4. DENORMALIZE back to real voltage
    const actualVoltage = (normResult * (MAX_VOLT - MIN_VOLT)) + MIN_VOLT;

    // 5. CLEANUP: TF.js requires manual memory management
    inputTensor.dispose();
    prediction.dispose();

    return actualVoltage.toFixed(1);
  };

  return { isReady: !!model, predictNext };
}