import * as tf from '@tensorflow/tfjs-node';
import path from 'path';

let model: tf.LayersModel;

export async function loadModel() {
  if (!model) {
    const modelPath = path.join(__dirname, '../../assets/model.json');
    model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log('Model loaded successfully');
  }
  return model;
}

export async function predict(inputData: any) {
  const model = await loadModel();
  
  // Preprocess input data to match model's expected input shape/format
  const tensorInput = tf.tensor(inputData); // Adjust preprocessing as needed
  
  const prediction = model.predict(tensorInput) as tf.Tensor;
  return prediction.array();
}