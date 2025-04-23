"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WardrobeItem {
  _id: string
  name: string
  category: string
  color: string
  season: string[]
  occasion: string[]
  imageUrl: string
  createdAt: string
}

export default function WardrobePage() {
  const router = useRouter()
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    color: '',
    season: [] as string[],
    occasion: [] as string[],
    image: null as File | null,
  })

  useEffect(() => {
    checkAuthAndFetchItems()
  }, [])

  async function checkAuthAndFetchItems() {
    try {
      const authRes = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (!authRes.ok) {
        router.push('/login')
        return
      }

      await fetchWardrobeItems()
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    }
  }

  async function fetchWardrobeItems() {
    try {
      const res = await fetch('/api/wardrobe', {
        credentials: 'include'
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch wardrobe items')
      }
      
      const data = await res.json()
      setItems(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewItem(prev => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setError('')

    try {
      if (!newItem.image) {
        throw new Error('Please select an image')
      }

      // Validate seasons
      const validSeasons = ['spring', 'summer', 'fall', 'winter']
      const seasons = newItem.season.map(s => s.toLowerCase().trim())
      const invalidSeasons = seasons.filter(s => !validSeasons.includes(s))
      
      if (invalidSeasons.length > 0) {
        throw new Error(`Invalid seasons: ${invalidSeasons.join(', ')}. Valid seasons are: spring, summer, fall, winter`)
      }

      if (seasons.length === 0) {
        throw new Error('Please select at least one season')
      }

      // Validate occasions
      if (newItem.occasion.length === 0) {
        throw new Error('Please add at least one occasion')
      }

      // First, upload the image
      const formData = new FormData()
      formData.append('image', newItem.image)
      
      const imageRes = await fetch('/api/upload-wardrobe-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      if (!imageRes.ok) {
        if (imageRes.status === 401) {
          router.push('/login')
          return
        }
        const imageError = await imageRes.json()
        throw new Error(imageError.error || 'Failed to upload image')
      }
      
      const imageData = await imageRes.json()

      // Then, create the wardrobe item
      const res = await fetch('/api/wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          color: newItem.color,
          season: seasons,
          occasion: newItem.occasion.map(o => o.trim()).filter(Boolean),
          imageUrl: imageData.url,
        }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to add item')
      }

      // Reset form and refresh items
      setNewItem({
        name: '',
        category: '',
        color: '',
        season: [],
        occasion: [],
        image: null,
      })
      setIsAddDialogOpen(false)
      await fetchWardrobeItems()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/wardrobe?id=${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to delete item')
      }

      await fetchWardrobeItems()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login')
      }
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Wardrobe</h1>
          <p className="text-muted-foreground">
            Manage your clothing collection
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Add a new item to your wardrobe
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Blue Cotton T-Shirt"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tops">Tops</SelectItem>
                      <SelectItem value="bottoms">Bottoms</SelectItem>
                      <SelectItem value="dresses">Dresses</SelectItem>
                      <SelectItem value="outerwear">Outerwear</SelectItem>
                      <SelectItem value="shoes">Shoes</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Color
                  </label>
                  <Input
                    value={newItem.color}
                    onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Blue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Seasons (comma-separated)
                  </label>
                  <Input
                    value={newItem.season.join(', ')}
                    onChange={(e) => setNewItem(prev => ({
                      ...prev,
                      season: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="spring, summer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Occasions (comma-separated)
                  </label>
                  <Input
                    value={newItem.occasion.join(', ')}
                    onChange={(e) => setNewItem(prev => ({
                      ...prev,
                      occasion: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="casual, work"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Image
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Item'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item._id}>
            <div className="aspect-square relative">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteItem(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>{item.color}</Badge>
                {item.season.map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.occasion.map((o) => (
                  <Badge key={o} variant="secondary">{o}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

