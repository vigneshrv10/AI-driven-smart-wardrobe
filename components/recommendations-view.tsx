"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

// Mock data for events with recommendations
const eventsWithRecommendations = [
  {
    id: 1,
    title: "Company Dinner",
    date: "March 10, 2025",
    time: "7:00 PM",
    location: "The Grand Hotel",
    type: "formal",
    weather: "clear",
    temp: "72°F",
    recommendation: {
      top: {
        name: "Navy Blazer",
        image: "/placeholder.svg?height=150&width=150",
      },
      bottom: {
        name: "Gray Dress Pants",
        image: "/placeholder.svg?height=150&width=150",
      },
      shoes: {
        name: "Black Oxford Shoes",
        image: "/placeholder.svg?height=150&width=150",
      },
      accessories: {
        name: "Silver Watch",
        image: "/placeholder.svg?height=150&width=150",
      },
      reasoning:
        "A classic blazer and dress pants combination is perfect for a formal company dinner. The navy and gray pairing is timeless and professional.",
      missingItems: ["Gray Dress Pants"],
    },
  },
  {
    id: 2,
    title: "Beach Party",
    date: "March 15, 2025",
    time: "2:00 PM",
    location: "Sunset Beach",
    type: "casual",
    weather: "sunny",
    temp: "85°F",
    recommendation: {
      top: {
        name: "Floral Short-Sleeve Shirt",
        image: "/placeholder.svg?height=150&width=150",
      },
      bottom: {
        name: "Beige Shorts",
        image: "/placeholder.svg?height=150&width=150",
      },
      shoes: {
        name: "Sandals",
        image: "/placeholder.svg?height=150&width=150",
      },
      accessories: {
        name: "Sunglasses",
        image: "/placeholder.svg?height=150&width=150",
      },
      reasoning:
        "Light, breathable clothing is ideal for a beach party in warm weather. The floral shirt adds a fun, casual touch appropriate for the occasion.",
      missingItems: ["Floral Short-Sleeve Shirt", "Sandals"],
    },
  },
  {
    id: 3,
    title: "Wedding",
    date: "March 20, 2025",
    time: "5:30 PM",
    location: "Rosewood Gardens",
    type: "formal",
    weather: "cloudy",
    temp: "68°F",
    recommendation: {
      top: {
        name: "White Dress Shirt",
        image: "/placeholder.svg?height=150&width=150",
      },
      bottom: {
        name: "Black Suit Pants",
        image: "/placeholder.svg?height=150&width=150",
      },
      outerwear: {
        name: "Black Suit Jacket",
        image: "/placeholder.svg?height=150&width=150",
      },
      shoes: {
        name: "Black Oxford Shoes",
        image: "/placeholder.svg?height=150&width=150",
      },
      accessories: {
        name: "Red Tie",
        image: "/placeholder.svg?height=150&width=150",
      },
      reasoning:
        "A classic suit is appropriate for a wedding. The black suit with a white shirt is timeless, and the red tie adds a touch of color.",
      missingItems: [],
    },
  },
]

// Weather icon mapping
const weatherIcons = {
  sunny: Sun,
  clear: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
}

