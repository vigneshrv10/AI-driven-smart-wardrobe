"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Plus, Sun, Cloud, CloudRain, Snowflake, Shirt, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { format, parseISO, differenceInDays } from "date-fns"

// Weather icon mapping
const weatherIcons = {
  sunny: Sun,
  clear: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
}

interface Event {
  _id: string
  eventTitle: string
  eventType: string
  eventDate: string
  eventLocation: string
  weather?: {
    temperature: number
    description: string
    location: string
    country: string
  }
  outfit?: {
    prompt?: string
    imageUrl?: string
    paymentRequired?: boolean
    message?: string
  }
  createdAt: string
}

interface WardrobeItem {
  _id: string
  name: string
  category: string
  color: string
  season: string[]
  occasion: string[]
  imageUrl: string
}

export function DashboardView() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventType: "",
    eventDate: format(new Date(), 'yyyy-MM-dd'),
    eventLocation: "",
    clothing: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [recommendation, setRecommendation] = useState<any>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [wardrobeStats, setWardrobeStats] = useState<{[key: string]: number}>({})
  const [recentRecommendations, setRecentRecommendations] = useState<Event[]>([])

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      
      // Check if user is logged in
      const authRes = await fetch('/api/auth/me')
      if (!authRes.ok) {
        console.log('User not authenticated, redirecting to login')
        router.push('/login')
        return
      }

      // Fetch events (recommendations)
      const eventsRes = await fetch('/api/recommendations', {
        credentials: 'include'
      })
      
      if (!eventsRes.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const eventsData = await eventsRes.json()
      
      // Sort events by date and filter for upcoming events
      const sortedEvents = eventsData
        .sort((a: Event, b: Event) => {
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        })
        .filter((event: Event) => {
          return new Date(event.eventDate) >= new Date()
        })
      
      setUpcomingEvents(sortedEvents.slice(0, 3)) // Get first 3 upcoming events
      setRecentRecommendations(eventsData.slice(-3).reverse()) // Get 3 most recent recommendations
      
      // Fetch wardrobe items for stats
      const wardrobeRes = await fetch('/api/wardrobe', {
        credentials: 'include'
      })
      
      if (!wardrobeRes.ok) {
        throw new Error('Failed to fetch wardrobe items')
      }
      
      const wardrobeData = await wardrobeRes.json()
      
      // Calculate wardrobe stats by category
      const stats: {[key: string]: number} = {}
      wardrobeData.forEach((item: WardrobeItem) => {
        const category = item.category.toLowerCase()
        stats[category] = (stats[category] || 0) + 1
      })
      
      setWardrobeStats(stats)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setRecommendation(null)

    try {
      // Check if user is logged in
      const authRes = await fetch('/api/auth/me')
      if (!authRes.ok) {
        console.log('User not authenticated, redirecting to login')
        router.push('/login')
        return
      }

      // Generate outfit recommendation
      const outfitRes = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!outfitRes.ok) {
        const errorData = await outfitRes.json()
        throw new Error(errorData.error || "Failed to generate outfit")
      }
      const outfitData = await outfitRes.json()

      // Save recommendation with the outfit data
      const saveRes = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          weather: outfitData.weather,
          outfit: {
            prompt: outfitData.outfit.prompt,
            image: outfitData.outfit.image,
            paymentRequired: outfitData.outfit.paymentRequired,
            message: outfitData.outfit.message,
          },
        }),
      })

      if (!saveRes.ok) {
        const errorData = await saveRes.json()
        throw new Error(errorData.error || "Failed to save recommendation")
      }
      const savedRecommendation = await saveRes.json()
      setRecommendation(savedRecommendation)

      // Refresh data
      await fetchUserData()

      // Clear form
      setFormData({
        eventTitle: "",
        eventType: "",
        eventDate: format(new Date(), 'yyyy-MM-dd'),
        eventLocation: "",
        clothing: "",
      })
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (isLoading && !recommendation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Get Outfit Recommendations</h1>
          <p className="text-muted-foreground">
            Enter your event details to get personalized outfit suggestions
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Tell us about your upcoming event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="eventTitle" className="text-sm font-medium">
                  Event Title
                </label>
                <Input
                  id="eventTitle"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="eventType" className="text-sm font-medium">
                  Event Type
                </label>
                <Input
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  placeholder="e.g., Wedding, Business Meeting, Party"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="eventDate" className="text-sm font-medium">
                  Event Date
                </label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="eventLocation" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="eventLocation"
                  name="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  placeholder="Enter city name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="clothing" className="text-sm font-medium">
                  Clothing Preferences (Optional)
                </label>
                <Input
                  id="clothing"
                  name="clothing"
                  value={formData.clothing}
                  onChange={handleChange}
                  placeholder="Any specific clothing preferences"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Recommendation...
                  </>
                ) : (
                  "Get Recommendation"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {recommendation && (
          <Card>
            <CardHeader>
              <CardTitle>Your Outfit Recommendation</CardTitle>
              <CardDescription>
                Based on your event details and the weather
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Weather Information</h3>
                <p>
                  {recommendation.weather.temperature}°C,{" "}
                  {recommendation.weather.description} in{" "}
                  {recommendation.weather.location},{" "}
                  {recommendation.weather.country}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Recommended Outfit</h3>
                <p className="text-muted-foreground">
                  {recommendation.outfit.prompt}
                </p>
              </div>

              {recommendation.outfit.image ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                  <Image
                    src={recommendation.outfit.image}
                    alt="Outfit recommendation"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : recommendation.outfit.paymentRequired ? (
                <div className="p-4 border rounded-lg bg-muted/50 text-center">
                  <p className="text-amber-600 font-medium">
                    Image Generation Unavailable
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {recommendation.outfit.message}
                  </p>
                </div>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/history")}
              >
                View History
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Upcoming Events</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const eventDate = parseISO(event.eventDate)
              const daysUntil = differenceInDays(eventDate, new Date())
              const weatherDescription = event.weather?.description?.toLowerCase() || "clear"
              const weatherType = weatherDescription.includes("cloud") ? "cloudy" : 
                                 weatherDescription.includes("rain") ? "rainy" :
                                 weatherDescription.includes("snow") ? "snowy" : "sunny"
              const WeatherIcon = weatherIcons[weatherType as keyof typeof weatherIcons] || Sun

              return (
                <Card key={event._id} className="event-card overflow-hidden">
                  <div className="h-2 w-full bg-primary" />
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{event.eventTitle}</CardTitle>
                      <Badge variant={event.eventType.toLowerCase().includes("formal") ? "default" : "secondary"}>
                        {event.eventType}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="mt-2 flex items-center text-sm">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(eventDate, "MMMM d, yyyy")}
                      </div>
                      <div className="mt-1 flex items-center text-sm">
                        <MapPin className="mr-1 h-4 w-4" />
                        {event.eventLocation}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.weather && (
                      <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                        <div className="flex items-center">
                          <WeatherIcon className="mr-2 h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{weatherType}</p>
                            <p className="text-xs text-muted-foreground">{event.weather.temperature}°C</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{daysUntil} day{daysUntil !== 1 ? 's' : ''}</p>
                          <p className="text-xs text-muted-foreground">until event</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/calendar?date=${event.eventDate}`)}
                    >
                      View in Calendar
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wardrobe Stats</CardTitle>
            <CardDescription>Overview of your wardrobe items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.keys(wardrobeStats).length > 0 ? (
                Object.entries(wardrobeStats).map(([category, count]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{category}</span>
                      <span className="font-medium">{count} item{count !== 1 ? 's' : ''}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (count / 10) * 100)} 
                      className="h-2" 
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Shirt className="mb-2 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">No Items Yet</h3>
                  <p className="text-sm text-muted-foreground">Add items to your wardrobe to see stats</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/wardrobe')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Items
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Recommendations</CardTitle>
            <CardDescription>Your latest outfit suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRecommendations.length > 0 ? (
              <div className="space-y-4">
                {recentRecommendations.map((event) => (
                  <div key={event._id} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md bg-primary/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{event.eventTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.eventDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/history')}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-medium">No Recommendations Yet</h3>
                <p className="text-sm text-muted-foreground">Create an event to get outfit recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
