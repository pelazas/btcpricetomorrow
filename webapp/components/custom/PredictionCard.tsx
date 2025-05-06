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
        {/*<CardHeader>
          <CardTitle className="text-2xl text-orange-900">Next Day Forecast</CardTitle>
          <CardDescription className="text-orange-800">Prediction for {formattedDate} at 9:00 AM</CardDescription>
        </CardHeader>*/}
        <CardContent className='p-6 md:p-8 md:px-16 lg:px-24'>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-medium text-muted-foreground mb-2">Predicted Price for {formattedDate}</h2>
            <div className="flex items-center gap-3">
              <span className="text-4xl md:text-5xl font-bold">{loading ? 'Loading...' : prediction ? `${formatBigNumber(prediction)}$` : ''}</span>
              <div className={`flex items-center ${priceDifference>0 ? "text-green-500" : "text-red-500"}`}>
              
                {priceDifference>0 ? (
                  <ArrowUpIcon className="h-5 w-5 ml-1" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5 ml-1" />
                )}
                {formatBigNumber(Math.abs(priceDifference))}$
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Current price: {today_price ? formatBigNumber(today_price): ''}
            </p>
          </div>

          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${
              priceDifference>0 ? "border-green-500/20 text-green-500" : "border-red-500/20 text-red-500"
            }`}
          >
            <div className="text-center">
              <div className="text-3xl font-bold">
                {priceDifference>0? "+" : ""}
                {percentageChange.toFixed(2)}%
              </div>
              <div className="text-xs uppercase font-medium mt-1">{priceDifference>0 ? "Increase" : "Decrease"}</div>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
