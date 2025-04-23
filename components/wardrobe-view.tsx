"use client"

import { useState } from "react"
import {
  Upload,
  Search,
  Filter,
  Plus,
  Shirt,
  PenIcon as Pants,
  FootprintsIcon as Shoe,
  Watch,
  Trash2,
  Edit,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for wardrobe items
const wardrobeItems = [
  {
    id: 1,
    name: "Blue Oxford Shirt",
    type: "tops",
    color: "blue",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["formal", "work"],
  },
  {
    id: 2,
    name: "Black Slim Jeans",
    type: "bottoms",
    color: "black",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["casual", "everyday"],
  },
  {
    id: 3,
    name: "Navy Blazer",
    type: "outerwear",
    color: "navy",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["formal", "work"],
  },
  {
    id: 4,
    name: "White Sneakers",
    type: "shoes",
    color: "white",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["casual", "everyday"],
  },
  {
    id: 5,
    name: "Red Dress",
    type: "dresses",
    color: "red",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["formal", "party"],
  },
  {
    id: 6,
    name: "Silver Watch",
    type: "accessories",
    color: "silver",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["formal", "everyday"],
  },
  {
    id: 7,
    name: "Floral Blouse",
    type: "tops",
    color: "multicolor",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["casual", "spring"],
  },
  {
    id: 8,
    name: "Khaki Chinos",
    type: "bottoms",
    color: "beige",
    image: "/placeholder.svg?height=200&width=200",
    tags: ["casual", "work"],
  },
]

// Type icons mapping
const typeIcons = {
  tops: Shirt,
  bottoms: Pants,
  shoes: Shoe,
  accessories: Watch,
  outerwear: Shirt,
  dresses: Shirt,
}

export function WardrobeView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // Filter items based on search query and active tab
  const filteredItems = wardrobeItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    return item.type === activeTab && matchesSearch
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Wardrobe</h1>
          <p className="text-muted-foreground">Manage and organize your clothing items</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Add Items
        </Button>
      </div>

      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchQuery("formal")}>Formal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("casual")}>Casual</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("work")}>Work</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("party")}>Party</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("")}>Clear Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
            Clear
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start overflow-auto">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="tops">Tops</TabsTrigger>
          <TabsTrigger value="bottoms">Bottoms</TabsTrigger>
          <TabsTrigger value="dresses">Dresses</TabsTrigger>
          <TabsTrigger value="outerwear">Outerwear</TabsTrigger>
          <TabsTrigger value="shoes">Shoes</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => {
              const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || Shirt

              return (
                <Card key={item.id} className="wardrobe-item overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-48 w-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
                        <div className="flex items-center justify-between">
                          <TypeIcon className="h-5 w-5 text-primary" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Tag className="mr-2 h-4 w-4" />
                                Edit Tags
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{item.color}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="mt-12 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No items found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setActiveTab("all")
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Other tabs content will be automatically filtered by the activeTab state */}
        {["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item) => {
                const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || Shirt

                return (
                  <Card key={item.id} className="wardrobe-item overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-48 w-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
                          <div className="flex items-center justify-between">
                            <TypeIcon className="h-5 w-5 text-primary" />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Tag className="mr-2 h-4 w-4" />
                                  Edit Tags
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{item.color}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="mt-12 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No items found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveTab("all")
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Upload a photo of your clothing item and our AI will automatically categorize it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-photo">Photo</Label>
              <div className="flex h-32 cursor-pointer items-center justify-center rounded-md border border-dashed border-input bg-muted/50">
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input id="item-name" placeholder="Blue Oxford Shirt" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item-type">Item Type</Label>
              <Select>
                <SelectTrigger id="item-type">
                  <SelectValue placeholder="Select item type" />
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

            <div className="grid gap-2">
              <Label htmlFor="item-color">Color</Label>
              <Input id="item-color" placeholder="Blue" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="item-tags">Tags (comma separated)</Label>
              <Input id="item-tags" placeholder="formal, work, spring" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsUploadDialogOpen(false)}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

