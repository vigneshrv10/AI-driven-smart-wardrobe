"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

const formSchema = z.object({
  eventTitle: z.string().min(2, {
    message: "Event title must be at least 2 characters.",
  }),
  eventType: z.string({
    required_error: "Please select an event type.",
  }),
  eventDate: z.date({
    required_error: "Please select a date.",
  }),
  eventLocation: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }).refine(value => /^[a-zA-Z\s\-]+$/.test(value), {
    message: "Location should only contain letters, spaces, and hyphens. Try a simple city name like 'London' or 'New York'.",
  }),
  clothing: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function EventForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [outfitResult, setOutfitResult] = useState<{
    weather?: {
      temperature: number
      description: string
      location: string
      country: string
    }
    outfit?: {
      prompt: string
      image: string | null
      paymentRequired?: boolean
      message?: string
    }
    error?: string
    historySaved?: boolean
    historyError?: string
  } | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventTitle: "",
      eventLocation: "",
      clothing: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setOutfitResult(null)

    try {
      const formattedLocation = values.eventLocation.trim();
      
      console.log("Submitting event with location:", formattedLocation);
      
      const weatherResponse = await fetch(`/api/weather?location=${encodeURIComponent(formattedLocation)}`);
      
      if (!weatherResponse.ok) {
        const weatherError = await weatherResponse.json();
        console.error("Weather validation failed:", weatherError);
        
        throw new Error(
          `Could not find weather data for "${formattedLocation}". Please try a different location name (e.g., "London" or "New York") or check for typos.`
        );
      }
      
      const response = await fetch("/api/outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: values.eventType,
          eventLocation: formattedLocation,
          eventDate: format(values.eventDate, "MMMM dd, yyyy"),
          clothing: values.clothing ? values.clothing.trim() : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate outfit recommendation")
      }

      setOutfitResult(data)
      
      try {
        const historyResponse = await fetch("/api/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventTitle: values.eventTitle,
            eventType: values.eventType,
            eventDate: format(values.eventDate, "MMMM dd, yyyy"),
            eventLocation: formattedLocation,
            clothing: values.clothing ? values.clothing.trim() : undefined,
            weather: data.weather,
            outfit: data.outfit,
          }),
        });
        
        if (historyResponse.ok) {
          console.log("Recommendation saved to history");
          setOutfitResult(prev => prev ? { ...prev, historySaved: true } : null);
        } else {
          const historyErrorData = await historyResponse.json();
          console.error("Failed to save recommendation to history:", historyErrorData);
          setOutfitResult(prev => prev ? { 
            ...prev, 
            historySaved: false, 
            historyError: historyErrorData.error || "Failed to save to history" 
          } : null);
        }
      } catch (historyError) {
        console.error("Error saving to history:", historyError);
        setOutfitResult(prev => prev ? { 
          ...prev, 
          historySaved: false, 
          historyError: historyError instanceof Error ? historyError.message : "Error saving to history" 
        } : null);
      }
    } catch (error) {
      console.error("Error generating outfit:", error)
      setOutfitResult({
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Enter the details of your upcoming event to get outfit recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="eventTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Dinner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="party">Party</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="London" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a simple city name (e.g., London, New York, Tokyo) to get weather-appropriate recommendations.
                      Some city names may not be recognized by the weather service.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clothing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clothing Items (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Red Rare Rabbit shirt"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe any specific clothing items you want to include in your outfit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Outfit...
                  </>
                ) : (
                  "Generate Outfit Recommendation"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outfit Recommendation</CardTitle>
          <CardDescription>
            Your AI-generated outfit recommendation based on event details and weather.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating your perfect outfit...</p>
            </div>
          ) : outfitResult ? (
            outfitResult.error ? (
              <div className="text-center space-y-2">
                <p className="text-destructive font-medium">Error</p>
                <p className="text-muted-foreground">{outfitResult.error}</p>
              </div>
            ) : (
              <div className="space-y-6 w-full">
                {outfitResult.weather && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Weather in {outfitResult.weather.location}, {outfitResult.weather.country}</h3>
                    <p className="text-sm">Temperature: {outfitResult.weather.temperature}°C</p>
                    <p className="text-sm capitalize">Conditions: {outfitResult.weather.description}</p>
                  </div>
                )}
                {outfitResult.outfit && (
                  <div className="space-y-4">
                    {outfitResult.outfit.image ? (
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                        <Image
                          src={outfitResult.outfit.image}
                          alt="Outfit recommendation"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : outfitResult.outfit.paymentRequired ? (
                      <div className="p-6 border rounded-lg bg-muted/50 text-center space-y-2">
                        <p className="text-amber-600 font-medium">Image Generation Unavailable</p>
                        <p className="text-sm text-muted-foreground">{outfitResult.outfit.message}</p>
                      </div>
                    ) : null}
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Outfit recommendation:</p>
                      <p>{outfitResult.outfit.prompt}</p>
                    </div>
                  </div>
                )}
                {outfitResult.historySaved === true && (
                  <div className="p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900 rounded-lg text-center">
                    <p className="text-green-600 dark:text-green-400 text-sm">Recommendation saved to history</p>
                  </div>
                )}
                {outfitResult.historyError && (
                  <div className="p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900 rounded-lg text-center">
                    <p className="text-amber-600 dark:text-amber-400 text-sm">
                      Note: {outfitResult.historyError}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your recommendation was generated but couldn't be saved to history.
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Fill out the event details form and click "Generate Outfit Recommendation" to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 