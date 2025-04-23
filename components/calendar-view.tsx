"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, CalendarIcon, Shirt, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Event {
  _id: string
  eventTitle: string
  eventType: string
  eventDate: string
  eventLocation: string
  outfit?: {
    prompt?: string
    imageUrl?: string
    paymentRequired?: boolean
    message?: string
  }
  createdAt: string
}

export function CalendarView() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    eventTitle: '',
    eventType: '',
    eventDate: format(new Date(), 'yyyy-MM-dd'),
    eventLocation: '',
    clothing: '',
  })

  useEffect(() => {
    fetchUserEvents()
  }, [])

  const fetchUserEvents = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/recommendations', {
        credentials: 'include'
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch events')
      }
      
      const data = await res.json()
      setEvents(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingEvent(true)
    setError('')

    try {
      // Generate outfit recommendation
      const outfitRes = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
      
      if (!outfitRes.ok) {
        const errorData = await outfitRes.json();
        throw new Error(errorData.error || "Failed to generate outfit");
      }
      
      const outfitData = await outfitRes.json()

      // Save recommendation with the outfit data
      const saveRes = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEvent,
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
        const errorData = await saveRes.json();
        throw new Error(errorData.error || "Failed to save event");
      }

      // Refresh events
      await fetchUserEvents()
      
      // Reset form and close dialog
      setNewEvent({
        eventTitle: '',
        eventType: '',
        eventDate: format(new Date(), 'yyyy-MM-dd'),
        eventLocation: '',
        clothing: '',
      })
      setIsAddEventDialogOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsCreatingEvent(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewEvent((prev) => ({ ...prev, [name]: value }))
  }

  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })

  // Add days from previous month to start the calendar on Sunday
  const startDay = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysFromPreviousMonth = Array.from({ length: startDay }, (_, i) => addDays(firstDayOfMonth, -startDay + i))

  // Add days from next month to complete the calendar grid (6 rows x 7 days = 42 cells)
  const totalDaysToShow = 42
  const remainingDays = totalDaysToShow - daysInMonth.length - daysFromPreviousMonth.length
  const daysFromNextMonth = Array.from({ length: remainingDays }, (_, i) => addDays(lastDayOfMonth, i + 1))

  // Combine all days
  const allDays = [...daysFromPreviousMonth, ...daysInMonth, ...daysFromNextMonth]

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? events.filter((event) => {
        const eventDate = parseISO(event.eventDate)
        return isSameDay(eventDate, selectedDate)
      }) 
    : []

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Event Calendar</h1>
          <p className="text-muted-foreground">View your upcoming events and outfit recommendations</p>
        </div>
        <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Add a new event and get an outfit recommendation
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEvent}>
              <div className="space-y-4 py-4">
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
                    value={newEvent.eventTitle}
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
                    value={newEvent.eventType}
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
                    value={newEvent.eventDate}
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
                    value={newEvent.eventLocation}
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
                    value={newEvent.clothing}
                    onChange={handleChange}
                    placeholder="Any specific clothing preferences"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreatingEvent}>
                  {isCreatingEvent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 text-sm font-medium">
                    {day}
                  </div>
                ))}

                {allDays.map((day, index) => {
                  // Find events for this day
                  const dayEvents = events.filter((event) => {
                    const eventDate = parseISO(event.eventDate)
                    return isSameDay(eventDate, day)
                  })
                  
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false

                  return (
                    <div key={index} className={cn("aspect-square p-1", !isCurrentMonth && "opacity-50")}>
                      <button
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "flex h-full w-full flex-col items-center justify-start rounded-md p-1 text-sm transition-colors",
                          isToday(day) && "border border-primary/50",
                          isSelected && "bg-primary text-primary-foreground",
                          !isSelected && dayEvents.length > 0 && "bg-primary/10",
                          !isSelected && "hover:bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full",
                            isSelected && "font-bold",
                          )}
                        >
                          {format(day, "d")}
                        </span>

                        {dayEvents.length > 0 && (
                          <div className="mt-auto w-full">
                            {dayEvents.length <= 2 ? (
                              dayEvents.map((event) => (
                                <div
                                  key={event._id}
                                  className={cn(
                                    "mb-1 truncate rounded px-1 text-xs",
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-primary/20 text-primary",
                                  )}
                                >
                                  {event.eventTitle}
                                </div>
                              ))
                            ) : (
                              <div
                                className={cn(
                                  "mb-1 truncate rounded px-1 text-xs text-center",
                                  isSelected
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-primary/20 text-primary",
                                )}
                              >
                                {dayEvents.length} events
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}</CardTitle>
              <CardDescription>
                {selectedDateEvents.length > 0
                  ? `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? "s" : ""}`
                  : "No events scheduled"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <Card key={event._id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{event.eventTitle}</CardTitle>
                          <Badge variant={event.eventType.toLowerCase().includes('formal') ? "default" : "secondary"}>
                            {event.eventType}
                          </Badge>
                        </div>
                        <CardDescription>
                          <div className="mt-1 flex items-center text-xs">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {format(parseISO(event.eventDate), "MMMM d, yyyy")}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between p-4 pt-2">
                        <div className="text-xs text-muted-foreground">{event.eventLocation}</div>
                        <div className="flex items-center">
                          <Shirt className="mr-1 h-3 w-3" />
                          <span className="text-xs">
                            {event.outfit?.prompt ? "Outfit ready" : "No outfit"}
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="mb-2 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">No Events</h3>
                  <p className="text-sm text-muted-foreground">There are no events scheduled for this date.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setNewEvent(prev => ({
                        ...prev,
                        eventDate: format(selectedDate, 'yyyy-MM-dd')
                      }))
                      setIsAddEventDialogOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="mb-2 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">Select a Date</h3>
                  <p className="text-sm text-muted-foreground">Click on a date to view scheduled events.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
