const express = require('express');
const bodyParser = require('body-parser');
const tf = require('@tensorflow/tfjs-node');
const Papa = require('papaparse');
const fs = require('fs');
const cors = require('cors'); // Add CORS middleware

const app = express();
const port = process.env.PORT || 3000;

let model;
app.use(cors()); // Enable CORS for your API

async function loadModel() {
  model = await tf.loadLayersModel('file://model/model/model.json');
  console.log('Model loaded successfully.');
}

loadModel().catch(error => {
  console.error('Error loading model:', error);
});

app.use(bodyParser.json());

app.post('/predict-crop', (req, res) => {
  if (!model) {
    res.status(500).json({ error: 'Model not loaded yet' });
    return;
  }

  const  N=17, P=18, K=28, temperature=23, humidity=34, pH=4.5, rainfall=44.4;
  function preprocessInput(inputData) {
    const minTemperature = 15; // Replace with the minimum temperature in your dataset
    const maxTemperature = 35; // Replace with the maximum temperature in your dataset
  
    const minHumidity = 11; // Replace with the minimum humidity in your dataset
    const maxHumidity = 103; // Replace with the maximum humidity in your dataset
  
    const minPH = 4; // Replace with the minimum pH in your dataset
    const maxPH = 8; // Replace with the maximum pH in your dataset
  
    const minRainfall = 30; // Replace with the minimum rainfall in your dataset
    const maxRainfall = 200; // Replace with the maximum rainfall in your dataset
  
    const minN = 3; // Replace with the minimum N value in your dataset
    const maxN = 100; // Replace with the maximum N value in your dataset
  
    const minP = 3; // Replace with the minimum P value in your dataset
    const maxP = 95; // Replace with the maximum P value in your dataset
  
    const minK = 6; // Replace with the minimum K value in your dataset
    const maxK = 89; // Replace with the maximum K value in your dataset
  
    // Perform data preprocessing
    const preprocessedInput = {
      temperature: (inputData.temperature - minTemperature) / (maxTemperature - minTemperature),
      humidity: (inputData.humidity - minHumidity) / (maxHumidity - minHumidity),
      pH: (inputData.pH - minPH) / (maxPH - minPH),
      rainfall: (inputData.rainfall - minRainfall) / (maxRainfall - minRainfall),
      N: (inputData.N - minN) / (maxN - minN),
      P: (inputData.P - minP) / (maxP - minP),
      K: (inputData.K - minK) / (maxK - minK),
    };
  
    return preprocessedInput;
  }
  
  // Preprocess input data (normalize, encode, etc.) as needed based on your training preprocessing
  const preprocessedInput = preprocessInput({ temperature, humidity, pH, rainfall, N, P, K });

  // Make predictions using the loaded model
  const predictions = model.predict(tf.tensor2d([[
    preprocessedInput.temperature,
    preprocessedInput.humidity,
    preprocessedInput.pH,
    preprocessedInput.rainfall,
    preprocessedInput.N,
    preprocessedInput.P,
    preprocessedInput.K,
  ]]));

  // Decode predicted values into crop names
  const labelSet = [
    'Rice', 'Maize', 'Chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean',
    'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 'grapes', 'watermelon',
    'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee'
  ]; // Replace with your crop labels
  const predictedCropIndex = predictions.argMax(1).dataSync()[0];
  console.log(predictedCropIndex);
  const predictedCrop = labelSet[predictedCropIndex];
  console.log(predictedCrop);
  res.json({ predictedCrop });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
