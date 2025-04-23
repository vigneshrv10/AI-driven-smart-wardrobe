"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardView } from "@/components/dashboard-view"

export default function RecommendationsPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.push('/login')
        }
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  return <DashboardView />
}

