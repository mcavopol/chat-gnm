"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    // In a real app, you would check a token in localStorage or cookies
    const checkAuth = () => {
      const hasSession = localStorage.getItem("chatgnm-session")
      setIsAuthenticated(!!hasSession)
    }

    checkAuth()
  }, [])

  const login = async () => {
    // In a real app, this would validate credentials with a server
    await new Promise((resolve) => setTimeout(resolve, 1000))
    localStorage.setItem("chatgnm-session", "true")
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("chatgnm-session")
    setIsAuthenticated(false)
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
