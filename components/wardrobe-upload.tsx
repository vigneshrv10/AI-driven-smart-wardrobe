"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, Loader2, X, Shirt } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  type: z.string({
    required_error: "Please select a clothing type.",
  }),
  color: z.string().min(1, {
    message: "Please enter a color.",
  }),
  image: z.instanceof(File, {
    message: "Please upload an image.",
  }).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "Image size must be less than 5MB"
  ).refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Only JPEG, PNG, and WebP formats are supported"
  ),
})

type FormValues = z.infer<typeof formSchema>

interface WardrobeItem {
  id: string;
  name: string;
  type: string;
  color: string;
  imageUrl: string;
  createdAt: string;
}

export function WardrobeUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("image", file, { shouldValidate: true })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    form.setValue("image", undefined as any, { shouldValidate: true })
    setPreviewImage(null)
  }

  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("type", values.type)
      formData.append("color", values.color)
      formData.append("image", values.image)

      const response = await fetch("/api/wardrobe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload wardrobe item")
      }

      const newItem = await response.json()
      setWardrobeItems((prev) => [newItem, ...prev])
      
      // Reset form
      form.reset()
      setPreviewImage(null)
      
      // Fetch updated wardrobe items
      fetchWardrobeItems()
    } catch (error) {
      console.error("Error uploading wardrobe item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchWardrobeItems() {
    try {
      const response = await fetch("/api/wardrobe")
      if (response.ok) {
        const data = await response.json()
        setWardrobeItems(data)
      }
    } catch (error) {
      console.error("Error fetching wardrobe items:", error)
    }
  }

  async function deleteWardrobeItem(id: string) {
    try {
      const response = await fetch(`/api/wardrobe?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setWardrobeItems((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (error) {
      console.error("Error deleting wardrobe item:", error)
    }
  }

  // Fetch wardrobe items on component mount
  useEffect(() => {
    fetchWardrobeItems()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Add Clothing Item</CardTitle>
          <CardDescription>Upload your clothing items to get personalized outfit recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Red Rare Rabbit Shirt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="shirt">Shirt</SelectItem>
                        <SelectItem value="t-shirt">T-Shirt</SelectItem>
                        <SelectItem value="pants">Pants</SelectItem>
                        <SelectItem value="jeans">Jeans</SelectItem>
                        <SelectItem value="shorts">Shorts</SelectItem>
                        <SelectItem value="dress">Dress</SelectItem>
                        <SelectItem value="skirt">Skirt</SelectItem>
                        <SelectItem value="jacket">Jacket</SelectItem>
                        <SelectItem value="sweater">Sweater</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessory">Accessory</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Red" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className={previewImage ? "hidden" : ""}
                          {...fieldProps}
                        />
                        
                        {previewImage && (
                          <div className="relative">
                            <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                              <Image
                                src={previewImage}
                                alt="Preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                              onClick={clearImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a clear image of your clothing item. Max size 5MB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Item
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Wardrobe</CardTitle>
          <CardDescription>
            Your uploaded clothing items will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wardrobeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <Shirt className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No items yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload your first clothing item to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {wardrobeItems.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex space-x-2">
                        <span className="text-xs bg-primary/80 text-primary-foreground px-2 py-0.5 rounded-full">
                          {item.type}
                        </span>
                        <span className="text-xs bg-primary/80 text-primary-foreground px-2 py-0.5 rounded-full">
                          {item.color}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteWardrobeItem(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 