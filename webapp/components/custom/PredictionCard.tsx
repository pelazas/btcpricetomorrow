import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'


interface PredictionCardProps {
  prediction: number | null;
  loading: boolean;
  formattedDate: string;
  today_price: number | null;
}

const formatBigNumber = (number: number): string => {
  return number.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function PredictionCard({ prediction, loading, formattedDate, today_price }: PredictionCardProps) {
  const priceDifference = prediction && today_price ? prediction - today_price : 0;
  const percentageChange = today_price ? (priceDifference / today_price) * 100 : 0;
  
  return (
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
              {loading ? 'Loading...' : prediction ? `${formatBigNumber(prediction)}$` : ''}
            </motion.div>
          </div>
          <div className="mt-4 text-center">
            {!loading && today_price && (
              <div className="flex items-center justify-center">
                {priceDifference > 0 ? (
                  <ArrowUpIcon className="text-green-600 mr-2 w-5 h-5" />
                ) : (
                  <ArrowDownIcon className="text-red-600 mr-2 w-5 h-5" />
                )}
                <span className="text-orange-900">
                  {formatBigNumber(Math.abs(priceDifference))}$
                  ({percentageChange.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
