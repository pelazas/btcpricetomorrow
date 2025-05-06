import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Model } from '@/app/page';

interface ModelStatsCardProps {
  model: Model | null;
}

export default function ModelStatsCard({ model }: ModelStatsCardProps) {
  return (
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
            <div>RMSE: {model?.RMSE}</div>
            <div>MAE: {model?.MAE}</div>
            <div>Direction Accuracy: {model?.directionAccuracy}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
