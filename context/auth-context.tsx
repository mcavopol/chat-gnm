"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserProfile, clearUserProfile } from "@/lib/user-profile-store"

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
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasSession = localStorage.getItem("chatgnm-session")

        // Also check if we have a user profile
        const profile = await getUserProfile()

        // Consider authenticated if either session exists or profile exists
        const isAuth = !!hasSession || !!profile

        setIsAuthenticated(isAuth)
        setIsGuest(!isAuth)

        console.log("Auth context initialized:", {
          hasSession: !!hasSession,
          hasProfile: !!profile,
          isAuthenticated: isAuth,
          isGuest: !isAuth,
        })
      } catch (error) {
        console.error("Error checking authentication:", error)
        // Default to not authenticated on error
        setIsAuthenticated(false)
        setIsGuest(true)
      } finally {
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [])

  const login = async () => {
    try {
      // In a real app, this would validate credentials with a server
      await new Promise((resolve) => setTimeout(resolve, 1000))
      localStorage.setItem("chatgnm-session", "true")
      setIsAuthenticated(true)
      setIsGuest(false)
      console.log("Logged in, new auth state:", { isAuthenticated: true, isGuest: false })
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    try {
      // Clear all authentication data
      localStorage.removeItem("chatgnm-session")

      // Clear user profile
      clearUserProfile().catch((error) => {
        console.error("Error clearing user profile:", error)
      })

      // Clear any session storage data
      try {
        // Clear all guest chat data
        const keys = Object.keys(sessionStorage)
        keys.forEach((key) => {
          if (key.startsWith("guest-chat-")) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (e) {
        console.error("Error clearing session storage:", e)
      }

      // Update authentication state
      setIsAuthenticated(false)
      setIsGuest(true)
      console.log("Logged out, new auth state:", { isAuthenticated: false, isGuest: true })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Provide a loading state until authentication is checked
  if (!isInitialized) {
    return <div className="hidden">Loading authentication...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
