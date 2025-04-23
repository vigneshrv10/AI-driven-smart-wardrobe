"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface User {
  _id: string
  username: string
  email: string
  name: string
  profilePicture?: string
}

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        } else {
          // If no user data, clear everything
          await handleLogout(false)
        }
      } else {
        // If error response, clear everything
        await handleLogout(false)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // If error occurs, clear everything
      await handleLogout(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async (redirect: boolean = true) => {
    try {
      setIsLoggingOut(true)
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (res.ok) {
        localStorage.clear()
        setUser(null)
        if (redirect) {
          window.location.href = '/'
        }
      } else {
        throw new Error('Failed to logout')
      }
    } catch (error) {
      console.error('Error logging out:', error)
      // Even if logout fails, clear local state
      localStorage.clear()
      setUser(null)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/recommendations" className="w-full">Recommendations</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wardrobe" className="w-full">My Wardrobe</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/history" className="w-full">History</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          disabled={isLoggingOut}
          onClick={() => handleLogout(true)}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            'Log out'
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 