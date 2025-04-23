"use client"

import { useState, useEffect } from "react"
import { HistoryView } from "@/components/history-view"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HistoryPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean | null;
    error: string | null;
    details: string | null;
  }>({
    isConnected: null,
    error: null,
    details: null
  })

  useEffect(() => {
    // Check if the database is connected
    async function checkDbConnection() {
      try {
        const response = await fetch("/api/history")
        
        if (response.ok) {
          setConnectionStatus({
            isConnected: true,
            error: null,
            details: null
          })
        } else {
          const errorData = await response.json()
          setConnectionStatus({
            isConnected: false,
            error: errorData.error || "Failed to connect to database",
            details: errorData.details || null
          })
        }
      } catch (error) {
        console.error("Error checking database connection:", error)
        setConnectionStatus({
          isConnected: false,
          error: error instanceof Error ? error.message : "Unknown error",
          details: null
        })
      }
    }

    checkDbConnection()
  }, [])

  const retryConnection = () => {
    setConnectionStatus({
      isConnected: null,
      error: null,
      details: null
    })
    
    // Re-check the connection
    fetch("/api/history")
      .then(async (response) => {
        if (response.ok) {
          setConnectionStatus({
            isConnected: true,
            error: null,
            details: null
          })
        } else {
          const errorData = await response.json()
          setConnectionStatus({
            isConnected: false,
            error: errorData.error || "Failed to connect to database",
            details: errorData.details || null
          })
        }
      })
      .catch((error) => {
        console.error("Error checking database connection:", error)
        setConnectionStatus({
          isConnected: false,
          error: error instanceof Error ? error.message : "Unknown error",
          details: null
        })
      })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Recommendation History</h1>
        <p className="text-muted-foreground">
          View your past outfit recommendations and event details.
        </p>
      </div>

      {connectionStatus.isConnected === false && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Connection Issue</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{connectionStatus.error}</p>
            {connectionStatus.details && (
              <p className="text-sm">{connectionStatus.details}</p>
            )}
            <div className="mt-2">
              <p className="text-sm">Please check your MongoDB connection string in the .env.local file:</p>
              <code className="block mt-2 p-2 bg-muted/50 rounded-md text-xs overflow-auto max-w-full">
                MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
              </code>
            </div>
            <div className="mt-4">
              <Button size="sm" onClick={retryConnection}>
                Retry Connection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <HistoryView />
    </div>
  )
} 