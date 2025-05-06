"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion'
//import { ArrowUpIcon } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import PreviousPredictionsTable from '@/components/custom/PreviousPredictionsTable';

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

export default function Home() {

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState('');
  const [model, setModel] = useState<Model | null>(null);
  const [previousData, setPreviousData] = useState<Prediction[]|null>(null);

  useEffect(() => {
    // Get tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long' 
    };
    const formatted = tomorrow.toLocaleDateString('en-GB', options);
    setFormattedDate(formatted);
  }, []);

  
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const responsePrediction = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + '/predictions/getPrediction'
        );
        setPrediction(Number(responsePrediction.data.prediction.next_day_prediction.toFixed(2)));
        setPreviousData(responsePrediction.data.predictions)
        const responseModel = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + '/models/getModel'
        );
        setModel(responseModel.data);
      } catch (err) {
        //setError('Failed to fetch prediction');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
    console.log(model)
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex-grow p-8">
      <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-orange-800">Bitcoin Price Tomorrow</h1>
          <h2 className="text-xl text-orange-600 mt-2">btcpricetomorrow.com</h2>
          <p className="text-sm text-orange-700 mt-4">
            Predictions are made daily at 9:00 AM for the Bitcoin price at 9:00 AM the following day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-yellow-200 to-orange-300 border-none shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-900">Next Day Forecast</CardTitle>
                  <CardDescription className="text-orange-800">Prediction for {formattedDate} at 9:00 AM</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <motion.div 
                      className="text-6xl font-bold mr-4 text-orange-900"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      ${loading? 'Loading...' : prediction}
                    </motion.div>
                  </div>
                  {/*<motion.div 
                    className="flex items-center justify-center mt-4 text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    
                      <ArrowUpIcon className="text-green-600 mr-2" />

                    <span className="text-orange-900">
                      2,406
                      (8,56%)
                    </span>
                  </motion.div>*/}
                  <div className="mt-4 text-center">
                    <span className="text-orange-800 font-semibold">Confidence Level: </span>
                    <span className="text-orange-900 font-bold">8/10</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-yellow-300 to-orange-200 border-none shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-900">Last 30 Days</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-orange-900">
                  <div className="flex flex-col items-center justify-center">
                    
                  
                  <div>
                    RMSE: {model?.RMSE}
                  </div>
                  <div>
                    MAE: {model?.MAE}
                  </div>
                  <div>
                    Direction Accuracy: {model?.directionAccuracy}
                  </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <div className='flex flex-col items-center w-full'>
            <p className="text-2xl font-semibold"> Last 30 days:</p>
            <PreviousPredictionsTable data={previousData} />
          </div>
    </div>
  );
}
