import PreviousPredictionsTable from './PreviousPredictionsTable';
import { Prediction } from '@/app/page';

interface PreviousPredictionsSectionProps {
  previousData: Prediction[] | null;
}

export default function PreviousPredictionsSection({ previousData }: PreviousPredictionsSectionProps) {
  return (
    <div className='flex flex-col items-center w-full'>
      <p className="text-2xl font-semibold">Last 30 days:</p>
      <PreviousPredictionsTable data={previousData} />
    </div>
  );
}
