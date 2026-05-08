import os

# TRICK: Disable the broken decision forest import by mocking the module
import sys
from types import ModuleType
mock_tfdf = ModuleType('tensorflow_decision_forests')
sys.modules['tensorflow_decision_forests'] = mock_tfdf

import tensorflow as tf
import tensorflowjs as tfjs

def export():
    # 1. Load the model you just trained
    model_path = 'ecoedge_model.h5'
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found. Run train.py first!")
        return

    model = tf.keras.models.load_model(model_path)
    print("Model loaded successfully.")

    # 2. Force save to web format
    output_dir = 'web_model'
    tfjs.converters.save_keras_model(model, output_dir)
    print(f"SUCCESS! Web model saved to folder: {output_dir}")

if __name__ == "__main__":
    export()