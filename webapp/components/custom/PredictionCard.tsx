import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface PredictionCardProps {
  prediction: number | null;
  loading: boolean;
  formattedDate: string;
}

export default function PredictionCard({ prediction, loading, formattedDate }: PredictionCardProps) {
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
              ${loading ? 'Loading...' : prediction}
            </motion.div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-orange-800 font-semibold">Confidence Level: </span>
            <span className="text-orange-900 font-bold">8/10</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
