"use client"

import { useState, useEffect } from "react"
import { Trash2, Calendar, MapPin, Tag, Shirt, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { format } from "date-fns"

interface User {
  _id: string
  username: string
  name: string
  profilePicture?: string
}

interface Recommendation {
  _id: string
  userId: string
  user: User
  eventTitle: string
  eventType: string
  eventDate: string
  eventLocation: string
  clothing?: string
  weather: {
    temperature: number
    description: string
    location: string
    country: string
  }
  outfit: {
    prompt: string
    imageUrl: string | null
    paymentRequired?: boolean
    message?: string
  }
  createdAt: string
}

export function HistoryView() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    fetchRecommendations()
    fetchCurrentUser()
  }, [])

  async function fetchCurrentUser() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  async function fetchRecommendations() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/history")
      
      if (!response.ok) {
        const errorData = await response.json()
        
        if (errorData.connectionStatus === 'disconnected') {
          throw new Error(`Database connection error: ${errorData.details || 'Could not connect to MongoDB'}`)
        }
        
        throw new Error(errorData.error || "Failed to fetch recommendations")
      }

      const data = await response.json()
      
      if (!data || !Array.isArray(data)) {
        console.warn("Received invalid data format:", data)
        setRecommendations([])
        return
      }
      
      setRecommendations(data)
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteRecommendation(id: string) {
    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete recommendation")
      }

      setRecommendations((prev) => prev.filter((rec) => rec._id !== id))
    } catch (error) {
      console.error("Error deleting recommendation:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading recommendations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-destructive font-medium mb-2">Error</p>
        <p className="text-muted-foreground text-center max-w-md mb-4">{error}</p>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {error.includes('Database connection error') ? (
            <>
              Please check your MongoDB connection string in the .env.local file:
              <code className="block mt-2 p-2 bg-muted rounded-md text-xs overflow-auto max-w-full">
                MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
              </code>
              <span className="block mt-2">
                Make sure your MongoDB Atlas cluster is running and your IP address is whitelisted.
              </span>
            </>
          ) : (
            "There was an error fetching your recommendation history."
          )}
        </p>
        <Button onClick={fetchRecommendations} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Generate outfit recommendations for your events to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((recommendation) => (
          <Card key={recommendation._id} className="overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={recommendation.user?.profilePicture} />
                    <AvatarFallback>
                      {recommendation.user?.name.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{recommendation.eventTitle}</CardTitle>
                    <CardDescription>
                      <p className="text-sm font-medium text-muted-foreground">
                        by {recommendation.user?.name || 'Unknown User'}
                      </p>
                      <div className="mt-2 flex items-center text-sm">
                        <Calendar className="mr-1 h-4 w-4" />
                        {recommendation.eventDate}
                      </div>
                      <div className="mt-1 flex items-center text-sm">
                        <MapPin className="mr-1 h-4 w-4" />
                        {recommendation.eventLocation}
                      </div>
                      <div className="mt-1 flex items-center text-sm">
                        <Tag className="mr-1 h-4 w-4" />
                        {recommendation.eventType}
                      </div>
                      {recommendation.clothing && (
                        <div className="mt-1 flex items-center text-sm">
                          <Shirt className="mr-1 h-4 w-4" />
                          {recommendation.clothing}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                </div>
                {currentUser?._id === recommendation.userId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRecommendation(recommendation._id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Weather</h4>
                <p className="text-sm">
                  {recommendation.weather.temperature}°C, {recommendation.weather.description} in{" "}
                  {recommendation.weather.location}, {recommendation.weather.country}
                </p>
              </div>

              {recommendation.outfit.imageUrl ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                  <Image
                    src={recommendation.outfit.imageUrl}
                    alt="Outfit recommendation"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : recommendation.outfit.paymentRequired ? (
                <div className="p-4 border rounded-lg bg-muted/50 text-center space-y-2">
                  <p className="text-amber-600 font-medium text-sm">Image Generation Unavailable</p>
                  <p className="text-xs text-muted-foreground">{recommendation.outfit.message}</p>
                </div>
              ) : null}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Outfit recommendation:</p>
                <p>{recommendation.outfit.prompt}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 