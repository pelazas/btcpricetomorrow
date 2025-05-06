'use client'
import { Prediction } from '@/app/page'
import { FC, useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

interface PreviousPredictionsTableProps {
  data: Prediction[]|null
}

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const PreviousPredictionsTable: FC<PreviousPredictionsTableProps> = ({data}) => {
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        if (!data) return;

        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${day}-${month}`;
        };

        const labels = data.map((entry: any) => formatDate(entry.date));
        const predicted = data.map((entry: any) => entry.next_day_prediction);
        const actual = data.map((entry: any) => entry.actual_price);

        setChartData({
            labels,
            datasets: [
                {
                    label: 'Predicted Price',
                    data: predicted,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                    tension: 0.3,
                },
                {
                    label: 'Actual Price',
                    data: actual,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.3,
                },
            ],
        });
    }, [data]);

    if (!data) {
        return <p>No data</p>;
    }

    return (
        <div className="w-full max-w-[800px] h-[300px] md:h-[400px]">
            {chartData && <Line data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false
            }} />}
        </div>
    );
}

export default PreviousPredictionsTable