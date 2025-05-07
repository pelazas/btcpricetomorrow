"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderSection from '../components/custom/HeaderSection';
import PredictionCard from '../components/custom/PredictionCard';
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
  const [todayPrice, setTodayPrice] = useState<number|null>(null)
  const [loading, setLoading] = useState(true);
  const [formattedDate, setFormattedDate] = useState('');
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
        setTodayPrice(Number(responsePrediction.data.today_price))
        setPreviousData(responsePrediction.data.predictions);
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
      <div className="mb-8 md:w-[900px] md:mx-auto sm:mx-16 mx-4">
        <PredictionCard prediction={prediction} loading={loading} formattedDate={formattedDate} today_price={todayPrice}/>
      </div>
      <PreviousPredictionsSection previousData={previousData} />
    </div>
  );
}
