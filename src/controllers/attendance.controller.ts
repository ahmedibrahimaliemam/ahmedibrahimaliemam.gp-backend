import { Request, Response } from 'express';
import { predict } from '../services/faceRecognitionService';

export async function modelPrediction(req: Request, res: Response) {
  try {
    const inputData = req.body;
    
    // Validate input data here
    
    const result = await predict(inputData);
    res.json({ prediction: result });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
}