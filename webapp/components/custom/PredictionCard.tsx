"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react';
import axios from 'axios';


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

  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [upVotePercentage, setUpVotePercentage] = useState(50)

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/votes/getVotes`);
        const { upvotes, downvotes } = response.data;
        
        // Calculate percentage
        const totalVotes = upvotes + downvotes;
        let newUpVotePercentage;
        if(totalVotes>0){
          newUpVotePercentage = Math.round((upvotes / totalVotes) * 100);
          setUpVotePercentage(newUpVotePercentage)
        }
        
      } catch (err) {
        console.error(err);
      }
    };
    fetchVotes();
  }, []);

  const handleVote = async (vote: "up" | "down") => {
    if (hasVoted) return;

    try {
      // Add the vote
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/votes/addVote`, { vote });
      
      // Get updated vote statistics
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/votes/getVotes`);
      const { upvotes, downvotes } = response.data;
      
      // Calculate percentage
      const totalVotes = upvotes + downvotes;
      const newUpVotePercentage = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
      
      setHasVoted(true);
      setUserVote(vote);
      setUpVotePercentage(newUpVotePercentage);
    } catch (error) {
      console.error('Error processing vote:', error);
      // Reset the vote state if there's an error
      setHasVoted(false);
      setUserVote(null);
    }
  }
  
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
            <h2 className="text-xl font-medium text-muted-foreground mb-2">Predicted Price for {formattedDate} at 00:00</h2>
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

        {/* Voting Section */}
        <div className="mt-8 pt-6 border-t border-gray-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-lg font-medium mb-1">What do you think?</p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-orange-500">{upVotePercentage}%</span> of users predict the price
                will go up
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant={userVote === "up" ? "default" : "outline"}
                size="lg"
                className={`flex items-center gap-2 ${
                  userVote === "up" ? "bg-green-500 hover:bg-green-600" : "hover:border-green-500 hover:text-green-500"
                } ${hasVoted && userVote !== "up" ? "opacity-50" : ""}`}
                onClick={() => handleVote("up")}
                disabled={hasVoted}
              >
                <ThumbsUpIcon className="h-5 w-5" />
                <span>Up</span>
              </Button>

              <Button
                variant={userVote === "down" ? "default" : "outline"}
                size="lg"
                className={`flex items-center gap-2 ${
                  userVote === "down" ? "bg-red-500 hover:bg-red-600" : "hover:border-red-500 hover:text-red-500"
                } ${hasVoted && userVote !== "down" ? "opacity-50" : ""}`}
                onClick={() => handleVote("down")}
                disabled={hasVoted}
              >
                <ThumbsDownIcon className="h-5 w-5" />
                <span>Down</span>
              </Button>
            </div>
          </div>

          {hasVoted && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Thanks for your vote! We'll see if you're right tomorrow.
            </div>
          )}
        </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
