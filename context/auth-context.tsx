"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserProfile } from "@/lib/user-profile-store"

interface AuthContextType {
  isAuthenticated: boolean
  isGuest: boolean
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGuest, setIsGuest] = useState(true) // Default to guest

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const hasSession = localStorage.getItem("chatgnm-session")

      // Also check if we have a user profile
      const profile = await getUserProfile()

      // Consider authenticated if either session exists or profile exists
      const isAuth = !!hasSession || !!profile

      setIsAuthenticated(isAuth)
      setIsGuest(!isAuth)

      console.log("Auth state:", {
        hasSession: !!hasSession,
        hasProfile: !!profile,
        isAuthenticated: isAuth,
        isGuest: !isAuth,
      })
    }

    checkAuth()
  }, [])

  const login = async () => {
    // In a real app, this would validate credentials with a server
    await new Promise((resolve) => setTimeout(resolve, 1000))
    localStorage.setItem("chatgnm-session", "true")
    setIsAuthenticated(true)
    setIsGuest(false)
    console.log("Logged in, new auth state:", { isAuthenticated: true, isGuest: false })
  }

  const logout = () => {
    localStorage.removeItem("chatgnm-session")
    setIsAuthenticated(false)
    setIsGuest(true)
    console.log("Logged out, new auth state:", { isAuthenticated: false, isGuest: true })
  }

  return <AuthContext.Provider value={{ isAuthenticated, isGuest, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
