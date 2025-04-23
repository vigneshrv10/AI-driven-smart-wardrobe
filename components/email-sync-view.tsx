"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Check, AlertCircle, RefreshCw, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for synced events
const syncedEvents = [
  {
    id: 1,
    title: "Team Offsite",
    from: "manager@company.com",
    date: "April 5, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Mountain Resort",
    type: "business",
    synced: true,
  },
  {
    id: 2,
    title: "Product Launch Party",
    from: "events@techcompany.com",
    date: "April 12, 2025",
    time: "7:00 PM - 10:00 PM",
    location: "Innovation Center",
    type: "formal",
    synced: true,
  },
  {
    id: 3,
    title: "Friend's Birthday",
    from: "alex@gmail.com",
    date: "April 18, 2025",
    time: "8:00 PM",
    location: "Skybar Lounge",
    type: "party",
    synced: false,
  },
]

export function EmailSyncView() {
  const [connected, setConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const handleConnect = () => {
    // Simulate connection process
    setSyncing(true)
    setTimeout(() => {
      setConnected(true)
      setSyncing(false)
    }, 2000)
  }

  const handleRefresh = () => {
    // Simulate refresh process
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
    }, 1500)
  }

  const filteredEvents = syncedEvents.filter((event) => {
    if (activeTab === "all") return true
    if (activeTab === "synced") return event.synced
    if (activeTab === "pending") return !event.synced
    return true
    return event.synced
    if (activeTab === "pending") return !event.synced
    return true
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Email Sync</h1>
        <p className="text-muted-foreground">
          Connect your email to automatically extract event details from invitations
        </p>
      </div>

      {!connected ? (
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Connect Your Email</CardTitle>
            <CardDescription>Link your email account to automatically sync your events and invitations</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-sm text-muted-foreground">
              We'll scan your inbox for event invitations and automatically add them to your calendar. Your credentials
              are securely stored and we only access event-related emails.
            </p>
            <Button onClick={handleConnect} className="w-full" disabled={syncing}>
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Connect Gmail
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-muted-foreground">
            We support Gmail, Outlook, and Yahoo Mail
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Email Connected</h2>
                <p className="text-sm text-muted-foreground">jane.doe@gmail.com</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={syncing}>
              {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sync in progress</AlertTitle>
            <AlertDescription>
              We're currently scanning your inbox for event invitations. This may take a few minutes.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="synced">Synced</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              <p className="text-sm text-muted-foreground">{filteredEvents.length} events found</p>
            </div>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <Badge variant={event.synced ? "default" : "outline"}>
                          {event.synced ? "Synced" : "Pending"}
                        </Badge>
                      </div>
                      <CardDescription>From: {event.from}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid gap-1 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {event.date}, {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {event.location}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant={event.synced ? "outline" : "default"} size="sm" className="ml-auto">
                        {event.synced ? "View Details" : "Sync Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="synced" className="mt-6">
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <Badge>Synced</Badge>
                      </div>
                      <CardDescription>From: {event.from}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid gap-1 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {event.date}, {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {event.location}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="ml-auto">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <CardDescription>From: {event.from}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid gap-1 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {event.date}, {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {event.location}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" className="ml-auto">
                        Sync Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

// Import missing component
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Calendar {...props} />
}

