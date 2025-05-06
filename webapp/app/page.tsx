"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderSection from '../components/custom/HeaderSection';
import PredictionCard from '../components/custom/PredictionCard';
import ModelStatsCard from '../components/custom/ModelStatsCard';
import PreviousPredictionsSection from '../components/custom/PreviousPredictionsSection';

export interface Model {
  name: string,
  RMSE: number;
  MAE: number;
  directionAccuracy: string;
}

export interface Prediction {
  next_day_prediction: number,
  date: Date,
  actual_price: number
}

export default function HomePage() {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [formattedDate, setFormattedDate] = useState('');
  const [model, setModel] = useState<Model | null>(null);
  const [previousData, setPreviousData] = useState<Prediction[]|null>(null);

  useEffect(() => {
    // Format tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    setFormattedDate(tomorrow.toLocaleDateString('en-GB', options));
  }, []);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const responsePrediction = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + '/predictions/getPrediction'
        );
        setPrediction(Number(responsePrediction.data.prediction.next_day_prediction.toFixed(2)));
        setPreviousData(responsePrediction.data.predictions);
        const responseModel = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + '/models/getModel'
        );
        setModel(responseModel.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex-grow p-8">
      <HeaderSection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-6xl mx-auto">
        <PredictionCard prediction={prediction} loading={loading} formattedDate={formattedDate} />
        <ModelStatsCard model={model} />
      </div>
      <PreviousPredictionsSection previousData={previousData} />
    </div>
  );
}
