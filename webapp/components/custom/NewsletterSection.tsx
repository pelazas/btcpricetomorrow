"use client"
import { FC, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'

interface NewsletterSectionProps {
  
}

const NewsletterSection: FC<NewsletterSectionProps> = ({}) => {
    const [email, setEmail] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email) return

        setIsLoading(true)
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/newsletter/add`,
                { email }
            )
            console.log("HERE")
            console.log(response.data)
            if (response.data.success) {
                toast({
                    title: "Success!",
                    description: "You've been subscribed to the newsletter.",
                    variant: "default",
                })
                setEmail('')
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to subscribe to newsletter",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mb-8 md:w-[700px] lg:w-[900px] md:mx-auto sm:mx-16 mx-4 mt-12 ">
            <Card className="bg-gradient-to-br from-yellow-200 to-orange-300 border-none shadow-lg h-full py-3">
                <CardHeader>
                    <CardTitle className="text-2xl">Subscribe to the Newsletter</CardTitle>
                    <CardDescription className="text-orange-900">
                        To receive an email with the daily prediction
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-grow bg-white/90 placeholder-orange-300 text-orange-900"
                            required
                            disabled={isLoading}
                            data-testid="subscribe-input"
                        />
                        <Button 
                            type="submit" 
                            className="bg-orange-700 hover:bg-orange-800 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? "Subscribing..." : "Subscribe"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default NewsletterSection