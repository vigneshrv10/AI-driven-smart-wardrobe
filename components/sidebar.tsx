"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Mail, Shirt, ThumbsUp, Menu, X, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Wardrobe", href: "/wardrobe", icon: Shirt },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Recommendations", href: "/recommendations", icon: ThumbsUp },
  { name: "History", href: "/history", icon: History },
  { name: "Email Sync", href: "/email-sync", icon: Mail },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 transform bg-background/80 backdrop-blur-sm transition-all duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full w-64 flex-col bg-background p-5 shadow-lg">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Shirt className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Smart Wardrobe</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden h-full w-64 flex-col border-r bg-background p-5 md:flex">
        <div className="mb-8 flex items-center space-x-2">
          <Shirt className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Smart Wardrobe</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
