"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Smart Wardrobe Assistant
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your personal AI-powered fashion consultant that helps you create perfect outfits for any occasion
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">Sign In</Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="p-6 rounded-lg bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
            <p className="text-muted-foreground">Get personalized outfit recommendations based on weather, occasion, and your style preferences.</p>
          </motion.div>
          <motion.div 
            className="p-6 rounded-lg bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-xl font-semibold mb-3">Digital Wardrobe</h3>
            <p className="text-muted-foreground">Organize your clothing collection digitally and access it from anywhere.</p>
          </motion.div>
          <motion.div 
            className="p-6 rounded-lg bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <h3 className="text-xl font-semibold mb-3">AI-Powered Styling</h3>
            <p className="text-muted-foreground">Let our AI help you create stylish outfits that match your preferences and the occasion.</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


