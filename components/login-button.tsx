"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

interface LoginButtonProps {
  className?: string
}

export function LoginButton({ className }: LoginButtonProps) {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Attempt to login
      await login()

      // Add a small delay for the loading animation to be visible
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Successful login - redirect to chat page
      router.push("/chat")
    } catch (err) {
      // Handle login error
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
        <Button
          size="lg"
          onClick={handleLogin}
          disabled={isLoading}
          className={cn(
            "px-8 py-6 text-lg rounded-full",
            "bg-blue-600 hover:bg-blue-700 transition-colors duration-300",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isLoading && "opacity-80",
            className,
          )}
          aria-label="Login to ChatGNM"
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </motion.div>

      {error && (
        <motion.div
          className="mt-4 text-red-500 text-sm bg-red-50 px-4 py-2 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}
