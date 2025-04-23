"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface User {
  _id: string
  username: string
  email: string
  name: string
  profilePicture?: string
  preferences?: {
    style: string[]
    colors: string[]
    occasions: string[]
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [preferences, setPreferences] = useState({
    style: '',
    colors: '',
    occasions: '',
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  async function fetchUserProfile() {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }
      const data = await res.json()
      setUser(data.user)
      setPreferences({
        style: data.user.preferences?.style?.join(', ') || '',
        colors: data.user.preferences?.colors?.join(', ') || '',
        occasions: data.user.preferences?.occasions?.join(', ') || '',
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])
    }
  }

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPreferences(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // Upload profile image if selected
      let profilePictureUrl = user?.profilePicture
      if (profileImage) {
        const formData = new FormData()
        formData.append('image', profileImage)
        
        const imageRes = await fetch('/api/upload-profile-image', {
          method: 'POST',
          body: formData,
        })
        
        if (!imageRes.ok) {
          throw new Error('Failed to upload profile image')
        }
        
        const imageData = await imageRes.json()
        profilePictureUrl = imageData.url
      }

      // Update user preferences
      const updatedPreferences = {
        style: preferences.style.split(',').map(s => s.trim()).filter(Boolean),
        colors: preferences.colors.split(',').map(s => s.trim()).filter(Boolean),
        occasions: preferences.occasions.split(',').map(s => s.trim()).filter(Boolean),
      }

      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profilePicture: profilePictureUrl,
          preferences: updatedPreferences,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess('Profile updated successfully!')
      // Refresh user data
      await fetchUserProfile()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <AlertDescription>Please log in to view your profile.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Picture</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <div>
              <h3 className="font-medium mb-4">Style Preferences</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Favorite Styles (comma-separated)
                  </label>
                  <Input
                    name="style"
                    value={preferences.style}
                    onChange={handlePreferenceChange}
                    placeholder="Casual, Formal, Streetwear"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Preferred Colors (comma-separated)
                  </label>
                  <Input
                    name="colors"
                    value={preferences.colors}
                    onChange={handlePreferenceChange}
                    placeholder="Blue, Black, White"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Common Occasions (comma-separated)
                  </label>
                  <Input
                    name="occasions"
                    value={preferences.occasions}
                    onChange={handlePreferenceChange}
                    placeholder="Work, Party, Casual"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 