export function RecommendationsView() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState(eventsWithRecommendations[0])

  // Filter events based on active tab
  const filteredEvents = eventsWithRecommendations.filter((event) => {
    if (activeTab === "all") return true
    if (activeTab === "missing" && event.recommendation.missingItems.length > 0) return true
    if (activeTab === "complete" && event.recommendation.missingItems.length === 0) return true
    return false
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Outfit Recommendations</h1>
        <p className="text-muted-foreground">AI-curated outfit suggestions for your upcoming events</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="missing" className="text-xs">
                  Missing Items
                </TabsTrigger>
                <TabsTrigger value="complete" className="text-xs">
                  Complete
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-4 pr-2">
            {filteredEvents.map((event) => {
              const WeatherIcon = weatherIcons[event.weather as keyof typeof weatherIcons] || Sun
              const isSelected = selectedEvent.id === event.id

              return (
                <Card
                  key={event.id}
                  className={`cursor-pointer transition-all ${isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <Badge variant={event.type === "formal" ? "default" : "secondary"} className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      <div className="mt-1 flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {event.date}
                      </div>
                      <div className="mt-1 flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {event.time}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <div className="flex items-center text-xs">
                      <WeatherIcon className="mr-1 h-3 w-3" />
                      <span>{event.temp}</span>
                    </div>
                    {event.recommendation.missingItems.length > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        {event.recommendation.missingItems.length} missing
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs"
                      >
                        Complete
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedEvent.title}</CardTitle>
                  <CardDescription>
                    <div className="mt-1 flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4" />
                      {selectedEvent.date}, {selectedEvent.time}
                    </div>
                    <div className="mt-1 flex items-center text-sm">
                      <MapPin className="mr-1 h-4 w-4" />
                      {selectedEvent.location}
                    </div>
                  </CardDescription>
                </div>
                <Badge
                  className="mt-2 w-fit sm:mt-0"
                  variant={selectedEvent.type === "formal" ? "default" : "secondary"}
                >
                  {selectedEvent.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 rounded-lg bg-muted p-4">
                <h3 className="mb-2 text-lg font-medium">Recommended Outfit</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {selectedEvent.recommendation.top && (
                    <div className="flex flex-col items-center">
                      <div className="mb-2 h-32 w-32 overflow-hidden rounded-md bg-background">
                        <img
                          src={selectedEvent.recommendation.top.image || "/placeholder.svg"}
                          alt={selectedEvent.recommendation.top.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm">{selectedEvent.recommendation.top.name}</p>
                    </div>
                  )}

                  {selectedEvent.recommendation.bottom && (
                    <div className="flex flex-col items-center">
                      <div className="mb-2 h-32 w-32 overflow-hidden rounded-md bg-background">
                        <img
                          src={selectedEvent.recommendation.bottom.image || "/placeholder.svg"}
                          alt={selectedEvent.recommendation.bottom.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm">{selectedEvent.recommendation.bottom.name}</p>
                    </div>
                  )}

                  {selectedEvent.recommendation.outerwear && (
                    <div className="flex flex-col items-center">
                      <div className="mb-2 h-32 w-32 overflow-hidden rounded-md bg-background">
                        <img
                          src={selectedEvent.recommendation.outerwear.image || "/placeholder.svg"}
                          alt={selectedEvent.recommendation.outerwear.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm">{selectedEvent.recommendation.outerwear.name}</p>
                    </div>
                  )}

                  {selectedEvent.recommendation.shoes && (
                    <div className="flex flex-col items-center">
                      <div className="mb-2 h-32 w-32 overflow-hidden rounded-md bg-background">
                        <img
                          src={selectedEvent.recommendation.shoes.image || "/placeholder.svg"}
                          alt={selectedEvent.recommendation.shoes.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm">{selectedEvent.recommendation.shoes.name}</p>
                    </div>
                  )}

                  {selectedEvent.recommendation.accessories && (
                    <div className="flex flex-col items-center">
                      <div className="mb-2 h-32 w-32 overflow-hidden rounded-md bg-background">
                        <img
                          src={selectedEvent.recommendation.accessories.image || "/placeholder.svg"}
                          alt={selectedEvent.recommendation.accessories.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-center text-sm">{selectedEvent.recommendation.accessories.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-lg font-medium">Why This Outfit?</h3>
                <p className="text-muted-foreground">{selectedEvent.recommendation.reasoning}</p>
              </div>

              {selectedEvent.recommendation.missingItems.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-lg font-medium">Missing Items</h3>
                  <div className="rounded-lg border p-4">
                    <p className="mb-2 text-sm text-muted-foreground">
                      You're missing {selectedEvent.recommendation.missingItems.length} item(s) for this outfit:
                    </p>
                    <ul className="mb-4 list-inside list-disc space-y-1">
                      {selectedEvent.recommendation.missingItems.map((item) => (
                        <li key={item} className="text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full sm:w-auto">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Shop Missing Items
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-between p-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Like
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Dislike
                </Button>
              </div>
              <Button size="sm">Generate Alternative</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

