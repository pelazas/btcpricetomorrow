// app/unsubscribe/UnsubscribeClient.tsx
'use client'

import { FC, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'

const UnsubscribePage: FC = () => {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleUnsubscribe = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/remove`, { email })
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message || "Successfully unsubscribed from the newsletter",
          variant: "default",
        })
        setEmail('')
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to unsubscribe from the newsletter",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Error when unsubscribing from the newsletter"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Unsubscribe from BTC Price Tomorrow Newsletter
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex rounded-md shadow-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              data-testid="unsubscribe-input"
            />
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              data-testid="unsubscribe-button"
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnsubscribePage
